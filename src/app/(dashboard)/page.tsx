"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardRouteFromRoles } from "@/lib/role-routing";
import { useAuthStore } from "@/store";
import { LoadingSpinner, RoleSelectionScreen } from "@/components/shared";

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
      
      // If user is OWNER, show role selection screen
      if (roleUpper === "OWNER") {
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
