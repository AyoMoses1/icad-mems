/**
 * Workspace Helper Functions
 * Utilities for working with workspace-specific data from user roles
 */

import type { WorkspaceRole } from "@/types";

export interface UserWithWorkspaceRoles {
  roles?: WorkspaceRole[] | string[];
}

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
  if (!seaFarerWorkspace?.tenants || !Array.isArray(seaFarerWorkspace.tenants)) {
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
