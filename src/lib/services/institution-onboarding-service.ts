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

const API_BASE = "/seafarer/api/v1/institutions";
const API_ONBOARDING_BASE = "/seafarer/api/v1/onboarding/institution";
const API_STAFF_BASE = "/seafarer/api/v1/institution-staffs";
const API_TRAINING_BASE = "/seafarer/api/v1/training-institutes";
const API_MEDICAL_BASE = "/seafarer/api/v1/medical-institutes";

// Training Institute types
export interface TrainingInstituteDto {
  id: string;
  institutionId: string;
  institutionName?: string | null;
  coursesOffered?: string[] | null;
  accreditationStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TrainingInstituteRequest {
  institutionId?: string;
  coursesOffered?: string[];
  accreditationStatus?: string;
}

// Medical Institute types
export interface MedicalInstituteDto {
  id: string;
  institutionId: string;
  institutionName?: string | null;
  servicesOffered?: string[] | null;
  accreditationStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MedicalInstituteRequest {
  institutionId?: string;
  servicesOffered?: string[];
  accreditationStatus?: string;
}

export interface InstitutionContactRequest {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  email?: string;
  phoneNumberPrimary?: string;
  phoneNumberSecondary?: string;
  officeExtension?: string;
  isPrimaryContact?: boolean;
  isActive?: boolean;
}

export interface InstitutionContactDto {
  id: string;
  institutionId?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  email?: string;
  phoneNumberPrimary?: string;
  phoneNumberSecondary?: string;
  officeExtension?: string;
  isPrimaryContact?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstitutionStaffRequest {
  institutionId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  staffType?: string;
  medicalLicenseNo?: string;
  nimasaAuthorizedExaminerId?: string;
  specialization?: string;
  imoModel609CertNo?: string;
  highestCocHeldId?: string;
  yearsOfSeaExperience?: number;
  isActive?: boolean;
}

export interface InstitutionStaffDto {
  id: string;
  institutionId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  staffType?: string;
  medicalLicenseNo?: string;
  nimasaAuthorizedExaminerId?: string;
  specialization?: string;
  imoModel609CertNo?: string;
  highestCocHeldId?: string;
  yearsOfSeaExperience?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Training Institute Onboarding Request (creates institution + training institute)
export interface TrainingInstituteOnboardingRequest {
  name: string;
  nimasaAccreditationNo: string;
  accreditationExpiry?: string | null; // date format (YYYY-MM-DD)
  physicalAddress: string;
  email: string;
  isActive: boolean;
  authUserId: string;
  mtiCategory: string;
  hasSimulators: boolean;
  totalClassrooms: number;
}

export interface TrainingInstituteOnboardingResponse {
  id: string; // institutionId
  name?: string | null;
  institutionType?: string | null;
  nimasaAccreditationNo?: string | null;
  physicalAddress?: string | null;
  email?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  mtiCategory?: string | null;
  hasSimulators?: boolean | null;
  totalClassrooms?: number | null;
}

// Medical Institute Onboarding Request (creates institution + medical institute)
export interface MedicalInstituteOnboardingRequest {
  name: string;
  nimasaAccreditationNo: string;
  accreditationExpiry?: string | null; // date format (YYYY-MM-DD)
  physicalAddress: string;
  email: string;
  isActive: boolean;
  authUserId: string;
  clinicLicenseNo: string;
  numApprovedDoctors: number;
  laboratoryEquipped: boolean;
}

export interface MedicalInstituteOnboardingResponse {
  id: string; // institutionId
  name?: string | null;
  institutionType?: string | null;
  nimasaAccreditationNo?: string | null;
  physicalAddress?: string | null;
  email?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  clinicLicenseNo?: string | null;
  numApprovedDoctors?: number | null;
  laboratoryEquipped?: boolean | null;
}

// Training Institution Staff Request (for training institutes)
export interface TrainingInstitutionStaffRequest {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  staffType?: string | null;
  imoModel609CertNo?: string | null;
  highestCocHeldId?: string | null; // UUID
  yearsOfSeaExperience?: number | null;
  isActive?: boolean | null;
}

// Medical Institution Staff Request (for medical institutes)
export interface MedicalInstitutionStaffRequest {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  staffType?: string | null;
  medicalLicenseNo?: string | null;
  nimasaAuthorizedExaminerId?: string | null;
  specialization?: string | null;
  isActive?: boolean | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

export interface InstitutionOnboardingStatus {
  completed?: boolean;
  message?: string;
}

export interface OnboardingRequirement {
  id: string;
  userType?: string;
  documentMasterId?: string;
  isMandatory: boolean;
  categoryType?: string;
  name: string;
}

/**
 * Get institution onboarding requirements
 * GET /api/onboarding/institution/requirements
 */
export async function getInstitutionOnboardingRequirements(params?: {
  institutionType?: string;
}): Promise<ApiResponse<OnboardingRequirement[]>> {
  const queryParams = new URLSearchParams();
  if (params?.institutionType) {
    queryParams.append("institutionType", params.institutionType);
  }

  return apiGetMain<OnboardingRequirement[]>(
    `${API_ONBOARDING_BASE}/requirements${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
}

/**
 * Get institution onboarding status
 * GET /api/onboarding/institution/onboarding-status
 */
export async function getInstitutionOnboardingStatus(): Promise<
  ApiResponse<InstitutionOnboardingStatus>
> {
  return apiGetMain<InstitutionOnboardingStatus>(
    `${API_ONBOARDING_BASE}/onboarding-status`,
  );
}

/**
 * Accept an enrollment
 * PATCH /api/Institutions/enrollments/{enrollmentId}/accept
 */
export async function acceptEnrollment(
  enrollmentId: string,
  data?: { remarks?: string | null }
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(
    `/api/Institutions/enrollments/${enrollmentId}/accept`,
    data || {}
  );
}

/**
 * Reject an enrollment
 * PATCH /api/Institutions/enrollments/{enrollmentId}/reject
 */
export async function rejectEnrollment(
  enrollmentId: string,
  data?: { remarks?: string | null }
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(
    `/api/Institutions/enrollments/${enrollmentId}/reject`,
    data || {}
  );
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
 * Add a contact to an institution (onboarding)
 * POST /api/onboarding/institution/{institutionId}/contacts
 */
export async function addInstitutionContact(
  institutionId: string,
  data: InstitutionContactRequest
): Promise<ApiResponse<InstitutionContactDto>> {
  return apiPostMain<InstitutionContactDto>(
    `${API_ONBOARDING_BASE}/${institutionId}/contacts`,
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
 * Add a staff member to an institution (onboarding - general)
 * POST /api/onboarding/institution/{institutionId}/staffs
 */
export async function addInstitutionStaff(
  institutionId: string,
  data: InstitutionStaffRequest
): Promise<ApiResponse<InstitutionStaffDto>> {
  return apiPostMain<InstitutionStaffDto>(
    `${API_ONBOARDING_BASE}/${institutionId}/staffs`,
    data
  );
}

/**
 * Add a staff member to a training institution (onboarding)
 * POST /api/onboarding/institution/training/{institutionId}/staffs
 */
export async function addTrainingInstitutionStaff(
  institutionId: string,
  data: TrainingInstitutionStaffRequest
): Promise<ApiResponse<any>> {
  return apiPostMain<any>(
    `${API_ONBOARDING_BASE}/training/${institutionId}/staffs`,
    data
  );
}

/**
 * Add a staff member to a medical institution (onboarding)
 * POST /api/onboarding/institution/medical/{institutionId}/staffs
 */
export async function addMedicalInstitutionStaff(
  institutionId: string,
  data: MedicalInstitutionStaffRequest
): Promise<ApiResponse<any>> {
  return apiPostMain<any>(
    `${API_ONBOARDING_BASE}/medical/${institutionId}/staffs`,
    data
  );
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
 * Create institution + training institute (onboarding)
 * POST /api/onboarding/institution/training
 */
export async function createTrainingInstitute(
  data: TrainingInstituteOnboardingRequest
): Promise<ApiResponse<TrainingInstituteOnboardingResponse>> {
  return apiPostMain<TrainingInstituteOnboardingResponse>(
    `${API_ONBOARDING_BASE}/training`,
    data,
  );
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
 * Create institution + medical institute (onboarding)
 * POST /api/onboarding/institution/medical
 */
export async function createMedicalInstitute(
  data: MedicalInstituteOnboardingRequest
): Promise<ApiResponse<MedicalInstituteOnboardingResponse>> {
  return apiPostMain<MedicalInstituteOnboardingResponse>(
    `${API_ONBOARDING_BASE}/medical`,
    data,
  );
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

