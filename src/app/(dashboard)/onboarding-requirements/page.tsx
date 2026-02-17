"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared";

/**
 * Redirects to the admin onboarding requirements page.
 * Kept for backward compatibility with old sidebar/menu links.
 */
export default function OnboardingRequirementsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/onboarding-requirements");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner />
      <span className="ml-2 text-muted-foreground">Redirecting...</span>
    </div>
  );
}
