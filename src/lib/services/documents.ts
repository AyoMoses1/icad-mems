import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  ApiResponse,
} from "@/lib/api-client";

export interface DocumentMasterDto {
  id: string;
  name?: string;
  categoryType?: string;
  stcwCode?: string;
  description?: string;
  createdAt?: string;
  subTypeCertificateId?: string;
  subTypeEducationId?: string;
  subTypeIdId?: string;
  subTypeMedicalId?: string;
  subTypeTrainingId?: string;
}

export interface CreateDocumentMasterRequest {
  name?: string;
  categoryType?: string;
  stcwCode?: string;
  description?: string;
}

export interface UpdateDocumentMasterRequest {
  name?: string;
  categoryType?: string;
  stcwCode?: string;
  description?: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

/**
 * Get all documents with pagination
 * ⚠️ DEPRECATED: The /api/Documents endpoint does not exist in swagger.json
 * Use document-service.ts for specific document operations (profile, education, institutions, applications)
 * or lookup-service.ts getDocumentTypes() for document type master data.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getDocuments(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<PagedResult<DocumentMasterDto>> {
  // Endpoint /api/Documents does not exist in swagger.json
  // Use document-service.ts or lookup-service.ts getDocumentTypes() instead
  return {
    items: [],
    pageNumber: params?.pageNumber || 1,
    pageSize: params?.pageSize || 100,
    totalNumber: 0,
  };
}

/**
 * Get document by ID
 * ⚠️ DEPRECATED: The /api/Documents/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getDocumentById(id: string): Promise<DocumentMasterDto> {
  // Endpoint /api/Documents/{id} does not exist in swagger.json
  throw new Error("Endpoint /api/Documents/{id} does not exist in the API");
}

/**
 * Create a new document
 * ⚠️ DEPRECATED: The /seafarer/api/Documents endpoint does not exist in swagger.json
 * Use document-service.ts upload functions instead.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createDocument(
  data: CreateDocumentMasterRequest
): Promise<DocumentMasterDto> {
  // Endpoint /seafarer/api/Documents does not exist in swagger.json
  throw new Error("Endpoint /seafarer/api/Documents does not exist in the API. Use document-service.ts upload functions instead.");
}

/**
 * Update a document
 * ⚠️ DEPRECATED: The /api/Documents/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateDocument(
  id: string,
  data: UpdateDocumentMasterRequest
): Promise<boolean> {
  // Endpoint /api/Documents/{id} does not exist in swagger.json
  throw new Error("Endpoint /api/Documents/{id} does not exist in the API");
}

/**
 * Delete a document
 * ⚠️ DEPRECATED: The /api/Documents/{id} endpoint does not exist in swagger.json
 * Use document-service.ts delete functions instead (deleteProfileDocument, deleteEducationDocument, etc.)
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteDocument(id: string): Promise<boolean> {
  // Endpoint /api/Documents/{id} does not exist in swagger.json
  // Use document-service.ts delete functions instead
  throw new Error("Endpoint /api/Documents/{id} does not exist in the API. Use document-service.ts delete functions instead.");
}

