/**
 * Profile Service - Corrected API integration based on swagger.json and FRONTEND_INTEGRATION_GUIDE.md
 * Base URL: /seafarer/api/v1/profile
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/profile";

/**
 * Contact Details DTO
 */
export interface ContactDetailsDto {
  contactDetailsId: string;
  rn?: string | null;
  phone?: string | null;
  email?: string | null;
  emergencyContactPerson?: string | null;
  relationship?: string | null;
  emergencyContactNumber?: string | null;
  address?: string | null;
  emergencyContactAddress?: string | null;
  dateCreated?: string | null;
  dateModified?: string | null;
}

/**
 * Create Contact Details Request
 */
export interface CreateContactDetailsRequest {
  phone?: string | null;
  email?: string | null;
  emergencyContactPerson?: string | null;
  relationship?: string | null;
  emergencyContactNumber?: string | null;
  address?: string | null;
  emergencyContactAddress?: string | null;
}

/**
 * Update Contact Details Request (same as create, all optional)
 */
export interface UpdateContactDetailsRequest
  extends CreateContactDetailsRequest {}

/**
 * Education Details DTO
 */
export interface EducationDetailsDto {
  educationId: string;
  rn?: string | null;
  institution?: string | null;
  certificateObtained?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  documents?: EducationDocumentDto[] | null;
  dateCreated?: string | null;
  dateModified?: string | null;
}

/**
 * Education Document DTO
 */
export interface EducationDocumentDto {
  documentId: string;
  educationId: string;
  documentTypesId: string;
  documentTypeDescription?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  filePathOrUrl?: string | null;
  dateCreated?: string | null;
}

/**
 * Create Education Details Request
 */
export interface CreateEducationDetailsRequest {
  institution?: string | null;
  certificateObtained?: string | null;
  startDate?: string | null; // ISO date-time format
  endDate?: string | null; // ISO date-time format
}

/**
 * Update Education Details Request (all optional)
 */
export interface UpdateEducationDetailsRequest
  extends CreateEducationDetailsRequest {}

// ============================================================================
// CONTACT DETAILS ENDPOINTS
// ============================================================================

/**
 * Get contact details
 * GET /seafarer/api/v1/profile/contact-details
 */
export async function getContactDetails(): Promise<
  ApiResponse<ContactDetailsDto>
> {
  return apiGetMain<ContactDetailsDto>(`${API_BASE}/contact-details`);
}

/**
 * Create or update contact details
 * POST /seafarer/api/v1/profile/contact-details
 * Note: Works during onboarding with temporary RN (PENDING-{UserId})
 */
export async function createOrUpdateContactDetails(
  data: CreateContactDetailsRequest
): Promise<ApiResponse<ContactDetailsDto>> {
  return apiPostMain<ContactDetailsDto>(`${API_BASE}/contact-details`, data);
}

/**
 * Update contact details
 * PUT /seafarer/api/v1/profile/contact-details
 */
export async function updateContactDetails(
  data: UpdateContactDetailsRequest
): Promise<ApiResponse<ContactDetailsDto>> {
  return apiPutMain<ContactDetailsDto>(`${API_BASE}/contact-details`, data);
}

// ============================================================================
// EDUCATION DETAILS ENDPOINTS
// ============================================================================

/**
 * Get all education details
 * GET /seafarer/api/v1/profile/education
 * Note: Works during onboarding with temporary RN
 */
export async function getEducationDetails(): Promise<
  ApiResponse<EducationDetailsDto[]>
> {
  return apiGetMain<EducationDetailsDto[]>(`${API_BASE}/education`);
}

/**
 * Get education details by ID
 * GET /seafarer/api/v1/profile/education/{educationId}
 */
export async function getEducationDetailsById(
  educationId: string
): Promise<ApiResponse<EducationDetailsDto>> {
  return apiGetMain<EducationDetailsDto>(
    `${API_BASE}/education/${educationId}`
  );
}

/**
 * Create education details
 * POST /seafarer/api/v1/profile/education
 * Note: Works during onboarding with temporary RN
 */
export async function createEducationDetails(
  data: CreateEducationDetailsRequest
): Promise<ApiResponse<EducationDetailsDto>> {
  return apiPostMain<EducationDetailsDto>(`${API_BASE}/education`, data);
}

/**
 * Update education details
 * PUT /seafarer/api/v1/profile/education/{educationId}
 */
export async function updateEducationDetails(
  educationId: string,
  data: UpdateEducationDetailsRequest
): Promise<ApiResponse<EducationDetailsDto>> {
  return apiPutMain<EducationDetailsDto>(
    `${API_BASE}/education/${educationId}`,
    data
  );
}

/**
 * Delete education details
 * DELETE /seafarer/api/v1/profile/education/{educationId}
 */
export async function deleteEducationDetails(
  educationId: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(`${API_BASE}/education/${educationId}`);
}



