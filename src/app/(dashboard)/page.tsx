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
            if (
              response.success &&
              response.data &&
              response.data.isOnboardingComplete === true &&
              isOnboardingApproved(response.data.status)
            ) {
              const role = response.data.role?.toUpperCase();
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

          setShowRoleSelection(true);
          setIsChecking(false);
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
