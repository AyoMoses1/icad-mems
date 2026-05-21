/**
 * Redirect to role dashboard after onboarding approval (User Readiness or my-onboarding).
 * Uses a full page navigation to avoid soft-router loops with stale layout state.
 *
 * Always refresh the OAuth session before redirect so the new JWT carries updated
 * role claims and GET /api/menu returns the correct sidebar items.
 */

import { getDashboardRoute } from "@/lib/role-routing";
import { refreshSessionAfterOnboarding } from "@/lib/services/auth-session-service";
import {
  getDashboardRoleFromReadiness,
  isUserReadyFromReadiness,
  type UserReadinessStatusDto,
} from "@/lib/services/user-readiness-service";

const REDIRECT_GUARD_KEY = "seafarer-onboarding-approved-redirect";

function resolveApprovalDashboardRole(
  readiness: UserReadinessStatusDto | null | undefined,
  fallbackRole?: string | null
): string | null {
  if (readiness && isUserReadyFromReadiness(readiness)) {
    return (
      getDashboardRoleFromReadiness(readiness) ??
      (fallbackRole ? fallbackRole.toUpperCase() : null) ??
      "SEAFARER"
    );
  }
  if (fallbackRole?.trim()) {
    return fallbackRole.toUpperCase();
  }
  return null;
}

/**
 * Full-page redirect once per tab session. Prevents pending ↔ dashboard ping-pong
 * that re-triggers UserReadiness/status in a loop.
 */
function redirectToDashboardWithRole(role: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const normalized = role.toUpperCase();
  const target = getDashboardRoute(normalized);
  const currentPath = window.location.pathname;

  if (currentPath === target || currentPath.startsWith(`${target}/`)) {
    return true;
  }

  const guardActive = sessionStorage.getItem(REDIRECT_GUARD_KEY) === "1";
  const stuckOnOnboarding = currentPath.startsWith("/onboarding");

  // Stale guard from a previous attempt must not block leaving onboarding routes
  if (guardActive && !stuckOnOnboarding) {
    return true;
  }
  if (guardActive && stuckOnOnboarding) {
    sessionStorage.removeItem(REDIRECT_GUARD_KEY);
  }

  sessionStorage.setItem(REDIRECT_GUARD_KEY, "1");
  window.location.replace(target);
  return true;
}

/** Synchronous redirect only — prefer redirectToDashboardAfterApprovalWithSessionRefresh. */
export function redirectToDashboardAfterApproval(
  readiness: UserReadinessStatusDto | null | undefined,
  fallbackRole?: string | null
): boolean {
  const role = resolveApprovalDashboardRole(readiness, fallbackRole);
  if (!role) return false;
  return redirectToDashboardWithRole(role);
}

/**
 * Refresh OAuth token (updated role/menu claims), then redirect to the role dashboard.
 * Call this whenever User Readiness or my-onboarding reports approval.
 */
export async function redirectToDashboardAfterApprovalWithSessionRefresh(
  readiness: UserReadinessStatusDto | null | undefined,
  fallbackRole?: string | null
): Promise<boolean> {
  const role = resolveApprovalDashboardRole(readiness, fallbackRole);
  if (!role) return false;

  if (typeof window !== "undefined") {
    const target = getDashboardRoute(role);
    const currentPath = window.location.pathname;
    const alreadyOnTarget =
      currentPath === target || currentPath.startsWith(`${target}/`);
    if (!alreadyOnTarget) {
      await refreshSessionAfterOnboarding();
    }
  }

  return redirectToDashboardAfterApproval(readiness, fallbackRole);
}

export function clearApprovalRedirectGuard(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REDIRECT_GUARD_KEY);
}
