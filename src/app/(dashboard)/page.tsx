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
import { getFirstMenuRouteForWorkspace } from "@/lib/services/menu-service";
import { SEA_FARER_WORKSPACE_ID } from "@/lib/utils/workspace-helpers";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Check user role and route accordingly
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole) {
      const roleUpper = userRole.toUpperCase();

      if (roleUpper === "ADMIN" || roleUpper === "SUPERADMIN") {
        router.replace("/admin/dashboard");
        return;
      }

      if (roleUpper === "OWNER") {
        (async () => {
          try {
            const response = await getMyOnboarding();
            if (response.success && response.data) {
              const data = response.data;
              // If user has active onboarding in pending state, send to status page (check status + Veriff).
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
                  // Use role-based route when menu API fails
                }
                router.replace(targetRoute);
                return;
              }
            }
          } catch {
            // API error or no onboarding - fall back to legacy check
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
              // Fall through to role-based redirect
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

          // OWNER: send to new onboarding welcome (about app + role dropdown) instead of legacy role selection
          router.replace("/onboarding/welcome");
          setIsChecking(false);
        })();
        return;
      }

      // SEAFARER / AGENT / TRAINING_INSTITUTION: if they have pending onboarding, send to status page
      const onboardingRequiredRoles = [
        "SEAFARER",
        "AGENT",
        "TRAINING_INSTITUTION",
      ];
      if (onboardingRequiredRoles.includes(roleUpper)) {
        (async () => {
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
            // Fall through to dashboard
          }
          const dashboardRoute = getDashboardRouteFromRoles([userRole]);
          router.replace(dashboardRoute);
        })();
        return;
      }

      const dashboardRoute = getDashboardRouteFromRoles([userRole]);
      router.replace(dashboardRoute);
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
