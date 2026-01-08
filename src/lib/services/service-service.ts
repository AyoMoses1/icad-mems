/**
 * Service Service - API integration for service operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  ServiceDto,
  ServiceRequirementDto,
  ServiceFilters,
  PaginatedResponse,
} from "@/types/seafarer";

const API_BASE = "/seafarer/api/v1/services";

/**
 * Get paginated list of services
 */
export async function getServices(
  filters: ServiceFilters = {}
): Promise<ApiResponse<PaginatedResponse<ServiceDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    searchTerm,
    serviceCategoryId,
    isActive,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm) params.append("searchTerm", searchTerm);
  if (serviceCategoryId)
    params.append("serviceCategoryId", serviceCategoryId.toString());
  if (isActive !== undefined) params.append("isActive", isActive.toString());

  return apiGetMain<PaginatedResponse<ServiceDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get service by ID
 */
export async function getServiceById(
  serviceId: number
): Promise<ApiResponse<ServiceDto>> {
  return apiGetMain<ServiceDto>(`${API_BASE}/${serviceId}`);
}

/**
 * Get requirements for a service
 */
export async function getServiceRequirements(
  serviceId: number
): Promise<ApiResponse<ServiceRequirementDto[]>> {
  return apiGetMain<ServiceRequirementDto[]>(
    `${API_BASE}/${serviceId}/requirements`
  );
}

/**
 * Get service requirement by ID
 */
export async function getServiceRequirement(
  serviceId: number,
  requirementId: number
): Promise<ApiResponse<ServiceRequirementDto>> {
  return apiGetMain<ServiceRequirementDto>(
    `${API_BASE}/${serviceId}/requirements/${requirementId}`
  );
}

