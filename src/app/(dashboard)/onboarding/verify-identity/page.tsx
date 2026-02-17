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

/**
 * Placeholder: Verify certificate/registration ID for employer or training institution.
 * Replace verifyCertificateId() body with the actual API call when the endpoint is provided.
 */
async function verifyCertificateId(
  _certificateId: string,
  _role: "AGENT" | "TRAINING_INSTITUTION"
): Promise<{ success: boolean; message?: string }> {
  // TODO: Call the verification endpoint when provided.
  // Example: return apiPost("/api/verify-certificate", { certificateId, role });
  await new Promise((r) => setTimeout(r, 800));
  const trimmed = _certificateId.trim();
  if (!trimmed) {
    return { success: false, message: "Please enter your certificate ID." };
  }
  return { success: true };
}

export default function VerifyIdentityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") ?? "AGENT").toUpperCase() as
    | "AGENT"
    | "TRAINING_INSTITUTION";
  const role = roleParam === "TRAINING_INSTITUTION" ? "TRAINING_INSTITUTION" : "AGENT";

  const [certificateId, setCertificateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setError(null);
    setIsVerifying(true);
    try {
      const result = await verifyCertificateId(certificateId, role);
      if (result.success) {
        const workspaceRoles = await getDomainRoles(SEA_FARER_WORKSPACE_ID);
        const options = getOnboardingRoleOptions(workspaceRoles);
        const onboardingRole = role === "AGENT" ? "AGENT" : "TRAINING_INSTITUTION";
        const option = options.find(
          (o) => getOnboardingRoleForRoleName(o.roleName) === onboardingRole
        );
        if (option) {
          router.push(
            `/onboarding?role=${onboardingRole}&workspaceRoleId=${encodeURIComponent(option.workspaceRoleId)}`
          );
        } else {
          setError("This role is not configured for onboarding. Please contact support.");
        }
      } else {
        setError(result.message ?? "Verification failed. Please check your certificate ID.");
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
      ? "Seafarer Employer – Verify identity"
      : "Training Institution – Verify identity";
  const subtitle =
    role === "AGENT"
      ? "Enter your certificate or registration ID to verify your identity."
      : "Enter your institution certificate ID to verify your identity.";

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
            <Label htmlFor="certificateId">
              Certificate / Registration ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="certificateId"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter your certificate or registration ID"
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
            We will verify your details with the registry. The verification
            endpoint will be connected when provided.
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
              disabled={!certificateId.trim() || isVerifying}
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
