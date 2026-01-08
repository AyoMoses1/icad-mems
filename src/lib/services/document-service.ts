/**
 * Document Service - Corrected API integration based on swagger.json and FRONTEND_INTEGRATION_GUIDE.md
 * Base URL: /seafarer/api/v1/documents
 * 
 * ⚠️ IMPORTANT: Documents are DIRECTLY LINKED to the onboarding process.
 * For Seafarers, Training Institutions, and Agents, all required documents must be uploaded
 * as part of the onboarding workflow. Documents are not separate entities but are tied to
 * the onboarding record. The onboarding status and approval depend on the completion of
 * document uploads.
 * 
 * Workflow:
 * 1. Create onboarding request (see onboarding-service.ts)
 * 2. Upload required documents using the endpoints below
 * 3. Documents are automatically linked to the onboarding record
 * 4. Admin reviews onboarding with all linked documents
 */

import {
  apiGetMain,
  apiPostMultipartMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/documents";

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
 * Document Upload DTO (response from upload)
 */
export interface DocumentUploadDto {
  documentId: string;
  filePathOrUrl?: string | null;
  fileName?: string | null;
  fileSize: number;
  contentType?: string | null;
}

/**
 * Upload Education Document Request
 * Note: This uses multipart/form-data
 * 
 * ⚠️ IMPORTANT: Education documents are linked to the onboarding process.
 * Upload these documents after creating the onboarding request.
 */
export interface UploadEducationDocumentRequest {
  file: File;
  documentTypesId: string;
  documentNumber?: string;
  issueDate?: string; // ISO date format (YYYY-MM-DD)
  expiryDate?: string; // ISO date format (YYYY-MM-DD)
  issuingAuthority?: string;
}

// ============================================================================
// EDUCATION DOCUMENT ENDPOINTS
// ============================================================================

/**
 * Upload education document
 * POST /seafarer/api/v1/documents/education/{educationId}/upload
 * Content-Type: multipart/form-data
 * 
 * Form fields:
 * - File (required): The document file
 * - DocumentTypesId (required): Document type ID
 * - DocumentNumber (optional): Document number
 * - IssueDate (optional): Issue date (ISO format)
 * - ExpiryDate (optional): Expiry date (ISO format)
 * - IssuingAuthority (optional): Issuing authority
 */
export async function uploadEducationDocument(
  educationId: string,
  request: UploadEducationDocumentRequest
): Promise<ApiResponse<DocumentUploadDto>> {
  const formData = new FormData();
  
  // Required fields
  formData.append("File", request.file);
  formData.append("DocumentTypesId", request.documentTypesId);
  
  // Optional fields
  if (request.documentNumber) {
    formData.append("DocumentNumber", request.documentNumber);
  }
  if (request.issueDate) {
    formData.append("IssueDate", request.issueDate);
  }
  if (request.expiryDate) {
    formData.append("ExpiryDate", request.expiryDate);
  }
  if (request.issuingAuthority) {
    formData.append("IssuingAuthority", request.issuingAuthority);
  }

  return apiPostMultipartMain<DocumentUploadDto>(
    `${API_BASE}/education/${educationId}/upload`,
    formData
  );
}

/**
 * Get education documents
 * GET /seafarer/api/v1/documents/education/{educationId}
 */
export async function getEducationDocuments(
  educationId: string
): Promise<ApiResponse<EducationDocumentDto[]>> {
  return apiGetMain<EducationDocumentDto[]>(
    `${API_BASE}/education/${educationId}`
  );
}

/**
 * Delete education document
 * DELETE /seafarer/api/v1/documents/education/{documentId}
 */
export async function deleteEducationDocument(
  documentId: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(`${API_BASE}/education/${documentId}`);
}

// ============================================================================
// PROFILE DOCUMENT ENDPOINTS
// ============================================================================

/**
 * Upload Profile Document Request
 * 
 * ⚠️ IMPORTANT: Profile documents (passport, medical, CoC, etc.) are linked to the onboarding process.
 * Upload these documents after creating the onboarding request. The RN (Registration Number) is required
 * for profile documents - use the RN from the onboarding record (may be "PENDING-{userId}" until approved).
 */
export interface UploadProfileDocumentRequest {
  file: File;
  rn: string; // Registration Number (required for profile documents)
  documentTypesId: string;
  documentNumber?: string;
  issueDate?: string; // ISO date format (YYYY-MM-DD)
  expiryDate?: string; // ISO date format (YYYY-MM-DD)
  issuingAuthority?: string;
}

/**
 * Upload profile document
 * POST /seafarer/api/v1/documents/profile/upload
 */
export async function uploadProfileDocument(
  request: UploadProfileDocumentRequest
): Promise<ApiResponse<DocumentUploadDto>> {
  const formData = new FormData();
  
  formData.append("File", request.file);
  formData.append("RN", request.rn);
  formData.append("DocumentTypesId", request.documentTypesId);
  
  if (request.documentNumber) {
    formData.append("DocumentNumber", request.documentNumber);
  }
  if (request.issueDate) {
    formData.append("IssueDate", request.issueDate);
  }
  if (request.expiryDate) {
    formData.append("ExpiryDate", request.expiryDate);
  }
  if (request.issuingAuthority) {
    formData.append("IssuingAuthority", request.issuingAuthority);
  }

  return apiPostMultipartMain<DocumentUploadDto>(
    `${API_BASE}/profile/upload`,
    formData
  );
}

/**
 * Get profile documents
 * GET /seafarer/api/v1/documents/profile/{rn}
 */
export async function getProfileDocuments(
  rn: string
): Promise<ApiResponse<EducationDocumentDto[]>> {
  return apiGetMain<EducationDocumentDto[]>(`${API_BASE}/profile/${rn}`);
}

/**
 * Delete profile document
 * DELETE /seafarer/api/v1/documents/profile/{documentId}
 */
export async function deleteProfileDocument(
  documentId: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(`${API_BASE}/profile/${documentId}`);
}

// ============================================================================
// INSTITUTION DOCUMENT ENDPOINTS
// ============================================================================

/**
 * Upload Institution Document Request
 */
export interface UploadInstitutionDocumentRequest {
  file: File;
  documentTypesId: string;
  documentNumber?: string;
  issueDate?: string; // ISO date format (YYYY-MM-DD)
  expiryDate?: string; // ISO date format (YYYY-MM-DD)
  issuingAuthority?: string;
}

/**
 * Upload institution document
 * POST /seafarer/api/v1/documents/institutions/{institutionId}/upload
 */
export async function uploadInstitutionDocument(
  institutionId: string,
  request: UploadInstitutionDocumentRequest
): Promise<ApiResponse<DocumentUploadDto>> {
  const formData = new FormData();
  
  formData.append("File", request.file);
  formData.append("DocumentTypesId", request.documentTypesId);
  
  if (request.documentNumber) {
    formData.append("DocumentNumber", request.documentNumber);
  }
  if (request.issueDate) {
    formData.append("IssueDate", request.issueDate);
  }
  if (request.expiryDate) {
    formData.append("ExpiryDate", request.expiryDate);
  }
  if (request.issuingAuthority) {
    formData.append("IssuingAuthority", request.issuingAuthority);
  }

  return apiPostMultipartMain<DocumentUploadDto>(
    `${API_BASE}/institutions/${institutionId}/upload`,
    formData
  );
}

/**
 * Get institution documents
 * GET /seafarer/api/v1/documents/institutions/{institutionId}
 */
export async function getInstitutionDocuments(
  institutionId: string
): Promise<ApiResponse<EducationDocumentDto[]>> {
  return apiGetMain<EducationDocumentDto[]>(
    `${API_BASE}/institutions/${institutionId}`
  );
}

/**
 * Delete institution document
 * DELETE /seafarer/api/v1/documents/institutions/{documentId}
 */
export async function deleteInstitutionDocument(
  documentId: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(`${API_BASE}/institutions/${documentId}`);
}

// ============================================================================
// USER DOCUMENT ENDPOINTS (General convenience wrappers)
// ============================================================================

/**
 * Document DTO for general user documents
 */
export interface DocumentDto {
  id: string;
  documentId?: string;
  documentTypeId?: string;
  documentTypeName?: string | null;
  documentTypeDescription?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  filePathOrUrl?: string | null;
  fileName?: string | null;
  fileSize?: number;
  contentType?: string | null;
  dateCreated?: string | null;
}

/**
 * Upload User Document Request (generic)
 */
export interface UploadUserDocumentRequest {
  file: File;
  documentTypesId: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  rn?: string; // Registration Number (if known)
}

/**
 * Upload user document (uses profile upload endpoint)
 * This is a convenience wrapper for profile document upload
 */
export async function uploadUserDocument(
  request: UploadUserDocumentRequest
): Promise<ApiResponse<DocumentUploadDto>> {
  const formData = new FormData();
  
  formData.append("File", request.file);
  formData.append("DocumentTypesId", request.documentTypesId);
  
  // Use RN if provided, otherwise use a placeholder
  if (request.rn) {
    formData.append("RN", request.rn);
  }
  
  if (request.documentNumber) {
    formData.append("DocumentNumber", request.documentNumber);
  }
  if (request.issueDate) {
    formData.append("IssueDate", request.issueDate);
  }
  if (request.expiryDate) {
    formData.append("ExpiryDate", request.expiryDate);
  }
  if (request.issuingAuthority) {
    formData.append("IssuingAuthority", request.issuingAuthority);
  }

  return apiPostMultipartMain<DocumentUploadDto>(
    `${API_BASE}/profile/upload`,
    formData
  );
}

/**
 * Get user's documents (uses profile documents endpoint)
 * This is a convenience wrapper for getting profile documents
 * @param rn - Registration Number
 */
export async function getUserDocuments(
  rn?: string
): Promise<ApiResponse<DocumentDto[]>> {
  if (!rn) {
    // Return empty if no RN provided
    return { success: true, data: [] };
  }
  return apiGetMain<DocumentDto[]>(`${API_BASE}/profile/${rn}`);
}

// ============================================================================
// APPLICATION DOCUMENT ENDPOINTS
// ============================================================================

/**
 * Upload application document
 * POST /seafarer/api/v1/documents/applications/{applicationId}/upload
 * Note: Similar structure to education document upload
 */
export async function uploadApplicationDocument(
  applicationId: string,
  request: UploadEducationDocumentRequest
): Promise<ApiResponse<DocumentUploadDto>> {
  const formData = new FormData();
  
  formData.append("File", request.file);
  formData.append("DocumentTypesId", request.documentTypesId);
  
  if (request.documentNumber) {
    formData.append("DocumentNumber", request.documentNumber);
  }
  if (request.issueDate) {
    formData.append("IssueDate", request.issueDate);
  }
  if (request.expiryDate) {
    formData.append("ExpiryDate", request.expiryDate);
  }
  if (request.issuingAuthority) {
    formData.append("IssuingAuthority", request.issuingAuthority);
  }

  return apiPostMultipartMain<DocumentUploadDto>(
    `${API_BASE}/applications/${applicationId}/upload`,
    formData
  );
}
