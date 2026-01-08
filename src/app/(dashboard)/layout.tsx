"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Sidebar, Header } from "@/components/dashboard";
import { useAuthStore } from "@/store";
import { LoadingPage } from "@/components/shared";
import { usePathname } from "next/navigation";
import { apiGetAuth } from "@/lib/api-client";
import { toast } from "sonner";
import { getDashboardRouteFromRoles } from "@/lib/role-routing";

/**
 * UserInfo from IMS /connect/userinfo endpoint
 */
interface UserInfo {
  sub?: string;
  id?: string;
  username?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  roles?: string[];
  role?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  fullName?: string;
  country?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  workspaces?: Array<{
    workspaceId: string;
    workspaceName: string;
    workspaceCode: string;
  }>;
}

export default function DashboardLayout({
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

  // Initialize user on mount - check for token from IMS and fetch user info
  useEffect(() => {
    // Wait a bit for searchParams to be available
    const timer = setTimeout(() => {
      initializeUser();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams]);

  const initializeUser = async () => {
    try {
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

      // Step 5: Fetch user info from IMS if not already loaded
      if (!user || !localStorage.getItem("userRole")) {
        const userInfo = await apiGetAuth<UserInfo>("/connect/userinfo");

        // Step 6: Extract role
        // Note: roles array now contains only tenant-specific roles (API Fix Issue #4)
        // Try to get role from roles array first
        const roles = userInfo.roles || [];
        
        // Filter out OWNER role and prioritize other roles
        const nonOwnerRoles = roles.filter(r => r && r.toUpperCase() !== "OWNER");
        
        // Use the first non-owner role, or first role if all are OWNER
        // Roles are already filtered to current tenant context by backend
        let role = userInfo.role || (nonOwnerRoles.length > 0 ? nonOwnerRoles[0] : roles[0]) || "";
        
        // If no role in roles array, try to derive from workspace code
        if (!role && userInfo.workspaces && userInfo.workspaces.length > 0) {
          // Check for SEAFARER workspace (since we're in seafarer app)
          const seafarerWorkspace = userInfo.workspaces.find(
            (ws) => 
              ws.workspaceCode?.toUpperCase() === "SEAFARER" ||
              ws.workspaceCode?.toUpperCase() === "SEA_FARER" ||
              ws.workspaceName?.toUpperCase().includes("SEAFARER") ||
              ws.workspaceName?.toUpperCase().includes("SEA FARER")
          );
          
          if (seafarerWorkspace) {
            role = "SEAFARER";
          } else {
            // Map workspace codes to roles
            const workspaceCode = userInfo.workspaces[0]?.workspaceCode?.toUpperCase() || "";
            const roleMapping: Record<string, string> = {
              "SEAFARER": "SEAFARER",
              "SEA_FARER": "SEAFARER",
              "TRAINING_INSTITUTION": "TRAINING_INSTITUTION",
              "TRAINING": "TRAINING_INSTITUTION",
              "AGENT": "AGENT",
              "ACCREDITATION_OFFICER": "ACCREDITATION_OFFICER",
              "INSPECTOR": "INSPECTOR",
              "FINANCE": "FINANCE",
              "ADMIN": "ADMIN",
            };
            
            role = roleMapping[workspaceCode] || "";
          }
        }
        
        // If still no role, default to SEAFARER since we're in seafarer app
        if (!role) {
          console.warn("No role found in userInfo, defaulting to SEAFARER for seafarer app");
          role = "SEAFARER";
        }

        // Step 7: Update user data
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
        };

        // Step 8: Set up full session
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

        // Step 9: Store role in localStorage
        localStorage.setItem("userRole", role);
      }

      // Step 10: Remove token from URL if present (keep URL clean)
      if (tokenFromUrl && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }

      setIsInitializing(false);
      
      // Step 11: Redirect to role-specific dashboard if on root path
      if (pathname === "/" || pathname === "") {
        const userRole = localStorage.getItem("userRole");
        const dashboardRoute = userRole ? getDashboardRouteFromRoles([userRole]) : "/seafarer/dashboard";
        router.replace(dashboardRoute);
      }
    } catch (error) {
      console.error("Failed to initialize user:", error);
      setInitializationError("Failed to load user information");
      toast.error("Failed to load user information. Please try again.");
      setTimeout(() => {
        router.replace("/auth/signin");
      }, 2000);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !isInitializing) {
      const currentState = useAuthStore.getState();
      if (!currentState.isAuthenticated || !currentState.token) {
        router.replace("/auth/signin");
      }
    }
  }, [authLoading, isInitializing, router]);

  // Show loading state while initializing or hydrating
  if (authLoading || isInitializing) {
    return (
      <LoadingPage 
        message={initializationError || "Loading user information..."} 
      />
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !token) {
    return <LoadingPage message="Redirecting to login..." />;
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
