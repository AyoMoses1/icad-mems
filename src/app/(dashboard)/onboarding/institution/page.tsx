"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AgentOnboardingForm } from "@/components/onboarding/AgentOnboardingForm";
import { TrainingInstitutionOnboardingForm } from "@/components/onboarding/TrainingInstitutionOnboardingForm";
import { LoadingSpinner } from "@/components/shared";

/**
 * Institution onboarding page that handles both Agent and Training Institution onboarding
 * Based on the 'type' query parameter
 */
function InstitutionOnboardingContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  // Show Agent onboarding if type is 'agent', otherwise show Training Institution
  if (type === "agent") {
    return <AgentOnboardingForm />;
  }

  // Default to Training Institution onboarding
  return <TrainingInstitutionOnboardingForm />;
}

export default function InstitutionOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading onboarding form...</p>
          </div>
        </div>
      }
    >
      <InstitutionOnboardingContent />
    </Suspense>
  );
}
