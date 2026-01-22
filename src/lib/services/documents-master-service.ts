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
 * ⚠️ DEPRECATED: The GET /seafarer/api/v1/documents endpoint does not exist in swagger.json
 * Only specific sub-paths exist (profile/{rn}, education/{educationId}, institutions/{institutionId}, applications/{applicationId}/upload).
 * Use lookup-service.ts getDocumentTypes() for document type master data.
 * 
 * @deprecated Use lookup-service.ts getDocumentTypes() instead
 */
export async function getDocumentMasters(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<DocumentMasterDto>>> {
  // Endpoint GET /seafarer/api/v1/documents does not exist in swagger.json
  // Use lookup-service.ts getDocumentTypes() instead
  return {
    success: false,
    error: { message: "GET /seafarer/api/v1/documents does not exist. Use lookup-service.ts getDocumentTypes() instead.", code: "ENDPOINT_NOT_FOUND" },
    data: {
      items: [],
      pageNumber: params?.pageNumber || 1,
      pageSize: params?.pageSize || 100,
      totalNumber: 0,
    },
  };
}

/**
 * Get document master by ID
 * ⚠️ DEPRECATED: The GET /seafarer/api/v1/documents/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getDocumentMasterById(id: string): Promise<ApiResponse<DocumentMasterDto>> {
  // Endpoint GET /seafarer/api/v1/documents/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint GET /seafarer/api/v1/documents/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Create a new document master
 * ⚠️ DEPRECATED: The POST /seafarer/api/v1/documents endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createDocumentMaster(
  data: CreateDocumentMasterRequest
): Promise<ApiResponse<DocumentMasterDto>> {
  // Endpoint POST /seafarer/api/v1/documents does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint POST /seafarer/api/v1/documents does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Update a document master
 * ⚠️ DEPRECATED: The PUT /seafarer/api/v1/documents/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateDocumentMaster(
  id: string,
  data: UpdateDocumentMasterRequest
): Promise<ApiResponse<DocumentMasterDto>> {
  // Endpoint PUT /seafarer/api/v1/documents/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint PUT /seafarer/api/v1/documents/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Delete a document master
 * ⚠️ DEPRECATED: The DELETE /seafarer/api/v1/documents/{id} endpoint does not exist in swagger.json
 * Use document-service.ts delete functions instead (deleteProfileDocument, deleteEducationDocument, etc.)
 * 
 * @deprecated Use document-service.ts delete functions instead
 */
export async function deleteDocumentMaster(id: string): Promise<ApiResponse<void>> {
  // Endpoint DELETE /seafarer/api/v1/documents/{id} does not exist in swagger.json
  // Use document-service.ts delete functions instead
  return {
    success: false,
    error: { message: "Endpoint DELETE /seafarer/api/v1/documents/{id} does not exist. Use document-service.ts delete functions instead.", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

