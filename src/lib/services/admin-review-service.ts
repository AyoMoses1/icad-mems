/**
 * Admin Review Service - API integration for admin review endpoints
 * Based on frontend-api-integration.md
 */

import { apiGetMain, apiPatchMain, type ApiResponse } from "@/lib/api-client";

const API_BASE_APPS = "/api/admin/AdminApplications";
const API_BASE_ACCREDS = "/api/admin/accreditations";
const API_BASE_ADMIN_ACCREDS = "/api/admin/AdminAccreditations";

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
 * GET /api/admin/AdminApplications/pending
 * Response: { data: ApplicationDto[], ... }
 */
export async function getPendingApplications(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<ApplicationDto[]>> {
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
    `${API_BASE_APPS}/pending${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

/**
 * Approve a certificate application
 * PATCH /api/admin/AdminApplications/{id}/approve
 */
export async function approveApplication(
  applicationId: string,
  data: ApproveApplicationRequest,
): Promise<ApiResponse<boolean>> {
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
 * GET /api/admin/AdminAccreditations/under-review
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
    `${API_BASE_ADMIN_ACCREDS}/under-review${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

/**
 * Get all accreditations (admin)
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
 * PATCH /api/admin/AdminAccreditations/audit
 * Based on swagger.txt
 */
export async function auditAccreditation(
  data: AuditAccreditationRequest,
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(`${API_BASE_ADMIN_ACCREDS}/audit`, data);
}

/**
 * Activate an accreditation
 * PATCH /api/admin/AdminAccreditations/{id}/activate
 * Based on swagger.txt
 */
export async function activateAccreditation(
  accreditationId: string,
  data: ActivateAccreditationRequest,
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(
    `${API_BASE_ADMIN_ACCREDS}/${accreditationId}/activate`,
    data,
  );
}

// ============================================================================
// Admin Stats
// ============================================================================

/**
 * Get admin dashboard statistics
 * GET /api/admin/AdminStats
 * Based on swagger.txt - AdminStatsDto
 */
export async function getAdminStats(): Promise<ApiResponse<AdminStatsDto>> {
  return apiGetMain<AdminStatsDto>("/api/admin/AdminStats");
}
