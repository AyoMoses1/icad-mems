/**
 * Session refresh via IMS/IAM POST /api/auth/refresh.
 * After onboarding assigns a workspace role, the access token must be refreshed
 * so GET /api/menu returns role-scoped resources (not the pre-onboarding set).
 */

import { apiGetAuth, type ApiResponse } from "@/lib/api-client";
import { useAuthStore } from "@/store";
import type { UserInfo, UserStatus, UserWithFullName } from "@/types";

export const SESSION_REFRESHED_EVENT = "session-refreshed";

/** User object returned in POST /api/auth/refresh data */
export interface AuthRefreshUserDto {
  id: string;
  userName?: string;
  email?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  country?: string;
  status?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  isActive?: boolean;
  isOnboardingComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  dateCreated?: string;
  dateModified?: string;
  fullName?: string;
  tenantId?: string;
}

/** data payload from POST /api/auth/refresh */
export interface AuthRefreshDataDto {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user?: AuthRefreshUserDto;
}

export type AuthRefreshResponse = ApiResponse<AuthRefreshDataDto>;

function getSsoBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SSO_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_OAUTH_BASE_URL?.trim() ||
    ""
  );
}

function normalizeUserStatus(status?: string): UserStatus {
  const upper = status?.toUpperCase();
  if (upper === "ACTIVE") return "ACTIVE" as UserStatus;
  if (upper === "INACTIVE") return "INACTIVE" as UserStatus;
  if (upper === "PENDING") return "PENDING" as UserStatus;
  if (upper === "SUSPENDED") return "SUSPENDED" as UserStatus;
  if (upper === "DELETED") return "DELETED" as UserStatus;
  return "ACTIVE" as UserStatus;
}

function mapRefreshUserToStoreUser(
  refreshUser: AuthRefreshUserDto,
  currentUser: UserWithFullName,
): UserWithFullName {
  return {
    ...currentUser,
    id: refreshUser.id || currentUser.id,
    username: refreshUser.userName || currentUser.username,
    email: refreshUser.email || currentUser.email,
    firstName: refreshUser.firstName || currentUser.firstName,
    middleName: refreshUser.middleName ?? currentUser.middleName,
    lastName: refreshUser.lastName || currentUser.lastName,
    dateOfBirth: refreshUser.dateOfBirth || currentUser.dateOfBirth,
    country: refreshUser.country || currentUser.country,
    status: normalizeUserStatus(refreshUser.status) || currentUser.status,
    emailVerified: refreshUser.emailVerified ?? currentUser.emailVerified,
    phoneVerified: refreshUser.phoneVerified ?? currentUser.phoneVerified,
    twoFactorEnabled:
      refreshUser.twoFactorEnabled ?? currentUser.twoFactorEnabled,
    is_onboarding_complete:
      refreshUser.isOnboardingComplete ?? currentUser.is_onboarding_complete,
    fullName: refreshUser.fullName || currentUser.fullName,
    createdAt: refreshUser.createdAt || currentUser.createdAt,
    updatedAt: refreshUser.updatedAt || currentUser.updatedAt,
  };
}

async function postAuthRefresh(
  refreshToken: string,
): Promise<AuthRefreshResponse> {
  const baseUrl = getSsoBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SSO_BASE_URL is not configured for auth refresh.",
    );
  }

  const response = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const text = await response.text();
  if (!text) {
    throw new Error(
      `Auth refresh failed (${response.status} ${response.statusText})`,
    );
  }

  let payload: AuthRefreshResponse;
  try {
    payload = JSON.parse(text) as AuthRefreshResponse;
  } catch {
    throw new Error("Auth refresh returned non-JSON response");
  }

  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.error?.message ||
        payload.message ||
        `Auth refresh failed (${response.status})`,
    );
  }

  return payload;
}

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
 * Re-fetch /connect/userinfo and update auth store user + primaryRole.
 * Workspace roles are only available from userinfo, not the refresh payload.
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
 */
export async function refreshSessionAfterOnboarding(options?: {
  syncUserInfo?: boolean;
}): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const refreshToken = useAuthStore.getState().refreshToken?.trim();
  if (!refreshToken) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "refreshSessionAfterOnboarding: no refresh token stored — menu may show all resources until re-login.",
      );
    }
    return false;
  }

  const currentUser = useAuthStore.getState().user;
  if (!currentUser) return false;

  try {
    const response = await postAuthRefresh(refreshToken);
    const data = response.data;

    if (!data?.accessToken) {
      console.warn("Auth refresh did not return data.accessToken");
      return false;
    }

    const expiresIn = data.expiresIn;
    const expiresAt = new Date(
      Date.now() + (expiresIn && expiresIn > 0 ? expiresIn : 86400) * 1000,
    ).toISOString();

    const updatedUser = data.user
      ? mapRefreshUserToStoreUser(data.user, currentUser)
      : currentUser;

    useAuthStore.getState().setSession({
      user: updatedUser,
      token: data.accessToken,
      refreshToken: data.refreshToken || refreshToken,
      expiresAt,
    });

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
