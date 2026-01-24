/**
 * Onboarding Service - Corrected API integration based on swagger.json and FRONTEND_INTEGRATION_GUIDE.md
 * Base URL: /seafarer/api/v1/Onboarding
 * 
 * ⚠️ IMPORTANT NOTE ON DOCUMENTS AND ONBOARDING:
 * Documents are DIRECTLY LINKED to the onboarding process. For Seafarers, Training Institutions, and Agents,
 * all required documents must be uploaded as part of the onboarding workflow. Documents are not separate
 * entities but are tied to the onboarding record. After creating an onboarding request, you must upload the
 * required documents using the document upload endpoints (see document-service.ts), which are linked to the
 * onboarding process. The onboarding status and approval depend on the completion of document uploads.
 */

import {
  apiGetMain,
  apiPostMain,
  apiPatchMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/Onboarding";

/**
 * Onboarding Status Enum
 */
export enum OnboardingStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

/**
 * User Seafarer Role Enum
 */
export enum UserSeafarerRole {
  SEAFAER = "SEAFARER",
  TRAINING_INSTITUTION = "TRAINING_INSTITUTION",
  AGENT = "AGENT",
  ACCREDITATION_OFFICER = "ACCREDITATION_OFFICER",
  INSPECTOR = "INSPECTOR",
  FINANCE = "FINANCE",
  ADMIN = "ADMIN",
}

/**
 * Create Onboarding Request
 */
export interface CreateOnboardingRequest {
  role: UserSeafarerRole;
  accreditedInstitutionId?: string | null;
  roleSpecificIdentifier?: string | null;
  sin?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  employeeId?: string | null;
  notes?: string | null;
}

/**
 * Update Onboarding Status Request
 */
export interface UpdateOnboardingStatusRequest {
  status: OnboardingStatus;
  rn?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
}

/**
 * Education Details DTO (nested in onboarding)
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
 * Profile Document DTO (nested in onboarding)
 */
export interface ProfileDocumentDto {
  documentId: string;
  rn?: string | null;
  documentTypesId: string;
  documentTypeDescription?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  filePathOrUrl?: string | null;
  dateCreated?: string | null;
  dateModified?: string | null;
}

/**
 * Voyage Document DTO (nested in VoyageActivityDto)
 */
export interface VoyageDocumentDto {
  documentId: string;
  voyageActivityId?: string | null;
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
 * Training Document DTO (nested in SeafarerTrainingDto)
 */
export interface TrainingDocumentDto {
  documentId: string;
  trainingId?: string | null;
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
 * Seafarer Training DTO (nested in onboarding)
 */
export interface SeafarerTrainingDto {
  recordId?: string | null;
  trainingId?: string | null;
  rn?: string | null;
  institutionSTCWAccreditationId: string;
  institutionSTCWAccreditationName?: string | null;
  institutionName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  trainingStatusId: string;
  trainingStatusDescription?: string | null;
  result?: string | null;
  certificateName?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  documents?: TrainingDocumentDto[] | null;
  dateCreated?: string | null;
  dateModified?: string | null;
}

/**
 * Voyage Activity DTO (nested in onboarding)
 */
export interface VoyageActivityDto {
  voyageActivityId?: string | null;
  logId?: string | null;
  rn?: string | null;
  seamanBookNo?: string | null;
  vesselName?: string | null;
  imoNumber?: string | null;
  flagState?: string | null;
  operatorCompany?: string | null;
  portOfEngagement?: string | null;
  portOfDischarge?: string | null;
  dateJoined?: string | null;
  dateLeft?: string | null;
  totalSeaTimeDays?: number | null;
  remarks?: string | null;
  documents?: VoyageDocumentDto[] | null;
  dateCreated?: string | null;
  dateModified?: string | null;
  createdOn?: string | null;
}

/**
 * Contact Details DTO (nested in onboarding)
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
 * User Seafarer Onboarding DTO
 * Note: COMPLETE_API_INTEGRATION_GUIDE.md shows simplified field names (id, createdAt, updatedAt)
 * but swagger.json uses full names (userSeafarerOnboardingId, dateCreated, dateModified)
 * This interface supports both formats
 */
export interface UserSeafarerOnboardingDto {
  userSeafarerOnboardingId?: string;
  id?: string; // Alternative field name from COMPLETE_API_INTEGRATION_GUIDE.md
  userId: string;
  role: string;
  roleDescription?: string | null;
  status: string;
  statusDescription?: string | null;
  rn?: string | null;
  sin?: string | null;
  accreditedInstitutionId?: string | null;
  accreditedInstitutionName?: string | null;
  roleSpecificIdentifier?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  employeeId?: string | null;
  approvedDate?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  dateCreated?: string | null;
  createdAt?: string | null; // Alternative field name from COMPLETE_API_INTEGRATION_GUIDE.md
  dateModified?: string | null;
  updatedAt?: string | null; // Alternative field name from COMPLETE_API_INTEGRATION_GUIDE.md
  isActive?: boolean;
  educationDetails?: EducationDetailsDto[] | null;
  contactDetails?: ContactDetailsDto | null;
  institutionDocuments?: any[] | null;
  hasEducationDetails?: boolean;
  hasContactDetails?: boolean;
  hasInstitutionDocuments?: boolean;
  educationDocumentCount?: number;
  institutionDocumentCount?: number;
  seafarerTrainings?: SeafarerTrainingDto[] | null;
  voyageActivities?: VoyageActivityDto[] | null;
  profileDocuments?: ProfileDocumentDto[] | null;
  trainingDocuments?: TrainingDocumentDto[] | null;
  voyageDocuments?: VoyageDocumentDto[] | null;
  hasSeafarerTrainings?: boolean;
  hasVoyageActivities?: boolean;
  hasProfileDocuments?: boolean;
  seafarerTrainingCount?: number;
  voyageActivityCount?: number;
  profileDocumentCount?: number;
  isOnboardingComplete?: boolean;
  hasActiveOnboarding?: boolean;
  canCreateNewOnboarding?: boolean;
  blockingReason?: string | null;
  activeOnboardingRole?: string | null;
  activeOnboardingStatus?: string | null;
}

/**
 * Create onboarding request
 * POST /seafarer/api/v1/Onboarding
 * 
 * ⚠️ IMPORTANT: After creating the onboarding request, you MUST upload required documents
 * that are linked to this onboarding. Use the document upload endpoints from document-service.ts:
 * - uploadEducationDocument() - for education-related documents
 * - uploadProfileDocument() - for profile documents (passport, medical, CoC, etc.)
 * 
 * The onboarding status and approval depend on the completion of document uploads.
 * Documents are directly linked to the onboarding process, not separate entities.
 */
export async function createOnboarding(
  data: CreateOnboardingRequest
): Promise<ApiResponse<UserSeafarerOnboardingDto>> {
  return apiPostMain<UserSeafarerOnboardingDto>(API_BASE, data);
}

/**
 * Get my onboarding status
 * GET /seafarer/api/v1/onboarding/my-onboarding
 * 
 * Returns onboarding status including:
 * - hasEducationDetails: Whether education details have been added
 * - hasContactDetails: Whether contact details have been added
 * - educationDocumentCount: Number of education documents uploaded
 * 
 * Note: The onboarding status reflects the completion of required documents.
 * Admin approval depends on all required documents being uploaded.
 */
export async function getMyOnboarding(): Promise<
  ApiResponse<UserSeafarerOnboardingDto>
> {
  return apiGetMain<UserSeafarerOnboardingDto>(`${API_BASE}/my-onboarding`);
}

/**
 * Get onboarding by ID
 * GET /seafarer/api/v1/onboarding/{id}
 */
export async function getOnboardingById(
  id: string
): Promise<ApiResponse<UserSeafarerOnboardingDto>> {
  return apiGetMain<UserSeafarerOnboardingDto>(`${API_BASE}/${id}`);
}

/**
 * Auto-create onboarding (for seafarers)
 * POST /seafarer/api/v1/onboarding/auto-create
 */
export async function autoCreateOnboarding(): Promise<
  ApiResponse<UserSeafarerOnboardingDto>
> {
  return apiPostMain<UserSeafarerOnboardingDto>(`${API_BASE}/auto-create`, {});
}

/**
 * Get pending onboardings (Admin only)
 * GET /seafarer/api/v1/onboarding/pending
 */
export async function getPendingOnboardings(): Promise<
  ApiResponse<UserSeafarerOnboardingDto[]>
> {
  return apiGetMain<UserSeafarerOnboardingDto[]>(`${API_BASE}/pending`);
}

/**
 * Get all onboardings (Admin only)
 * GET /seafarer/api/v1/onboarding/all
 */
export async function getAllOnboardings(): Promise<
  ApiResponse<UserSeafarerOnboardingDto[]>
> {
  return apiGetMain<UserSeafarerOnboardingDto[]>(`${API_BASE}/all`);
}

/**
 * Update onboarding status (Admin only)
 * PATCH /seafarer/api/v1/onboarding/{id}/status
 */
export async function updateOnboardingStatus(
  id: string,
  data: UpdateOnboardingStatusRequest
): Promise<ApiResponse<UserSeafarerOnboardingDto>> {
  return apiPatchMain<UserSeafarerOnboardingDto>(
    `${API_BASE}/${id}/status`,
    data
  );
}

