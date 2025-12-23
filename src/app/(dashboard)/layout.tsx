"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Sidebar, Header } from "@/components/dashboard";
import { useAuthStore } from "@/store";
import { LoadingPage } from "@/components/shared";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isLoading: authLoading,
    setLoading,
    token,
  } = useAuthStore();

  // Check authentication on mount - wait for hydration to complete
  useEffect(() => {
    console.log("Dashboard Layout - Auth Check:", {
      authLoading,
      isAuthenticated,
      hasToken: !!token,
    });

    // Wait for auth store to finish hydrating from localStorage
    if (!authLoading) {
      // Small delay to allow state to settle after navigation from login
      const timer = setTimeout(() => {
        const currentState = useAuthStore.getState();
        console.log("Dashboard Layout - State Check:", {
          isAuthenticated: currentState.isAuthenticated,
          hasToken: !!currentState.token,
          user: currentState.user?.email,
        });

        if (!currentState.isAuthenticated || !currentState.token) {
          console.log("Dashboard Layout - Redirecting to signin");
          router.replace("/auth/signin");
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [authLoading, router, isAuthenticated, token]);

  // Show loading state while hydrating
  if (authLoading) {
    return <LoadingPage message="Loading..." />;
  }

  // Don't render anything while checking auth or redirecting
  if (!isAuthenticated || !token) {
    return <LoadingPage message="Redirecting..." />;
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
