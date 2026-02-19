"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardRouteFromRoles,
  getDashboardRoute,
} from "@/lib/role-routing";
import { useAuthStore } from "@/store";
import { LoadingSpinner, RoleSelectionScreen } from "@/components/shared";
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

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Call User Readiness first, then my-onboarding when source is onboarding
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole) {
      const roleUpper = userRole.toUpperCase();

      if (roleUpper === "ADMIN" || roleUpper === "SUPERADMIN") {
        router.replace("/admin/dashboard");
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
                const targetRoute =
                  dashboardRole !== null
                    ? getDashboardRoute(dashboardRole)
                    : "/seafarer/dashboard";
                try {
                  const firstMenuRoute = await getFirstMenuRouteForWorkspace(
                    SEA_FARER_WORKSPACE_ID
                  );
                  if (firstMenuRoute) {
                    router.replace(firstMenuRoute);
                    return;
                  }
                } catch {
                  // Use role-based route
                }
                router.replace(targetRoute);
                return;
              }
              // source === "onboarding" and ready
              const role = readiness.role?.toUpperCase();
              let targetRoute = getDashboardRoute(role || "SEAFARER");
              try {
                const firstMenuRoute = await getFirstMenuRouteForWorkspace(
                  SEA_FARER_WORKSPACE_ID
                );
                if (firstMenuRoute) targetRoute = firstMenuRoute;
              } catch {
                // Use role-based route
              }
              router.replace(targetRoute);
              return;
            }

            // Not ready: onboarding source with pending/draft etc.
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
          }
        } catch (err) {
          if (err instanceof ApiError && err.code === READINESS_NOT_FOUND_CODE) {
            router.replace("/onboarding/welcome");
            setIsChecking(false);
            return;
          }
          // Other errors: fall through to legacy / my-onboarding
        }

        // Fallback: my-onboarding (e.g. OWNER or when readiness failed)
        if (roleUpper === "OWNER") {
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
                try {
                  const firstMenuRoute = await getFirstMenuRouteForWorkspace(
                    SEA_FARER_WORKSPACE_ID
                  );
                  if (firstMenuRoute) targetRoute = firstMenuRoute;
                } catch {
                  // Use role-based route
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
            const primaryRole = getSeaFarerPrimaryRole(user);
            if (primaryRole === "Seafarer" || primaryRole === "Owner") {
              router.replace("/seafarer/dashboard");
              return;
            }
            if (primaryRole === "Agent") {
              router.replace("/agent/dashboard");
              return;
            }
            if (primaryRole === "Training Institution") {
              router.replace("/institution/dashboard");
              return;
            }
            router.replace("/seafarer/dashboard");
            return;
          }

          router.replace("/onboarding/welcome");
          setIsChecking(false);
          return;
        }

        const onboardingRequiredRoles = [
          "SEAFARER",
          "AGENT",
          "TRAINING_INSTITUTION",
        ];
        if (onboardingRequiredRoles.includes(roleUpper)) {
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
          const dashboardRoute = getDashboardRouteFromRoles([userRole]);
          router.replace(dashboardRoute);
          return;
        }

        const dashboardRoute = getDashboardRouteFromRoles([userRole]);
        router.replace(dashboardRoute);
      })();
    } else {
      setIsChecking(false);
    }
  }, [user, router]);

  // Show role selection screen for OWNER
  if (showRoleSelection) {
    return <RoleSelectionScreen />;
  }

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

  // Fallback: show role selection if we reach here
  return <RoleSelectionScreen />;
}
