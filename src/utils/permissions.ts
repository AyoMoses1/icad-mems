/**
 * Permission utilities for checking user access
 * Based on frontend-service-management-guide.md
 */

import { useAuthStore } from "@/store";
import { User } from "@/types";

/**
 * Check if user can manage services (admin-only)
 * @param user - Current user object
 * @returns true if user is admin, false otherwise
 */
export const canManageServices = (user: User | null | undefined): boolean => {
  if (!user) return false;

  // Check user roles array
  if (user.roles && Array.isArray(user.roles)) {
    const roles = user.roles.map((r) => String(r).toUpperCase());
    if (
      roles.includes("ADMIN") ||
      roles.includes("ADMINISTRATOR") ||
      roles.includes("SUPERADMIN")
    ) {
      return true;
    }
  }

  // Check localStorage for role (fallback)
  if (typeof window !== "undefined") {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      const roleUpper = storedRole.toUpperCase();
      if (
        roleUpper === "ADMIN" ||
        roleUpper === "ADMINISTRATOR" ||
        roleUpper === "SUPERADMIN"
      ) {
        return true;
      }
    }
  }

  // Check for specific permission
  // Note: This assumes permissions might be in user object in the future
  if ((user as any).permissions && Array.isArray((user as any).permissions)) {
    const permissions = (user as any).permissions.map((p: string) =>
      String(p).toUpperCase()
    );
    if (
      permissions.includes("SERVICES:MANAGE") ||
      permissions.includes("SERVICES_MANAGE")
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Hook to check service management permissions
 */
export const useCanManageServices = (): boolean => {
  const { user } = useAuthStore();
  return canManageServices(user);
};
