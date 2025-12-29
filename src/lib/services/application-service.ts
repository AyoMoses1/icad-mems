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
// Endpoints from swagger.txt (Seafarer Certificate Application)
// ============================================================================

export interface CheckEligibilityRequest {
  applicantId: string;
  targetDocumentMasterId: string;
}

export interface EligibilityResultDto {
  targetDocumentMasterId: string;
  isEligible: boolean;
  requirements?: CertificateRequirementDto[] | null;
}

export interface CertificateRequirementDto {
  id?: string;
  targetDocumentMasterId?: string;
  requiredDocumentMasterId?: string;
  requirementGroupId?: number | null;
  isMandatory?: boolean | null;
}

export interface CreateApplicationRequest {
  applicantId: string;
  targetDocumentMasterId: string;
  remarks?: string | null;
}

export interface ApplicationDto {
  id: string;
  applicantId: string;
  targetDocumentMasterId: string;
  applicationStatus?: string | null;
  invoiceId?: string | null;
  paymentReference?: string | null;
  isPaid?: boolean | null;
  submissionDate?: string | null;
  approvalDate?: string | null;
  remarks?: string | null;
}

export interface AddApplicationAttachmentRequest {
  heldDocumentId: string;
  wasValidAtSubmission?: boolean | null;
}

export interface ApplicationAttachmentDto {
  id?: string;
  applicationId?: string;
  heldDocumentId?: string;
  wasValidAtSubmission?: boolean | null;
}

export interface GenerateInvoiceRequest {
  certificateFeeId: string;
  nationalityType?: string | null;
  processingSpeed?: string | null;
  billingCategory?: string | null;
  dueDate: string;
}

export interface ApplicationInvoiceDto {
  id: string;
  applicationId?: string | null;
  invoiceNumber?: string | null;
  totalAmount: number;
  currency?: string | null;
  status?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  paymentReference?: string | null;
  createdAt?: string | null;
}

/**
 * Check eligibility for certificate application
 * POST /api/Applications/check-eligibility
 */
export async function checkEligibility(
  data: CheckEligibilityRequest
): Promise<ApiResponse<EligibilityResultDto>> {
  return apiPostMain<EligibilityResultDto>(
    `/api/Applications/check-eligibility`,
    data
  );
}

/**
 * Check eligibility for current user
 * POST /api/Applications/me/check-eligibility
 */
export async function checkEligibilityForCurrentUser(
  data: { targetDocumentMasterId: string }
): Promise<ApiResponse<EligibilityResultDto>> {
  return apiPostMain<EligibilityResultDto>(
    `/api/Applications/me/check-eligibility`,
    data
  );
}

/**
 * Create a draft application
 * POST /api/Applications/draft
 */
export async function createDraftApplication(
  data: CreateApplicationRequest
): Promise<ApiResponse<ApplicationDto>> {
  return apiPostMain<ApplicationDto>(
    `/api/Applications/draft`,
    data
  );
}

/**
 * Attach documents to an application
 * POST /api/Applications/{id}/attach
 */
export async function attachDocumentsToApplication(
  applicationId: string,
  attachments: AddApplicationAttachmentRequest[]
): Promise<ApiResponse<ApplicationAttachmentDto[]>> {
  return apiPostMain<ApplicationAttachmentDto[]>(
    `/api/Applications/${applicationId}/attach`,
    attachments
  );
}

/**
 * Generate invoice for an application
 * POST /api/Applications/{id}/generate-invoice
 */
export async function generateApplicationInvoice(
  applicationId: string,
  data: GenerateInvoiceRequest
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  return apiPostMain<ApplicationInvoiceDto>(
    `/api/Applications/${applicationId}/generate-invoice`,
    data
  );
}

/**
 * Get invoice for an application
 * GET /api/Applications/{id}/invoice
 */
export async function getApplicationInvoice(
  applicationId: string
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  return apiGetMain<ApplicationInvoiceDto>(
    `/api/Applications/${applicationId}/invoice`
  );
}

