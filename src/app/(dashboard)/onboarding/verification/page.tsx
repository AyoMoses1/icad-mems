"use client";

import { useAuthStore } from "@/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IdentityVerificationStep } from "@/components/onboarding/IdentityVerificationStep";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * Standalone identity verification page.
 * Shown after comprehensive onboarding is saved as draft; user completes
 * verification here, then backend moves status to pending review.
 */
export default function OnboardingVerificationPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/onboarding/status/pending">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to status
            </Link>
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Identity verification
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Verify your identity with your passport or national ID. This is
            required before your application can be submitted for review.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify your identity</CardTitle>
            <CardDescription>
              You will be guided through a quick verification process. Have your
              passport or national ID ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IdentityVerificationStep
              userId={userId}
              firstName={user?.firstName}
              lastName={user?.lastName}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
