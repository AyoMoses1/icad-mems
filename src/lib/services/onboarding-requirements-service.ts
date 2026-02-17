/**
 * Onboarding Requirements Service
 * Integrates with seafarer/api/v1/onboarding-requirements as per onboarding-requirements-frontend-guide.md
 */

import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/onboarding-requirements";

// ============================================================================
// Types (from guide)
// ============================================================================

/** 0 = Compulsory, 1 = Optional */
export type RequirementKind = 0 | 1;

export interface OnboardingRequirementDocumentTypeItemDto {
  documentTypesId: string;
  description: string;
}

/** API may return requirementKind as 0|1 or "Compulsory"|"Optional" */
export interface OnboardingRequirementDto {
  onboardingRequirementId: string;
  role: string;
  description: string;
  requirementKind: RequirementKind | "Compulsory" | "Optional";
  documentTypeIds?: string[];
  documentTypes?: OnboardingRequirementDocumentTypeItemDto[];
}

/** Normalize requirementKind from API (string or number) to 0 | 1 for UI */
export function normalizeRequirementKind(
  v: RequirementKind | "Compulsory" | "Optional" | string | number
): RequirementKind {
  if (v === 0 || v === 1) return v;
  if (typeof v === "string") {
    if (v === "Compulsory") return 0;
    if (v === "Optional") return 1;
  }
  return 0;
}

export interface CreateOnboardingRequirementRequest {
  role: string;
  description: string;
  requirementKind: RequirementKind;
  documentTypes: Array<{ documentTypesId: string }>;
}

export interface UpdateOnboardingRequirementRequest {
  description?: string;
  requirementKind?: RequirementKind;
  documentTypes?: Array<{ documentTypesId: string }>;
}

// ============================================================================
// API
// ============================================================================

/**
 * List onboarding requirements by role (for checklist and admin).
 * GET ?role=SEAFARER or GET for-role?role=SEAFARER
 */
export async function getOnboardingRequirementsByRole(
  role: string = "SEAFARER"
): Promise<ApiResponse<OnboardingRequirementDto[]>> {
  const q = new URLSearchParams({ role: role.toUpperCase() });
  return apiGet<OnboardingRequirementDto[]>(`${API_BASE}?${q.toString()}`);
}

/**
 * Create onboarding requirement (admin).
 * POST with body: role, description, requirementKind, documentTypes
 */
export async function createOnboardingRequirement(
  data: CreateOnboardingRequirementRequest
): Promise<ApiResponse<OnboardingRequirementDto>> {
  return apiPost<OnboardingRequirementDto>(API_BASE, data);
}

/**
 * Update onboarding requirement (admin).
 * PATCH {id} with optional description, requirementKind, documentTypes
 */
export async function updateOnboardingRequirement(
  id: string,
  data: UpdateOnboardingRequirementRequest
): Promise<ApiResponse<OnboardingRequirementDto>> {
  return apiPatch<OnboardingRequirementDto>(`${API_BASE}/${id}`, data);
}

/**
 * Remove onboarding requirement (admin).
 * DELETE {id}
 */
export async function deleteOnboardingRequirement(
  id: string
): Promise<ApiResponse<boolean>> {
  return apiDelete<boolean>(`${API_BASE}/${id}`);
}
