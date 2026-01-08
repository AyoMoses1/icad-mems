/**
 * Documents Master Service - API integration for DocumentMaster operations
 * Based on swagger.txt - /api/Documents endpoints
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/documents";

// ============================================================================
// Types
// ============================================================================

export interface DocumentMasterDto {
  id: string;
  name?: string | null;
  categoryType?: string | null;
  stcwCode?: string | null;
  description?: string | null;
  createdAt?: string | null;
  subTypeCertificateId?: string | null;
  subTypeEducationId?: string | null;
  subTypeIdId?: string | null;
  subTypeMedicalId?: string | null;
  subTypeTrainingId?: string | null;
}

export interface CreateDocumentMasterRequest {
  name?: string | null;
  categoryType?: string | null;
  stcwCode?: string | null;
  description?: string | null;
}

export interface UpdateDocumentMasterRequest {
  name?: string | null;
  categoryType?: string | null;
  stcwCode?: string | null;
  description?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

// ============================================================================
// Document Master CRUD
// ============================================================================

/**
 * Get paginated list of document masters
 * GET /api/Documents
 */
export async function getDocumentMasters(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<DocumentMasterDto>>> {
  const searchParams = new URLSearchParams();
  if (params?.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize) searchParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection) searchParams.append("sortDirection", params.sortDirection);
  
  const url = searchParams.toString() ? `${API_BASE}?${searchParams.toString()}` : API_BASE;
  return apiGetMain<PagedResult<DocumentMasterDto>>(url);
}

/**
 * Get document master by ID
 * GET /api/Documents/{id}
 */
export async function getDocumentMasterById(id: string): Promise<ApiResponse<DocumentMasterDto>> {
  return apiGetMain<DocumentMasterDto>(`${API_BASE}/${id}`);
}

/**
 * Create a new document master
 * POST /api/Documents
 */
export async function createDocumentMaster(
  data: CreateDocumentMasterRequest
): Promise<ApiResponse<DocumentMasterDto>> {
  return apiPostMain<DocumentMasterDto>(API_BASE, data);
}

/**
 * Update a document master
 * PUT /api/Documents/{id}
 */
export async function updateDocumentMaster(
  id: string,
  data: UpdateDocumentMasterRequest
): Promise<ApiResponse<DocumentMasterDto>> {
  return apiPutMain<DocumentMasterDto>(`${API_BASE}/${id}`, data);
}

/**
 * Delete a document master
 * DELETE /api/Documents/{id}
 */
export async function deleteDocumentMaster(id: string): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${id}`);
}

