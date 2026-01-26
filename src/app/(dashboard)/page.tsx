"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardRouteFromRoles } from "@/lib/role-routing";
import { useAuthStore } from "@/store";
import { LoadingSpinner, RoleSelectionScreen } from "@/components/shared";
import {
  isSeaFarerOnboardingComplete,
  getSeaFarerPrimaryRole,
} from "@/lib/utils/workspace-helpers";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  
  // Check user role and route accordingly
  useEffect(() => {
    // Get user role from localStorage
    const userRole = localStorage.getItem("userRole");
    
    if (userRole) {
      const roleUpper = userRole.toUpperCase();
      
      // If user is ADMIN, redirect to admin dashboard immediately
      if (roleUpper === "ADMIN" || roleUpper === "SUPERADMIN") {
        router.replace("/admin/dashboard");
        return;
      }
      
      // If user is OWNER, check if Sea Farer workspace onboarding is complete
      if (roleUpper === "OWNER") {
        const seaFarerOnboardingComplete = isSeaFarerOnboardingComplete(user);
        
        // If Sea Farer onboarding is complete, redirect to appropriate dashboard
        if (seaFarerOnboardingComplete) {
          const primaryRole = getSeaFarerPrimaryRole(user);
          
          // Redirect based on primary role in Sea Farer workspace
          // If role is Owner, default to Seafarer dashboard
          // (Owners typically complete Seafarer onboarding first)
          if (primaryRole === "Seafarer" || primaryRole === "Owner") {
            router.replace("/seafarer/dashboard");
            return;
          } else if (primaryRole === "Agent") {
            router.replace("/agent/dashboard");
            return;
          } else if (primaryRole === "Training Institution") {
            router.replace("/training-institution/dashboard");
            return;
          }
          
          // Fallback: if onboarding complete but role unknown, go to seafarer dashboard
          router.replace("/seafarer/dashboard");
          return;
        }
        
        // Show role selection screen only if onboarding is NOT complete
        setShowRoleSelection(true);
        setIsChecking(false);
        return;
      }
      
      // For other roles, redirect to their specific dashboard
      const dashboardRoute = getDashboardRouteFromRoles([userRole]);
      router.replace(dashboardRoute);
    } else {
      // If no role stored, show loading (layout will handle role detection)
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
          <p className="text-muted-foreground mt-4">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Fallback: show role selection if we reach here
  return <RoleSelectionScreen />;
}
