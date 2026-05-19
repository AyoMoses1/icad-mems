"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  FileText,
  RefreshCw,
  LogOut,
  Loader2,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { formatDate } from "@/lib/utils";
import {
  isOnboardingApproved,
  OnboardingStatus,
} from "@/lib/services/onboarding-service";
import { refreshSessionAfterOnboarding } from "@/lib/services/auth-session-service";
import { getUserReadinessStatus } from "@/lib/services/user-readiness-service";
import {
  clearApprovalRedirectGuard,
  redirectToDashboardAfterApproval,
} from "@/lib/onboarding-approval-redirect";

interface OnboardingPendingPageProps {
  onStatusChange?: (status: string) => void;
}

export function OnboardingPendingPage({
  onStatusChange,
}: OnboardingPendingPageProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { status, onboardingData, isLoading, refresh } =
    useOnboardingStatus(true);
  const [isChecking, setIsChecking] = useState(false);
  const syncInFlightRef = useRef(false);
  const initialSyncDoneRef = useRef(false);

  const syncSessionAndCheckApproval = async (): Promise<void> => {
    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    setIsChecking(true);

    try {
      await refreshSessionAfterOnboarding();

      try {
        const readinessRes = await getUserReadinessStatus();
        if (
          readinessRes.success &&
          readinessRes.data &&
          redirectToDashboardAfterApproval(
            readinessRes.data,
            onboardingData?.role
          )
        ) {
          return;
        }
      } catch {
        /* fall through to my-onboarding */
      }

      const data = await refresh();
      if (data && isOnboardingApproved(data.status)) {
        redirectToDashboardAfterApproval(null, data.role);
        return;
      }
    } finally {
      setIsChecking(false);
      syncInFlightRef.current = false;
    }
  };

  // Browser refresh / first visit: refresh token + check approval once
  useEffect(() => {
    if (initialSyncDoneRef.current) return;
    initialSyncDoneRef.current = true;
    void syncSessionAndCheckApproval();
  }, []);

  useEffect(() => {
    if (status === "rejected") {
      onStatusChange?.("rejected");
      router.replace("/onboarding/status/rejected");
    } else if (status === "no_onboarding") {
      onStatusChange?.("no_onboarding");
      router.replace("/onboarding");
    }
  }, [status, onStatusChange, router]);

  const handleRefresh = () => {
    if (isChecking || syncInFlightRef.current) return;
    void syncSessionAndCheckApproval();
  };

  const handleLogout = () => {
    clearApprovalRedirectGuard();
    logout();
    window.location.href = "https://ims.mems.ng";
  };

  const getRoleDisplayName = (role?: string | null) => {
    if (!role) return "User";
    const normalizedRole = role.toUpperCase();
    switch (normalizedRole) {
      case "SEAFARER":
        return "Seafarer";
      case "AGENT":
        return "Agent";
      case "TRAINING_INSTITUTION":
        return "Training Institution";
      default:
        return role;
    }
  };

  const getStatusInfo = (status?: string | null) => {
    if (!status)
      return { label: "Pending", color: "bg-amber-50 text-amber-700" };
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case "DRAFT":
        return { label: "Draft", color: "bg-gray-50 text-gray-700" };
      case "PENDING":
      case "SUBMITTED":
        return { label: "Submitted", color: "bg-blue-50 text-blue-700" };
      case "UNDER_REVIEW":
        return { label: "Under Review", color: "bg-amber-50 text-amber-700" };
      default:
        return { label: status, color: "bg-gray-50 text-gray-700" };
    }
  };

  const statusInfo = getStatusInfo(onboardingData?.status);
  const isDraft =
    onboardingData?.status?.toUpperCase() === OnboardingStatus.DRAFT;
  const showChecking = isChecking || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDraft ? "bg-blue-100" : "bg-amber-100"
            }`}
          >
            {isDraft ? (
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            ) : (
              <Clock className="h-8 w-8 text-amber-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isDraft
              ? "Complete Identity Verification"
              : "Application Under Review"}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isDraft
              ? `Your ${getRoleDisplayName(onboardingData?.role)} onboarding has been saved as a draft. Complete identity verification to submit your application for review.`
              : `Your ${getRoleDisplayName(onboardingData?.role)} onboarding application has been submitted and is currently being reviewed by our team.`}
          </p>
        </div>

        {isDraft && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Identity verification required
              </CardTitle>
              <CardDescription>
                Verify your identity with your passport or national ID. After
                verification, your application will be submitted for review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full sm:w-auto" size="lg">
                <Link href="/onboarding/verification">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Proceed to verification
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Application Status
              </CardTitle>
              <Badge variant="secondary" className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>
            <CardDescription>
              Track the progress of your onboarding application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground">
                  Application Type
                </p>
                <p className="font-medium">
                  {getRoleDisplayName(onboardingData?.role)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground">Submitted On</p>
                <p className="font-medium">
                  {onboardingData?.dateCreated
                    ? formatDate(onboardingData.dateCreated)
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-sm font-medium">Progress</p>
              <div className="space-y-2">
                {[
                  { label: "Application Submitted", completed: true },
                  {
                    label: "Document Verification",
                    completed: (() => {
                      const s = onboardingData?.status?.toUpperCase();
                      return s === "PENDING" || s === "UNDER_REVIEW";
                    })(),
                  },
                  { label: "Admin Review", completed: false },
                  { label: "Approval Decision", completed: false },
                ].map((step, index) => (
                  <div
                    key={step.label}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        step.completed
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">What happens next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • Our team will review your submitted documents and
                    information
                  </li>
                  <li>• This process typically takes 1-3 business days</li>
                  <li>
                    • You will receive a notification once your application is
                    processed
                  </li>
                  <li>• You can check back here anytime for status updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={showChecking}
            className="min-w-[140px]"
          >
            {showChecking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Status
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {user && (
          <p className="text-center text-xs text-muted-foreground">
            Signed in as {user.email || user.firstName || "User"}
          </p>
        )}
      </div>
    </div>
  );
}
