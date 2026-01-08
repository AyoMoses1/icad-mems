/**
 * Role-based routing utility
 * Determines the appropriate dashboard route based on user role
 */

export type UserRole = 
  | "SEAFARER" 
  | "AGENT" 
  | "TRAINING_INSTITUTION" 
  | "ADMIN" 
  | "OFFICER" 
  | "INSPECTOR" 
  | "ACCREDITATION_OFFICER" 
  | "FINANCE"
  | "OWNER";

/**
 * Get the dashboard route for a given role
 */
export function getDashboardRoute(role: UserRole | string): string {
  const roleUpper = role?.toUpperCase() || "";
  
  switch (roleUpper) {
    case "SEAFARER":
      return "/seafarer/dashboard";
    
    case "AGENT":
      return "/agent/dashboard";
    
    case "TRAINING_INSTITUTION":
    case "INSTITUTION":
      return "/institution/dashboard";
    
    case "ADMIN":
    case "OFFICER":
    case "ACCREDITATION_OFFICER":
    case "INSPECTOR":
    case "FINANCE":
      return "/admin/dashboard";
    
    case "OWNER":
      // OWNER might be combined with another role, check roles array
      return "/admin/dashboard";
    
    default:
      // Default to seafarer dashboard if role is unknown
      console.warn(`Unknown role: ${role}, defaulting to seafarer dashboard`);
      return "/seafarer/dashboard";
  }
}

/**
 * Get the dashboard route from user roles array (picks the first valid role)
 */
export function getDashboardRouteFromRoles(roles: string[]): string {
  if (!roles || roles.length === 0) {
    return "/seafarer/dashboard";
  }
  
  // Filter out OWNER role and prioritize other roles
  const nonOwnerRoles = roles.filter(r => r.toUpperCase() !== "OWNER");
  
  // Use the first non-owner role, or first role if all are OWNER
  const primaryRole = nonOwnerRoles.length > 0 ? nonOwnerRoles[0] : roles[0];
  
  return getDashboardRoute(primaryRole);
}

/**
 * Check if a user has access to a specific route based on their role
 */
export function canAccessRoute(userRole: UserRole | string, route: string): boolean {
  const roleUpper = userRole?.toUpperCase() || "";
  
  // Admin roles can access everything
  if (["ADMIN", "OFFICER"].includes(roleUpper)) {
    return true;
  }
  
  // Check role-specific access
  if (roleUpper === "SEAFARER" && route.startsWith("/seafarer")) {
    return true;
  }
  
  if (roleUpper === "AGENT" && (route.startsWith("/agent") || route.startsWith("/seafarer"))) {
    return true;
  }
  
  if ((roleUpper === "TRAINING_INSTITUTION" || roleUpper === "INSTITUTION") && route.startsWith("/institution")) {
    return true;
  }
  
  if (roleUpper === "ACCREDITATION_OFFICER" && (route.startsWith("/admin/accreditations") || route.startsWith("/accreditations"))) {
    return true;
  }
  
  if (roleUpper === "INSPECTOR" && (route.startsWith("/admin/inspections") || route.startsWith("/inspections"))) {
    return true;
  }
  
  if (roleUpper === "FINANCE" && (route.startsWith("/invoices") || route.startsWith("/admin/invoices"))) {
    return true;
  }
  
  return false;
}



