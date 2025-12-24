/**
 * Admin Review Service - API integration for admin review endpoints
 * Based on frontend-api-integration.md
 */

import { apiGetMain, apiPatchMain, type ApiResponse } from "@/lib/api-client";

const API_BASE_APPS = "/api/admin/AdminApplications";
const API_BASE_ACCREDS = "/api/admin/accreditations";

export interface ApplicationDto {
  id: string;
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
  approved?: boolean;
  comments?: string;
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
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

export interface AuditAccreditationRequest {
  approved?: boolean;
  comments?: string;
  auditDate?: string;
  auditorName?: string;
}

export interface AuditAccreditationResponse {
  success: boolean;
  message?: string;
}

export interface ActivateAccreditationRequest {
  accreditationNumber?: string;
  activationDate?: string;
  expiryDate?: string;
  comments?: string;
}

export interface ActivateAccreditationResponse {
  success: boolean;
  message?: string;
}

export interface PagedAccreditationResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

// ============================================================================
// Admin Application Review
// ============================================================================

/**
 * Get pending certificate applications
 */
export async function getPendingApplications(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<ApplicationDto>>> {
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

  return apiGetMain<PagedResult<ApplicationDto>>(
    `${API_BASE_APPS}/pending${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

/**
 * Approve or reject a certificate application
 */
export async function approveApplication(
  applicationId: string,
  data: ApproveApplicationRequest,
): Promise<ApiResponse<ApproveApplicationResponse>> {
  return apiPatchMain<ApproveApplicationResponse>(
    `${API_BASE_APPS}/${applicationId}/approve`,
    data,
  );
}

// ============================================================================
// Admin Accreditation Review
// ============================================================================

/**
 * Get accreditations under review
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
    `${API_BASE_ACCREDS}/under-review${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
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
 */
export async function auditAccreditation(
  accreditationId: string,
  data: AuditAccreditationRequest,
): Promise<ApiResponse<AuditAccreditationResponse>> {
  return apiPatchMain<AuditAccreditationResponse>(`${API_BASE_ACCREDS}/audit`, {
    ...data,
    accreditationId,
  });
}

/**
 * Activate an accreditation
 */
export async function activateAccreditation(
  accreditationId: string,
  data: ActivateAccreditationRequest,
): Promise<ApiResponse<ActivateAccreditationResponse>> {
  return apiPatchMain<ActivateAccreditationResponse>(
    `${API_BASE_ACCREDS}/${accreditationId}/activate`,
    data,
  );
}
