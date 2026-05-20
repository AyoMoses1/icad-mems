/**
 * Redirect to role dashboard after onboarding approval (User Readiness or my-onboarding).
 * Uses a full page navigation to avoid soft-router loops with stale layout state.
 */

import { getDashboardRoute } from "@/lib/role-routing";
import {
  getDashboardRoleFromReadiness,
  isUserReadyFromReadiness,
  type UserReadinessStatusDto,
} from "@/lib/services/user-readiness-service";

const REDIRECT_GUARD_KEY = "seafarer-onboarding-approved-redirect";

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

export function redirectToDashboardAfterApproval(
  readiness: UserReadinessStatusDto | null | undefined,
  fallbackRole?: string | null
): boolean {
  if (readiness && isUserReadyFromReadiness(readiness)) {
    const role =
      getDashboardRoleFromReadiness(readiness) ??
      (fallbackRole ? fallbackRole.toUpperCase() : null) ??
      "SEAFARER";
    return redirectToDashboardWithRole(role);
  }

  if (fallbackRole) {
    return redirectToDashboardWithRole(fallbackRole);
  }

  return false;
}

export function clearApprovalRedirectGuard(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REDIRECT_GUARD_KEY);
}
