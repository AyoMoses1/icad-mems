/**
 * Permissions Service - API integration for permissions endpoints
 * Based on GetMyPermissions_API_Documentation.md
 */

import type { ApiResponse } from "@/lib/api-client";

/**
 * Get user permissions for a specific workspace.
 * The endpoint GET /api/workspaces/{workspaceId}/permissions/my is not available (404),
 * so we return an empty list. Menu and route access will not filter by permissions.
 *
 * @param _workspaceId - The unique identifier of the workspace (unused)
 * @returns Response with empty permission array
 */
export async function getMyPermissions(
  _workspaceId: string
): Promise<ApiResponse<string[]>> {
  return { success: true, data: [] };
}

/**
 * Check if user has a specific permission
 * 
 * @param permissions - Array of permission strings
 * @param resource - Resource name (e.g., "WasteRequest", "Workspaces")
 * @param permission - Permission name (e.g., "Create", "View", "Update", "Delete")
 * @returns true if user has the permission
 */
export function hasPermission(
  permissions: string[],
  resource: string,
  permission: string
): boolean {
  const permissionString = `${resource}.${permission}`;
  return permissions.includes(permissionString);
}

/**
 * Check if user has any of the specified permissions
 * 
 * @param permissions - Array of permission strings
 * @param requiredPermissions - Array of permission strings to check (format: "ResourceName.PermissionName")
 * @returns true if user has at least one of the required permissions
 */
export function hasAnyPermission(
  permissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((perm) => permissions.includes(perm));
}

/**
 * Check if user has all of the specified permissions
 * 
 * @param permissions - Array of permission strings
 * @param requiredPermissions - Array of permission strings to check (format: "ResourceName.PermissionName")
 * @returns true if user has all of the required permissions
 */
export function hasAllPermissions(
  permissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((perm) => permissions.includes(perm));
}
