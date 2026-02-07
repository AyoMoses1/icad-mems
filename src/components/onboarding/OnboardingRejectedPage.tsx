"use client";

import { useEffect } from "react";
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
  XCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Loader2,
  Mail,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { formatDate } from "@/lib/utils";

interface OnboardingRejectedPageProps {
  /** Optional callback when status changes */
  onStatusChange?: (status: string) => void;
}

export function OnboardingRejectedPage({
  onStatusChange,
}: OnboardingRejectedPageProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    status,
    onboardingData,
    isLoading,
    refresh,
    navigateToAppropriateRoute,
  } = useOnboardingStatus(true);

  // Handle status changes
  useEffect(() => {
    if (status === "approved") {
      // Status changed to approved, navigate to dashboard
      onStatusChange?.("approved");
      navigateToAppropriateRoute();
    } else if (status === "pending_review") {
      // Status changed to pending, navigate to pending page
      onStatusChange?.("pending_review");
      router.replace("/onboarding/status/pending");
    } else if (status === "no_onboarding") {
      // Can create new onboarding
      onStatusChange?.("no_onboarding");
    }
  }, [status, onStatusChange, navigateToAppropriateRoute, router]);

  const handleRefresh = async () => {
    await refresh();
  };

  const handleLogout = () => {
    logout();
    window.location.href = "https://ims.mems.ng";
  };

  const handleReapply = () => {
    // Navigate to the onboarding form to start a new application
    // Note: This will only work if canCreateNewOnboarding is true
    if (onboardingData?.canCreateNewOnboarding) {
      router.replace("/onboarding");
    }
  };

  const handleContactSupport = () => {
    // Open email client with support email
    window.location.href =
      "mailto:support@nimasa.gov.ng?subject=Onboarding%20Application%20Inquiry";
  };

  // Get role display name
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Application Rejected
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Unfortunately, your {getRoleDisplayName(onboardingData?.role)}{" "}
            onboarding application has been rejected. Please review the reason
            below.
          </p>
        </div>

        {/* Rejection Details Card */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Rejection Details
              </CardTitle>
              <Badge variant="secondary" className="bg-red-50 text-red-700">
                Rejected
              </Badge>
            </div>
            <CardDescription>
              Review the reason for rejection and next steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Application Details */}
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
                <p className="text-xs text-muted-foreground">Date Processed</p>
                <p className="font-medium">
                  {onboardingData?.dateModified
                    ? formatDate(onboardingData.dateModified)
                    : onboardingData?.dateCreated
                      ? formatDate(onboardingData.dateCreated)
                      : "N/A"}
                </p>
              </div>
            </div>

            {/* Rejection Reason */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">
                Reason for Rejection
              </p>
              <p className="text-sm text-red-700">
                {onboardingData?.rejectionReason ||
                  "No specific reason was provided. Please contact support for more information."}
              </p>
            </div>

            {/* Notes if any */}
            {onboardingData?.notes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Additional Notes
                </p>
                <p className="text-sm text-amber-700">{onboardingData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              What You Can Do
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                Review the rejection reason carefully
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                Gather the correct or missing documents
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                Contact support if you need clarification
              </li>
              {onboardingData?.canCreateNewOnboarding && (
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  Submit a new application with the corrected information
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onboardingData?.canCreateNewOnboarding && (
            <Button
              onClick={handleReapply}
              className="min-w-[180px] bg-primary hover:bg-primary/90"
            >
              Apply Again
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleContactSupport}
            className="min-w-[180px]"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Sign Out */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* User Info */}
        {user && (
          <p className="text-center text-xs text-muted-foreground">
            Signed in as {user.email || user.firstName || "User"}
          </p>
        )}
      </div>
    </div>
  );
}
