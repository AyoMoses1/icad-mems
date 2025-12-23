/**
 * Seafarer Onboarding Service - API integration for seafarer onboarding endpoints
 * Based on frontend-api-integration.md
 */

import {
  apiGetMain,
  apiPostMain,
  apiPostMultipartMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/api/onboarding/seafarer";

export interface SeafarerRequirement {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  category?: string;
}

export interface SeafarerRequirementsResponse {
  requirements: SeafarerRequirement[];
  completedRequirements?: string[];
  pendingRequirements?: string[];
}

export interface SeafarerProfileRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  nationalityId?: string;
  rankId?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface SeafarerProfileResponse {
  id: string;
  seafarerId?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
}

export interface ContactRequest {
  firstName?: string;
  lastName?: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  isEmergencyContact?: boolean;
}

export interface ContactDto {
  id: string;
  seafarerId?: string;
  firstName?: string;
  lastName?: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  isEmergencyContact?: boolean;
  createdAt?: string;
}

export interface HeldDocumentRequest {
  documentTypeId?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  notes?: string;
}

export interface HeldDocumentDto {
  id: string;
  seafarerId?: string;
  documentTypeId?: string;
  documentTypeName?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  fileUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface FileUploadResponse {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * Get seafarer onboarding requirements
 */
export async function getSeafarerRequirements(): Promise<
  ApiResponse<SeafarerRequirementsResponse>
> {
  return apiGetMain<SeafarerRequirementsResponse>(
    `${API_BASE}/requirements`
  );
}

/**
 * Create or update seafarer profile
 */
export async function createSeafarerProfile(
  data: SeafarerProfileRequest
): Promise<ApiResponse<SeafarerProfileResponse>> {
  return apiPostMain<SeafarerProfileResponse>(`${API_BASE}/profile`, data);
}

/**
 * Add contact for a seafarer
 */
export async function addSeafarerContact(
  seafarerId: string,
  data: ContactRequest
): Promise<ApiResponse<ContactDto>> {
  return apiPostMain<ContactDto>(
    `${API_BASE}/${seafarerId}/contacts`,
    data
  );
}

/**
 * Upload held document for a seafarer (multipart/form-data)
 */
export async function uploadSeafarerDocument(
  seafarerId: string,
  file: File,
  documentData: HeldDocumentRequest
): Promise<ApiResponse<HeldDocumentDto>> {
  const formData = new FormData();
  formData.append("file", file);

  if (documentData.documentTypeId) {
    formData.append("documentTypeId", documentData.documentTypeId);
  }
  if (documentData.documentNumber) {
    formData.append("documentNumber", documentData.documentNumber);
  }
  if (documentData.issueDate) {
    formData.append("issueDate", documentData.issueDate);
  }
  if (documentData.expiryDate) {
    formData.append("expiryDate", documentData.expiryDate);
  }
  if (documentData.issuingAuthority) {
    formData.append("issuingAuthority", documentData.issuingAuthority);
  }
  if (documentData.notes) {
    formData.append("notes", documentData.notes);
  }

  return apiPostMultipartMain<HeldDocumentDto>(
    `${API_BASE}/${seafarerId}/documents`,
    formData
  );
}

/**
 * Get all held documents for a seafarer
 */
export async function getSeafarerDocuments(
  seafarerId: string
): Promise<ApiResponse<HeldDocumentDto[]>> {
  return apiGetMain<HeldDocumentDto[]>(
    `${API_BASE}/${seafarerId}/documents`
  );
}

