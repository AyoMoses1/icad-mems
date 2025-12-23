/**
 * Accreditation Service - API integration for accreditation operations (Officer/Admin only)
 */

import {
  apiGetMain,
  apiPostMain,
  apiPatchMain,
  apiPostMultipartMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/api/v1/Accreditations";
const API_BASE_LEGACY = "/api/accreditations"; // For endpoints from frontend-api-integration.md

export interface AccreditationDto {
  id: number;
  userOrganizationId?: number;
  organizationName?: string | null;
  applicationNumber?: string | null;
  applicationDate?: string;
  accreditationStatusId?: number;
  accreditationStatusName?: string | null;
  accreditationStartDate?: string | null;
  accreditationEndDate?: string | null;
  accreditationExpiryDate?: string | null;
  accreditationNumber?: string | null;
  certificateNumber?: string | null;
  [key: string]: unknown;
}

export interface AccreditationFilters {
  pageNumber?: number;
  pageSize?: number;
  organizationId?: number;
  statusId?: number;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Get paginated list of accreditations (Officer/Admin only)
 */
export async function getAccreditations(
  filters: AccreditationFilters = {}
): Promise<ApiResponse<PaginatedResponse<AccreditationDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    organizationId,
    statusId,
    isActive,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (organizationId)
    params.append("organizationId", organizationId.toString());
  if (statusId) params.append("statusId", statusId.toString());
  if (isActive !== undefined) params.append("isActive", isActive.toString());

  return apiGetMain<PaginatedResponse<AccreditationDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get accreditation by ID
 */
export async function getAccreditationById(
  accredId: number
): Promise<ApiResponse<AccreditationDto>> {
  return apiGetMain<AccreditationDto>(`${API_BASE}/${accredId}`);
}

/**
 * Approve accreditation (Officer/Admin only)
 */
export async function approveAccreditation(
  accredId: number,
  approvalData: {
    accreditationStartDate: string;
    accreditationEndDate: string;
    accreditationNumber: string;
    certificateNumber?: string;
    [key: string]: unknown;
  }
): Promise<ApiResponse<AccreditationDto>> {
  return apiPostMain<AccreditationDto>(
    `${API_BASE}/${accredId}/approve`,
    approvalData
  );
}

/**
 * Reject accreditation (Officer/Admin only)
 */
export async function rejectAccreditation(
  accredId: number,
  rejectionData: { reason?: string; [key: string]: unknown }
): Promise<ApiResponse<AccreditationDto>> {
  return apiPostMain<AccreditationDto>(
    `${API_BASE}/${accredId}/reject`,
    rejectionData
  );
}

/**
 * Suspend accreditation (Officer/Admin only)
 */
export async function suspendAccreditation(
  accredId: number,
  suspensionData: { reason?: string; [key: string]: unknown }
): Promise<ApiResponse<AccreditationDto>> {
  return apiPostMain<AccreditationDto>(
    `${API_BASE}/${accredId}/suspend`,
    suspensionData
  );
}

// ============================================================================
// Endpoints from frontend-api-integration.md (Accreditation Flow)
// ============================================================================

export interface AccreditationRequirement {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  category?: string;
}

export interface AccreditationRequirementsResponse {
  requirements: AccreditationRequirement[];
}

export interface AccreditationStatusCheckResponse {
  isEligible: boolean;
  completedRequirements?: string[];
  missingRequirements?: string[];
  gaps?: string[];
  message?: string;
}

export interface AccreditationApplyRequest {
  institutionId?: string;
  accreditationType?: string;
  requestedServices?: string[];
}

export interface AccreditationApplyResponse {
  accreditationId: string;
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
  accreditationId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  paymentUrl?: string;
  createdAt?: string;
}

export interface VerifyPaymentRequest {
  paymentReference?: string;
  transactionId?: string;
}

export interface VerifyPaymentResponse {
  isVerified: boolean;
  message?: string;
}

export interface AccreditationDetailDto {
  id: string;
  institutionId?: string;
  accreditationType?: string;
  status?: string;
  requestedServices?: string[];
  submittedAt?: string;
  finalizedAt?: string;
  reviewedAt?: string;
  activatedAt?: string;
  createdAt?: string;
}

/**
 * Get accreditation requirements
 */
export async function getAccreditationRequirements(): Promise<
  ApiResponse<AccreditationRequirementsResponse>
> {
  return apiGetMain<AccreditationRequirementsResponse>(
    `${API_BASE_LEGACY}/requirements`
  );
}

/**
 * Check accreditation status and gaps
 */
export async function checkAccreditationStatus(
  institutionId?: string
): Promise<ApiResponse<AccreditationStatusCheckResponse>> {
  const queryParams = institutionId ? `?institutionId=${institutionId}` : "";
  return apiGetMain<AccreditationStatusCheckResponse>(
    `${API_BASE_LEGACY}/check-status${queryParams}`
  );
}

/**
 * Apply for accreditation
 */
export async function applyForAccreditation(
  data: AccreditationApplyRequest
): Promise<ApiResponse<AccreditationApplyResponse>> {
  return apiPostMain<AccreditationApplyResponse>(
    `${API_BASE_LEGACY}/apply`,
    data
  );
}

/**
 * Upload evidence for accreditation (multipart/form-data)
 */
export async function uploadAccreditationEvidence(
  accreditationId: string,
  files: File[],
  requirementId?: string
): Promise<ApiResponse<FileUploadResponse[]>> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  if (requirementId) {
    formData.append("requirementId", requirementId);
  }

  return apiPostMultipartMain<FileUploadResponse[]>(
    `${API_BASE_LEGACY}/${accreditationId}/upload`,
    formData
  );
}

/**
 * Finalize accreditation application
 */
export async function finalizeAccreditation(
  accreditationId: string
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(
    `${API_BASE_LEGACY}/${accreditationId}/finalize`
  );
}

/**
 * Generate invoice for accreditation
 */
export async function generateAccreditationInvoice(
  accreditationId: string
): Promise<ApiResponse<InvoiceDto>> {
  return apiPostMain<InvoiceDto>(
    `${API_BASE_LEGACY}/${accreditationId}/invoice`
  );
}

/**
 * Get invoice for accreditation
 */
export async function getAccreditationInvoice(
  accreditationId: string
): Promise<ApiResponse<InvoiceDto>> {
  return apiGetMain<InvoiceDto>(
    `${API_BASE_LEGACY}/${accreditationId}/invoice`
  );
}

/**
 * Verify payment for accreditation
 */
export async function verifyAccreditationPayment(
  accreditationId: string,
  data: VerifyPaymentRequest
): Promise<ApiResponse<VerifyPaymentResponse>> {
  return apiPostMain<VerifyPaymentResponse>(
    `${API_BASE_LEGACY}/${accreditationId}/verify-payment`,
    data
  );
}

/**
 * Get accreditation details
 */
export async function getAccreditationDetails(
  accreditationId: string
): Promise<ApiResponse<AccreditationDetailDto>> {
  return apiGetMain<AccreditationDetailDto>(
    `${API_BASE_LEGACY}/${accreditationId}`
  );
}

