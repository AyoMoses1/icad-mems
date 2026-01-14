"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store";
import { apiGetAuth } from "@/lib/api-client";
import { SeafarerOnboardingForm } from "@/components/onboarding/SeafarerOnboardingForm";
import { TrainingInstitutionOnboardingForm } from "@/components/onboarding/TrainingInstitutionOnboardingForm";
import { AgentOnboardingForm } from "@/components/onboarding/AgentOnboardingForm";

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

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        // Map role to onboarding type
        if (specificRole === "SEAFARER") {
          console.log("✓ Routing to SEAFARER onboarding");
          setUserRole("SEAFARER");
        } else if (specificRole === "TRAINING_INSTITUTION") {
          console.log("✓ Routing to TRAINING_INSTITUTION onboarding");
          setUserRole("TRAINING_INSTITUTION");
        } else if (specificRole === "AGENT") {
          console.log("✓ Routing to AGENT onboarding");
          setUserRole("AGENT");
        } else {
          // Fallback: Check if any role contains the keywords
          const rolesStr = roles.join(" ").toUpperCase();

          if (rolesStr.includes("SEAFARER")) {
            console.log(
              "✓ Routing to SEAFARER onboarding (fallback detection)"
            );
            setUserRole("SEAFARER");
          } else if (
            rolesStr.includes("TRAINING") ||
            rolesStr.includes("INSTITUTION")
          ) {
            console.log(
              "✓ Routing to TRAINING_INSTITUTION onboarding (fallback detection)"
            );
            setUserRole("TRAINING_INSTITUTION");
          } else if (rolesStr.includes("AGENT")) {
            console.log("✓ Routing to AGENT onboarding (fallback detection)");
            setUserRole("AGENT");
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
  }, [user, router]);

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

  // Render the appropriate onboarding form based on user role
  switch (userRole) {
    case "SEAFARER":
      return <SeafarerOnboardingForm />;
    case "TRAINING_INSTITUTION":
      return <TrainingInstitutionOnboardingForm />;
    case "AGENT":
      return <AgentOnboardingForm />;
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
