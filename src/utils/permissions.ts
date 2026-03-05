/**
 * Permission utilities for checking user access
 * Based on frontend-service-management-guide.md
 * Role is read from API (auth store primaryRole), not localStorage.
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

  // Role from API (auth store), not localStorage
  const primaryRole = useAuthStore.getState().primaryRole;
  if (primaryRole) {
    const roleUpper = primaryRole.toUpperCase();
    if (
      roleUpper === "ADMIN" ||
      roleUpper === "ADMINISTRATOR" ||
      roleUpper === "SUPERADMIN"
    ) {
      return true;
    }
  }

  // Check user roles array (nested structure from API)
  if (user.roles && Array.isArray(user.roles)) {
    const roles = (user.roles as any[]).flatMap((r) => {
      if (typeof r === "string") return [String(r).toUpperCase()];
      if (r?.tenants?.length) {
        return (r.tenants as any[]).flatMap((t: any) =>
          (t?.roles ?? []).map((ro: any) => String(ro?.role ?? ro).toUpperCase())
        );
      }
      return [];
    });
    if (
      roles.includes("ADMIN") ||
      roles.includes("ADMINISTRATOR") ||
      roles.includes("SUPERADMIN")
    ) {
      return true;
    }
  }

  // Check for specific permission
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
