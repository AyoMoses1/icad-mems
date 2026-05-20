/**
 * Session refresh via IMS/IAM POST /connect/token (OAuth refresh_token grant).
 * After onboarding assigns a workspace role, the access token must be refreshed
 * so GET /api/menu returns role-scoped resources (not the pre-onboarding set).
 */

import { apiGetAuth, apiPostForm } from "@/lib/api-client";
import { useAuthStore } from "@/store";
import type { UserInfo, UserWithFullName } from "@/types";
import type { TokenResponse } from "@/types";
import { invalidateUserReadinessCache } from "@/lib/services/user-readiness-service";

export const SESSION_REFRESHED_EVENT = "session-refreshed";

function extractRolesFromUserInfo(userInfo: UserInfo): string[] {
  const extractedRoles: string[] = [];

  if (userInfo.roles && Array.isArray(userInfo.roles)) {
    (
      userInfo.roles as Array<{
        tenants?: Array<{ roles?: Array<{ role?: string }> }>;
      }>
    ).forEach((workspaceRole) => {
      workspaceRole.tenants?.forEach((tenant) => {
        tenant.roles?.forEach((roleObj) => {
          if (roleObj.role && typeof roleObj.role === "string") {
            extractedRoles.push(roleObj.role.toUpperCase());
          }
        });
      });
    });
  }

  if (userInfo.role && typeof userInfo.role === "string") {
    extractedRoles.push(userInfo.role.toUpperCase());
  }

  return Array.from(new Set(extractedRoles));
}

function resolvePrimaryRole(userInfo: UserInfo, uniqueRoles: string[]): string {
  const adminDetails = userInfo.adminDetails as
    | { isSystemAdmin?: boolean; isWorkspaceAdmin?: boolean }
    | undefined;
  const ownerDetails = userInfo.ownerDetails as
    | { isOwner?: boolean }
    | undefined;

  const isAdmin =
    userInfo.isAdmin === true ||
    adminDetails?.isSystemAdmin === true ||
    adminDetails?.isWorkspaceAdmin === true ||
    uniqueRoles.includes("ADMIN") ||
    uniqueRoles.includes("SUPERADMIN");

  const isOwner =
    userInfo.isOwner === true ||
    ownerDetails?.isOwner === true ||
    uniqueRoles.includes("OWNER");

  if (isAdmin) return "ADMIN";
  if (isOwner) return "OWNER";

  return (
    uniqueRoles.find((r) => r === "SEAFARER") ||
    uniqueRoles.find((r) => r === "AGENT") ||
    uniqueRoles.find((r) => r === "TRAINING_INSTITUTION") ||
    uniqueRoles[0] ||
    ""
  );
}

/**
 * POST /connect/token with grant_type=refresh_token (application/x-www-form-urlencoded).
 */
async function postConnectTokenRefresh(
  refreshToken: string
): Promise<TokenResponse> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID?.trim();
  const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "OAuth credentials are not configured (NEXT_PUBLIC_CLIENT_ID / NEXT_PUBLIC_CLIENT_SECRET)."
    );
  }

  return apiPostForm<TokenResponse>("/connect/token", {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
}

/**
 * Re-fetch /connect/userinfo and update auth store user + primaryRole.
 * Workspace roles are only available from userinfo after token refresh.
 */
export async function syncSessionFromUserInfo(): Promise<void> {
  const {
    user: currentUser,
    setSession,
    setPrimaryRole,
  } = useAuthStore.getState();
  const token = useAuthStore.getState().token;
  if (!token || !currentUser) return;

  const userInfo = await apiGetAuth<UserInfo>("/connect/userinfo");
  const uniqueRoles = extractRolesFromUserInfo(userInfo);
  const role = resolvePrimaryRole(userInfo, uniqueRoles);

  const workspaceRoles =
    userInfo.roles?.map((workspaceRole) => ({
      workspaceId: workspaceRole.workspaceId,
      workspaceName: workspaceRole.workspaceName,
      is_onboarding_complete: (
        workspaceRole as { is_onboarding_complete?: boolean }
      ).is_onboarding_complete,
      onboarding_completed_date: (
        workspaceRole as { onboarding_completed_date?: string | null }
      ).onboarding_completed_date,
      tenants: workspaceRole.tenants,
    })) || [];

  const userData: UserWithFullName = {
    ...currentUser,
    id: userInfo.id || userInfo.sub || currentUser.id,
    email: userInfo.email || currentUser.email,
    firstName:
      userInfo.firstName || userInfo.given_name || currentUser.firstName || "",
    lastName:
      userInfo.lastName || userInfo.family_name || currentUser.lastName || "",
    fullName:
      userInfo.fullName ||
      userInfo.name ||
      `${userInfo.firstName || userInfo.given_name || ""} ${userInfo.lastName || userInfo.family_name || ""}`.trim() ||
      userInfo.email ||
      currentUser.fullName,
    roles: (workspaceRoles.length > 0
      ? workspaceRoles
      : currentUser.roles) as UserWithFullName["roles"],
  };

  setSession({
    user: userData,
    token,
    refreshToken: useAuthStore.getState().refreshToken || "",
    expiresAt:
      useAuthStore.getState().expiresAt ||
      new Date(Date.now() + 86400 * 1000).toISOString(),
  });

  if (role) {
    setPrimaryRole(role);
  }
}

/**
 * Refresh access token after onboarding (or role change) and notify listeners (e.g. sidebar menu).
 * Uses OAuth /connect/token so the new JWT carries updated role claims for GET /api/menu.
 */
export async function refreshSessionAfterOnboarding(options?: {
  syncUserInfo?: boolean;
}): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const refreshToken = useAuthStore.getState().refreshToken?.trim();
  if (!refreshToken) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "refreshSessionAfterOnboarding: no refresh token stored — menu may show all resources until re-login."
      );
    }
    return false;
  }

  const currentUser = useAuthStore.getState().user;
  if (!currentUser) return false;

  try {
    const tokenResponse = await postConnectTokenRefresh(refreshToken);

    if (!tokenResponse.access_token) {
      console.warn("OAuth refresh did not return access_token");
      return false;
    }

    const expiresIn = tokenResponse.expires_in ?? 86400;
    const expiresAt = new Date(
      Date.now() + expiresIn * 1000
    ).toISOString();

    useAuthStore.getState().setSession({
      user: currentUser,
      token: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || refreshToken,
      expiresAt,
    });

    // Role/claims may have changed after token refresh — drop cached readiness
    invalidateUserReadinessCache();

    if (options?.syncUserInfo !== false) {
      try {
        await syncSessionFromUserInfo();
      } catch (err) {
        console.warn("Userinfo sync after token refresh failed:", err);
      }
    }

    window.dispatchEvent(new CustomEvent(SESSION_REFRESHED_EVENT));
    return true;
  } catch (err) {
    console.error("refreshSessionAfterOnboarding failed:", err);
    return false;
  }
}
