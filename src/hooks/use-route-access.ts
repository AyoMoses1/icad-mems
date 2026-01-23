/**
 * Hook to check route access based on permissions and role
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { getMyPermissions } from "@/lib/services/permissions-service";
import { canAccessRouteCombined } from "@/utils/route-protection";

/**
 * Hook to check if current user can access the current route
 * 
 * @param requiredPermissions - Optional array of required permissions
 * @returns Object with access status and loading state
 */
export function useRouteAccess(requiredPermissions?: string[]) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [hasAccess, setHasAccess] = useState<boolean>(true); // Default to true to avoid blocking
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);

      try {
        // Get user role from localStorage
        const userRole = typeof window !== "undefined"
          ? localStorage.getItem("userRole")
          : null;

        // Try to get workspaceId from user
        const workspaceId = user?.workspaces?.[0]?.workspaceId ||
                           (user?.workspaces as any)?.[0]?.id ||
                           undefined;

        let userPermissions: string[] = [];

        // Fetch permissions if workspaceId is available
        if (workspaceId) {
          try {
            const permissionsResponse = await getMyPermissions(workspaceId);
            if (permissionsResponse.success && permissionsResponse.data) {
              userPermissions = permissionsResponse.data;
              setPermissions(userPermissions);
            }
          } catch (error) {
            console.warn("Failed to fetch permissions for route access check:", error);
          }
        }

        // Check access using combined method (permissions first, then role)
        const access = canAccessRouteCombined(
          userRole,
          userPermissions.length > 0 ? userPermissions : null,
          pathname,
          requiredPermissions
        );

        setHasAccess(access);
      } catch (error) {
        console.error("Error checking route access:", error);
        // On error, default to allowing access (fail open)
        // You might want to change this to fail closed depending on security requirements
        setHasAccess(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [pathname, user, requiredPermissions]);

  return {
    hasAccess,
    isChecking,
    permissions,
  };
}
