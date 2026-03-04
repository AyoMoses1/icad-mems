"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardRouteFromRoles,
  getDashboardRoute,
} from "@/lib/role-routing";
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
  getDashboardRoleFromReadiness,
  READINESS_NOT_FOUND_CODE,
} from "@/lib/services/user-readiness-service";
import { ApiError } from "@/lib/api-client";
import { getFirstMenuRouteForWorkspace } from "@/lib/services/menu-service";
import { SEA_FARER_WORKSPACE_ID } from "@/lib/utils/workspace-helpers";

/** SessionStorage key set by verify-success after permit record; root does one refresh for second status call */
const PERMIT_JUST_RECORDED_KEY = "permitJustRecorded";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
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

  // Call User Readiness first, then my-onboarding when source is onboarding
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

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
              if (readiness.source === "permit") {
                const dashboardRole = getDashboardRoleFromReadiness(readiness);
                let targetRoute =
                  dashboardRole !== null
                    ? getDashboardRoute(dashboardRole)
                    : "/seafarer/dashboard";
                // For AGENT/TRAINING_INSTITUTION use role dashboard only; don't override with first menu route
                const useRoleDashboardOnly =
                  dashboardRole === "AGENT" || dashboardRole === "TRAINING_INSTITUTION";
                if (!useRoleDashboardOnly) {
                  try {
                    const firstMenuRoute = await getFirstMenuRouteForWorkspace(
                      SEA_FARER_WORKSPACE_ID
                    );
                    if (firstMenuRoute) targetRoute = firstMenuRoute;
                  } catch {
                    // Use role-based route
                  }
                }
                router.replace(targetRoute);
                return;
              }
              // source === "onboarding" and ready
              const role = readiness.role?.toUpperCase();
              let targetRoute = getDashboardRoute(role || "SEAFARER");
              const useRoleDashboardOnly =
                role === "AGENT" || role === "TRAINING_INSTITUTION" || role === "INSTITUTION";
              if (!useRoleDashboardOnly) {
                try {
                  const firstMenuRoute = await getFirstMenuRouteForWorkspace(
                    SEA_FARER_WORKSPACE_ID
                  );
                  if (firstMenuRoute) targetRoute = firstMenuRoute;
                } catch {
                  // Use role-based route
                }
              }
              router.replace(targetRoute);
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
                const role = data.role?.toUpperCase();
                let targetRoute = getDashboardRoute(role || "SEAFARER");
                const useRoleDashboardOnly =
                  role === "AGENT" || role === "TRAINING_INSTITUTION" || role === "INSTITUTION";
                if (!useRoleDashboardOnly) {
                  try {
                    const firstMenuRoute = await getFirstMenuRouteForWorkspace(
                      SEA_FARER_WORKSPACE_ID
                    );
                    if (firstMenuRoute) targetRoute = firstMenuRoute;
                  } catch {
                    // Use role-based route
                  }
                }
                router.replace(targetRoute);
                return;
              }
            }
          } catch {
            // Fall through
          }

          const seaFarerOnboardingComplete = isSeaFarerOnboardingComplete(user);
          if (seaFarerOnboardingComplete) {
            const primaryRole = getSeaFarerPrimaryRole(user);
            // For AGENT and Training Institution use role dashboard only; never first menu route
            if (primaryRole === "Agent") {
              router.replace("/agent/dashboard");
              return;
            }
            if (primaryRole === "Training Institution") {
              router.replace("/institution/dashboard");
              return;
            }
            let didRedirect = false;
            try {
              const firstMenuRoute = await getFirstMenuRouteForWorkspace(
                SEA_FARER_WORKSPACE_ID
              );
              if (firstMenuRoute) {
                router.replace(firstMenuRoute);
                didRedirect = true;
              }
            } catch {
              // Fall through
            }
            if (didRedirect) return;
            if (primaryRole === "Seafarer" || primaryRole === "Owner") {
              router.replace("/seafarer/dashboard");
              return;
            }
            router.replace("/seafarer/dashboard");
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
      // No role in localStorage: send directly to onboarding welcome (dropdown), not the card-based role selection
      router.replace("/onboarding/welcome");
    }
  }, [user, router]);

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
