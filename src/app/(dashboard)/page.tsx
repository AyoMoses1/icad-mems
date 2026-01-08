"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardRouteFromRoles } from "@/lib/role-routing";
import { useAuthStore } from "@/store";
import { LoadingSpinner } from "@/components/shared";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Redirect users to their role-specific dashboard
  useEffect(() => {
    // Get user role from localStorage or infer from user data
    let userRole = localStorage.getItem("userRole");
    
    // If no role in localStorage, try to get from user workspaces or roles
    if (!userRole && user) {
      // Try roles array first (from UserInfo)
      const roles = (user as any).roles || [];
      if (roles.length > 0) {
        // Filter out OWNER role
        const nonOwnerRoles = roles.filter((r: string) => r.toUpperCase() !== "OWNER");
        userRole = nonOwnerRoles.length > 0 ? nonOwnerRoles[0] : roles[0];
      }
      // Fall back to workspace-based detection
      else if (user.workspaces && user.workspaces.length > 0) {
        const workspace = user.workspaces[0];
        const workspaceCode = workspace.workspaceCode?.toUpperCase() || "";
        const workspaceName = workspace.workspaceName?.toUpperCase() || "";
        
        if (workspaceCode.includes("SEAFARER") || workspaceName.includes("SEAFARER")) {
          userRole = "SEAFARER";
        } else if (workspaceCode.includes("AGENT") || workspaceName.includes("AGENT")) {
          userRole = "AGENT";
        } else if (workspaceCode.includes("INSTITUTION") || workspaceName.includes("INSTITUTION")) {
          userRole = "TRAINING_INSTITUTION";
        } else if (workspaceCode.includes("ADMIN") || workspaceName.includes("ADMIN")) {
          userRole = "ADMIN";
        }
      }
    }
    
    // If we have a role, redirect to the appropriate dashboard
    if (userRole) {
      const dashboardRoute = getDashboardRouteFromRoles([userRole]);
      router.replace(dashboardRoute);
    }
  }, [user, router]);

  // Show loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-muted-foreground mt-4">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
