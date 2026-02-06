/**
 * Comprehensive Onboarding Service - Single transaction onboarding API
 * Based on FRONTEND_INTEGRATION_GUIDE.md
 */

import { apiPostMultipartMain, type ApiResponse } from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1";

// ============================================================================
// Request Types
// ============================================================================

export interface ContactDetailsRequest {
  phone: string;
  email: string;
  address: string;
  emergencyContactPerson?: string;
  relationship?: string;
  emergencyContactNumber?: string;
  emergencyContactAddress?: string;
}

export interface EducationDetailsRequest {
  index: number;
  institution: string;
  certificateObtained: string;
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
}

export interface SeafarerTrainingRequest {
  institutionSTCWAccreditationId: string; // GUID
  startDate: string;
  endDate: string;
  trainingStatusId: string; // GUID - Training status (In Progress, Completed, etc.)
  result: string;
  certificateName: string;
  issueDate: string;
  expiryDate: string;
}

export interface VoyageActivityRequest {
  index: number;
  seamanBookNo: string;
  vesselName: string;
  imoNumber: string;
  flagState: string;
  operatorCompany: string;
  portOfEngagement: string;
  portOfDischarge: string;
  dateJoined: string;
  dateLeft: string;
  totalSeaTimeDays: string;
  remarks?: string;
}

export interface ProfileDocumentRequest {
  documentTypesId: string; // GUID
  documentNumber: string;
  issueDate: string; // ISO 8601 date
  expiryDate: string; // ISO 8601 date
  issuingAuthority: string;
}

export interface EducationDocumentRequest {
  educationIndex: number; // Must match EducationDetails[x].Index
  documentTypesId: string; // GUID
  documentNumber?: string;
  issueDate?: string; // ISO 8601 date
  expiryDate?: string;
  issuingAuthority?: string;
}

export interface VoyageDocumentRequest {
  voyageActivityIndex: number; // Must match VoyageActivities[x].Index
  documentTypesId: string; // GUID
  documentNumber?: string;
  issueDate?: string; // ISO 8601 date
  expiryDate?: string;
  issuingAuthority?: string;
}

export interface InstitutionDocumentRequest {
  documentTypesId: string; // GUID
  documentNumber: string;
  issueDate: string; // ISO 8601 date
  expiryDate?: string; // ISO 8601 date
  issuingAuthority: string;
}

export interface ComprehensiveOnboardingRequest {
  // Common fields - Role is REQUIRED
  role: "SEAFARER" | "TRAINING_INSTITUTION" | "AGENT"; // Required: determines which nested data is required/allowed
  workspaceRoleId?: string; // UUID - workspace (domain) role id from IMS, required for comprehensive payload
  saveAsDraft?: boolean; // true = DRAFT, false/undefined = PENDING
  notes?: string;
  contactDetails: ContactDetailsRequest;

  // SEAFARER specific fields
  sin?: string; // Seafarer Identification Number (for SEAFARER)
  rankId?: string; // Rank ID for seafarer
  educationDetails?: EducationDetailsRequest[];
  seafarerTrainings?: SeafarerTrainingRequest[];
  voyageActivities?: VoyageActivityRequest[];
  profileDocuments?: Array<ProfileDocumentRequest & { file: File }>;
  educationDocuments?: Array<EducationDocumentRequest & { file: File }>;
  voyageDocuments?: Array<VoyageDocumentRequest & { file: File }>;

  // TRAINING_INSTITUTION and AGENT specific fields
  accreditedInstitutionId?: string; // Required for TRAINING_INSTITUTION and AGENT
  roleSpecificIdentifier?: string; // Institution/Agent registration number
  department?: string;
  jobTitle?: string;
  employeeId?: string; // Optional for AGENT
  institutionDocuments?: Array<InstitutionDocumentRequest & { file: File }>;
}

// ============================================================================
// Response Types
// ============================================================================

export interface OnboardingDto {
  userSeafarerOnboardingId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  rn: string;
  sin?: string;
  role: string;
  status: string;
  notes?: string;
  dateCreated: string;
  approvedDate?: string | null;
  approvedBy?: string | null;
  // For TRAINING_INSTITUTION and AGENT
  accreditedInstitutionId?: string;
  roleSpecificIdentifier?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
}

export interface ContactDetailsDto {
  contactDetailsId: string;
  rn: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactPerson?: string;
  relationship?: string;
  emergencyContactNumber?: string;
  emergencyContactAddress?: string;
}

export interface EducationDetailsDto {
  educationId: string;
  rn: string;
  institution: string;
  certificateObtained: string;
  startDate: string;
  endDate: string;
  documents: DocumentDto[];
}

export interface SeafarerTrainingDto {
  recordId: string;
  rn: string;
  institutionSTCWAccreditationId: string;
  certificateName: string;
  startDate: string;
  endDate: string;
  result: string;
  issueDate: string;
  expiryDate: string;
}

export interface VoyageActivityDto {
  logId: string;
  rn: string;
  seamanBookNo: string;
  vesselName: string;
  imoNumber: string;
  flagState: string;
  operatorCompany: string;
  portOfEngagement: string;
  portOfDischarge: string;
  dateJoined: string;
  dateLeft: string;
  totalSeaTimeDays: number;
  remarks?: string;
}

export interface DocumentDto {
  documentId: string;
  filePathOrUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface EducationDocumentDto {
  educationId: string;
  educationIndex: number;
  document: DocumentDto;
}

export interface VoyageDocumentDto {
  voyageActivityLogId: string;
  voyageActivityIndex: number;
  document: DocumentDto;
}

export interface OnboardingSummary {
  onboardingCreated: boolean;
  contactDetailsCreated: boolean;
  educationRecordsCreated: number;
  trainingRecordsCreated: number;
  voyageActivitiesCreated: number;
  profileDocumentsUploaded: number;
  educationDocumentsUploaded: number;
  voyageDocumentsUploaded: number;
  institutionDocumentsUploaded: number;
  isDraft: boolean;
  message: string;
  warnings: string[];
}

export interface ComprehensiveOnboardingResponse {
  onboarding: OnboardingDto;
  contactDetails?: ContactDetailsDto;
  educationDetails?: EducationDetailsDto[];
  seafarerTrainings?: SeafarerTrainingDto[];
  voyageActivities?: VoyageActivityDto[];
  profileDocuments?: DocumentDto[];
  educationDocuments?: EducationDocumentDto[];
  voyageDocuments?: VoyageDocumentDto[];
  institutionDocuments?: DocumentDto[];
  summary: OnboardingSummary;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Submit comprehensive onboarding with all related information
 * POST /api/seafarer/onboarding/comprehensive
 */
export async function submitComprehensiveOnboarding(
  data: ComprehensiveOnboardingRequest
): Promise<ApiResponse<ComprehensiveOnboardingResponse>> {
  const formData = new FormData();

  // Add Role field (REQUIRED) - must be one of SEAFARER, TRAINING_INSTITUTION, or AGENT
  formData.append("Role", data.role);

  // Add workspace role id (from IMS domain roles for this workspace)
  if (data.workspaceRoleId) {
    formData.append("WorkspaceRoleId", data.workspaceRoleId);
  }

  // Add optional draft flag
  if (data.saveAsDraft !== undefined) {
    formData.append("SaveAsDraft", data.saveAsDraft.toString());
  }

  // Add optional notes
  if (data.notes) {
    formData.append("Notes", data.notes);
  }

  // Add SEAFARER specific fields
  if (data.sin) {
    formData.append("SIN", data.sin);
  }
  if (data.rankId) {
    formData.append("RankId", data.rankId);
  }

  // Add TRAINING_INSTITUTION and AGENT specific fields
  if (data.accreditedInstitutionId) {
    formData.append("AccreditedInstitutionId", data.accreditedInstitutionId);
  }
  if (data.roleSpecificIdentifier) {
    formData.append("RoleSpecificIdentifier", data.roleSpecificIdentifier);
  }
  if (data.department) {
    formData.append("Department", data.department);
  }
  if (data.jobTitle) {
    formData.append("JobTitle", data.jobTitle);
  }
  if (data.employeeId) {
    formData.append("EmployeeId", data.employeeId);
  }

  // Add contact details (required)
  formData.append("ContactDetails.Phone", data.contactDetails.phone);
  formData.append("ContactDetails.Email", data.contactDetails.email);
  formData.append("ContactDetails.Address", data.contactDetails.address);
  if (data.contactDetails.emergencyContactPerson) {
    formData.append(
      "ContactDetails.EmergencyContactPerson",
      data.contactDetails.emergencyContactPerson
    );
  }
  if (data.contactDetails.relationship) {
    formData.append(
      "ContactDetails.Relationship",
      data.contactDetails.relationship
    );
  }
  if (data.contactDetails.emergencyContactNumber) {
    formData.append(
      "ContactDetails.EmergencyContactNumber",
      data.contactDetails.emergencyContactNumber
    );
  }
  if (data.contactDetails.emergencyContactAddress) {
    formData.append(
      "ContactDetails.EmergencyContactAddress",
      data.contactDetails.emergencyContactAddress
    );
  }

  // Add education details (optional)
  if (data.educationDetails && data.educationDetails.length > 0) {
    data.educationDetails.forEach((edu, index) => {
      formData.append(`EducationDetails[${index}].Index`, edu.index.toString());
      formData.append(
        `EducationDetails[${index}].Institution`,
        edu.institution
      );
      formData.append(
        `EducationDetails[${index}].CertificateObtained`,
        edu.certificateObtained
      );
      formData.append(`EducationDetails[${index}].StartDate`, edu.startDate);
      formData.append(`EducationDetails[${index}].EndDate`, edu.endDate);
    });
  }

  // Add seafarer trainings (optional, SEAFARER only)
  if (data.seafarerTrainings && data.seafarerTrainings.length > 0) {
    data.seafarerTrainings.forEach((training, index) => {
      formData.append(
        `SeafarerTrainings[${index}].InstitutionSTCWAccreditationId`,
        training.institutionSTCWAccreditationId
      );
      formData.append(
        `SeafarerTrainings[${index}].StartDate`,
        training.startDate
      );
      formData.append(`SeafarerTrainings[${index}].EndDate`, training.endDate);
      formData.append(`SeafarerTrainings[${index}].Result`, training.result);
      formData.append(
        `SeafarerTrainings[${index}].CertificateName`,
        training.certificateName
      );
      formData.append(
        `SeafarerTrainings[${index}].IssueDate`,
        training.issueDate
      );
      formData.append(
        `SeafarerTrainings[${index}].ExpiryDate`,
        training.expiryDate
      );
      if (training.trainingStatusId) {
        formData.append(
          `SeafarerTrainings[${index}].TrainingStatusId`,
          training.trainingStatusId
        );
      }
    });
  }

  // Add voyage activities (optional, SEAFARER only)
  if (data.voyageActivities && data.voyageActivities.length > 0) {
    data.voyageActivities.forEach((voyage, index) => {
      formData.append(
        `VoyageActivities[${index}].Index`,
        voyage.index.toString()
      );
      formData.append(
        `VoyageActivities[${index}].SeamanBookNo`,
        voyage.seamanBookNo
      );
      formData.append(
        `VoyageActivities[${index}].VesselName`,
        voyage.vesselName
      );
      formData.append(`VoyageActivities[${index}].IMONumber`, voyage.imoNumber);
      formData.append(`VoyageActivities[${index}].FlagState`, voyage.flagState);
      formData.append(
        `VoyageActivities[${index}].OperatorCompany`,
        voyage.operatorCompany
      );
      formData.append(
        `VoyageActivities[${index}].PortOfEngagement`,
        voyage.portOfEngagement
      );
      formData.append(
        `VoyageActivities[${index}].PortOfDischarge`,
        voyage.portOfDischarge
      );
      formData.append(
        `VoyageActivities[${index}].DateJoined`,
        voyage.dateJoined
      );
      formData.append(`VoyageActivities[${index}].DateLeft`, voyage.dateLeft);
      formData.append(
        `VoyageActivities[${index}].TotalSeaTimeDays`,
        voyage.totalSeaTimeDays
      );
      if (voyage.remarks) {
        formData.append(`VoyageActivities[${index}].Remarks`, voyage.remarks);
      }
    });
  }

  // Add profile documents (for SEAFARER, required - minimum 1)
  if (data.profileDocuments && data.profileDocuments.length > 0) {
    data.profileDocuments.forEach((doc, index) => {
      formData.append(
        `ProfileDocuments[${index}].DocumentTypesId`,
        doc.documentTypesId
      );
      formData.append(
        `ProfileDocuments[${index}].DocumentNumber`,
        doc.documentNumber
      );
      formData.append(`ProfileDocuments[${index}].IssueDate`, doc.issueDate);
      formData.append(`ProfileDocuments[${index}].ExpiryDate`, doc.expiryDate);
      formData.append(
        `ProfileDocuments[${index}].IssuingAuthority`,
        doc.issuingAuthority
      );
      formData.append(`ProfileDocuments[${index}].File`, doc.file);
    });
  }

  // Add education documents (optional, SEAFARER only)
  if (data.educationDocuments && data.educationDocuments.length > 0) {
    data.educationDocuments.forEach((doc, index) => {
      formData.append(
        `EducationDocuments[${index}].EducationIndex`,
        doc.educationIndex.toString()
      );
      formData.append(
        `EducationDocuments[${index}].DocumentTypesId`,
        doc.documentTypesId
      );
      formData.append(`EducationDocuments[${index}].File`, doc.file);
      if (doc.documentNumber) {
        formData.append(
          `EducationDocuments[${index}].DocumentNumber`,
          doc.documentNumber
        );
      }
      if (doc.issueDate) {
        formData.append(
          `EducationDocuments[${index}].IssueDate`,
          doc.issueDate
        );
      }
      if (doc.expiryDate) {
        formData.append(
          `EducationDocuments[${index}].ExpiryDate`,
          doc.expiryDate
        );
      }
      if (doc.issuingAuthority) {
        formData.append(
          `EducationDocuments[${index}].IssuingAuthority`,
          doc.issuingAuthority
        );
      }
    });
  }

  // Add voyage documents (optional, SEAFARER only)
  if (data.voyageDocuments && data.voyageDocuments.length > 0) {
    data.voyageDocuments.forEach((doc, index) => {
      formData.append(
        `VoyageDocuments[${index}].VoyageActivityIndex`,
        doc.voyageActivityIndex.toString()
      );
      formData.append(
        `VoyageDocuments[${index}].DocumentTypesId`,
        doc.documentTypesId
      );
      formData.append(`VoyageDocuments[${index}].File`, doc.file);
      if (doc.documentNumber) {
        formData.append(
          `VoyageDocuments[${index}].DocumentNumber`,
          doc.documentNumber
        );
      }
      if (doc.issueDate) {
        formData.append(`VoyageDocuments[${index}].IssueDate`, doc.issueDate);
      }
      if (doc.expiryDate) {
        formData.append(`VoyageDocuments[${index}].ExpiryDate`, doc.expiryDate);
      }
      if (doc.issuingAuthority) {
        formData.append(
          `VoyageDocuments[${index}].IssuingAuthority`,
          doc.issuingAuthority
        );
      }
    });
  }

  // Add institution documents (for TRAINING_INSTITUTION and AGENT, required - minimum 1)
  if (data.institutionDocuments && data.institutionDocuments.length > 0) {
    data.institutionDocuments.forEach((doc, index) => {
      formData.append(
        `InstitutionDocuments[${index}].DocumentTypesId`,
        doc.documentTypesId
      );
      formData.append(
        `InstitutionDocuments[${index}].DocumentNumber`,
        doc.documentNumber
      );
      formData.append(
        `InstitutionDocuments[${index}].IssueDate`,
        doc.issueDate
      );
      formData.append(
        `InstitutionDocuments[${index}].IssuingAuthority`,
        doc.issuingAuthority
      );
      formData.append(`InstitutionDocuments[${index}].File`, doc.file);
      if (doc.expiryDate) {
        formData.append(
          `InstitutionDocuments[${index}].ExpiryDate`,
          doc.expiryDate
        );
      }
    });
  }

  return apiPostMultipartMain<ComprehensiveOnboardingResponse>(
    `${API_BASE}/Onboarding/comprehensive`,
    formData
  );
}
