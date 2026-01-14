/**
 * Admin Review Service - API integration for admin review endpoints
 * Based on frontend-api-integration.md
 */

import { apiGetMain, apiPatchMain, type ApiResponse } from "@/lib/api-client";

const API_BASE_APPS = "/seafarer/api/v1/Applications";
const API_BASE_ACCREDS = "/seafarer/api/v1/Accreditation/institutions";
const API_BASE_ADMIN_ACCREDS = "/seafarer/api/v1/Accreditation";

export interface ApplicationDto {
  id: string;
  applicantId?: string;
  targetDocumentMasterId?: string;
  applicationStatus?: string | null;
  invoiceId?: string | null;
  paymentReference?: string | null;
  isPaid?: boolean | null;
  submissionDate?: string | null;
  approvalDate?: string | null;
  remarks?: string | null;
  // Legacy fields for backward compatibility
  seafarerId?: string;
  seafarerName?: string;
  certificateId?: string;
  certificateName?: string;
  documentId?: string;
  documentName?: string;
  status?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

export interface ApproveApplicationRequest {
  remarks?: string | null;
}

export interface RejectApplicationRequest {
  remarks?: string | null;
}

export interface ApproveApplicationResponse {
  success: boolean;
  message?: string;
  certificateId?: string;
}

export interface AccreditationDto {
  id: string;
  institutionId?: string;
  institutionName?: string;
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
 * Audit Accreditation Request
 * Based on swagger: AuditAccreditationRequest
 */
export interface AuditAccreditationRequest {
  accreditationId: string; // Required UUID
  auditDate?: string; // Optional date format
}

/**
 * Activate Accreditation Request
 * Based on swagger: ActivateAccreditationRequest
 */
export interface ActivateAccreditationRequest {
  issueDate: string; // Required date format
  expiryDate: string; // Required date format
  certificateNumber?: string; // Optional
}

export interface PagedAccreditationResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

export interface AdminStatsDto {
  pendingApplications: number;
  pendingAccreditations: number;
  accreditedInstitutions: number;
  totalInstitutions: number;
  totalSeafarers: number;
  newApplicationsLastWeek: number;
  newSeafarersLastWeek: number;
  newInstitutionsLastWeek: number;
}

// ============================================================================
// Admin Application Review
// ============================================================================

/**
 * Get pending certificate applications
 * GET /seafarer/api/v1/Onboarding/pending - pending onboarding applications
 * Note: /seafarer/api/v1/Applications only supports POST, not GET
 * Response: { data: ApplicationDto[], ... }
 */
export async function getPendingApplications(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<ApplicationDto[]>> {
  // Use Onboarding/pending for pending applications as per swagger
  // Applications endpoint only has POST method, no GET
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params?.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params?.sortDirection) {
    queryParams.append("sortDirection", params.sortDirection);
  }

  return apiGetMain<ApplicationDto[]>(
    `/seafarer/api/v1/Onboarding/pending${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

/**
 * Approve a certificate application
 * PATCH /seafarer/api/v1/Applications/{id}/approve (if exists) or use status update
 */
export async function approveApplication(
  applicationId: string,
  data: ApproveApplicationRequest,
): Promise<ApiResponse<boolean>> {
  // Check swagger - might need to use Applications/{id}/status endpoint
  return apiPatchMain<boolean>(
    `${API_BASE_APPS}/${applicationId}/approve`,
    data,
  );
}

/**
 * Reject a certificate application
 * PATCH /api/admin/AdminApplications/{id}/reject
 */
export async function rejectApplication(
  applicationId: string,
  data: RejectApplicationRequest,
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(
    `${API_BASE_APPS}/${applicationId}/reject`,
    data,
  );
}

/**
 * Get application attachments
 * GET /api/admin/AdminApplications/{id}/attachments
 */
export async function getApplicationAttachments(
  applicationId: string,
): Promise<ApiResponse<ApplicationAttachmentDto[]>> {
  return apiGetMain<ApplicationAttachmentDto[]>(
    `${API_BASE_APPS}/${applicationId}/attachments`,
  );
}

export interface ApplicationAttachmentDto {
  id?: string;
  applicationId?: string;
  heldDocumentId?: string;
  wasValidAtSubmission?: boolean | null;
  documentName?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  fileUrl?: string | null;
}

// ============================================================================
// Admin Accreditation Review
// ============================================================================

/**
 * Get accreditations under review
 * GET /seafarer/api/v1/Accreditation/requests (pending accreditations)
 */
export async function getAccreditationsUnderReview(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<AccreditationDto>>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params?.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params?.sortDirection) {
    queryParams.append("sortDirection", params.sortDirection);
  }

  return apiGetMain<PagedResult<AccreditationDto>>(
    `${API_BASE_ADMIN_ACCREDS}/requests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

/**
 * Get all accreditations (admin)
 * GET /seafarer/api/v1/Accreditation/institutions
 */
export async function getAllAccreditations(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedAccreditationResult<AccreditationDto>>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params?.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params?.sortDirection) {
    queryParams.append("sortDirection", params.sortDirection);
  }

  return apiGetMain<PagedAccreditationResult<AccreditationDto>>(
    `${API_BASE_ACCREDS}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

/**
 * Audit an accreditation (approve/reject after review)
 * PATCH /seafarer/api/v1/Accreditation/institutions/{id}/status
 * Based on swagger.json
 */
export async function auditAccreditation(
  data: AuditAccreditationRequest,
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(`${API_BASE_ACCREDS}/${data.accreditationId}/status`, {
    status: "APPROVED", // or REJECTED based on audit
  });
}

/**
 * Activate an accreditation
 * PATCH /seafarer/api/v1/Accreditation/institutions/{id}/status
 * Based on swagger.json - use status endpoint with status "ACTIVATED"
 */
export async function activateAccreditation(
  accreditationId: string,
  data: ActivateAccreditationRequest,
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(
    `${API_BASE_ACCREDS}/${accreditationId}/status`,
    {
      status: "ACTIVATED",
      ...data,
    },
  );
}

// ============================================================================
// Admin Stats
// ============================================================================

/**
 * Get admin dashboard statistics
 * GET /seafarer/api/v1/Statistics/admin
 * Based on swagger.json
 */
export async function getAdminStats(): Promise<ApiResponse<AdminStatsDto>> {
  return apiGetMain<AdminStatsDto>("/seafarer/api/v1/Statistics/admin");
}
