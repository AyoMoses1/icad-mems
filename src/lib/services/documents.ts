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
 */
export async function getDocuments(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<PagedResult<DocumentMasterDto>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection) queryParams.append("sortDirection", params.sortDirection);

  const response = await apiGetMain<PagedResult<DocumentMasterDto>>(
    `/api/Documents${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch documents");
  }

  return response.data;
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: string): Promise<DocumentMasterDto> {
  const response = await apiGetMain<DocumentMasterDto>(`/api/Documents/${id}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch document");
  }

  return response.data;
}

/**
 * Create a new document
 */
export async function createDocument(
  data: CreateDocumentMasterRequest
): Promise<DocumentMasterDto> {
  const response = await apiPostMain<DocumentMasterDto>("/api/Documents", data);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to create document");
  }

  return response.data;
}

/**
 * Update a document
 */
export async function updateDocument(
  id: string,
  data: UpdateDocumentMasterRequest
): Promise<boolean> {
  const response = await apiPutMain<boolean>(`/api/Documents/${id}`, data);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(response.error?.message || "Failed to update document");
  }

  return response.data ?? true;
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<boolean> {
  const response = await apiDeleteMain<boolean>(`/api/Documents/${id}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(response.error?.message || "Failed to delete document");
  }

  return response.data ?? true;
}

