"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight, ArrowLeft } from "lucide-react";
import { SEA_FARER_WORKSPACE_ID } from "@/lib/utils/workspace-helpers";
import {
  getDomainRoles,
  getOnboardingRoleOptions,
  getOnboardingRoleForRoleName,
  type OnboardingRoleOption,
} from "@/lib/services/domain-roles-service";
import { LoadingSpinner } from "@/components/shared";

export default function SeafarerSetupIntermediaryPage() {
  const router = useRouter();
  const [workspaceRoleId, setWorkspaceRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const roles = await getDomainRoles(SEA_FARER_WORKSPACE_ID);
        if (cancelled) return;
        const options = getOnboardingRoleOptions(roles);
        const seafarerOption = options.find(
          (o) => getOnboardingRoleForRoleName(o.roleName) === "SEAFARER"
        );
        if (seafarerOption) {
          setWorkspaceRoleId(seafarerOption.workspaceRoleId);
        } else {
          setError("Seafarer role is not configured for this workspace.");
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load workspace roles"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleContinue = () => {
    if (workspaceRoleId) {
      router.push(
        `/onboarding?role=SEAFARER&workspaceRoleId=${encodeURIComponent(workspaceRoleId)}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push("/onboarding/welcome")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to role selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Set up your account</CardTitle>
              <CardDescription className="mt-1">
                You need to complete your seafarer profile to proceed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The next step will take you through the seafarer onboarding process.
            You will be asked to provide your personal details, contact
            information, education, trainings, voyage history, and required
            documents.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/welcome")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button className="flex-1" onClick={handleContinue}>
              Continue to onboarding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
