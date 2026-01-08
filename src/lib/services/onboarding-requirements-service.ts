/**
 * Onboarding Requirements Service - API integration for onboarding requirements management
 * Based on swagger.txt - /api/OnboardingRequirements endpoints
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/onboarding-requirements";

// ============================================================================
// Types
// ============================================================================

export interface OnboardingRequirementDto {
  id: string;
  userType?: string | null;
  documentMasterId: string;
  isMandatory?: boolean | null;
  categoryType?: string | null;
  name?: string | null;
}

export interface CreateOnboardingRequirementRequest {
  userType?: string | null;
  documentMasterId: string;
  isMandatory?: boolean | null;
}

export interface UpdateOnboardingRequirementRequest {
  userType?: string | null;
  documentMasterId: string;
  isMandatory?: boolean | null;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Get all onboarding requirements
 * GET /api/OnboardingRequirements?userType={userType}
 */
export async function getOnboardingRequirements(params?: {
  userType?: string;
}): Promise<ApiResponse<OnboardingRequirementDto[]>> {
  const queryParams = new URLSearchParams();
  if (params?.userType) {
    queryParams.append("userType", params.userType);
  }

  const url = queryParams.toString()
    ? `${API_BASE}?${queryParams.toString()}`
    : API_BASE;

  return apiGetMain<OnboardingRequirementDto[]>(url);
}

/**
 * Get onboarding requirement by ID
 * GET /api/OnboardingRequirements/{id}
 */
export async function getOnboardingRequirementById(
  id: string
): Promise<ApiResponse<OnboardingRequirementDto>> {
  return apiGetMain<OnboardingRequirementDto>(`${API_BASE}/${id}`);
}

/**
 * Create a new onboarding requirement
 * POST /api/OnboardingRequirements
 */
export async function createOnboardingRequirement(
  data: CreateOnboardingRequirementRequest
): Promise<ApiResponse<OnboardingRequirementDto>> {
  return apiPostMain<OnboardingRequirementDto>(API_BASE, data);
}

/**
 * Update an onboarding requirement
 * PUT /api/OnboardingRequirements/{id}
 */
export async function updateOnboardingRequirement(
  id: string,
  data: UpdateOnboardingRequirementRequest
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(`${API_BASE}/${id}`, data);
}

/**
 * Delete an onboarding requirement
 * DELETE /api/OnboardingRequirements/{id}
 */
export async function deleteOnboardingRequirement(
  id: string
): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${id}`);
}

