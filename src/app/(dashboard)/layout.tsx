"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Sidebar, Header } from "@/components/dashboard";
import { useAuthStore } from "@/store";
import { LoadingPage, UnauthorizedScreen } from "@/components/shared";
import { usePathname } from "next/navigation";
import { apiGetAuth } from "@/lib/api-client";
import { toast } from "sonner";
import { getDashboardRouteFromRoles } from "@/lib/role-routing";
import { isSeaFarerOnboardingComplete, getSeaFarerWorkspace } from "@/lib/utils/workspace-helpers";
import { Button } from "@/components/ui/button";

/**
 * UserInfo from IMS /connect/userinfo endpoint
 * Matches the actual API response structure with nested roles
 */
interface UserInfo {
  sub?: string;
  id?: string;
  username?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_verified?: boolean;
  phone_number_verified?: boolean;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  name?: string;
  // Nested roles structure from API
  roles?: Array<{
    workspaceId: string;
    workspaceName: string;
    tenants?: Array<{
      tenantId: string;
      roles?: Array<{
        role: string;
      }>;
    }>;
  }>;
  role?: string; // Direct role field (if available)
  firstName?: string;
  lastName?: string;
  middleName?: string;
  fullName?: string;
  country?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  last_login?: string;
  is_onboarding_complete?: boolean;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  workspaces?: Array<{
    workspaceId: string;
    workspaceName: string;
    workspaceCode?: string;
  }>;
  isOwner?: boolean;
  ownerDetails?: {
    isOwner?: boolean;
    ownerWorkspaces?: Array<{
      workspaceId: string;
      workspaceName: string;
    }>;
  };
  isAdmin?: boolean;
  adminDetails?: {
    isSystemAdmin?: boolean;
    isWorkspaceAdmin?: boolean;
    adminWorkspaces?: Array<{
      workspaceId: string;
      workspaceName: string;
      adminRole?: string;
      permissions?: string[];
    }>;
    adminModules?: unknown[];
  };
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    isAuthenticated,
    isLoading: authLoading,
    setLoading,
    token,
    setSession,
    user,
  } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasRedirectedToOnboarding, setHasRedirectedToOnboarding] = useState(false);
  const [isInitializingUser, setIsInitializingUser] = useState(false);

  // Initialize user on mount - check for token from IMS and fetch user info
  useEffect(() => {
    // Don't run if already initializing
    if (isInitializingUser) {
      return;
    }
    
    // Wait a bit for searchParams to be available, then initialize
    const timer = setTimeout(() => {
      initializeUser();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  const initializeUser = async () => {
    // Prevent multiple simultaneous initializations
    if (isInitializingUser) {
      return;
    }
    
    // Check if user is already fully loaded - if so, just mark as done
    // But only skip if we have BOTH complete user data AND stored role
    const hasCompleteUserData = user && user.id && user.roles && Array.isArray(user.roles) && user.roles.length > 0;
    const hasStoredRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    
    // Only skip if we have everything - otherwise fetch to get latest data
    if (hasCompleteUserData && hasStoredRole && user.roles.length > 0) {
      // Verify the roles have the workspace structure we need
      const hasWorkspaceRoles = user.roles.some((r: any) => 
        typeof r === "object" && r.workspaceId && r.workspaceName
      );
      
      if (hasWorkspaceRoles) {
        setIsInitializing(false);
        setIsInitializingUser(false);
        return;
      }
    }
    
    try {
      setIsInitializingUser(true);
      setIsInitializing(true);
      setInitializationError(null);

      // Step 1: Check for token in URL (from IMS redirect)
      const tokenFromUrl = searchParams.get("token");
      
      // Step 2: Also check localStorage directly as a fallback
      let storedToken = token;
      if (!storedToken && typeof window !== "undefined") {
        try {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            storedToken = parsed?.state?.token || null;
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      // Step 3: Get current token (from URL, store, or localStorage)
      const currentToken = tokenFromUrl || storedToken;
      
      if (!currentToken) {
        setInitializationError("No authentication token found");
        setIsInitializing(false);
        setIsInitializingUser(false);
        setTimeout(() => {
          router.replace("/auth/signin");
        }, 2000);
        return;
      }

      // Step 4: Set token in store if it's from URL (needed for apiGetAuth to work)
      // Also immediately persist to localStorage to survive page refresh
      if (tokenFromUrl && tokenFromUrl !== storedToken) {
        const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();
        const tempSession = {
          user: user || {
            id: "",
            username: "",
            email: "",
            phoneNumber: "",
            firstName: "",
            lastName: "",
            fullName: "",
            country: "",
            status: "ACTIVE" as any,
            emailVerified: false,
            phoneVerified: false,
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: tokenFromUrl,
          refreshToken: "",
          expiresAt: expiresAt,
        };
        
        // Set in zustand store
        setSession(tempSession);
        
        // Also immediately persist to localStorage to ensure it survives refresh
        const storageData = {
          state: {
            user: tempSession.user,
            token: tokenFromUrl,
            refreshToken: "",
            expiresAt: expiresAt,
            isAuthenticated: true,
          },
          version: 0,
        };
        localStorage.setItem("auth-storage", JSON.stringify(storageData));
        
        // Wait a bit for store to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Step 5: Fetch user info from IMS
      // Always fetch to get latest data including onboarding status
      const userInfo = await apiGetAuth<UserInfo>("/connect/userinfo");

      // Step 6: Extract roles from nested structure
      // The API returns roles in this structure:
      // roles: [{ workspaceId, workspaceName, tenants: [{ tenantId, roles: [{ role }] }] }]
      const extractedRoles: string[] = [];
      
      // Extract roles from nested structure
      if (userInfo.roles && Array.isArray(userInfo.roles)) {
        userInfo.roles.forEach((workspaceRole) => {
          if (workspaceRole.tenants && Array.isArray(workspaceRole.tenants)) {
            workspaceRole.tenants.forEach((tenant) => {
              if (tenant.roles && Array.isArray(tenant.roles)) {
                tenant.roles.forEach((roleObj) => {
                  if (roleObj.role && typeof roleObj.role === "string") {
                    extractedRoles.push(roleObj.role.toUpperCase());
                  }
                });
              }
            });
          }
        });
      }
      
      // Also check for direct role field
      if (userInfo.role && typeof userInfo.role === "string") {
        extractedRoles.push(userInfo.role.toUpperCase());
      }
      
      // Remove duplicates
      const uniqueRoles = Array.from(new Set(extractedRoles));
      
      // IMPORTANT: Check if user is ADMIN first (highest priority)
      // If user is an admin (isAdmin: true), prioritize ADMIN role and route to admin dashboard
      const isAdmin = userInfo.isAdmin === true || 
                     userInfo.adminDetails?.isSystemAdmin === true ||
                     userInfo.adminDetails?.isWorkspaceAdmin === true ||
                     uniqueRoles.includes("ADMIN") ||
                     uniqueRoles.includes("SUPERADMIN");
      
      // IMPORTANT: Check if user is OWNER (second priority)
      // If user is an owner (isOwner: true), prioritize OWNER role
      const isOwner = userInfo.isOwner === true || 
                     userInfo.ownerDetails?.isOwner === true ||
                     uniqueRoles.includes("OWNER");
      
      // Step 7: Check if user has required role (ADMIN, OWNER, SEAFARER, AGENT, TRAINING_INSTITUTION, or staff roles)
      const allowedRoles = ["ADMIN", "SUPERADMIN", "OWNER", "SEAFARER", "AGENT", "TRAINING_INSTITUTION", "ACCREDITATION_OFFICER", "INSPECTOR", "FINANCE"];
      const hasAccess = isAdmin || isOwner || uniqueRoles.some(role => allowedRoles.includes(role));
      
      // Get the primary role for display/storage
      // IMPORTANT: Prioritize ADMIN over OWNER over SEAFARER
      // Admins go to admin dashboard, owners see role selection, others see their specific dashboard
      let role: string;
      if (isAdmin) {
        role = "ADMIN";
      } else if (isOwner) {
        role = "OWNER";
      } else {
        role = uniqueRoles.find(r => r === "SEAFARER") || 
               uniqueRoles.find(r => r === "AGENT") || 
               uniqueRoles.find(r => r === "TRAINING_INSTITUTION") ||
               uniqueRoles.find(r => r === "OWNER") || 
               uniqueRoles[0] || "";
      }
      
      // If user doesn't have required role, show unauthorized screen
      if (!hasAccess) {
        setIsUnauthorized(true);
        setUserRole(role || uniqueRoles.join(", ") || "Unknown");
        setIsInitializing(false);
        setIsInitializingUser(false);
        return;
      }

      // Step 8: Update user data
      // Map workspace roles structure from IMS to our WorkspaceRole format
      const workspaceRoles = userInfo.roles?.map((role) => ({
        workspaceId: role.workspaceId,
        workspaceName: role.workspaceName,
        is_onboarding_complete: (role as any).is_onboarding_complete,
        onboarding_completed_date: (role as any).onboarding_completed_date,
        tenants: role.tenants,
      })) || [];

      const userData = {
        id: userInfo.id || userInfo.sub || user?.id || "",
        username: userInfo.username || userInfo.email?.split("@")[0] || user?.username || "",
        email: userInfo.email || user?.email || "",
        phoneNumber: userInfo.phone_number || user?.phoneNumber || "",
        firstName: userInfo.firstName || userInfo.given_name || user?.firstName || "",
        middleName: userInfo.middleName || user?.middleName,
        lastName: userInfo.lastName || userInfo.family_name || user?.lastName || "",
        fullName: userInfo.fullName || userInfo.name || 
                 `${userInfo.firstName || userInfo.given_name || ""} ${userInfo.lastName || userInfo.family_name || ""}`.trim() ||
                 userInfo.email || user?.fullName || "",
        country: userInfo.country || user?.country || "",
        status: (userInfo.status as any) || user?.status || "ACTIVE",
        emailVerified: userInfo.email_verified || user?.emailVerified || false,
        phoneVerified: userInfo.phone_verified || user?.phoneVerified || false,
        twoFactorEnabled: user?.twoFactorEnabled || false,
        createdAt: userInfo.createdAt || user?.createdAt || new Date().toISOString(),
        updatedAt: userInfo.updatedAt || user?.updatedAt || new Date().toISOString(),
        roles: workspaceRoles.length > 0 ? workspaceRoles : user?.roles || [],
      };

      // Step 9: Set up full session
      const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();
      const finalSession = {
        user: userData,
        token: currentToken,
        refreshToken: "", // Will be set if available
        expiresAt: expiresAt,
      };
      
      // Set in zustand store
      setSession(finalSession);
      
      // Also persist to localStorage to ensure it survives refresh
      const storageData = {
        state: {
          user: userData,
          token: currentToken,
          refreshToken: "",
          expiresAt: expiresAt,
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem("auth-storage", JSON.stringify(storageData));

      // Step 10: Store role in localStorage
      localStorage.setItem("userRole", role);
      setUserRole(role);

      // Step 11: Remove token from URL if present (keep URL clean)
      if (tokenFromUrl && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }

      // IMPORTANT: Always set these flags to false when initialization completes
      setIsInitializing(false);
      setIsInitializingUser(false);
      
      // Step 12: Redirect to role-specific dashboard if on root path
      // But only if we're not already on a specific page
      if (pathname === "/" || pathname === "") {
        const userRole = localStorage.getItem("userRole");
        
        if (userRole) {
          const roleUpper = userRole.toUpperCase();
          
          // ADMIN goes to admin dashboard
          if (roleUpper === "ADMIN" || roleUpper === "SUPERADMIN") {
            router.replace("/admin/dashboard");
            return;
          }
          
          // OWNER stays on root path to see role selection screen
          if (roleUpper === "OWNER") {
            // Don't redirect - let the root page show role selection
            return;
          }
          
          // For other roles, redirect to their specific dashboard
          const dashboardRoute = getDashboardRouteFromRoles([userRole]);
          router.replace(dashboardRoute);
        } else {
          // Fallback to seafarer dashboard if no role
          router.replace("/seafarer/dashboard");
        }
      }
    } catch (error) {
      console.error("Failed to initialize user:", error);
      
      // IMPORTANT: Always set these flags to false even on error
      setIsInitializing(false);
      setIsInitializingUser(false);
      
      // Check if it's an authentication error (401/403) vs other errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAuthError = errorMessage.includes("401") || 
                         errorMessage.includes("403") || 
                         errorMessage.includes("Authentication required");
      
      if (isAuthError) {
        // For auth errors, redirect to login
        setInitializationError("Authentication failed");
        toast.error("Authentication failed. Please sign in again.");
        setTimeout(() => {
          router.replace("/auth/signin");
        }, 2000);
      } else {
        // For other errors (like network issues), show error but don't redirect
        setInitializationError("Failed to load user information. Please refresh the page.");
        toast.error("Failed to load user information. Please try again.");
      }
    }
  };

  // Reset redirect flag when pathname changes to onboarding
  useEffect(() => {
    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
      setHasRedirectedToOnboarding(false);
    }
  }, [pathname]);
  
  // Redirect to onboarding if user has Sea Farer workspace but onboarding is not complete
  // Only run this after initialization is complete
  // BUT EXCLUDE ADMINS - admins should have full access regardless
  useEffect(() => {
    // Don't run during initialization or if user data isn't loaded yet
    if (isInitializing || !user || !user.roles || !Array.isArray(user.roles)) {
      return;
    }
    
    // Check if user is admin - if so, skip onboarding check
    const userRoleFromStorage = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    const isAdmin = userRoleFromStorage?.toUpperCase() === "ADMIN" || userRoleFromStorage?.toUpperCase() === "SUPERADMIN" ||
                    user?.roles?.some((r: any) => {
                      if (typeof r === "string") return false;
                      return r.tenants?.some((t: any) => 
                        t.roles?.some((roleObj: any) => 
                          roleObj.role?.toUpperCase() === "ADMIN" || roleObj.role?.toUpperCase() === "SUPERADMIN"
                        )
                      );
                    });
    
    // Skip onboarding check for admins
    if (isAdmin) {
      return;
    }
    
    if (!hasRedirectedToOnboarding) {
      const seaFarerWorkspace = getSeaFarerWorkspace(user);
      const hasSeaFarerWorkspace = seaFarerWorkspace !== null;
      const isOnboardingComplete = isSeaFarerOnboardingComplete(user) ?? user?.is_onboarding_complete ?? false;
      const isOnboardingPage = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
      const isRootPage = pathname === "/" || pathname === "";
      
      // If user has Sea Farer workspace but onboarding is not complete
      if (hasSeaFarerWorkspace && !isOnboardingComplete) {
        // Allow root page for role selection
        if (isRootPage) {
          return;
        }
        
        // Redirect to onboarding if not already on onboarding page
        if (!isOnboardingPage) {
          setHasRedirectedToOnboarding(true);
          router.replace("/onboarding");
        }
      }
    }
  }, [isInitializing, user, pathname, router, hasRedirectedToOnboarding]);

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !isInitializing) {
      const currentState = useAuthStore.getState();
      if (!currentState.isAuthenticated || !currentState.token) {
        router.replace("/auth/signin");
      }
    }
  }, [authLoading, isInitializing, router]);

  // Show unauthorized screen if user doesn't have required role
  if (isUnauthorized) {
    return <UnauthorizedScreen userRole={userRole || undefined} />;
  }

  // Safety check: If we've been initializing for too long, stop and show error
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isInitializing && isInitializingUser) {
        console.error("Initialization timeout - forcing stop");
        setIsInitializing(false);
        setIsInitializingUser(false);
        setInitializationError("Initialization timed out. Please refresh the page.");
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [isInitializing, isInitializingUser]);

  // Show loading state while initializing or hydrating
  // But don't wait forever - if we've been loading for more than 5 seconds, show error
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitializing && !user) {
        setLoadingTimeout(true);
        setIsInitializing(false);
        setIsInitializingUser(false);
        setInitializationError("Loading is taking longer than expected. Please refresh the page.");
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isInitializing, user]);
  
  if ((authLoading || isInitializing) && !loadingTimeout) {
    return (
      <LoadingPage 
        message={initializationError || "Loading user information..."} 
      />
    );
  }
  
  if (loadingTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Loading Timeout</p>
          <p className="text-muted-foreground mb-4">{initializationError || "Please refresh the page."}</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !token) {
    return <LoadingPage message="Redirecting to login..." />;
  }

  // Check if user has completed onboarding for Sea Farer workspace
  // This applies to ANY user with a role in Sea Farer workspace (Owner, Seafarer, Agent, etc.)
  // BUT EXCLUDE ADMINS - admins should have full access regardless of onboarding status
  const userRoleFromStorage = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const isAdmin = userRoleFromStorage?.toUpperCase() === "ADMIN" || userRoleFromStorage?.toUpperCase() === "SUPERADMIN" ||
                  user?.roles?.some((r: any) => {
                    if (typeof r === "string") return false;
                    return r.tenants?.some((t: any) => 
                      t.roles?.some((roleObj: any) => 
                        roleObj.role?.toUpperCase() === "ADMIN" || roleObj.role?.toUpperCase() === "SUPERADMIN"
                      )
                    );
                  });
  
  const seaFarerWorkspace = getSeaFarerWorkspace(user);
  const hasSeaFarerWorkspace = seaFarerWorkspace !== null;
  const isOnboardingComplete = isSeaFarerOnboardingComplete(user) ?? user?.is_onboarding_complete ?? false;
  const isOnboardingPage = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
  const isRootPage = pathname === "/" || pathname === "";
  
  // For users in Sea Farer workspace who haven't completed onboarding
  // BUT SKIP THIS CHECK FOR ADMINS - they should have full access
  if (!isInitializing && user && hasSeaFarerWorkspace && !isOnboardingComplete && !isAdmin) {
    // If on root page, show role selection (for owners) - NO SIDEBAR, NO HEADER
    if (isRootPage) {
      return (
        <div className="min-h-screen bg-background">
          {children}
        </div>
      );
    }
    
    // If not on onboarding page or root page, redirect to onboarding
    if (!isOnboardingPage) {
      if (typeof window !== "undefined" && !hasRedirectedToOnboarding) {
        setHasRedirectedToOnboarding(true);
        router.replace("/onboarding");
      }
      return <LoadingPage message="Redirecting to onboarding..." />;
    }
    
    // If on onboarding page, show ONLY the page content - NO SIDEBAR, NO HEADER
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingPage message="Loading..." />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
