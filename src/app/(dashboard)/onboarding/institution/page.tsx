"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared";

/**
 * Redirect to the new unified onboarding page
 * This route is deprecated - the new implementation automatically
 * detects user role and shows the appropriate form
 */
export default function InstitutionOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new unified onboarding page
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <LoadingSpinner className="mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to onboarding...</p>
            </div>
    </div>
  );
}
