/**
 * Admin Review Service - API integration for admin review endpoints
 * Based on frontend-api-integration.md
 */

import { apiGetMain, apiPatchMain, type ApiResponse } from "@/lib/api-client";

const API_BASE_APPS = "/seafarer/api/v1/Applications";
const API_BASE_ACCREDS = "/seafarer/api/v1/Accreditation/institutions";
const API_BASE_ADMIN_ACCREDS = "/seafarer/api/v1/Accreditation";

export interface ApplicationDto {
  // Primary identifier from onboarding endpoint
  userSeafarerOnboardingId?: string;
  userId?: string;
  rn?: string; // Reference number (e.g., "SEA-2026-0003", "AGT-2026-0003")
  role?: string; // "SEAFARER", "AGENT", "TRAINING_INSTITUTION"
  roleDescription?: string;
  status?: string; // "PENDING", "APPROVED", "REJECTED"
  statusDescription?: string;
  dateCreated?: string;
  dateModified?: string;
  
  // Legacy/backward compatibility fields
  id?: string; // Maps to userSeafarerOnboardingId
  applicantId?: string; // Maps to rn
  targetDocumentMasterId?: string; // Maps to role/roleDescription
  applicationStatus?: string | null; // Maps to status
  invoiceId?: string | null;
  paymentReference?: string | null;
  isPaid?: boolean | null;
  submissionDate?: string | null; // Maps to dateCreated
  approvalDate?: string | null;
  remarks?: string | null;
  seafarerId?: string;
  seafarerName?: string;
  certificateId?: string;
  certificateName?: string;
  documentId?: string;
  documentName?: string;
  submittedAt?: string; // Maps to dateCreated
  createdAt?: string; // Maps to dateCreated
  updatedAt?: string; // Maps to dateModified
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
 * The response contains UserSeafarerOnboardingDto objects which we map to ApplicationDto
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

  const response = await apiGetMain<any[]>(
    `/seafarer/api/v1/Onboarding/pending${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );

  // Map the onboarding DTOs to ApplicationDto format
  if (response.success && response.data) {
    const mappedData: ApplicationDto[] = response.data.map((item: any) => ({
      ...item,
      // Map to legacy fields for backward compatibility
      id: item.userSeafarerOnboardingId || item.id,
      applicantId: item.rn || item.applicantId,
      targetDocumentMasterId: item.roleDescription || item.role || item.targetDocumentMasterId,
      applicationStatus: item.status || item.statusDescription || item.applicationStatus,
      submissionDate: item.dateCreated || item.submissionDate,
      submittedAt: item.dateCreated || item.submittedAt,
      createdAt: item.dateCreated || item.createdAt,
      updatedAt: item.dateModified || item.updatedAt,
    }));

    return {
      ...response,
      data: mappedData,
    };
  }

  return response as ApiResponse<ApplicationDto[]>;
}

/**
 * Approve an onboarding application
 * PATCH /seafarer/api/v1/Onboarding/{id}/status
 * Based on swagger: uses userSeafarerOnboardingId
 */
export async function approveApplication(
  applicationId: string,
  data: ApproveApplicationRequest,
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(
    `/seafarer/api/v1/Onboarding/${applicationId}/status`,
    {
      status: "APPROVED",
      remarks: data.remarks || null,
    },
  );
}

/**
 * Reject an onboarding application
 * PATCH /seafarer/api/v1/Onboarding/{id}/status
 * Based on swagger: uses userSeafarerOnboardingId
 */
export async function rejectApplication(
  applicationId: string,
  data: RejectApplicationRequest,
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(
    `/seafarer/api/v1/Onboarding/${applicationId}/status`,
    {
      status: "REJECTED",
      remarks: data.remarks || null,
    },
  );
}

/**
 * Get application attachments
 * Note: The onboarding endpoint doesn't have a separate attachments endpoint.
 * Documents are included in the onboarding response itself.
 * This function is kept for backward compatibility but should use the documents
 * from the onboarding record directly.
 */
export async function getApplicationAttachments(
  applicationId: string,
): Promise<ApiResponse<ApplicationAttachmentDto[]>> {
  // Since there's no attachments endpoint for onboarding, return empty array
  // The actual documents should be extracted from the onboarding record
  return Promise.resolve({
    success: true,
    data: [],
    message: "Attachments are included in the onboarding record",
  });
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
