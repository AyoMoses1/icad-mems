"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { SEA_FARER_WORKSPACE_ID } from "@/lib/utils/workspace-helpers";
import {
  getDomainRoles,
  getOnboardingRoleOptions,
  getOnboardingRoleForRoleName,
} from "@/lib/services/domain-roles-service";
import {
  validatePermit,
  PERMIT_VALIDATION_STORAGE_KEY,
  type PermitValidationResult,
} from "@/lib/services/permit-validation-service";

export default function VerifyIdentityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") ?? "AGENT").toUpperCase() as
    | "AGENT"
    | "TRAINING_INSTITUTION";
  const role = roleParam === "TRAINING_INSTITUTION" ? "TRAINING_INSTITUTION" : "AGENT";

  const [permitNumber, setPermitNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setError(null);
    setIsVerifying(true);
    try {
      const result: PermitValidationResult = await validatePermit(permitNumber, role);
      if (result.valid) {
        const workspaceRoles = await getDomainRoles(SEA_FARER_WORKSPACE_ID);
        const options = getOnboardingRoleOptions(workspaceRoles);
        const onboardingRole = role === "AGENT" ? "AGENT" : "TRAINING_INSTITUTION";
        const option = options.find(
          (o) => getOnboardingRoleForRoleName(o.roleName) === onboardingRole
        );
        if (option) {
          try {
            sessionStorage.setItem(
              PERMIT_VALIDATION_STORAGE_KEY,
              JSON.stringify({
                permitNumber: result.permitNumber,
                company: result.company,
                companyOwnerEmail: result.companyOwnerEmail,
                validTo: result.validTo,
                validFrom: result.validFrom,
                status: result.status,
                message: result.message,
                serviceTypeCode: result.serviceTypeCode,
                workspaceRoleId: option.workspaceRoleId,
              })
            );
          } catch {
            // sessionStorage may be unavailable; continue without prefilling
          }
          router.push(
            `/onboarding/verify-success?role=${onboardingRole}&workspaceRoleId=${encodeURIComponent(option.workspaceRoleId)}`
          );
        } else {
          setError("This role is not configured for onboarding. Please contact support.");
        }
      } else {
        setError(result.message ?? "This permit cannot be used for onboarding. Please check the permit number and try again.");
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const title =
    role === "AGENT"
      ? "Seafarer Employer – Verify permit"
      : "Training Institution – Verify permit";
  const subtitle =
    role === "AGENT"
      ? "Enter your NIMASA permit number to verify your registration as a Seafarer Employer."
      : "Enter your NIMASA permit number to verify your registration as a Training Institution.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-1">{subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="permitNumber">
              Permit number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="permitNumber"
              value={permitNumber}
              onChange={(e) => setPermitNumber(e.target.value)}
              placeholder="e.g. PERMIT-SEAFARER_EMPLOYER-2026-000001"
              disabled={isVerifying}
              className="font-mono"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Enter the permit number exactly as shown on your NIMASA Service Type
            Permit certificate. We will verify it with the registry before continuing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/welcome")}
              disabled={isVerifying}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleVerify}
              disabled={!permitNumber.trim() || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and continue"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
