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

  const onPendingPage = window.location.pathname.includes(
    "/onboarding/status/pending"
  );
  const guardActive = sessionStorage.getItem(REDIRECT_GUARD_KEY) === "1";

  // Guard prevents pending ↔ dashboard loops; do not block leaving pending when approved
  if (guardActive && !onPendingPage) {
    return true;
  }

  const normalized = role.toUpperCase();
  sessionStorage.setItem(REDIRECT_GUARD_KEY, "1");
  window.location.replace(getDashboardRoute(normalized));
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
