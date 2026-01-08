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

const API_BASE = "/seafarer/api/v1/certificates";

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
 * GET /api/Certificates
 */
export async function getCertificates(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<CertificateDto>>> {
  const searchParams = new URLSearchParams();
  if (params?.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize) searchParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection) searchParams.append("sortDirection", params.sortDirection);
  
  const url = searchParams.toString() ? `${API_BASE}?${searchParams.toString()}` : API_BASE;
  return apiGetMain<PagedResult<CertificateDto>>(url);
}

/**
 * Get certificate by ID
 * GET /api/Certificates/{id}
 */
export async function getCertificateById(id: string): Promise<ApiResponse<CertificateDto>> {
  return apiGetMain<CertificateDto>(`${API_BASE}/${id}`);
}

/**
 * Create a new certificate
 * POST /api/Certificates
 */
export async function createCertificate(
  data: CreateCertificateRequest
): Promise<ApiResponse<CertificateDto>> {
  return apiPostMain<CertificateDto>(API_BASE, data);
}

/**
 * Update a certificate
 * PUT /api/Certificates/{id}
 */
export async function updateCertificate(
  id: string,
  data: UpdateCertificateRequest
): Promise<ApiResponse<CertificateDto>> {
  return apiPutMain<CertificateDto>(`${API_BASE}/${id}`, data);
}

/**
 * Delete a certificate
 * DELETE /api/Certificates/{id}
 */
export async function deleteCertificate(id: string): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${id}`);
}

// ============================================================================
// Certificate Requirements
// ============================================================================

/**
 * Get requirements for a certificate
 * GET /api/Certificates/{certificateId}/requirements
 */
export async function getCertificateRequirements(
  certificateId: string
): Promise<ApiResponse<CertificateRequirementDto[]>> {
  return apiGetMain<CertificateRequirementDto[]>(`${API_BASE}/${certificateId}/requirements`);
}

/**
 * Create a certificate requirement
 * POST /api/Certificates/{certificateId}/requirements
 */
export async function createCertificateRequirement(
  certificateId: string,
  data: CreateCertificateRequirementRequest
): Promise<ApiResponse<CertificateRequirementDto>> {
  return apiPostMain<CertificateRequirementDto>(
    `${API_BASE}/${certificateId}/requirements`,
    data
  );
}

/**
 * Get certificate requirement by ID
 * GET /api/Certificates/requirements/{requirementId}
 */
export async function getCertificateRequirement(
  requirementId: string
): Promise<ApiResponse<CertificateRequirementDto>> {
  return apiGetMain<CertificateRequirementDto>(`${API_BASE}/requirements/${requirementId}`);
}

/**
 * Update a certificate requirement
 * PUT /api/Certificates/requirements/{requirementId}
 */
export async function updateCertificateRequirement(
  requirementId: string,
  data: CreateCertificateRequirementRequest
): Promise<ApiResponse<CertificateRequirementDto>> {
  return apiPutMain<CertificateRequirementDto>(
    `${API_BASE}/requirements/${requirementId}`,
    data
  );
}

/**
 * Delete a certificate requirement
 * DELETE /api/Certificates/requirements/{requirementId}
 */
export async function deleteCertificateRequirement(
  requirementId: string
): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/requirements/${requirementId}`);
}

// ============================================================================
// Certificate Fees
// ============================================================================

/**
 * Get fees for a certificate
 * GET /api/Certificates/{certificateId}/fees
 */
export async function getCertificateFees(
  certificateId: string
): Promise<ApiResponse<CertificateFeeDto[]>> {
  return apiGetMain<CertificateFeeDto[]>(`${API_BASE}/${certificateId}/fees`);
}

/**
 * Create a certificate fee
 * POST /api/Certificates/{certificateId}/fees
 */
export async function createCertificateFee(
  certificateId: string,
  data: CertificateFeeInput
): Promise<ApiResponse<CertificateFeeDto>> {
  return apiPostMain<CertificateFeeDto>(`${API_BASE}/${certificateId}/fees`, data);
}

/**
 * Update a certificate fee
 * PUT /api/Certificates/{certificateId}/fees/{feeId}
 */
export async function updateCertificateFee(
  certificateId: string,
  feeId: string,
  data: CertificateFeeInput
): Promise<ApiResponse<CertificateFeeDto>> {
  return apiPutMain<CertificateFeeDto>(`${API_BASE}/${certificateId}/fees/${feeId}`, data);
}

/**
 * Delete a certificate fee
 * DELETE /api/Certificates/{certificateId}/fees/{feeId}
 */
export async function deleteCertificateFee(
  certificateId: string,
  feeId: string
): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${certificateId}/fees/${feeId}`);
}

