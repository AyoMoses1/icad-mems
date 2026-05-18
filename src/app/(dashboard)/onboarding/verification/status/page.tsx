"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getUserReadinessStatus } from "@/lib/services/user-readiness-service";

/**
 * Legacy route — redirects to pending onboarding status after User Readiness check.
 * Veriff completion no longer lands here; kept for old bookmarks and external links.
 */
export default function VerificationStatusRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      try {
        await getUserReadinessStatus();
      } catch {
        // Redirect regardless — readiness is best-effort
      }
      router.replace("/onboarding/status/pending");
    };

    void redirect();
  }, [router]);

  return (
    <div className="container max-w-xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[40vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting...</p>
    </div>
  );
}
