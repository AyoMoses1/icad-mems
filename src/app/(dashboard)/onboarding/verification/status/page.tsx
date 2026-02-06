"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  Shield,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getVerificationStatus } from "@/lib/services/verification-service";
import { useAuthStore } from "@/store";
import type { VerificationStatusResponse } from "@/lib/services/verification-service";

type ViewState =
  | "loading"
  | "error"
  | "approved"
  | "declined"
  | "pending"
  | "not_started";

export default function VerificationStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const userIdParam = searchParams.get("userId");
  const userId = userIdParam || user?.id || "";

  const [data, setData] = useState<VerificationStatusResponse | null>(null);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setErrorMessage("User ID is required. Please ensure you are logged in.");
      setViewState("error");
      return;
    }

    const fetchStatus = async () => {
      try {
        setViewState("loading");
        setErrorMessage(null);

        const response = await getVerificationStatus(userId);

        if (response.success && response.data) {
          const d = response.data;
          setData(d);

          if (d.isVerified) {
            setViewState("approved");
          } else if (d.hasVerification && d.latestVerification) {
            const status = (d.latestVerification.status || "").toUpperCase();
            if (status === "APPROVED") {
              setViewState("approved");
            } else if (status === "DECLINED" || status === "REJECTED") {
              setViewState("declined");
            } else {
              setViewState("pending");
            }
          } else {
            setViewState("not_started");
          }
        } else {
          setErrorMessage(
            response.message || "Failed to fetch verification status."
          );
          setViewState("error");
        }
      } catch (err) {
        console.error("Verification status error:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
        setViewState("error");
      }
    };

    fetchStatus();
  }, [userId]);

  const handleProceedToOnboarding = () => {
    router.push("/onboarding");
  };

  const handleRetryVerification = () => {
    router.push("/onboarding");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Loading state
  if (viewState === "loading") {
    return (
      <div className="container max-w-xl mx-auto py-12 px-4">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-primary/10 p-4 mb-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Checking verification status...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Please wait a moment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (viewState === "error") {
    return (
      <div className="container max-w-xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Verification Status
          </h1>
          <p className="text-muted-foreground mt-1">
            Check your identity verification result
          </p>
        </div>
        <Card className="border-destructive/30 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <ShieldAlert className="h-7 w-7 text-destructive" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">Unable to Load Status</CardTitle>
                <CardDescription className="text-base">
                  {errorMessage}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRetryVerification}
              variant="outline"
              size="lg"
            >
              Return to Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content - always show header and one result card
  return (
    <div className="container max-w-xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Verification Status
        </h1>
        <p className="text-muted-foreground mt-1">
          Your identity verification result
        </p>
      </div>

      {/* Approved */}
      {viewState === "approved" && (
        <Card className="border-emerald-500/30 overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">
                  Verification Successful
                </CardTitle>
                <CardDescription className="text-base text-emerald-700/90 dark:text-emerald-300/90">
                  Your identity has been verified. You can now proceed with your
                  onboarding application.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={handleProceedToOnboarding}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Proceed with Onboarding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Not started - no verification attempts yet */}
      {viewState === "not_started" && (
        <Card className="border-amber-500/30 overflow-hidden bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                <Shield className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
                  Verification Not Complete
                </CardTitle>
                <CardDescription className="text-base text-amber-700/90 dark:text-amber-300/90">
                  You haven&apos;t completed identity verification yet. Start
                  the verification process to continue with your onboarding.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <Button onClick={handleRetryVerification} size="lg">
              Start Verification
            </Button>
            <p className="text-sm text-muted-foreground">
              You will be redirected to the onboarding page to begin
              verification.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Declined / Failed */}
      {viewState === "declined" && (
        <Card className="border-destructive/30 overflow-hidden bg-destructive/5">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <XCircle className="h-7 w-7 text-destructive" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl text-destructive">
                  Verification Failed
                </CardTitle>
                <CardDescription className="text-base">
                  {data?.latestVerification?.message ||
                    "Your identity verification was not approved. Please try again or contact support if you believe this is an error."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <Button
              onClick={handleRetryVerification}
              size="lg"
              variant="destructive"
            >
              Try Again
            </Button>
            <p className="text-sm text-muted-foreground">
              You will be redirected to the onboarding page to restart
              verification.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending review */}
      {viewState === "pending" && (
        <Card className="border-blue-500/30 overflow-hidden bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
                <Loader2 className="h-7 w-7 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl text-blue-800 dark:text-blue-200">
                  Verification Pending
                </CardTitle>
                <CardDescription className="text-base text-blue-700/90 dark:text-blue-300/90">
                  {data?.latestVerification?.message ||
                    "Your verification is being reviewed. This usually takes a few minutes. Check back shortly or we will notify you when it&apos;s complete."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={handleRefresh} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
