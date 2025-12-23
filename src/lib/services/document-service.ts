/**
 * Document Service - API integration for document operations
 */

import type { ApiResponse } from "@/lib/api-client";

const API_BASE = "/api/v1/Documents";

export interface DocumentDto {
  id: number;
  documentTypeId?: number;
  documentTypeName?: string | null;
  fileName?: string | null;
  filePath?: string | null;
  fileSize?: number;
  mimeType?: string | null;
  expiryDate?: string | null;
  issueDate?: string | null;
  issuingAuthority?: string | null;
  documentNumber?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface UploadDocumentDto {
  file: File;
  DocumentTypeId: number;
  ExpiryDate?: string | null;
  IssueDate?: string | null;
  IssuingAuthority?: string | null;
  DocumentNumber?: string | null;
  Notes?: string | null;
}

/**
 * Upload a profile document for the current user
 */
export async function uploadUserDocument(
  documentData: UploadDocumentDto
): Promise<ApiResponse<DocumentDto>> {
  // Get API base URL and auth token
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_LOGIN_BASE_URL?.trim() || "";
  const token = getAuthToken();

  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_LOGIN_BASE_URL is not configured");
  }

  const url = `${API_BASE_URL}${API_BASE}/users/me/documents`;

  // Create FormData for multipart/form-data
  const formData = new FormData();
  formData.append("file", documentData.file);
  formData.append("DocumentTypeId", documentData.DocumentTypeId.toString());

  if (documentData.ExpiryDate) {
    formData.append("ExpiryDate", documentData.ExpiryDate);
  }
  if (documentData.IssueDate) {
    formData.append("IssueDate", documentData.IssueDate);
  }
  if (documentData.IssuingAuthority) {
    formData.append("IssuingAuthority", documentData.IssuingAuthority);
  }
  if (documentData.DocumentNumber) {
    formData.append("DocumentNumber", documentData.DocumentNumber);
  }
  if (documentData.Notes) {
    formData.append("Notes", documentData.Notes);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - let browser set it with boundary
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: {
        code: data.code || "UPLOAD_ERROR",
        message: data.message || data.error || "Failed to upload document",
      },
    };
  }

  return {
    success: true,
    data: data.data || data,
    message: data.message,
  };
}

/**
 * Get all documents for the current user
 */
export async function getUserDocuments(): Promise<ApiResponse<DocumentDto[]>> {
  const { apiGetMain } = await import("@/lib/api-client");
  return apiGetMain<DocumentDto[]>(`${API_BASE}/users/me/documents`);
}

/**
 * Get a specific document by ID
 */
export async function getDocumentById(
  docId: number
): Promise<ApiResponse<DocumentDto>> {
  const { apiGetMain } = await import("@/lib/api-client");
  return apiGetMain<DocumentDto>(`${API_BASE}/users/me/documents/${docId}`);
}

/**
 * Download a document
 */
export async function downloadDocument(docId: number): Promise<Blob> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_LOGIN_BASE_URL?.trim() || "";
  const token = getAuthToken();

  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_LOGIN_BASE_URL is not configured");
  }

  if (!token) {
    throw new Error("Authentication token is required. Please log in first.");
  }

  const url = `${API_BASE_URL}${API_BASE}/users/me/documents/${docId}/download`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download document");
  }

  return response.blob();
}

/**
 * Gets the current access token from auth store
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const { useAuthStore } = require("@/store");
    const token = useAuthStore.getState().token;

    if (!token && process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ No authentication token found for document upload. Please ensure you are logged in."
      );
    }

    return token;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting auth token:", error);
    }
    return null;
  }
}

