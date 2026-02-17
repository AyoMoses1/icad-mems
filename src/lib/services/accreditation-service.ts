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

// Match swagger.json paths exactly - note capital A in Accreditation
const API_BASE = "/seafarer/api/v1/Accreditation";

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
 * ⚠️ DEPRECATED: The GET /seafarer/api/v1/Accreditation/requirements endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API. Use institution-specific endpoints instead.
 */
export async function getAccreditationRequirements(params?: {
  userType?: string;
  authUserId?: string;
  institutionId?: string;
}): Promise<ApiResponse<AccreditationRequirement[]>> {
  // Endpoint does not exist in swagger.json
  return {
    success: false,
    error: { 
      message: "Endpoint /seafarer/api/v1/Accreditation/requirements does not exist in the API. Please use institution-specific endpoints instead.", 
      code: "ENDPOINT_NOT_FOUND" 
    },
    data: undefined,
  };
}

/**
 * Check accreditation status and gaps
 * ⚠️ DEPRECATED: The GET /seafarer/api/v1/Accreditation/check-status endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function checkAccreditationStatus(params?: {
  institutionId?: string;
  userType?: string;
}): Promise<ApiResponse<AccreditationGapAnalysisDto>> {
  // Endpoint does not exist in swagger.json
  return {
    success: false,
    error: { 
      message: "Endpoint /seafarer/api/v1/Accreditation/check-status does not exist in the API.", 
      code: "ENDPOINT_NOT_FOUND" 
    },
    data: undefined,
  };
}

// ============================================================================
// Apply for Accreditation
// ============================================================================

/**
 * Apply for accreditation
 * ⚠️ DEPRECATED: The POST /seafarer/api/v1/Accreditation/apply endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API. Use institution-specific endpoints instead.
 */
export async function applyForAccreditation(
  accreditationType: string,
  file: File,
): Promise<ApiResponse<InstitutionAccreditationDto>> {
  // Endpoint does not exist in swagger.json
  return {
    success: false,
    error: { 
      message: "Endpoint /seafarer/api/v1/Accreditation/apply does not exist in the API.", 
      code: "ENDPOINT_NOT_FOUND" 
    },
    data: undefined,
  };
}

/**
 * Upload evidence/document for accreditation
 * ⚠️ DEPRECATED: The POST /seafarer/api/v1/Accreditation/{id}/upload endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function uploadAccreditationEvidence(
  accreditationId: string,
  file: File,
): Promise<ApiResponse<InstitutionAccreditationDto>> {
  // Endpoint does not exist in swagger.json
  return {
    success: false,
    error: { 
      message: "Endpoint /seafarer/api/v1/Accreditation/{id}/upload does not exist in the API.", 
      code: "ENDPOINT_NOT_FOUND" 
    },
    data: undefined,
  };
}

/**
 * Finalize accreditation application
 * ⚠️ DEPRECATED: The PATCH /seafarer/api/v1/Accreditation/{id}/finalize endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function finalizeAccreditation(
  accreditationId: string,
  data?: FinalizeAccreditationRequest,
): Promise<ApiResponse<boolean>> {
  // Endpoint does not exist in swagger.json
  return {
    success: false,
    error: { 
      message: "Endpoint /seafarer/api/v1/Accreditation/{id}/finalize does not exist in the API.", 
      code: "ENDPOINT_NOT_FOUND" 
    },
    data: undefined,
  };
}

/**
 * Generate invoice for accreditation
 * ⚠️ DEPRECATED: The POST /seafarer/api/v1/Accreditation/{id}/invoice endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function generateAccreditationInvoice(
  accreditationId: string,
  data: GenerateAccreditationInvoiceRequest,
): Promise<ApiResponse<any>> {
  // Endpoint does not exist in swagger.json
  return {
    success: false,
    error: { 
      message: "Endpoint /seafarer/api/v1/Accreditation/{id}/invoice does not exist in the API.", 
      code: "ENDPOINT_NOT_FOUND" 
    },
    data: undefined,
  };
}

/**
 * Get invoice for accreditation
 * ⚠️ DEPRECATED: The GET /seafarer/api/v1/Accreditation/{id}/invoice endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getAccreditationInvoice(
  accreditationId: string,
): Promise<ApiResponse<any>> {
  // Endpoint does not exist in swagger.json
  return {
    success: false,
    error: { 
      message: "Endpoint /seafarer/api/v1/Accreditation/{id}/invoice does not exist in the API.", 
      code: "ENDPOINT_NOT_FOUND" 
    },
    data: undefined,
  };
}

/**
 * Verify payment for accreditation
 * ⚠️ DEPRECATED: The POST /seafarer/api/v1/Accreditation/{id}/verify-payment endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
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
  // Endpoint does not exist in swagger.json
  return {
    success: false,
    error: { 
      message: "Endpoint /seafarer/api/v1/Accreditation/{id}/verify-payment does not exist in the API.", 
      code: "ENDPOINT_NOT_FOUND" 
    },
    data: undefined,
  };
}

/**
 * Get accreditation details
 * GET /seafarer/api/v1/Accreditation/institutions/{id}
 * Based on swagger.json - use institutions endpoint with ID
 */
export async function getAccreditationDetails(
  accreditationId: string,
): Promise<ApiResponse<InstitutionAccreditationDto>> {
  return apiGetMain<InstitutionAccreditationDto>(
    `${API_BASE}/institutions/${accreditationId}`,
  );
}

/**
 * Get all accreditations for the current user/institution
 * GET /seafarer/api/v1/Accreditation/requests
 * Based on swagger.json - this endpoint returns AccreditedInstitutionDto[]
 */
export interface AccreditedInstitutionDto {
  accreditedInstitutionsId?: string;
  accreditedInstitutionName?: string;
  accreditedInstitutionAddress?: string;
  institutionTypeId?: string;
  institutionTypeDescription?: string;
  isApproved?: boolean;
  accreditationStatusId?: string;
  accreditationStatus?: string;
  accreditedInstitutionEmail?: string;
  accreditedInstitutionPhone?: string;
  expiryDate?: string;
  stcwAccreditations?: any[];
}

export async function getAllAccreditations(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<AccreditedInstitutionDto[]>> {
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

  return apiGetMain<AccreditedInstitutionDto[]>(
    `${API_BASE}/requests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

// ============================================================================
// STCW Standards (Seafarer API)
// ============================================================================

export interface StcwStandardDto {
  id?: string;
  stcwRef: string;
  regulationCode?: string;
  competenceArea?: string;
  level?: string;
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
 * GET /seafarer/api/v1/Accreditation/institutions
 * Based on swagger.json
 */
export async function getAccreditedInstitutions(): Promise<ApiResponse<any[]>> {
  return apiGetMain<any[]>(`${API_BASE}/institutions`);
}

/**
 * Get accreditation requests (Officer only)
 * GET /seafarer/api/v1/Accreditation/requests
 * Based on swagger.json
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
