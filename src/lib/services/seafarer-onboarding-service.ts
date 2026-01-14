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

const API_BASE = "/seafarer/api/v1/onboarding/seafarer";
const API_BASE_V2 = "/seafarer/api/v1/seafarers";

export interface SeafarerRequirement {
  id: string;
  userType?: string;
  documentMasterId?: string;
  isMandatory: boolean;
  categoryType?: string;
  name: string;
}

export interface SeafarerProfileRequest {
  FirstName?: string;
  LastName?: string;
  DateOfBirth?: string;
  Gender?: string;
  Nationality?: string;
  NationalityId?: string;
  NinNumber?: string;
  SidNumber?: string;
  DischargeBookNo?: string;
  CurrentRankId?: string;
  Email?: string;
  PhoneNumber?: string;
  HomeAddress?: string;
  IsActive?: boolean;
  WalletAddress?: string;
}

export interface SeafarerProfileResponse {
  id: string;
  seafarerId?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
}

export interface ContactRequest {
  fullName?: string;
  relationship?: string;
  phoneNumber?: string;
  isPrimary?: boolean;
}

export interface ContactDto {
  id: string;
  seafarerId?: string;
  fullName?: string;
  relationship?: string;
  phoneNumber?: string;
  isPrimary?: boolean;
}

export interface HeldDocumentRequest {
  DocumentMasterId: string; // Required
  DocumentNumber: string; // Required
  IssueDate: string; // Required (date format)
  ExpiryDate?: string; // Optional (date format)
}

export interface HeldDocumentDto {
  id: string;
  seafarerId?: string;
  documentMasterId?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  verificationStatus?: string;
  ipfsHash?: string;
  dateVerified?: string;
  status?: string;
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
  ApiResponse<SeafarerRequirement[]>
> {
  return apiGetMain<SeafarerRequirement[]>(`${API_BASE}/requirements`);
}
export async function getDocumentInformation({
  documentId,
}: {
  documentId: string;
}): Promise<ApiResponse<any>> {
  return apiGetMain<any>(`${API_BASE}/document/${documentId}`);
}

/**
 * Create or update seafarer profile
 * Note: This endpoint uses multipart/form-data (even without ProfilePicture file)
 */
export async function createSeafarerProfile(
  data: SeafarerProfileRequest,
  profilePictureFile?: File
): Promise<ApiResponse<SeafarerProfileResponse>> {
  const formData = new FormData();

  // Explicit role for seafarer onboarding (per mems.md)
  formData.append("Role", "SEAFARER");

  // Add all fields to FormData (PascalCase keys as per API)
  if (data.FirstName) formData.append("FirstName", data.FirstName);
  if (data.LastName) formData.append("LastName", data.LastName);
  if (data.DateOfBirth) formData.append("DateOfBirth", data.DateOfBirth);
  if (data.Gender) formData.append("Gender", data.Gender);
  if (data.Nationality) formData.append("Nationality", data.Nationality);
  if (data.NinNumber) formData.append("NinNumber", data.NinNumber);
  if (data.SidNumber) formData.append("SidNumber", data.SidNumber);
  if (data.DischargeBookNo)
    formData.append("DischargeBookNo", data.DischargeBookNo);
  if (data.CurrentRankId) formData.append("CurrentRankId", data.CurrentRankId);
  if (data.Email) formData.append("Email", data.Email);
  if (data.PhoneNumber) formData.append("PhoneNumber", data.PhoneNumber);
  if (data.HomeAddress) formData.append("HomeAddress", data.HomeAddress);
  if (data.IsActive !== undefined)
    formData.append("IsActive", data.IsActive.toString());
  if (data.WalletAddress) formData.append("WalletAddress", data.WalletAddress);
  if (data.NationalityId) formData.append("NationalityId", data.NationalityId);
  if (profilePictureFile) formData.append("ProfilePicture", profilePictureFile);

  return apiPostMultipartMain<SeafarerProfileResponse>(
    `${API_BASE}/profile`,
    formData
  );
}

/**
 * Add contact for a seafarer
 */
export async function addSeafarerContact(
  seafarerId: string,
  data: ContactRequest
): Promise<ApiResponse<ContactDto>> {
  return apiPostMain<ContactDto>(`${API_BASE}/${seafarerId}/contacts`, data);
}

/**
 * Upload held document for a seafarer (multipart/form-data)
 * Required fields: DocumentMasterId, DocumentNumber, IssueDate, File
 */
export async function uploadSeafarerDocument(
  seafarerId: string,
  file: File,
  documentData: HeldDocumentRequest
): Promise<ApiResponse<HeldDocumentDto>> {
  const formData = new FormData();

  // Required fields
  formData.append("File", file);
  formData.append("DocumentMasterId", documentData.DocumentMasterId);
  formData.append("DocumentNumber", documentData.DocumentNumber);
  formData.append("IssueDate", documentData.IssueDate);

  // Optional fields
  if (documentData.ExpiryDate) {
    formData.append("ExpiryDate", documentData.ExpiryDate);
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
  return apiGetMain<HeldDocumentDto[]>(`${API_BASE}/${seafarerId}/documents`);
}
