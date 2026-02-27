"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
  getStoredPermitValidation,
  PERMIT_VALIDATION_STORAGE_KEY,
  type StoredPermitValidation,
} from "@/lib/services/permit-validation-service";
import { recordCompanyPermit } from "@/lib/services/company-permit-service";
import {
  getUserReadinessStatus,
  isUserReadyFromReadiness,
  getDashboardRoleFromReadiness,
} from "@/lib/services/user-readiness-service";
import { getDashboardRoute } from "@/lib/role-routing";
import {
  Building2,
  CheckCircle2,
  FileCheck,
  Mail,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function getRoleLabel(role: string): string {
  return role === "AGENT" ? "Seafarer Employer" : "Training Institution";
}

/** Flag so root page can do one refresh to get updated readiness after permit record */
const PERMIT_JUST_RECORDED_KEY = "permitJustRecorded";

export default function VerifySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? "";
  const workspaceRoleId = searchParams.get("workspaceRoleId") ?? "";

  const [data, setData] = useState<StoredPermitValidation | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = getStoredPermitValidation();
    if (!stored) {
      router.replace("/onboarding/welcome");
      return;
    }
    setData(stored);
  }, [mounted, router]);

  const handleSetupAccount = async () => {
    if (!data) return;
    setIsSubmitting(true);
    try {
      const response = await recordCompanyPermit(data, workspaceRoleId || undefined);
      if (response.success !== false) {
        try {
          sessionStorage.removeItem(PERMIT_VALIDATION_STORAGE_KEY);
        } catch {
          // ignore
        }
        // First status check: User Readiness may not be updated yet by the backend
        try {
          const readinessRes = await getUserReadinessStatus();
          if (
            readinessRes.success &&
            readinessRes.data &&
            isUserReadyFromReadiness(readinessRes.data)
          ) {
            const dashboardRole = getDashboardRoleFromReadiness(readinessRes.data);
            const targetRoute =
              dashboardRole !== null
                ? getDashboardRoute(dashboardRole)
                : "/agent/dashboard";
            toast.success("Your Seafarer workspace is ready.");
            window.location.href = targetRoute;
            return;
          }
        } catch {
          // Readiness may not be updated yet
        }
        // Not ready yet: full-page redirect to root; root will refresh once for second status call
        try {
          sessionStorage.setItem(PERMIT_JUST_RECORDED_KEY, "1");
        } catch {
          // ignore
        }
        toast.success("Your Seafarer workspace is ready.");
        window.location.href = "/";
      } else {
        toast.error(
          (response as { message?: string }).message ??
            "Failed to set up your account. Please try again."
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to set up your account. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="animate-pulse rounded-lg bg-muted h-64 w-full max-w-lg" />
      </div>
    );
  }

  const roleLabel = getRoleLabel(role);
  const status = (data.status ?? "ACTIVE").toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit mb-2">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Permit verified</CardTitle>
          <CardDescription>
            Your NIMASA permit has been verified for {roleLabel}. Review the details below and complete your profile on Seafarer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company & permit */}
          <div className="rounded-xl bg-muted/50 border p-4 space-y-4">
            {data.company?.legalName && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-background p-2 border">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Permit holder
                  </p>
                  <p className="font-semibold text-lg mt-0.5 truncate">
                    {data.company.legalName}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-background p-2 border">
                <FileCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Permit number
                </p>
                <p className="font-mono text-sm mt-0.5 break-all">
                  {data.permitNumber}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </span>
              <Badge
                variant={status === "ACTIVE" ? "default" : "secondary"}
                className={
                  status === "ACTIVE"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : ""
                }
              >
                {status}
              </Badge>
            </div>
            {(data.validFrom != null || data.validTo != null) && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-background p-2 border">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Validity
                  </p>
                  <p className="text-sm mt-0.5">
                    {formatDate(data.validFrom)} – {formatDate(data.validTo)}
                  </p>
                </div>
              </div>
            )}
            {(data.company?.email || data.companyOwnerEmail) && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-background p-2 border">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Contact email
                  </p>
                  <p className="text-sm mt-0.5 truncate">
                    {data.company?.email || data.companyOwnerEmail}
                  </p>
                </div>
              </div>
            )}
          </div>

          {data.message && (
            <p className="text-sm text-muted-foreground text-center border-t pt-4">
              {data.message}
            </p>
          )}

          <Button
            className="w-full h-12 text-base"
            size="lg"
            onClick={handleSetupAccount}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Set up your account on Seafarer
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
