/**
 * Requirement Service - API integration for requirement operations
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";
import type {
  RequirementDto,
  RequirementFilters,
  PaginatedResponse,
} from "@/types/seafarer";

const API_BASE = "/api/v1/Requirements";

/**
 * Get paginated list of requirements
 */
export async function getRequirements(
  filters: RequirementFilters = {}
): Promise<ApiResponse<PaginatedResponse<RequirementDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    searchTerm,
    requirementTypeId,
    isActive,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm) params.append("searchTerm", searchTerm);
  if (requirementTypeId)
    params.append("requirementTypeId", requirementTypeId.toString());
  if (isActive !== undefined) params.append("isActive", isActive.toString());

  return apiGetMain<PaginatedResponse<RequirementDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get requirement by ID
 */
export async function getRequirementById(
  requirementId: number
): Promise<ApiResponse<RequirementDto>> {
  return apiGetMain<RequirementDto>(`${API_BASE}/${requirementId}`);
}

