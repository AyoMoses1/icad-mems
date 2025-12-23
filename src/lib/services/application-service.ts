/**
 * Application Service - API integration for application operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiPatchMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  ApplicationDto,
  ApplicationFilters,
  CreateApplicationDto,
  FulfillRequirementDto,
  PaginatedResponse,
} from "@/types/payment";
import type {
  ApplicationRequirementDto,
  ReviewRequirementDto,
} from "@/types/seafarer";

const API_BASE = "/api/v1/Applications";

/**
 * Get paginated list of applications with optional filtering
 */
export async function getApplications(
  filters: ApplicationFilters = {}
): Promise<ApiResponse<PaginatedResponse<ApplicationDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    applicantId,
    programId,
    statusId,
    searchTerm,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (applicantId) params.append("applicantId", applicantId.toString());
  if (programId) params.append("programId", programId.toString());
  if (statusId) params.append("statusId", statusId.toString());
  if (searchTerm) params.append("searchTerm", searchTerm);

  return apiGetMain<PaginatedResponse<ApplicationDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get application by ID
 */
export async function getApplicationById(
  applicationId: number
): Promise<ApiResponse<ApplicationDto>> {
  return apiGetMain<ApplicationDto>(`${API_BASE}/${applicationId}`);
}

/**
 * Create a new application
 */
export async function createApplication(
  applicationData: CreateApplicationDto
): Promise<ApiResponse<ApplicationDto>> {
  return apiPostMain<ApplicationDto>(API_BASE, applicationData);
}

/**
 * Approve application (Officer/Admin only)
 */
export async function approveApplication(
  applicationId: number,
  approvalData?: { comments?: string; [key: string]: unknown }
): Promise<ApiResponse<ApplicationDto>> {
  return apiPostMain<ApplicationDto>(
    `${API_BASE}/${applicationId}/approve`,
    approvalData || {}
  );
}

/**
 * Reject application (Officer/Admin only)
 */
export async function rejectApplication(
  applicationId: number,
  rejectionData: { reason?: string; comments?: string; [key: string]: unknown }
): Promise<ApiResponse<ApplicationDto>> {
  return apiPostMain<ApplicationDto>(
    `${API_BASE}/${applicationId}/reject`,
    rejectionData
  );
}

/**
 * Request more info for application (Officer/Admin only)
 */
export async function requestMoreInfo(
  applicationId: number,
  requestData: { message: string; [key: string]: unknown }
): Promise<ApiResponse<ApplicationDto>> {
  return apiPostMain<ApplicationDto>(
    `${API_BASE}/${applicationId}/request-more-info`,
    requestData
  );
}

/**
 * Submit application
 */
export async function submitApplication(
  applicationId: number
): Promise<ApiResponse<ApplicationDto>> {
  return apiPatchMain<ApplicationDto>(
    `${API_BASE}/${applicationId}/submit`,
    {}
  );
}

/**
 * Fulfill an application requirement by linking a document
 */
export async function fulfillApplicationRequirement(
  applicationId: number,
  requirementId: number,
  fulfillmentData: FulfillRequirementDto
): Promise<ApiResponse<ApplicationRequirementDto>> {
  return apiPatchMain<ApplicationRequirementDto>(
    `${API_BASE}/${applicationId}/requirements/${requirementId}`,
    fulfillmentData
  );
}

/**
 * Get requirements for an application
 */
export async function getApplicationRequirements(
  applicationId: number
): Promise<ApiResponse<ApplicationRequirementDto[]>> {
  return apiGetMain<ApplicationRequirementDto[]>(
    `${API_BASE}/${applicationId}/requirements`
  );
}

/**
 * Get application requirement by ID
 */
export async function getApplicationRequirement(
  applicationId: number,
  requirementId: number
): Promise<ApiResponse<ApplicationRequirementDto>> {
  return apiGetMain<ApplicationRequirementDto>(
    `${API_BASE}/${applicationId}/requirements/${requirementId}`
  );
}

/**
 * Review an application requirement (admin only)
 */
export async function reviewApplicationRequirement(
  applicationId: number,
  requirementId: number,
  reviewData: ReviewRequirementDto
): Promise<ApiResponse<ApplicationRequirementDto>> {
  return apiPostMain<ApplicationRequirementDto>(
    `${API_BASE}/${applicationId}/requirements/${requirementId}/review`,
    reviewData
  );
}

