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
  Clock,
  CheckCircle2,
  FileText,
  RefreshCw,
  LogOut,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { formatDate } from "@/lib/utils";

interface OnboardingPendingPageProps {
  /** Optional callback when status changes */
  onStatusChange?: (status: string) => void;
}

export function OnboardingPendingPage({
  onStatusChange,
}: OnboardingPendingPageProps) {
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
    } else if (status === "rejected") {
      // Status changed to rejected, navigate to rejected page
      onStatusChange?.("rejected");
      router.replace("/onboarding/status/rejected");
    } else if (status === "no_onboarding") {
      // No onboarding found, navigate to onboarding form
      onStatusChange?.("no_onboarding");
      router.replace("/onboarding");
    }
  }, [status, onStatusChange, navigateToAppropriateRoute, router]);

  const handleRefresh = async () => {
    await refresh();
  };

  const handleLogout = () => {
    logout();
    window.location.href = "https://icad-ims.netlify.app/";
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

  // Get status display info
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Application Under Review
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your {getRoleDisplayName(onboardingData?.role)} onboarding
            application has been submitted and is currently being reviewed by
            our team.
          </p>
        </div>

        {/* Status Card */}
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
                <p className="text-xs text-muted-foreground">Submitted On</p>
                <p className="font-medium">
                  {onboardingData?.dateCreated
                    ? formatDate(onboardingData.dateCreated)
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3 pt-4">
              <p className="text-sm font-medium">Progress</p>
              <div className="space-y-2">
                {[
                  { label: "Application Submitted", completed: true },
                  {
                    label: "Document Verification",
                    completed:
                      onboardingData?.status?.toUpperCase() === "UNDER_REVIEW",
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

        {/* Info Card */}
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
