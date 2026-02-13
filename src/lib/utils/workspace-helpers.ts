/**
 * Workspace Helper Functions
 * Utilities for working with workspace-specific data from user roles
 */

import type { WorkspaceRole } from "@/types";

export interface UserWithWorkspaceRoles {
  roles?: WorkspaceRole[] | string[];
}

/** Known Sea Farer workspace ID (fallback when user.roles structure is missing) */
export const SEA_FARER_WORKSPACE_ID = "432b0876-c0d8-4a56-b9b4-9f8142c7889c";

/**
 * Get the Sea Farer workspace role information
 * @param user - User object with roles array
 * @returns Workspace role info for Sea Farer, or null if not found
 */
export function getSeaFarerWorkspace(
  user: UserWithWorkspaceRoles | null | undefined
): WorkspaceRole | null {
  if (!user?.roles || !Array.isArray(user.roles)) {
    return null;
  }

  // Check if roles is array of strings (legacy) or WorkspaceRole objects
  if (user.roles.length > 0 && typeof user.roles[0] === "string") {
    // Legacy format - return null as we need WorkspaceRole structure
    return null;
  }

  // Find the "Sea Farer" workspace (case-insensitive)
  const seaFarerWorkspace = (user.roles as WorkspaceRole[]).find(
    (role) =>
      role.workspaceName?.toLowerCase() === "sea farer" ||
      role.workspaceName?.toLowerCase() === "seafarer" ||
      role.workspaceId === "432b0876-c0d8-4a56-b9b4-9f8142c7889c" // Known Sea Farer workspace ID
  );

  return seaFarerWorkspace || null;
}

/**
 * Check if onboarding is complete for Sea Farer workspace
 * @param user - User object with roles array
 * @returns true if onboarding is complete for Sea Farer workspace
 */
export function isSeaFarerOnboardingComplete(
  user: UserWithWorkspaceRoles | null | undefined
): boolean {
  const seaFarerWorkspace = getSeaFarerWorkspace(user);
  return seaFarerWorkspace?.is_onboarding_complete === true;
}

/**
 * Get the user's role in the Sea Farer workspace
 * @param user - User object with roles array
 * @returns Array of role names (e.g., ["Owner", "Seafarer", "Agent", "Training Institution"])
 */
export function getSeaFarerRoles(
  user: UserWithWorkspaceRoles | null | undefined
): string[] {
  const seaFarerWorkspace = getSeaFarerWorkspace(user);
  if (
    !seaFarerWorkspace?.tenants ||
    !Array.isArray(seaFarerWorkspace.tenants)
  ) {
    return [];
  }

  const roles: string[] = [];
  seaFarerWorkspace.tenants.forEach((tenant) => {
    if (tenant.roles && Array.isArray(tenant.roles)) {
      tenant.roles.forEach((roleObj) => {
        if (roleObj.role && typeof roleObj.role === "string") {
          roles.push(roleObj.role);
        }
      });
    }
  });

  return roles;
}

/**
 * Get the primary role for Sea Farer workspace (for dashboard routing)
 * Priority: Owner > Seafarer > Agent > Training Institution
 * @param user - User object with roles array
 * @returns Primary role name or null
 */
export function getSeaFarerPrimaryRole(
  user: UserWithWorkspaceRoles | null | undefined
): string | null {
  const roles = getSeaFarerRoles(user);

  // Priority order
  if (roles.includes("Owner")) return "Owner";
  if (roles.includes("Seafarer")) return "Seafarer";
  if (roles.includes("Agent")) return "Agent";
  if (roles.includes("Training Institution")) return "Training Institution";

  return roles[0] || null;
}

/** User with optional adminDetails from IMS (adminModules, etc.) */
export interface UserWithAdminDetails extends UserWithWorkspaceRoles {
  adminDetails?: {
    adminModules?: Array<{
      module?: string;
      workspaceId?: string;
      role?: string;
    }>;
  };
}

/**
 * Check if the user is a Super Admin in the Sea Farer module.
 * Used to restrict the seafarer app sidebar to only the Dashboard for Super Admins;
 * other roles get their menu from IMS.
 * @param user - User object with roles and optional adminDetails
 * @param workspaceId - Current workspace ID (e.g. Sea Farer workspace)
 * @returns true if user has SuperAdmin role in this workspace / Sea Farer module
 */
export function isSuperAdminInSeafarer(
  user: UserWithAdminDetails | null | undefined,
  workspaceId: string | undefined
): boolean {
  if (!user) return false;

  // Check adminDetails.adminModules (IMS) for Sea Farer module with SuperAdmin role
  const adminModules = user.adminDetails?.adminModules;
  if (adminModules && Array.isArray(adminModules)) {
    const seaFarerModule = adminModules.find(
      (m) =>
        (m.module?.toLowerCase() === "sea farer" ||
          m.module?.toLowerCase() === "seafarer" ||
          m.workspaceId === SEA_FARER_WORKSPACE_ID) &&
        m.role?.toLowerCase() === "superadmin"
    );
    if (seaFarerModule) return true;
  }

  // Check user.roles for this workspace (or Sea Farer) with SuperAdmin in tenants
  if (!workspaceId && !user.roles) return false;
  const roles = user.roles as WorkspaceRole[] | undefined;
  if (!roles || !Array.isArray(roles) || roles.length === 0) return false;
  if (typeof roles[0] === "string") return false;

  const targetWorkspaceId = workspaceId || SEA_FARER_WORKSPACE_ID;
  const workspaceRole = (roles as WorkspaceRole[]).find(
    (r) => r.workspaceId === targetWorkspaceId
  );
  if (!workspaceRole?.tenants?.length) return false;

  const hasSuperAdmin = workspaceRole.tenants.some((tenant) =>
    tenant.roles?.some(
      (r) => r.role?.toLowerCase() === "superadmin"
    )
  );
  return hasSuperAdmin;
}
