/**
 * Post-Veriff completion: User Readiness + optional session refresh, then pending page.
 */

import { refreshSessionAfterOnboarding } from "@/lib/services/auth-session-service";
import { getUserReadinessStatus } from "@/lib/services/user-readiness-service";

const PENDING_ROUTE = "/onboarding/status/pending";

/**
 * Call after Veriff finishes. Uses UserReadiness/status as source of truth, then navigates to pending.
 */
export async function finalizeVerificationAndGoToPending(): Promise<void> {
  try {
    await getUserReadinessStatus();
  } catch {
    // Continue — pending page will show latest onboarding state from my-onboarding
  }

  try {
    await refreshSessionAfterOnboarding();
  } catch {
    // Non-fatal if refresh token missing
  }

  if (typeof window !== "undefined") {
    window.location.replace(PENDING_ROUTE);
  }
}

export { PENDING_ROUTE as VERIFICATION_PENDING_ROUTE };
