/**
 * Route Protection Utilities
 * Provides functions to check if a user can access a route based on permissions
 * Integrates with the permissions API from GetMyPermissions_API_Documentation.md
 */

import { canAccessRoute } from "@/lib/role-routing";
import { hasPermission, hasAnyPermission } from "@/lib/services/permissions-service";

/**
 * Check if user can access a route based on role
 * This is a fallback when permissions are not available
 * 
 * @param userRole - User's role
 * @param route - Route path to check
 * @returns true if user can access the route
 */
export function canAccessRouteByRole(
  userRole: string | null,
  route: string
): boolean {
  if (!userRole) return false;
  return canAccessRoute(userRole, route);
}

/**
 * Check if user can access a route based on permissions
 * 
 * @param permissions - Array of user permission strings
 * @param route - Route path to check
 * @param requiredPermissions - Optional array of required permissions (format: "ResourceName.PermissionName")
 * @returns true if user can access the route
 */
export function canAccessRouteByPermissions(
  permissions: string[],
  route: string,
  requiredPermissions?: string[]
): boolean {
  // If specific permissions are required, check them
  if (requiredPermissions && requiredPermissions.length > 0) {
    return hasAnyPermission(permissions, requiredPermissions);
  }

  // Map routes to required permissions based on URL path
  const routePermissionMap: Record<string, string[]> = {
    // Seafarer routes
    "/seafarer/dashboard": ["Seafarer.View", "Dashboard.View"],
    "/seafarer/services": ["Service.View", "Services.View"],
    "/seafarer/applications": ["Application.View", "Applications.View"],
    "/seafarer/profile": ["Profile.View", "User.View"],
    
    // Agent routes
    "/agent/dashboard": ["Agent.View", "Dashboard.View"],
    "/agent/applications": ["Application.View", "Applications.View"],
    
    // Institution routes
    "/institution/dashboard": ["Institution.View", "Dashboard.View"],
    "/institution/applications": ["Application.View", "Applications.View"],
    
    // Admin routes
    "/admin/dashboard": ["Admin.View", "Dashboard.View"],
    "/admin/onboarding": ["Onboarding.View"],
    "/admin/applications": ["Application.View", "Applications.View"],
    "/admin/accreditations": ["Accreditation.View", "Accreditations.View"],
    "/admin/inspections": ["Inspection.View", "Inspections.View"],
    "/admin/services": ["Service.View", "Services.View"],
    
    // Invoice/Payment routes
    "/invoices": ["Invoice.View", "Invoices.View", "Payment.View"],
    "/invoices/my-invoices": ["Invoice.View", "Invoices.View"],
    "/invoices/payments": ["Payment.View", "Payments.View"],
    
    // Accreditation routes
    "/accreditations": ["Accreditation.View", "Accreditations.View"],
    "/accreditations/apply": ["Accreditation.Create"],
    
    // Institution routes
    "/institutions": ["Institution.View", "Institutions.View"],
  };

  // Check exact route match first
  if (routePermissionMap[route]) {
    return hasAnyPermission(permissions, routePermissionMap[route]);
  }

  // Check route prefix matches
  for (const [routePrefix, requiredPerms] of Object.entries(routePermissionMap)) {
    if (route.startsWith(routePrefix)) {
      return hasAnyPermission(permissions, requiredPerms);
    }
  }

  // Default: if no specific mapping, check for general View permission
  // Extract resource name from route
  const routeParts = route.split("/").filter(Boolean);
  if (routeParts.length > 0) {
    const resourceName = routeParts[0].charAt(0).toUpperCase() + routeParts[0].slice(1);
    return hasPermission(permissions, resourceName, "View");
  }

  // If no mapping found and no permissions, deny access
  return false;
}

/**
 * Combined route access check using both role and permissions
 * 
 * @param userRole - User's role
 * @param permissions - Array of user permission strings
 * @param route - Route path to check
 * @param requiredPermissions - Optional array of required permissions
 * @returns true if user can access the route
 */
export function canAccessRouteCombined(
  userRole: string | null,
  permissions: string[] | null,
  route: string,
  requiredPermissions?: string[]
): boolean {
  // If permissions are available, use them (more granular)
  if (permissions && permissions.length > 0) {
    return canAccessRouteByPermissions(permissions, route, requiredPermissions);
  }

  // Fall back to role-based check
  return canAccessRouteByRole(userRole, route);
}

/**
 * Get required permissions for a route
 * 
 * @param route - Route path
 * @returns Array of required permission strings, or empty array if unknown
 */
export function getRequiredPermissionsForRoute(route: string): string[] {
  const routePermissionMap: Record<string, string[]> = {
    "/seafarer/dashboard": ["Seafarer.View", "Dashboard.View"],
    "/seafarer/services": ["Service.View", "Services.View"],
    "/seafarer/applications": ["Application.View", "Applications.View"],
    "/seafarer/profile": ["Profile.View", "User.View"],
    "/agent/dashboard": ["Agent.View", "Dashboard.View"],
    "/agent/applications": ["Application.View", "Applications.View"],
    "/institution/dashboard": ["Institution.View", "Dashboard.View"],
    "/admin/dashboard": ["Admin.View", "Dashboard.View"],
    "/admin/onboarding": ["Onboarding.View"],
    "/admin/applications": ["Application.View", "Applications.View"],
    "/admin/accreditations": ["Accreditation.View", "Accreditations.View"],
    "/admin/inspections": ["Inspection.View", "Inspections.View"],
    "/admin/services": ["Service.View", "Services.View"],
    "/invoices": ["Invoice.View", "Invoices.View", "Payment.View"],
    "/accreditations": ["Accreditation.View", "Accreditations.View"],
    "/accreditations/apply": ["Accreditation.Create"],
    "/institutions": ["Institution.View", "Institutions.View"],
  };

  // Check exact match
  if (routePermissionMap[route]) {
    return routePermissionMap[route];
  }

  // Check prefix match
  for (const [routePrefix, perms] of Object.entries(routePermissionMap)) {
    if (route.startsWith(routePrefix)) {
      return perms;
    }
  }

  return [];
}
