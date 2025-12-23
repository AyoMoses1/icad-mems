/**
 * Application Service - API integration for application operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiPatchMain,
  apiPostMultipartMain,
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
const API_BASE_LEGACY = "/api/applications"; // For endpoints from frontend-api-integration.md

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

// ============================================================================
// Endpoints from frontend-api-integration.md (Seafarer Certificate Application)
// ============================================================================

export interface EligibilityCheckRequest {
  certificateId?: string;
  documentId?: string;
}

export interface EligibilityCheckResponse {
  isEligible: boolean;
  requirements?: string[];
  missingRequirements?: string[];
  message?: string;
}

export interface ApplicationDraftRequest {
  certificateId?: string;
  documentId?: string;
  seafarerId?: string;
}

export interface ApplicationDraftResponse {
  applicationId: string;
  status?: string;
  message?: string;
}

export interface FileUploadResponse {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
}

export interface InvoiceDto {
  id: string;
  applicationId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paymentUrl?: string;
  createdAt?: string;
}

/**
 * Check eligibility for certificate application
 */
export async function checkEligibility(
  data: EligibilityCheckRequest
): Promise<ApiResponse<EligibilityCheckResponse>> {
  return apiPostMain<EligibilityCheckResponse>(
    `${API_BASE_LEGACY}/check-eligibility`,
    data
  );
}

/**
 * Create a draft application
 */
export async function createDraftApplication(
  data: ApplicationDraftRequest
): Promise<ApiResponse<ApplicationDraftResponse>> {
  return apiPostMain<ApplicationDraftResponse>(
    `${API_BASE_LEGACY}/draft`,
    data
  );
}

/**
 * Attach files to an application (multipart/form-data)
 */
export async function attachFilesToApplication(
  applicationId: string,
  files: File[]
): Promise<ApiResponse<FileUploadResponse[]>> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  return apiPostMultipartMain<FileUploadResponse[]>(
    `${API_BASE_LEGACY}/${applicationId}/attach`,
    formData
  );
}

/**
 * Generate invoice for an application
 */
export async function generateApplicationInvoice(
  applicationId: string
): Promise<ApiResponse<InvoiceDto>> {
  return apiPostMain<InvoiceDto>(
    `${API_BASE_LEGACY}/${applicationId}/generate-invoice`
  );
}

/**
 * Get invoice for an application
 */
export async function getApplicationInvoice(
  applicationId: string
): Promise<ApiResponse<InvoiceDto>> {
  return apiGetMain<InvoiceDto>(
    `${API_BASE_LEGACY}/${applicationId}/invoice`
  );
}

