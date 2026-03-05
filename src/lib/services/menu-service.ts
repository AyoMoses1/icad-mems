/**
 * Menu Service - API integration for menu endpoints
 * Based on GetMyPermissions_API_Documentation.md
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";

/**
 * Menu Item DTO structure from API
 */
export interface MenuItemDto {
  resourceId: string;
  name: string;
  url?: string | null;
  parentId?: string | null;
  children: MenuItemDto[];
}

/**
 * Workspace Menu DTO structure from API
 */
export interface WorkspaceMenuDto {
  workspaceId: string;
  workspaceName?: string | null;
  workspaceCode?: string | null;
  resources: MenuItemDto[];
}

/**
 * Get workspace menu items
 * GET /api/menu?workspaceId={workspaceId}
 *
 * @param workspaceId - Optional workspace ID to filter menu items for a specific workspace
 * @returns Array of workspace menus with their menu items
 */
export async function getMenu(
  workspaceId?: string
): Promise<ApiResponse<WorkspaceMenuDto[]>> {
  const url = workspaceId
    ? `/api/menu?workspaceId=${workspaceId}`
    : "/api/menu";

  return apiGetMain<WorkspaceMenuDto[]>(url);
}

/**
 * Flatten menu items into a single array (useful for searching/filtering)
 *
 * @param items - Array of menu items (can be nested)
 * @returns Flattened array of all menu items
 */
export function flattenMenuItems(items: MenuItemDto[]): MenuItemDto[] {
  const result: MenuItemDto[] = [];

  for (const item of items) {
    result.push(item);
    if (item.children && item.children.length > 0) {
      result.push(...flattenMenuItems(item.children));
    }
  }

  return result;
}

/**
 * Get the first valid menu item URL from the menu response.
 * Used to redirect users (e.g. after onboarding) to what they actually see in the menu
 * instead of a hardcoded dashboard, avoiding owner/role priority mismatches.
 *
 * @param menus - Array of workspace menus from GET /api/menu
 * @returns First menu item URL (e.g. /agent/dashboard) or null if none
 */
export function getFirstMenuRoute(
  menus: WorkspaceMenuDto[] | null | undefined
): string | null {
  if (!menus || menus.length === 0) return null;
  for (const menu of menus) {
    const flattened = flattenMenuItems(menu.resources || []);
    for (const item of flattened) {
      const url = item.url?.trim();
      if (url && url !== "#") return url;
    }
  }
  return null;
}

/**
 * Fetch menu for a workspace and return the first menu item URL.
 * Use this for post-onboarding or root redirect so the user lands on their first menu item.
 */
export async function getFirstMenuRouteForWorkspace(
  workspaceId: string
): Promise<string | null> {
  const response = await getMenu(workspaceId);
  if (!response.success || !response.data) return null;
  return getFirstMenuRoute(response.data);
}

/**
 * URL path prefixes allowed for Seafarer workspace when API returns all resources.
 * Used to filter menu so seafarers only see their own items, not admin/agent/institution.
 */
const SEAFARER_ALLOWED_URL_PREFIXES = [
  "/seafarer/",
  "/profile-documents",
  "/invoices/my-invoices",
  "/invoices/payments",
  "/audit-logs",
  "/license-certification",
  "/onboarding",
  "/documents",
  "/accreditations/apply",
  "/accreditations/stcw",
  "/ranks",
];

function isSeafarerAllowedUrl(url: string | null | undefined): boolean {
  if (!url || url === "#") return false;
  const path = url.replace(/^\//, "").toLowerCase();
  return SEAFARER_ALLOWED_URL_PREFIXES.some((prefix) => {
    const p = prefix.replace(/^\//, "").toLowerCase();
    return path === p || path.startsWith(p.endsWith("/") ? p : p + "/");
  });
}

/**
 * Filter resources to only seafarer-relevant items when workspace is Seafarer (SEA_FARER).
 * Backend may return all resources; this keeps only items with allowed URLs so the menu is not "plenty".
 */
export function filterResourcesForSeafarerWorkspace(
  items: MenuItemDto[]
): MenuItemDto[] {
  return items
    .map((item) => {
      const hasAllowedUrl = isSeafarerAllowedUrl(item.url);
      const filteredChildren =
        item.children && item.children.length > 0
          ? filterResourcesForSeafarerWorkspace(item.children)
          : [];
      const hasAllowedChild = filteredChildren.length > 0;

      if (hasAllowedUrl) {
        return { ...item, children: filteredChildren };
      }
      if (hasAllowedChild) {
        return { ...item, children: filteredChildren };
      }
      return null;
    })
    .filter((item): item is MenuItemDto => item !== null);
}

/**
 * Find menu item by URL
 *
 * @param menus - Array of workspace menus
 * @param url - URL to search for
 * @returns Menu item if found, null otherwise
 */
export function findMenuItemByUrl(
  menus: WorkspaceMenuDto[],
  url: string
): MenuItemDto | null {
  for (const menu of menus) {
    const flattened = flattenMenuItems(menu.resources);
    const found = flattened.find((item) => item.url === url);
    if (found) return found;
  }
  return null;
}

/**
 * Filter menu items based on user permissions
 * Only includes menu items where the user has at least View permission for the resource
 *
 * @param menus - Array of workspace menus
 * @param permissions - Array of user permission strings
 * @returns Filtered array of workspace menus
 */
export function filterMenuByPermissions(
  menus: WorkspaceMenuDto[],
  permissions: string[]
): WorkspaceMenuDto[] {
  return menus.map((menu) => {
    const filteredResources = filterMenuItemsByPermissions(
      menu.resources,
      permissions
    );
    return {
      ...menu,
      resources: filteredResources,
    };
  });
}

/**
 * Recursively filter menu items based on permissions
 *
 * @param items - Array of menu items
 * @param permissions - Array of user permission strings
 * @returns Filtered array of menu items
 */
function filterMenuItemsByPermissions(
  items: MenuItemDto[],
  permissions: string[]
): MenuItemDto[] {
  return items
    .map((item) => {
      // Check if user has View permission for this resource
      // Permission format: "ResourceName.View"
      // We'll check if any permission matches the resource name
      const hasAccess = checkMenuItemAccess(item, permissions);

      if (!hasAccess) {
        return null;
      }

      // Recursively filter children
      const filteredChildren = item.children
        ? filterMenuItemsByPermissions(item.children, permissions)
        : [];

      return {
        ...item,
        children: filteredChildren,
      };
    })
    .filter((item): item is MenuItemDto => item !== null);
}

/**
 * Check if user has access to a menu item
 * Checks if user has View permission for the resource based on URL path
 *
 * @param item - Menu item to check
 * @param permissions - Array of user permission strings
 * @returns true if user has access
 */
function checkMenuItemAccess(
  item: MenuItemDto,
  permissions: string[]
): boolean {
  // If no permissions, deny access
  if (!permissions || permissions.length === 0) {
    return false;
  }

  // If no URL, allow access (parent items without URLs are usually allowed)
  if (!item.url || item.url === "#") {
    return true;
  }

  // Extract resource name from URL path
  // Example: /seafarer/applications -> "Applications"
  // Example: /admin/onboarding -> "Onboarding"
  const urlPath = item.url.replace(/^\//, "").split("/")[0]; // Get first segment after /

  // Map URL paths to resource names
  const resourceMap: Record<string, string[]> = {
    seafarer: ["Seafarer", "Seafarers", "Application", "Applications"],
    agent: ["Agent", "Agents", "Agency"],
    institution: ["Institution", "Institutions", "Training"],
    admin: [
      "Admin",
      "Onboarding",
      "Application",
      "Applications",
      "Accreditation",
      "Accreditations",
      "Inspection",
      "Inspections",
    ],
    accreditations: ["Accreditation", "Accreditations"],
    inspections: ["Inspection", "Inspections"],
    invoices: ["Invoice", "Invoices", "Payment", "Payments"],
    applications: ["Application", "Applications"],
    onboarding: ["Onboarding"],
    services: ["Service", "Services"],
    documents: ["Document", "Documents"],
    profile: ["Profile", "User", "Users"],
  };

  // Find matching resource names
  const possibleResources = resourceMap[urlPath] || [];

  // Also try to extract from menu item name
  const nameWords = item.name
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""));

  // Check if user has View permission for any matching resource
  // Permission format: "ResourceName.View"
  return permissions.some((perm) => {
    const [permResource, permAction] = perm.split(".");

    // Check if permission is View (or any action if we're being permissive)
    if (permAction && permAction.toLowerCase() !== "view") {
      return false;
    }

    // Check against mapped resources
    if (
      possibleResources.some(
        (res) => res.toLowerCase() === permResource.toLowerCase()
      )
    ) {
      return true;
    }

    // Check against name words
    if (
      nameWords.some(
        (word) => word.toLowerCase() === permResource.toLowerCase()
      )
    ) {
      return true;
    }

    return false;
  });
}
