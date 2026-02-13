"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Building2,
  GraduationCap,
  ArrowRight,
  Shield,
  Ship,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared";
import {
  getDomainRoles,
  getOnboardingRoleForRoleName,
  type DomainRoleDto,
} from "@/lib/services/domain-roles-service";
import { SEA_FARER_WORKSPACE_ID } from "@/lib/utils/workspace-helpers";

const ROLE_DISPLAY: Record<
  string,
  { title: string; description: string; icon: React.ReactNode; color: string }
> = {
  seafarer: {
    title: "Seafarer Onboarding",
    description:
      "Complete your profile as a seafarer to access seafarer services and applications",
    icon: <User className="h-8 w-8" />,
    color: "bg-blue-500",
  },
  agent: {
    title: "Seafarer Employer Onboarding",
    description:
      "Register as a seafarer employer to manage seafarer applications and services",
    icon: <Building2 className="h-8 w-8" />,
    color: "bg-green-500",
  },
  "training institution": {
    title: "Training Institution Onboarding",
    description:
      "Register your training institution to offer courses and certifications",
    icon: <GraduationCap className="h-8 w-8" />,
    color: "bg-purple-500",
  },
};

/** Normalize API role name (e.g. TRAINING_INSTITUTION) to display key (e.g. training institution). */
function normalizeRoleKey(roleName: string) {
  return roleName?.trim().toLowerCase().replace(/_/g, " ") ?? "";
}

/** Format role name for display: "TRAINING_INSTITUTION" → "Training Institution". */
function formatRoleNameForDisplay(roleName: string) {
  return normalizeRoleKey(roleName)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDisplayForRole(roleName: string) {
  const key = normalizeRoleKey(roleName);
  return (
    ROLE_DISPLAY[key] ?? {
      title: `${formatRoleNameForDisplay(roleName)} Onboarding`,
      description: `Complete onboarding for the ${formatRoleNameForDisplay(roleName)} role.`,
      icon: <Ship className="h-8 w-8" />,
      color: "bg-slate-500",
    }
  );
}

export function RoleSelectionScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [domainRoles, setDomainRoles] = useState<DomainRoleDto[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [selectedWorkspaceRoleId, setSelectedWorkspaceRoleId] = useState<
    string | null
  >(null);

  const workspaceId =
    searchParams.get("workspaceId")?.trim() || SEA_FARER_WORKSPACE_ID;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoadingRoles(true);
      setRolesError(null);
      try {
        const roles = await getDomainRoles(workspaceId);
        if (!cancelled) {
          setDomainRoles(roles);
        }
      } catch (err) {
        if (!cancelled) {
          setRolesError(
            err instanceof Error ? err.message : "Failed to load roles"
          );
          setDomainRoles([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRoles(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleSelectRole = (role: DomainRoleDto) => {
    const onboardingRole = getOnboardingRoleForRoleName(role.roleName);
    setSelectedWorkspaceRoleId(role.workspaceRoleId);
    const params = new URLSearchParams();
    params.set("workspaceRoleId", role.workspaceRoleId);
    if (onboardingRole) {
      params.set("role", onboardingRole);
    }
    router.push(`/onboarding?${params.toString()}`);
  };

  if (isLoadingRoles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading roles for this workspace...
          </p>
        </div>
      </div>
    );
  }

  if (rolesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-2">
            Could not load workspace roles.
          </p>
          <p className="text-sm text-muted-foreground">{rolesError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="container max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            As an owner, you can complete onboarding for any role. Please select
            the type of onboarding you would like to complete.
          </p>
        </div>

        {/* Role Selection Cards - one per domain role from IMS (filtered by workspaceId) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {domainRoles.map((role) => {
            const display = getDisplayForRole(role.roleName);
            const isSelected = selectedWorkspaceRoleId === role.workspaceRoleId;
            return (
              <Card
                key={role.workspaceRoleId}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 min-w-0 overflow-hidden",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => handleSelectRole(role)}
              >
                <CardHeader className="min-w-0">
                  <div className="flex items-start gap-4 mb-2 min-w-0">
                    <div
                      className={cn(
                        "rounded-lg p-3 text-white shrink-0",
                        display.color
                      )}
                    >
                      {display.icon}
                    </div>
                    <CardTitle className="text-xl break-words min-w-0">
                      {display.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm break-words min-w-0">
                    {display.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole(role);
                    }}
                  >
                    Start Onboarding
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {domainRoles.length === 0 && (
          <p className="text-center text-muted-foreground mb-8">
            No onboarding roles are configured for this workspace.
          </p>
        )}

        {/* Info Box */}
        <Card className="bg-muted/50 border-muted">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">About Owner Onboarding</h3>
                <p className="text-sm text-muted-foreground">
                  As an owner, you have the flexibility to complete onboarding
                  for multiple roles. You can complete onboarding for Seafarer,
                  Agent, or Training Institution roles. Each onboarding process
                  is independent and can be completed at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
