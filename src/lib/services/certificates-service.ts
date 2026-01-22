/**
 * Certificates Service - API integration for certificate operations
 * Based on swagger.txt - /api/Certificates endpoints
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/api/Certificates"; // ⚠️ This endpoint does not exist in swagger.json

// ============================================================================
// Types
// ============================================================================

export interface CertificateDto {
  id: string;
  name?: string | null;
  categoryType?: string | null;
  stcwCode?: string | null;
  description?: string | null;
  createdAt?: string | null;
  certType?: string | null;
  rankLevel?: string | null;
  tonnageLimit?: string | null;
  fees?: CertificateFeeDto[] | null;
}

export interface CertificateFeeDto {
  id?: string;
  certificateId?: string;
  amount?: number;
  currency?: string;
  nationalityType?: string | null;
  processingSpeed?: string | null;
  billingCategory?: string | null;
  isActive?: boolean;
}

export interface CreateCertificateRequest {
  name?: string | null;
  stcwCode?: string | null;
  description?: string | null;
  certType?: string | null;
  rankLevel?: string | null;
  tonnageLimit?: string | null;
  fees?: CertificateFeeInput[] | null;
}

export interface CertificateFeeInput {
  amount?: number;
  currency?: string;
  nationalityType?: string | null;
  processingSpeed?: string | null;
  billingCategory?: string | null;
}

export interface UpdateCertificateRequest {
  name?: string | null;
  stcwCode?: string | null;
  description?: string | null;
  certType?: string | null;
  rankLevel?: string | null;
  tonnageLimit?: string | null;
}

export interface CertificateRequirementDto {
  id?: string;
  targetDocumentMasterId?: string;
  targetDocumentName?: string | null;
  requiredDocumentMasterId?: string;
  requiredDocumentName?: string | null;
  requirementGroupId?: number | null;
  isMandatory?: boolean | null;
}

export interface CreateCertificateRequirementRequest {
  targetDocumentMasterId: string;
  requiredDocumentMasterId: string;
  requirementGroupId?: number | null;
  isMandatory?: boolean | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

// ============================================================================
// Certificate CRUD
// ============================================================================

/**
 * Get paginated list of certificates
 * ⚠️ DEPRECATED: The /api/Certificates endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCertificates(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<CertificateDto>>> {
  // Endpoint /api/Certificates does not exist in swagger.json
  const pageNumber = params?.pageNumber || 1;
  const pageSize = params?.pageSize || 100;
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: {
      items: [],
      pageNumber,
      pageSize,
      totalNumber: 0,
    },
  };
}

/**
 * Get certificate by ID
 * ⚠️ DEPRECATED: The /api/Certificates/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCertificateById(id: string): Promise<ApiResponse<CertificateDto>> {
  // Endpoint /api/Certificates/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Create a new certificate
 * ⚠️ DEPRECATED: The /api/Certificates endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createCertificate(
  data: CreateCertificateRequest
): Promise<ApiResponse<CertificateDto>> {
  // Endpoint /api/Certificates does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Update a certificate
 * ⚠️ DEPRECATED: The /api/Certificates/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateCertificate(
  id: string,
  data: UpdateCertificateRequest
): Promise<ApiResponse<CertificateDto>> {
  // Endpoint /api/Certificates/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Delete a certificate
 * ⚠️ DEPRECATED: The /api/Certificates/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteCertificate(id: string): Promise<ApiResponse<void>> {
  // Endpoint /api/Certificates/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

// ============================================================================
// Certificate Requirements
// ============================================================================

/**
 * Get requirements for a certificate
 * ⚠️ DEPRECATED: The /api/Certificates/{certificateId}/requirements endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCertificateRequirements(
  certificateId: string
): Promise<ApiResponse<CertificateRequirementDto[]>> {
  // Endpoint /api/Certificates/{certificateId}/requirements does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{certificateId}/requirements does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Create a certificate requirement
 * ⚠️ DEPRECATED: The /api/Certificates/{certificateId}/requirements endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createCertificateRequirement(
  certificateId: string,
  data: CreateCertificateRequirementRequest
): Promise<ApiResponse<CertificateRequirementDto>> {
  // Endpoint /api/Certificates/{certificateId}/requirements does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{certificateId}/requirements does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Get certificate requirement by ID
 * ⚠️ DEPRECATED: The /api/Certificates/requirements/{requirementId} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCertificateRequirement(
  requirementId: string
): Promise<ApiResponse<CertificateRequirementDto>> {
  // Endpoint /api/Certificates/requirements/{requirementId} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/requirements/{requirementId} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Update a certificate requirement
 * ⚠️ DEPRECATED: The /api/Certificates/requirements/{requirementId} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateCertificateRequirement(
  requirementId: string,
  data: CreateCertificateRequirementRequest
): Promise<ApiResponse<CertificateRequirementDto>> {
  // Endpoint /api/Certificates/requirements/{requirementId} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/requirements/{requirementId} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Delete a certificate requirement
 * ⚠️ DEPRECATED: The /api/Certificates/requirements/{requirementId} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteCertificateRequirement(
  requirementId: string
): Promise<ApiResponse<void>> {
  // Endpoint /api/Certificates/requirements/{requirementId} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/requirements/{requirementId} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

// ============================================================================
// Certificate Fees
// ============================================================================

/**
 * Get fees for a certificate
 * ⚠️ DEPRECATED: The /api/Certificates/{certificateId}/fees endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCertificateFees(
  certificateId: string
): Promise<ApiResponse<CertificateFeeDto[]>> {
  // Endpoint /api/Certificates/{certificateId}/fees does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{certificateId}/fees does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Create a certificate fee
 * ⚠️ DEPRECATED: The /api/Certificates/{certificateId}/fees endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createCertificateFee(
  certificateId: string,
  data: CertificateFeeInput
): Promise<ApiResponse<CertificateFeeDto>> {
  // Endpoint /api/Certificates/{certificateId}/fees does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{certificateId}/fees does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Update a certificate fee
 * ⚠️ DEPRECATED: The /api/Certificates/{certificateId}/fees/{feeId} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateCertificateFee(
  certificateId: string,
  feeId: string,
  data: CertificateFeeInput
): Promise<ApiResponse<CertificateFeeDto>> {
  // Endpoint /api/Certificates/{certificateId}/fees/{feeId} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{certificateId}/fees/{feeId} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Delete a certificate fee
 * ⚠️ DEPRECATED: The /api/Certificates/{certificateId}/fees/{feeId} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteCertificateFee(
  certificateId: string,
  feeId: string
): Promise<ApiResponse<void>> {
  // Endpoint /api/Certificates/{certificateId}/fees/{feeId} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Certificates/{certificateId}/fees/{feeId} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

