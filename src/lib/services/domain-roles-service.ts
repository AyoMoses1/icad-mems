/**
 * Domain roles service - fetches workspace (domain) roles from IMS/SSO backend.
 * Used for onboarding type selection so cards reflect roles configured for the workspace.
 *
 * IMS endpoint: GET /api/workspaces/{workspaceId}/roles/domain
 * Returns: { workspaceRoleId: string; roleName: string }[] (or wrapped in { data: [...] })
 */

import { apiGetAuth } from "@/lib/api-client";

export interface DomainRoleDto {
  workspaceRoleId: string;
  roleName: string;
}

/** Role names that map to onboarding types (case-insensitive; underscores normalized to spaces) */
const ONBOARDING_ROLE_NAMES: Record<
  string,
  "SEAFARER" | "TRAINING_INSTITUTION" | "AGENT"
> = {
  seafarer: "SEAFARER",
  "training institution": "TRAINING_INSTITUTION",
  agent: "AGENT",
};

export type OnboardingRoleType = "SEAFARER" | "TRAINING_INSTITUTION" | "AGENT";

export interface OnboardingRoleOption {
  workspaceRoleId: string;
  roleName: string;
  onboardingRole: OnboardingRoleType;
}

/**
 * Get domain roles for a workspace from IMS (SSO backend).
 * Uses NEXT_PUBLIC_SSO_BASE_URL for the request.
 */
export async function getDomainRoles(
  workspaceId: string
): Promise<DomainRoleDto[]> {
  const raw = await apiGetAuth<DomainRoleDto[] | { data?: DomainRoleDto[] }>(
    `/api/workspaces/${workspaceId}/roles/domain`
  );
  if (Array.isArray(raw)) {
    return raw;
  }
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as { data?: DomainRoleDto[] }).data)
  ) {
    return (raw as { data: DomainRoleDto[] }).data;
  }
  return [];
}

/**
 * Get onboarding role type for a domain role name (or null if no mapping).
 */
export function getOnboardingRoleForRoleName(
  roleName: string
): OnboardingRoleType | null {
  const key = (roleName?.trim().toLowerCase() ?? "").replace(/_/g, " ");
  return ONBOARDING_ROLE_NAMES[key] ?? null;
}

/**
 * Map domain roles to onboarding options (only roles that correspond to SEAFARER, TRAINING_INSTITUTION, AGENT).
 */
export function getOnboardingRoleOptions(
  domainRoles: DomainRoleDto[]
): OnboardingRoleOption[] {
  const options: OnboardingRoleOption[] = [];
  const seen = new Set<OnboardingRoleType>();

  for (const role of domainRoles) {
    const onboardingRole = getOnboardingRoleForRoleName(role.roleName);
    if (onboardingRole && !seen.has(onboardingRole)) {
      seen.add(onboardingRole);
      options.push({
        workspaceRoleId: role.workspaceRoleId,
        roleName: role.roleName,
        onboardingRole,
      });
    }
  }

  return options;
}
