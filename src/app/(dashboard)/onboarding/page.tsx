"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store";
import { apiGetAuth } from "@/lib/api-client";
import {
  getMyOnboarding,
  isOnboardingPendingReview,
} from "@/lib/services/onboarding-service";
import type { UserSeafarerOnboardingDto } from "@/lib/services/onboarding-service";
import { SeafarerOnboardingForm } from "@/components/onboarding/SeafarerOnboardingForm";
import { TrainingInstitutionOnboardingForm } from "@/components/onboarding/TrainingInstitutionOnboardingForm";
import { AgentOnboardingForm } from "@/components/onboarding/AgentOnboardingForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  isSeaFarerOnboardingComplete,
  getSeaFarerPrimaryRole,
  getSeaFarerWorkspace,
  SEA_FARER_WORKSPACE_ID,
} from "@/lib/utils/workspace-helpers";
import {
  getDomainRoles,
  getOnboardingRoleOptions,
  type OnboardingRoleOption,
} from "@/lib/services/domain-roles-service";
import { Ship, GraduationCap, Building2 } from "lucide-react";

type UserRole = "SEAFARER" | "TRAINING_INSTITUTION" | "AGENT" | null;

// All possible user roles in the system
type SystemRole =
  | "SEAFARER"
  | "TRAINING_INSTITUTION"
  | "AGENT"
  | "ADMIN"
  | "OWNER"
  | "ACCREDITATION_OFFICER"
  | "INSPECTOR"
  | "FINANCE";

interface UserInfo {
  sub?: string;
  name?: string;
  email?: string;
  // Nested roles structure from API
  roles?: Array<{
    workspaceId: string;
    workspaceName: string;
    tenants?: Array<{
      tenantId: string;
      roles?: Array<{
        role: string;
      }>;
    }>;
  }>;
  role?: string; // Fallback single role field
  isOwner?: boolean;
  ownerDetails?: {
    isOwner?: boolean;
    ownerWorkspaces?: Array<{
      workspaceId: string;
      workspaceName: string;
    }>;
  };
  isAdmin?: boolean;
  adminDetails?: {
    isSystemAdmin?: boolean;
    isWorkspaceAdmin?: boolean;
    adminWorkspaces?: Array<{
      workspaceId: string;
      workspaceName: string;
      adminRole?: string;
      permissions?: string[];
    }>;
    adminModules?: unknown[];
  };
  [key: string]: unknown;
}

const VALID_ROLES: UserRole[] = ["SEAFARER", "TRAINING_INSTITUTION", "AGENT"];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedWorkspaceRoleId, setSelectedWorkspaceRoleId] = useState<
    string | null
  >(null);
  const [onboardingRoleOptions, setOnboardingRoleOptions] = useState<
    OnboardingRoleOption[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myOnboarding, setMyOnboarding] =
    useState<UserSeafarerOnboardingDto | null>(null);
  const [onboardingCheckDone, setOnboardingCheckDone] = useState(false);

  // When arriving from home with ?workspaceRoleId=...&role=..., use them and show form
  useEffect(() => {
    const qWorkspaceRoleId = searchParams.get("workspaceRoleId")?.trim();
    const qRole = searchParams.get("role")?.trim()?.toUpperCase();
    if (qWorkspaceRoleId && qRole && VALID_ROLES.includes(qRole as UserRole)) {
      setSelectedWorkspaceRoleId(qWorkspaceRoleId);
      setUserRole(qRole as UserRole);
      setOnboardingRoleOptions([]);
      getMyOnboarding()
        .then((res) => setMyOnboarding(res.data ?? null))
        .catch(() => setMyOnboarding(null));
      setOnboardingCheckDone(true);
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const qWorkspaceRoleId = searchParams.get("workspaceRoleId")?.trim();
    const qRole = searchParams.get("role")?.trim()?.toUpperCase();
    if (qWorkspaceRoleId && qRole && VALID_ROLES.includes(qRole as UserRole)) {
      return;
    }

    const detectUserRole = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user info from /connect/userinfo to get the role
        const userInfo = await apiGetAuth<UserInfo>("/connect/userinfo");

        console.log("UserInfo received:", userInfo);
        console.log("isAdmin:", userInfo.isAdmin);
        console.log("isOwner:", userInfo.isOwner);
        console.log("adminDetails:", userInfo.adminDetails);
        console.log("ownerDetails:", userInfo.ownerDetails);

        // IMPORTANT: Check if user is ADMIN FIRST (highest priority)
        // Admins should go to admin dashboard, not onboarding
        const isAdmin =
          userInfo.isAdmin === true ||
          userInfo.adminDetails?.isSystemAdmin === true ||
          userInfo.adminDetails?.isWorkspaceAdmin === true;

        if (isAdmin) {
          console.log("✓ User is ADMIN - redirecting to admin dashboard");
          setIsLoading(false);
          router.replace("/admin/dashboard");
          return;
        }

        // IMPORTANT: Check if user is OWNER (second priority)
        // If user is an owner (isOwner: true), they should see the role selection screen
        // to choose which onboarding to complete, not be forced into a specific onboarding
        const isOwner =
          userInfo.isOwner === true || userInfo.ownerDetails?.isOwner === true;

        if (isOwner) {
          console.log(
            "✓ User is OWNER - redirecting to role selection dashboard"
          );
          setIsLoading(false);
          // Use replace instead of push to prevent back button issues
          router.replace("/");
          return;
        }

        // Extract roles from nested structure
        // The API returns roles in this structure:
        // roles: [{ workspaceId, workspaceName, tenants: [{ tenantId, roles: [{ role }] }] }]
        const extractedRoles: string[] = [];

        // Extract roles from nested structure
        if (userInfo.roles && Array.isArray(userInfo.roles)) {
          userInfo.roles.forEach((workspaceRole) => {
            if (workspaceRole.tenants && Array.isArray(workspaceRole.tenants)) {
              workspaceRole.tenants.forEach((tenant) => {
                if (tenant.roles && Array.isArray(tenant.roles)) {
                  tenant.roles.forEach((roleObj) => {
                    if (roleObj.role && typeof roleObj.role === "string") {
                      extractedRoles.push(roleObj.role.toUpperCase());
                    }
                  });
                }
              });
            }
          });
        }

        // Also check for direct role field
        if (userInfo.role && typeof userInfo.role === "string") {
          extractedRoles.push(userInfo.role.toUpperCase());
        }

        // Remove duplicates
        const roles = Array.from(new Set(extractedRoles));

        console.log("Extracted roles:", roles);

        // Also check if OWNER role is in the roles array (fallback check)
        if (roles.includes("OWNER") && !isOwner) {
          console.log(
            "✓ User has OWNER role in roles array - redirecting to role selection dashboard"
          );
          setIsLoading(false);
          router.replace("/");
          return;
        }

        // IMPORTANT: Check for onboarding-required roles
        // These roles (SEAFARER, TRAINING_INSTITUTION, AGENT) require onboarding
        const specificRole = roles.find(
          (r) =>
            r === "SEAFARER" || r === "TRAINING_INSTITUTION" || r === "AGENT"
        );

        console.log("Detected specific role:", specificRole);

        // If user has an onboarding-required role, proceed with onboarding
        if (specificRole) {
          console.log(`✓ User has ${specificRole} role - onboarding REQUIRED`);
          console.log("All roles:", roles);
          // Continue to role mapping below
        } else {
          // Only check for pure staff/admin roles if no onboarding-required roles found
          // Per ONBOARDING_PAYLOADS_REFERENCE.md:
          // "Staff roles (ACCREDITATION_OFFICER, INSPECTOR, FINANCE, ADMIN) do NOT require onboarding"
          const pureStaffRoles = [
            "ADMIN",
            "ACCREDITATION_OFFICER",
            "INSPECTOR",
            "FINANCE",
          ];
          const hasOnlyStaffRole = roles.some((r) =>
            pureStaffRoles.includes(r)
          );

          if (hasOnlyStaffRole) {
            console.log(
              "✓ User has only staff/admin role - no onboarding required"
            );
            console.log(
              "Staff roles detected:",
              roles.filter((r) => pureStaffRoles.includes(r))
            );
            // Redirect staff users to dashboard - they get access automatically
            router.push("/");
            return;
          }
        }

        const finishOnboardingRole = async (
          role: UserRole,
          workspaceId: string,
          options: OnboardingRoleOption[]
        ) => {
          try {
            const res = await getMyOnboarding();
            setMyOnboarding(res.data ?? null);
          } catch {
            setMyOnboarding(null);
          } finally {
            setOnboardingCheckDone(true);
          }
          if (options.length === 0) {
            setUserRole(role);
            return;
          }
          if (options.length === 1 && options[0].onboardingRole === role) {
            setSelectedWorkspaceRoleId(options[0].workspaceRoleId);
            setUserRole(role);
            return;
          }
          setOnboardingRoleOptions(options);
          setUserRole(null);
        };

        // Check if Sea Farer workspace onboarding is already complete
        // If complete, redirect to appropriate dashboard based on role
        const seaFarerOnboardingComplete = isSeaFarerOnboardingComplete(user);
        if (seaFarerOnboardingComplete) {
          console.log(
            "✓ Sea Farer workspace onboarding already complete - redirecting to dashboard"
          );
          const primaryRole = getSeaFarerPrimaryRole(user);

          // Redirect based on role
          if (primaryRole === "Owner") {
            router.replace("/");
          } else if (primaryRole === "Seafarer") {
            router.replace("/seafarer/dashboard");
          } else if (primaryRole === "Agent") {
            router.replace("/agent/dashboard");
          } else if (primaryRole === "Training Institution") {
            router.replace("/training-institution/dashboard");
          } else {
            // Fallback to seafarer dashboard
            router.replace("/seafarer/dashboard");
          }
          return;
        }

        const workspaceId =
          getSeaFarerWorkspace(user)?.workspaceId ??
          (userInfo.roles &&
          Array.isArray(userInfo.roles) &&
          userInfo.roles.length > 0
            ? (
                userInfo.roles.find(
                  (r: { workspaceName?: string }) =>
                    r.workspaceName?.toLowerCase() === "sea farer" ||
                    r.workspaceName?.toLowerCase() === "seafarer"
                ) as { workspaceId?: string } | undefined
              )?.workspaceId
            : null) ??
          SEA_FARER_WORKSPACE_ID;

        let domainRoleOptions: OnboardingRoleOption[] = [];
        try {
          const domainRoles = await getDomainRoles(workspaceId);
          domainRoleOptions = getOnboardingRoleOptions(domainRoles);
        } catch (domainErr) {
          console.warn(
            "Failed to fetch domain roles for onboarding cards:",
            domainErr
          );
        }

        // Map role to onboarding type
        if (specificRole === "SEAFARER") {
          console.log("✓ Routing to SEAFARER onboarding");
          await finishOnboardingRole(
            "SEAFARER",
            workspaceId,
            domainRoleOptions
          );
        } else if (specificRole === "TRAINING_INSTITUTION") {
          console.log("✓ Routing to TRAINING_INSTITUTION onboarding");
          await finishOnboardingRole(
            "TRAINING_INSTITUTION",
            workspaceId,
            domainRoleOptions
          );
        } else if (specificRole === "AGENT") {
          console.log("✓ Routing to AGENT onboarding");
          await finishOnboardingRole("AGENT", workspaceId, domainRoleOptions);
        } else {
          // Fallback: Check if any role contains the keywords
          const rolesStr = roles.join(" ").toUpperCase();

          if (rolesStr.includes("SEAFARER")) {
            console.log(
              "✓ Routing to SEAFARER onboarding (fallback detection)"
            );
            await finishOnboardingRole(
              "SEAFARER",
              workspaceId,
              domainRoleOptions
            );
          } else if (
            rolesStr.includes("TRAINING") ||
            rolesStr.includes("INSTITUTION")
          ) {
            console.log(
              "✓ Routing to TRAINING_INSTITUTION onboarding (fallback detection)"
            );
            await finishOnboardingRole(
              "TRAINING_INSTITUTION",
              workspaceId,
              domainRoleOptions
            );
          } else if (rolesStr.includes("AGENT")) {
            console.log("✓ Routing to AGENT onboarding (fallback detection)");
            await finishOnboardingRole("AGENT", workspaceId, domainRoleOptions);
          } else {
            // No recognized onboarding role found
            console.error(
              "❌ No recognized onboarding role found. User roles:",
              roles
            );
            setError(
              `Your account role (${roles.join(", ")}) does not require onboarding. If you believe this is an error, please contact support.`
            );
          }
        }
      } catch (error) {
        console.error("Error detecting user role:", error);
        setError(
          "Failed to detect your user type. Please ensure you are properly logged in."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      detectUserRole();
    } else {
      setError("No user found. Please log in again.");
      setIsLoading(false);
    }
  }, [user, router, searchParams]);

  // Derived before any conditional returns so hooks are always called in the same order
  const blocked =
    myOnboarding != null && myOnboarding.canCreateNewOnboarding === false;
  const hasPendingOnboarding =
    blocked &&
    myOnboarding?.hasActiveOnboarding &&
    isOnboardingPendingReview(myOnboarding.status);

  // When user has active onboarding in a pending state, send them to the status page.
  useEffect(() => {
    if (hasPendingOnboarding) {
      router.replace("/onboarding/status/pending");
    }
  }, [hasPendingOnboarding, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Detecting your user type...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">
                    Error Loading Onboarding
                  </h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasPendingOnboarding) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">
            Taking you to your application status...
          </p>
        </div>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-3">
                  <h3 className="font-semibold text-destructive">
                    Cannot Create New Onboarding
                  </h3>
                  {myOnboarding?.blockingReason && (
                    <p className="text-sm text-muted-foreground">
                      {myOnboarding.blockingReason}
                    </p>
                  )}
                  {myOnboarding?.hasActiveOnboarding &&
                    myOnboarding?.userSeafarerOnboardingId && (
                      <div className="rounded border bg-muted/50 p-3 text-sm">
                        <p className="text-muted-foreground">
                          Active onboarding:{" "}
                          {[
                            myOnboarding.activeOnboardingRole,
                            myOnboarding.activeOnboardingStatus,
                          ]
                            .filter(Boolean)
                            .join(" – ") || "—"}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          asChild
                        >
                          <Link
                            href={`/admin/onboarding/${myOnboarding.userSeafarerOnboardingId}`}
                          >
                            View active onboarding
                          </Link>
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show role selection cards when we have options and user hasn't selected yet
  if (
    onboardingRoleOptions != null &&
    onboardingRoleOptions.length > 0 &&
    !userRole &&
    !selectedWorkspaceRoleId
  ) {
    const cardConfig: Record<
      "SEAFARER" | "TRAINING_INSTITUTION" | "AGENT",
      { title: string; description: string; icon: React.ReactNode }
    > = {
      SEAFARER: {
        title: "Seafarer",
        description:
          "Register as a seafarer. Submit your profile, documents, and voyage history.",
        icon: <Ship className="h-10 w-10" />,
      },
      TRAINING_INSTITUTION: {
        title: "Training Institution",
        description:
          "Onboard as a training institution. Provide accreditation and contact details.",
        icon: <GraduationCap className="h-10 w-10" />,
      },
      AGENT: {
        title: "Agent",
        description:
          "Onboard as an agent. Link your institution and upload required documents.",
        icon: <Building2 className="h-10 w-10" />,
      },
    };

    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Choose your onboarding type
          </h1>
          <p className="text-muted-foreground mt-1">
            Select the type of onboarding you want to complete for this
            workspace.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {onboardingRoleOptions.map((option) => {
            const config = cardConfig[option.onboardingRole];
            return (
              <Card
                key={option.workspaceRoleId}
                className="cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50"
                onClick={() => {
                  setSelectedWorkspaceRoleId(option.workspaceRoleId);
                  setUserRole(option.onboardingRole);
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {config.icon}
                    </div>
                    <h3 className="font-semibold">{config.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Render the appropriate onboarding form based on user role
  const workspaceRoleIdProp = selectedWorkspaceRoleId ?? undefined;
  switch (userRole) {
    case "SEAFARER":
      return <SeafarerOnboardingForm workspaceRoleId={workspaceRoleIdProp} />;
    case "TRAINING_INSTITUTION":
      return (
        <TrainingInstitutionOnboardingForm
          workspaceRoleId={workspaceRoleIdProp}
        />
      );
    case "AGENT":
      return <AgentOnboardingForm workspaceRoleId={workspaceRoleIdProp} />;
    default:
      return (
        <div className="container max-w-2xl mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Unknown User Type
                    </h3>
                    <p className="text-sm text-yellow-800">
                      We couldn't determine your user type. Please contact
                      support for assistance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
  }
}
