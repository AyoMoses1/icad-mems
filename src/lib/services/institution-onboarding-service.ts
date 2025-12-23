/**
 * Institution Onboarding Service - API integration for institution onboarding endpoints
 * Based on frontend-api-integration.md
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/api/institutions";
const API_STAFF_BASE = "/api/institutionstaffs";
const API_TRAINING_BASE = "/api/traininginstitutes";
const API_MEDICAL_BASE = "/api/medicalinstitutes";

export interface InstitutionContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
}

export interface InstitutionContactDto {
  id: string;
  institutionId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstitutionStaffRequest {
  institutionId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  isActive?: boolean;
}

export interface InstitutionStaffDto {
  id: string;
  institutionId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingInstituteRequest {
  institutionId?: string;
  accreditationNumber?: string;
  accreditationExpiry?: string;
  coursesOffered?: string[];
  capacity?: number;
  facilities?: string[];
  isActive?: boolean;
}

export interface TrainingInstituteDto {
  id: string;
  institutionId?: string;
  accreditationNumber?: string;
  accreditationExpiry?: string;
  coursesOffered?: string[];
  capacity?: number;
  facilities?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalInstituteRequest {
  institutionId?: string;
  accreditationNumber?: string;
  accreditationExpiry?: string;
  servicesOffered?: string[];
  capacity?: number;
  facilities?: string[];
  isActive?: boolean;
}

export interface MedicalInstituteDto {
  id: string;
  institutionId?: string;
  accreditationNumber?: string;
  accreditationExpiry?: string;
  servicesOffered?: string[];
  capacity?: number;
  facilities?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

// ============================================================================
// Institution Contacts
// ============================================================================

/**
 * Get all contacts for an institution
 */
export async function getInstitutionContacts(
  institutionId: string
): Promise<ApiResponse<InstitutionContactDto[]>> {
  return apiGetMain<InstitutionContactDto[]>(
    `${API_BASE}/${institutionId}/contacts`
  );
}

/**
 * Add a contact to an institution
 */
export async function addInstitutionContact(
  institutionId: string,
  data: InstitutionContactRequest
): Promise<ApiResponse<InstitutionContactDto>> {
  return apiPostMain<InstitutionContactDto>(
    `${API_BASE}/${institutionId}/contacts`,
    data
  );
}

/**
 * Update an institution contact
 */
export async function updateInstitutionContact(
  institutionId: string,
  contactId: string,
  data: InstitutionContactRequest
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(
    `${API_BASE}/${institutionId}/contacts/${contactId}`,
    data
  );
}

/**
 * Delete an institution contact
 */
export async function deleteInstitutionContact(
  institutionId: string,
  contactId: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(
    `${API_BASE}/${institutionId}/contacts/${contactId}`
  );
}

// ============================================================================
// Institution Staff
// ============================================================================

/**
 * Get all staff for an institution
 */
export async function getInstitutionStaff(
  institutionId: string,
  params?: {
    pageNumber?: number;
    pageSize?: number;
  }
): Promise<ApiResponse<PagedResult<InstitutionStaffDto>>> {
  const queryParams = new URLSearchParams();
  queryParams.append("institutionId", institutionId);
  if (params?.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params?.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }

  return apiGetMain<PagedResult<InstitutionStaffDto>>(
    `${API_STAFF_BASE}?${queryParams.toString()}`
  );
}

/**
 * Add a staff member to an institution
 */
export async function addInstitutionStaff(
  data: InstitutionStaffRequest
): Promise<ApiResponse<InstitutionStaffDto>> {
  return apiPostMain<InstitutionStaffDto>(API_STAFF_BASE, data);
}

/**
 * Update an institution staff member
 */
export async function updateInstitutionStaff(
  id: string,
  data: Partial<InstitutionStaffRequest>
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(`${API_STAFF_BASE}/${id}`, data);
}

/**
 * Delete an institution staff member
 */
export async function deleteInstitutionStaff(
  id: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(`${API_STAFF_BASE}/${id}`);
}

// ============================================================================
// Training Institutes
// ============================================================================

/**
 * Create a training institute
 */
export async function createTrainingInstitute(
  data: TrainingInstituteRequest
): Promise<ApiResponse<TrainingInstituteDto>> {
  return apiPostMain<TrainingInstituteDto>(API_TRAINING_BASE, data);
}

/**
 * Get training institute by institution ID
 */
export async function getTrainingInstitute(
  institutionId: string
): Promise<ApiResponse<TrainingInstituteDto>> {
  return apiGetMain<TrainingInstituteDto>(
    `${API_TRAINING_BASE}/${institutionId}`
  );
}

/**
 * Update a training institute
 */
export async function updateTrainingInstitute(
  institutionId: string,
  data: Partial<TrainingInstituteRequest>
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(
    `${API_TRAINING_BASE}/${institutionId}`,
    data
  );
}

/**
 * Delete a training institute
 */
export async function deleteTrainingInstitute(
  institutionId: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(`${API_TRAINING_BASE}/${institutionId}`);
}

// ============================================================================
// Medical Institutes
// ============================================================================

/**
 * Create a medical institute
 */
export async function createMedicalInstitute(
  data: MedicalInstituteRequest
): Promise<ApiResponse<MedicalInstituteDto>> {
  return apiPostMain<MedicalInstituteDto>(API_MEDICAL_BASE, data);
}

/**
 * Get medical institute by institution ID
 */
export async function getMedicalInstitute(
  institutionId: string
): Promise<ApiResponse<MedicalInstituteDto>> {
  return apiGetMain<MedicalInstituteDto>(
    `${API_MEDICAL_BASE}/${institutionId}`
  );
}

/**
 * Update a medical institute
 */
export async function updateMedicalInstitute(
  institutionId: string,
  data: Partial<MedicalInstituteRequest>
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(`${API_MEDICAL_BASE}/${institutionId}`, data);
}

/**
 * Delete a medical institute
 */
export async function deleteMedicalInstitute(
  institutionId: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(`${API_MEDICAL_BASE}/${institutionId}`);
}

