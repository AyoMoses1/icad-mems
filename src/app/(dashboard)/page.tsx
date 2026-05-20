"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardRouteFromRoles } from "@/lib/role-routing";
import { useAuthStore } from "@/store";
import { LoadingSpinner } from "@/components/shared";
import {
  isSeaFarerOnboardingComplete,
  getSeaFarerPrimaryRole,
} from "@/lib/utils/workspace-helpers";
import {
  getMyOnboarding,
  isOnboardingApproved,
  isOnboardingPendingReview,
} from "@/lib/services/onboarding-service";
import {
  getUserReadinessStatus,
  isUserReadyFromReadiness,
  READINESS_NOT_FOUND_CODE,
} from "@/lib/services/user-readiness-service";
import { ApiError } from "@/lib/api-client";
import { redirectToDashboardAfterApproval } from "@/lib/onboarding-approval-redirect";

/** SessionStorage key set by verify-success after permit record; root does one refresh for second status call */
const PERMIT_JUST_RECORDED_KEY = "permitJustRecorded";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, primaryRole } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // After permit record: one refresh so second status call returns updated readiness and we redirect to dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const justRecorded = sessionStorage.getItem(PERMIT_JUST_RECORDED_KEY);
    if (justRecorded === "1") {
      sessionStorage.removeItem(PERMIT_JUST_RECORDED_KEY);
      window.location.reload();
      return;
    }
  }, []);

  // Call User Readiness first, then my-onboarding when source is onboarding (role from API store)
  useEffect(() => {
    const userRole = primaryRole;

    if (userRole) {
      const roleUpper = userRole.toUpperCase();

      if (roleUpper === "ADMIN" || roleUpper === "SUPERADMIN") {
        router.replace("/admin/dashboard");
        return;
      }

      // Training institution: never call User Readiness (that endpoint is for seafarer/employer only). Redirect straight to institution dashboard.
      if (roleUpper === "TRAINING_INSTITUTION") {
        router.replace("/institution/dashboard");
        return;
      }

      (async () => {
        try {
          // 1) User Readiness first — single source of truth for "show onboarding welcome or not"
          const readinessRes = await getUserReadinessStatus();

          if (readinessRes.success && readinessRes.data) {
            const readiness = readinessRes.data;

            if (isUserReadyFromReadiness(readiness)) {
              redirectToDashboardAfterApproval(readiness, userRole);
              return;
            }

            // Not ready: seafarer only — call my-onboarding for pending/draft
            if (readiness.source === "onboarding") {
              const myRes = await getMyOnboarding();
              if (
                myRes.success &&
                myRes.data?.hasActiveOnboarding &&
                isOnboardingPendingReview(myRes.data.status)
              ) {
                router.replace("/onboarding/status/pending");
                return;
              }
            }
            // Permit (agent/ti) not ready: use status only, redirect to welcome
            if (readiness.source === "permit") {
              router.replace("/onboarding/welcome");
              setIsChecking(false);
              return;
            }
          }
        } catch (err) {
          if (err instanceof ApiError && err.code === READINESS_NOT_FOUND_CODE) {
            router.replace("/onboarding/welcome");
            setIsChecking(false);
            return;
          }
          // Other errors: fall through to legacy
        }

        // Fallback: my-onboarding only for seafarer path (OWNER or SEAFARER)
        if (roleUpper === "OWNER" || roleUpper === "SEAFARER") {
          try {
            const response = await getMyOnboarding();
            if (response.success && response.data) {
              const data = response.data;
              if (
                data.hasActiveOnboarding &&
                isOnboardingPendingReview(data.status)
              ) {
                router.replace("/onboarding/status/pending");
                return;
              }
              if (
                data.isOnboardingComplete === true &&
                isOnboardingApproved(data.status)
              ) {
                const role = data.role?.toUpperCase() ?? "SEAFARER";
                redirectToDashboardAfterApproval(null, role);
                return;
              }
            }
          } catch {
            // Fall through
          }

          const seaFarerOnboardingComplete = isSeaFarerOnboardingComplete(user);
          if (seaFarerOnboardingComplete) {
            const primaryRole = getSeaFarerPrimaryRole(user);
            const roleForRoute =
              primaryRole === "Agent"
                ? "AGENT"
                : primaryRole === "Training Institution"
                  ? "TRAINING_INSTITUTION"
                  : "SEAFARER";
            redirectToDashboardAfterApproval(null, roleForRoute);
            return;
          }

          router.replace("/onboarding/welcome");
          setIsChecking(false);
          return;
        }

        // Seafarer only: call my-onboarding for pending status
        if (roleUpper === "SEAFARER") {
          try {
            const response = await getMyOnboarding();
            if (
              response.success &&
              response.data?.hasActiveOnboarding &&
              isOnboardingPendingReview(response.data.status)
            ) {
              router.replace("/onboarding/status/pending");
              return;
            }
          } catch {
            // Fall through
          }
        }
        // Agent / Training institution: use status endpoint only (already handled above); redirect to dashboard
        const dashboardRoute = getDashboardRouteFromRoles([userRole]);
        router.replace(dashboardRoute);
      })();
    } else {
      // No role from API yet: send directly to onboarding welcome (dropdown), not the card-based role selection
      router.replace("/onboarding/welcome");
    }
  }, [user, primaryRole, router]);

  // Show loading spinner while checking or redirecting
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Fallback: redirect to onboarding welcome so we never show the card-based role selection
  if (typeof window !== "undefined") {
    router.replace("/onboarding/welcome");
  }
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-muted-foreground mt-4">Redirecting...</p>
      </div>
    </div>
  );
}
