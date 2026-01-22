/**
 * Services Index - Export API services
 * 
 * Note: Import directly from specific service files when you need access to types
 * or when there are name conflicts.
 */

// Core services - export all (functions only, no types that could conflict)
export * from "./payment-service";
export * from "./invoice-service";
export * from "./program-service";
export * from "./course-service";
export * from "./enrollment-service";
export * from "./user-service";
export * from "./applicant-service";
export * from "./requirement-service";
export * from "./profile-service";
export * from "./statistics-service";
export * from "./inspection-service";
export * from "./deficiency-service";
export * from "./audit-service";
export * from "./lookup-service";
// comprehensive-onboarding-service exports are handled via explicit exports below to avoid type conflicts
// export * from "./comprehensive-onboarding-service";
// Seafarers - specific exports
export {
  createSeafarer,
  getSeafarers,
  getMySeafarerOnboardingStatus,
  getMySeafarer,
  getMySeafarerDocuments,
  type SeafarerDto,
  type CreateSeafarerRequest,
  type SeafarerOnboardingStatus,
  type SeafarerHeldDocumentDto,
} from "./seafarers";

// Ranks - specific exports to avoid PagedResult conflict
export {
  getRanks,
  getRankById,
} from "./ranks";

// Application service functions
export {
  getAvailableServices,
  getServiceById,
  getServiceChecklist,
  createApplication,
  submitApplication,
  getMyApplications,
  getApplicationById,
  getApplicationDashboard,
  getApplicationHistory,
  getApplicationsWithHistory,
  generateApplicationInvoice,
  getApplicationInvoice,
  getApplicationRequirements,
  fulfillApplicationRequirement,
  approveApplication,
  rejectApplication,
  getApplications,
  checkEligibility,
  checkEligibilityForCurrentUser,
  createDraftApplication,
  attachDocumentsToApplication,
  generateApplicationInvoiceWithFee,
} from "./application-service";

// Accreditation service functions
export {
  getAccreditationRequirements,
  checkAccreditationStatus,
  applyForAccreditation,
  uploadAccreditationEvidence,
  finalizeAccreditation,
  generateAccreditationInvoice,
  getAccreditationInvoice,
  verifyAccreditationPayment,
  getAccreditationDetails,
  getAllAccreditations,
  getStcwStandards,
  addStcwAccreditation,
  getInstitutionStcwAccreditations,
  updateStcwAccreditationStatus,
  getAccreditedInstitutions,
  getAccreditationRequests,
  updateInstitutionAccreditationStatus,
} from "./accreditation-service";

// Organization service - specific exports
export {
  getOrganizations,
  getOrganizationById,
  getOrganizationAccreditations,
} from "./organization-service";

// Service service
export {
  getServices,
  getServiceRequirements,
} from "./service-service";

// Service Management API (Admin-only mutations)
export {
  serviceManagementApi,
  servicesApi,
  requirementListsApi,
} from "./service-management-api";

// Document service functions
export {
  uploadEducationDocument,
  getEducationDocuments,
  deleteEducationDocument,
  uploadProfileDocument,
  getProfileDocuments,
  deleteProfileDocument,
  uploadInstitutionDocument,
  getInstitutionDocuments,
  deleteInstitutionDocument,
  uploadUserDocument,
  getUserDocuments,
  uploadApplicationDocument,
} from "./document-service";

// Institution onboarding functions
export {
  addTrainingInstitutionStaff,
  addMedicalInstitutionStaff,
} from "./institution-onboarding-service";

// Seafarer onboarding
export * from "./seafarer-onboarding-service";

// Medical institutes
export {
  getMedicalInstitutes,
  getMedicalInstituteById,
} from "./medical-institutes-service";

// Institutions - specific exports
export {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "./institutions";

// Medical service - specific exports
export {
  getMedicalAppointments,
  getMedicalAppointmentById,
  createMedicalAppointment,
  updateMedicalAppointment,
  cancelMedicalAppointment,
  getMedicalServices,
  getMedicalServiceById,
  createMedicalService,
  updateMedicalService,
  deleteMedicalService,
} from "./medical-service";

// Certificates service - specific exports
export {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificateRequirements,
  getCertificateFees,
} from "./certificates-service";

// Vessels service - specific exports
export {
  getVessels,
  getVesselById,
  createVessel,
  updateVessel,
  deleteVessel,
} from "./vessels-service";

// Previous certificates - specific exports
export {
  getPreviousCertificates,
  getPreviousCertificateById,
} from "./previous-certificates-service";

// Cohorts service - specific exports
export {
  getCohorts,
  getCohortById,
  createCohort,
  updateCohort,
  deleteCohort,
} from "./cohorts-service";

// Maritime departments - specific exports
export {
  getMaritimeDepartments,
} from "./maritime-departments-service";

// Documents master - specific exports
export {
  getDocumentMasters,
  getDocumentMasterById,
} from "./documents-master-service";

// Onboarding service - specific exports
export {
  createOnboarding,
  getOnboardingById,
  updateOnboardingStatus,
  getMyOnboarding,
} from "./onboarding-service";

// Onboarding requirements
export * from "./onboarding-requirements-service";

// Admin review - specific exports using renamed exports
export {
  getPendingApplications,
} from "./admin-review-service";
