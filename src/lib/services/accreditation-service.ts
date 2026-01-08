/**
 * Accreditation Service - API integration for accreditation operations
 * Based on swagger.txt API definitions
 */

import {
  apiGetMain,
  apiPostMain,
  apiPatchMain,
  apiPostMultipartMain,
  type ApiResponse,
} from "@/lib/api-client";

// Match swagger.json paths exactly
const API_BASE = "/seafarer/api/v1/accreditation";

// ============================================================================
// DTOs from Swagger
// ============================================================================

export interface InstitutionAccreditationDto {
  id: string;
  institutionId?: string;
  accreditationType?: string;
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: string;
  lastAuditDate?: string;
  fileUrl?: string;
  invoiceId?: string;
}

export interface FinalizeAccreditationRequest {
  remarks?: string;
}

export interface GenerateAccreditationInvoiceRequest {
  totalAmount: number;
  currency?: string;
  dueDate: string; // date format
  billingCategory?: string;
}

export interface AccreditationRequirement {
  id: string;
  userType?: string;
  documentMasterId?: string;
  isMandatory: boolean;
  categoryType?: string;
  name: string;
}

export interface AccreditationGapAnalysisDto {
  isEligible?: boolean;
  completedRequirements?: string[];
  missingRequirements?: string[];
  gaps?: string[];
  message?: string;
}

// ============================================================================
// Accreditation Requirements
// ============================================================================

/**
 * Get accreditation requirements
 * GET /api/Accreditations/requirements
 */
export async function getAccreditationRequirements(params?: {
  userType?: string;
  authUserId?: string;
  institutionId?: string;
}): Promise<ApiResponse<AccreditationRequirement[]>> {
  const queryParams = new URLSearchParams();
  if (params?.userType) {
    queryParams.append("UserType", params.userType);
  }
  if (params?.authUserId) {
    queryParams.append("authUserId", params.authUserId);
  }
  if (params?.institutionId) {
    queryParams.append("institutionId", params.institutionId);
  }

  return apiGetMain<AccreditationRequirement[]>(
    `${API_BASE}/requirements${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

/**
 * Check accreditation status and gaps
 * GET /api/Accreditations/check-status
 */
export async function checkAccreditationStatus(params?: {
  institutionId?: string;
  userType?: string;
}): Promise<ApiResponse<AccreditationGapAnalysisDto>> {
  const queryParams = new URLSearchParams();
  if (params?.institutionId) {
    queryParams.append("InstitutionId", params.institutionId);
  }
  if (params?.userType) {
    queryParams.append("UserType", params.userType);
  }

  return apiGetMain<AccreditationGapAnalysisDto>(
    `${API_BASE}/check-status${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

// ============================================================================
// Apply for Accreditation
// ============================================================================

/**
 * Apply for accreditation
 * POST /api/Accreditations/apply
 * multipart/form-data: AccreditationType (required), File (required)
 */
export async function applyForAccreditation(
  accreditationType: string,
  file: File,
): Promise<ApiResponse<InstitutionAccreditationDto>> {
  const formData = new FormData();
  formData.append("AccreditationType", accreditationType);
  formData.append("File", file);

  return apiPostMultipartMain<InstitutionAccreditationDto>(
    `${API_BASE}/apply`,
    formData,
  );
}

/**
 * Upload evidence/document for accreditation
 * POST /api/Accreditations/{id}/upload
 * multipart/form-data: File (required)
 */
export async function uploadAccreditationEvidence(
  accreditationId: string,
  file: File,
): Promise<ApiResponse<InstitutionAccreditationDto>> {
  const formData = new FormData();
  formData.append("File", file);

  return apiPostMultipartMain<InstitutionAccreditationDto>(
    `${API_BASE}/${accreditationId}/upload`,
    formData,
  );
}

/**
 * Finalize accreditation application
 * PATCH /api/Accreditations/{id}/finalize
 */
export async function finalizeAccreditation(
  accreditationId: string,
  data?: FinalizeAccreditationRequest,
): Promise<ApiResponse<boolean>> {
  return apiPatchMain<boolean>(
    `${API_BASE}/${accreditationId}/finalize`,
    data || {},
  );
}

/**
 * Generate invoice for accreditation
 * POST /api/Accreditations/{id}/invoice
 */
export async function generateAccreditationInvoice(
  accreditationId: string,
  data: GenerateAccreditationInvoiceRequest,
): Promise<ApiResponse<any>> {
  return apiPostMain<any>(`${API_BASE}/${accreditationId}/invoice`, data);
}

/**
 * Get invoice for accreditation
 * GET /api/Accreditations/{id}/invoice
 */
export async function getAccreditationInvoice(
  accreditationId: string,
): Promise<ApiResponse<any>> {
  return apiGetMain<any>(`${API_BASE}/${accreditationId}/invoice`);
}

/**
 * Verify payment for accreditation
 * POST /api/Accreditations/{id}/verify-payment
 */
export interface VerifyAccreditationPaymentRequest {
  paymentReference?: string;
  transactionId?: string;
}

export interface VerifyAccreditationPaymentResponse {
  isVerified?: boolean;
  message?: string;
}

export async function verifyAccreditationPayment(
  accreditationId: string,
  data: VerifyAccreditationPaymentRequest,
): Promise<ApiResponse<VerifyAccreditationPaymentResponse>> {
  return apiPostMain<VerifyAccreditationPaymentResponse>(
    `${API_BASE}/${accreditationId}/verify-payment`,
    data,
  );
}

/**
 * Get accreditation details
 * GET /api/Accreditations/{id}
 */
export async function getAccreditationDetails(
  accreditationId: string,
): Promise<ApiResponse<InstitutionAccreditationDto>> {
  return apiGetMain<InstitutionAccreditationDto>(
    `${API_BASE}/${accreditationId}`,
  );
}

/**
 * Get all accreditations for the current user/institution
 * This endpoint may vary based on backend implementation
 * For now, we'll use a generic approach that can be adjusted
 */
export async function getAllAccreditations(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<InstitutionAccreditationDto[]>> {
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

  const url = queryParams.toString()
    ? `${API_BASE}?${queryParams.toString()}`
    : API_BASE;

  return apiGetMain<InstitutionAccreditationDto[]>(url);
}

// ============================================================================
// STCW Standards (Seafarer API)
// ============================================================================

export interface StcwStandardDto {
  id: string;
  stcwRef: string;
  description?: string;
  isActive?: boolean;
}

export interface StcwAccreditationDto {
  id: string;
  institutionId: string;
  stcwRef: string;
  status: string;
  effectiveDate?: string;
  expiryDate?: string;
  remarks?: string;
}

export interface CreateStcwAccreditationRequest {
  stcwRef: string;
  effectiveDate: string;
  expiryDate?: string;
  remarks?: string;
}

export interface UpdateStcwAccreditationStatusRequest {
  status: string;
  notes?: string;
}

/**
 * Get all STCW standards
 * GET /seafarer/api/v1/accreditation/stcw-standards
 */
export async function getStcwStandards(): Promise<ApiResponse<StcwStandardDto[]>> {
  return apiGetMain<StcwStandardDto[]>(`${API_BASE}/stcw-standards`);
}

/**
 * Add STCW accreditation to institution
 * POST /seafarer/api/v1/accreditation/institutions/{id}/stcw-accreditations
 */
export async function addStcwAccreditation(
  institutionId: string,
  data: CreateStcwAccreditationRequest
): Promise<ApiResponse<StcwAccreditationDto>> {
  return apiPostMain<StcwAccreditationDto>(
    `${API_BASE}/institutions/${institutionId}/stcw-accreditations`,
    data
  );
}

/**
 * Get STCW accreditations for an institution
 * GET /seafarer/api/v1/accreditation/institutions/{id}/stcw-accreditations
 */
export async function getInstitutionStcwAccreditations(
  institutionId: string
): Promise<ApiResponse<StcwAccreditationDto[]>> {
  return apiGetMain<StcwAccreditationDto[]>(
    `${API_BASE}/institutions/${institutionId}/stcw-accreditations`
  );
}

/**
 * Update STCW accreditation status (Officer/Inspector only)
 * PATCH /seafarer/api/v1/accreditation/stcw-accreditations/{id}/status
 */
export async function updateStcwAccreditationStatus(
  stcwAccreditationId: string,
  data: UpdateStcwAccreditationStatusRequest
): Promise<ApiResponse<StcwAccreditationDto>> {
  return apiPatchMain<StcwAccreditationDto>(
    `${API_BASE}/stcw-accreditations/${stcwAccreditationId}/status`,
    data
  );
}

/**
 * Get accredited institutions (public endpoint)
 * GET /seafarer/api/v1/accreditation/institutions
 */
export async function getAccreditedInstitutions(): Promise<ApiResponse<any[]>> {
  return apiGetMain<any[]>(`${API_BASE}/institutions`);
}

/**
 * Get accreditation requests (Officer only)
 * GET /seafarer/api/v1/accreditation/requests
 */
export async function getAccreditationRequests(): Promise<ApiResponse<any[]>> {
  return apiGetMain<any[]>(`${API_BASE}/requests`);
}

/**
 * Update institution accreditation status (Officer only)
 * PATCH /seafarer/api/v1/accreditation/institutions/{id}/status
 */
export async function updateInstitutionAccreditationStatus(
  institutionId: string,
  data: { status: string; notes?: string }
): Promise<ApiResponse<any>> {
  return apiPatchMain<any>(
    `${API_BASE}/institutions/${institutionId}/status`,
    data
  );
}
