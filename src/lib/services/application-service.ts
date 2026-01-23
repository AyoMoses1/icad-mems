/**
 * Application Service - API integration for application operations
 * Based on COMPLETE_API_INTEGRATION_GUIDE.md and swagger.json
 */

import {
  apiGetMain,
  apiPostMain,
  apiPatchMain,
  apiPostMultipartMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/Applications";

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ServiceDto {
  serviceId: string;
  id?: string;
  serviceName?: string | null;
  name?: string | null;
  description?: string | null;
  serviceTypeId?: string | null;
  serviceType?: string | null;
  serviceTypeDescription?: string | null;
  currencyId?: string | null;
  isActive?: boolean;
  requirements?: ServiceRequirementDto[];
}

export interface ServiceRequirementDto {
  serviceRequirementId?: string;
  requirementListId?: string;
  requirementName?: string | null;
  rankId?: string | null;
  rankDescription?: string | null;
  requiredValue?: string | null;
  metricId?: string | null;
  metricDescription?: string | null;
}

export interface ApplicationRequirementDto {
  applicationRequirementId?: string;
  id?: string;
  requirementListId: string;
  requirementName?: string | null;
  requirementDescription?: string | null;
  metricId?: string;
  metricType?: string | null;
  metricDescription?: string | null;
  requiredValue?: string | null;
  actualValue?: string | null;
  isRequired?: boolean;
  isSubmitted?: boolean;
  dateSubmitted?: string | null;
  documentTypesId?: string | null; // Direct FK to document type (V2)
  documentTypeDescription?: string | null; // Document type name (V2)
}

export interface RequirementValueDto {
  requirementListId: string;
  actualValue?: string | null;
}

export interface CreateApplicationRequest {
  serviceId: string;
  remarks?: string | null;
}

export interface SubmitApplicationRequest {
  applicationId: string;
  remarks?: string | null;
  requirementValues?: RequirementValueDto[] | null;
}

export interface ApplicationDto {
  id?: string;
  applicationId?: string;
  rn?: string | null;
  serviceId?: string;
  serviceName?: string | null;
  serviceTypeId?: string | null;
  applicationStatusId?: string;
  applicationStatus?: string | null;
  status?: string | null;
  applicationDate?: string | null;
  remarks?: string | null;
  dateCreated?: string | null;
  createdAt?: string | null;
  requirements?: ApplicationRequirementDto[] | null;
  hasInvoice?: boolean;
  invoiceId?: string | null;
  invoiceStatus?: string | null;
  hasPayment?: boolean;
  paymentRef?: string | null;
  // Alternative field names
  isPaid?: boolean | null;
  submissionDate?: string | null;
  approvalDate?: string | null;
  paymentReference?: string | null;
}

export interface InvoiceLineItem {
  description?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ApplicationInvoiceDto {
  id?: string;
  invoiceId?: string;
  applicationId?: string;
  invoiceNumber?: string | null;
  amount?: number;
  totalAmount?: number;
  currency?: string | null;
  status?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  paymentReference?: string | null;
  dateCreated?: string | null;
  createdAt?: string | null;
  lineItems?: InvoiceLineItem[] | null;
}

export interface ApplicationDashboardDto {
  totalApplications: number;
  draftApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  paymentPendingApplications: number;
  paidApplications: number;
  completedApplications: number;
  recentApplications?: ApplicationHistoryDto[] | null;
  pendingPayments: number;
  pendingDocumentUploads: number;
  pendingRequirementSubmissions: number;
  totalAmountOwed: number;
  totalAmountPaid: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export interface ApplicationHistoryDto {
  application: ApplicationDto;
  requirements?: ApplicationRequirementDto[] | null;
  documents?: unknown[] | null;
  invoices?: unknown[] | null;
  payments?: unknown[] | null;
  statusHistory?: unknown[] | null;
  totalRequirements?: number;
  completedRequirements?: number;
  pendingRequirements?: number;
}

export interface ApplicationHistoryFilters {
  serviceId?: string;
  statusId?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ApplicationFilters {
  pageNumber?: number;
  pageSize?: number;
  applicantId?: number;
  programId?: number;
  statusId?: number;
  searchTerm?: string;
}

export interface PaginatedApplications {
  items: ApplicationDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get available services
 * GET /seafarer/api/v1/Applications/services
 */
export async function getAvailableServices(): Promise<ApiResponse<ServiceDto[]>> {
  return apiGetMain<ServiceDto[]>(`${API_BASE}/services`);
}

/**
 * Get service by ID
 * GET /seafarer/api/v1/Applications/services/{serviceId}
 */
export async function getServiceById(serviceId: string): Promise<ApiResponse<ServiceDto>> {
  return apiGetMain<ServiceDto>(`${API_BASE}/services/${serviceId}`);
}

/**
 * Get service checklist (requirements)
 * GET /seafarer/api/v1/Applications/services/{serviceId}/checklist
 */
export async function getServiceChecklist(
  serviceId: string
): Promise<ApiResponse<ApplicationRequirementDto[]>> {
  return apiGetMain<ApplicationRequirementDto[]>(
    `${API_BASE}/services/${serviceId}/checklist`
  );
}

/**
 * Create application
 * POST /seafarer/api/v1/Applications
 */
export async function createApplication(
  data: CreateApplicationRequest
): Promise<ApiResponse<ApplicationDto>> {
  return apiPostMain<ApplicationDto>(API_BASE, data);
}

/**
 * Submit application with requirement values
 * POST /seafarer/api/v1/Applications/{id}/submit
 */
export async function submitApplication(
  applicationId: string,
  data: SubmitApplicationRequest
): Promise<ApiResponse<ApplicationDto>> {
  return apiPostMain<ApplicationDto>(`${API_BASE}/${applicationId}/submit`, {
    applicationId,
    remarks: data.remarks,
    requirementValues: data.requirementValues,
  });
}

/**
 * Get my applications
 * GET /seafarer/api/v1/Applications/my-applications
 * Note: The base endpoint /seafarer/api/v1/Applications only supports POST, not GET
 */
export async function getMyApplications(): Promise<ApiResponse<ApplicationDto[]>> {
  // Ensure endpoint doesn't have trailing slash - use /my-applications suffix
  const endpoint = `${API_BASE}/my-applications`;
  return apiGetMain<ApplicationDto[]>(endpoint);
}

/**
 * Get application by ID
 * GET /seafarer/api/v1/Applications/{id}
 */
export async function getApplicationById(
  applicationId: string
): Promise<ApiResponse<ApplicationDto>> {
  console.log("applicationId", applicationId);
  return apiGetMain<ApplicationDto>(`${API_BASE}/${applicationId}`);
}

/**
 * Get application dashboard
 * GET /seafarer/api/v1/Applications/dashboard
 */
export async function getApplicationDashboard(): Promise<
  ApiResponse<ApplicationDashboardDto>
> {
  return apiGetMain<ApplicationDashboardDto>(`${API_BASE}/dashboard`);
}

/**
 * Get application history
 * GET /seafarer/api/v1/Applications/{id}/history
 */
export async function getApplicationHistory(
  applicationId: string
): Promise<ApiResponse<ApplicationHistoryDto>> {
  return apiGetMain<ApplicationHistoryDto>(`${API_BASE}/${applicationId}/history`);
}

/**
 * Get applications with history (filtered)
 * GET /seafarer/api/v1/Applications/history
 */
export async function getApplicationsWithHistory(
  filters: ApplicationHistoryFilters = {}
): Promise<ApiResponse<ApplicationHistoryDto[]>> {
  const { pageNumber = 1, pageSize = 10, serviceId, statusId, fromDate, toDate } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (serviceId) params.append("serviceId", serviceId);
  if (statusId) params.append("statusId", statusId);
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);

  return apiGetMain<ApplicationHistoryDto[]>(`${API_BASE}/history?${params.toString()}`);
}

// ============================================================================
// Invoice Functions
// ============================================================================

/**
 * Generate invoice for application
 * POST /seafarer/api/v1/Applications/{id}/invoice
 */
export async function generateApplicationInvoice(
  applicationId: string
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  return apiPostMain<ApplicationInvoiceDto>(`${API_BASE}/${applicationId}/invoice`, {});
}

/**
 * Get invoice for application
 * GET /seafarer/api/v1/Applications/{id}/invoice
 */
export async function getApplicationInvoice(
  applicationId: string
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  return apiGetMain<ApplicationInvoiceDto>(`${API_BASE}/${applicationId}/invoice`);
}

// ============================================================================
// Application Requirements Functions
// ============================================================================

/**
 * Get requirements for an application
 * ⚠️ DEPRECATED: The /seafarer/api/v1/Applications/{id}/requirements endpoint does not exist in swagger.json
 * Use getServiceChecklist() to get requirements before creating an application,
 * or getApplicationById() which may include requirements in the response.
 * 
 * @deprecated Use getServiceChecklist() or getApplicationById() instead
 */
export async function getApplicationRequirements(
  applicationId: string
): Promise<ApiResponse<ApplicationRequirementDto[]>> {
  // Endpoint /seafarer/api/v1/Applications/{id}/requirements does not exist in swagger.json
  // Use getServiceChecklist() or getApplicationById() instead
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/Applications/{id}/requirements does not exist. Use getServiceChecklist() or getApplicationById() instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Fulfill an application requirement
 * ⚠️ DEPRECATED: The /seafarer/api/v1/Applications/{id}/requirements/{requirementId} endpoint does not exist in swagger.json
 * Submit requirement values when calling submitApplication() instead.
 * 
 * @deprecated Submit requirement values when calling submitApplication() instead
 */
export async function fulfillApplicationRequirement(
  applicationId: string,
  requirementId: string,
  fulfillmentData: { documentId?: string; value?: string }
): Promise<ApiResponse<ApplicationRequirementDto>> {
  // Endpoint /seafarer/api/v1/Applications/{id}/requirements/{requirementId} does not exist in swagger.json
  // Submit requirement values when calling submitApplication() instead
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/Applications/{id}/requirements/{requirementId} does not exist. Submit requirement values when calling submitApplication() instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

// ============================================================================
// Certificate Application Flow (swagger.txt / seafarer certificate application)
// ============================================================================

export interface CheckEligibilityRequest {
  applicantId: string;
  targetDocumentMasterId: string;
}

export interface EligibilityResultDto {
  targetDocumentMasterId: string;
  isEligible: boolean;
  requirements?: CertificateRequirementDto[] | null;
}

export interface CertificateRequirementDto {
  id?: string;
  targetDocumentMasterId?: string;
  requiredDocumentMasterId?: string;
  requirementGroupId?: number | null;
  isMandatory?: boolean | null;
}

export interface CreateDraftApplicationRequest {
  applicantId: string;
  targetDocumentMasterId: string;
  remarks?: string | null;
}

export interface AddApplicationAttachmentRequest {
  heldDocumentId: string;
  wasValidAtSubmission?: boolean | null;
}

export interface ApplicationAttachmentDto {
  id?: string;
  applicationId?: string;
  heldDocumentId?: string;
  wasValidAtSubmission?: boolean | null;
}

export interface GenerateInvoiceRequest {
  certificateFeeId: string;
  nationalityType?: string | null;
  processingSpeed?: string | null;
  billingCategory?: string | null;
  dueDate: string;
}

/**
 * Check eligibility for certificate application
 * ⚠️ DEPRECATED: The /api/Applications/check-eligibility endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function checkEligibility(
  data: CheckEligibilityRequest
): Promise<ApiResponse<EligibilityResultDto>> {
  // Endpoint /api/Applications/check-eligibility does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Applications/check-eligibility does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Check eligibility for current user
 * ⚠️ DEPRECATED: The /api/Applications/me/check-eligibility endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function checkEligibilityForCurrentUser(
  data: { targetDocumentMasterId: string }
): Promise<ApiResponse<EligibilityResultDto>> {
  // Endpoint /api/Applications/me/check-eligibility does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Applications/me/check-eligibility does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Create a draft application
 * ⚠️ DEPRECATED: The /api/Applications/draft endpoint does not exist in swagger.json
 * Use createApplication() instead which calls POST /seafarer/api/v1/Applications
 * 
 * @deprecated Use createApplication() instead
 */
export async function createDraftApplication(
  data: CreateDraftApplicationRequest
): Promise<ApiResponse<ApplicationDto>> {
  // Endpoint /api/Applications/draft does not exist in swagger.json
  // Use createApplication() instead
  return {
    success: false,
    error: { message: "Endpoint /api/Applications/draft does not exist. Use createApplication() instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Attach documents to an application
 * ⚠️ DEPRECATED: The /api/Applications/{id}/attach endpoint does not exist in swagger.json
 * Use uploadApplicationDocument() from document-service.ts instead which calls /seafarer/api/v1/documents/applications/{applicationId}/upload
 * 
 * @deprecated Use uploadApplicationDocument() from document-service.ts instead
 */
export async function attachDocumentsToApplication(
  applicationId: string,
  attachments: AddApplicationAttachmentRequest[]
): Promise<ApiResponse<ApplicationAttachmentDto[]>> {
  // Endpoint /api/Applications/{id}/attach does not exist in swagger.json
  // Use uploadApplicationDocument() from document-service.ts instead
  return {
    success: false,
    error: { message: "Endpoint /api/Applications/{id}/attach does not exist. Use uploadApplicationDocument() from document-service.ts instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Generate invoice for an application (with fee details)
 * ⚠️ DEPRECATED: The /api/Applications/{id}/generate-invoice endpoint does not exist in swagger.json
 * Use generateApplicationInvoice() instead which calls POST /seafarer/api/v1/Applications/{id}/invoice
 * 
 * @deprecated Use generateApplicationInvoice() instead
 */
export async function generateApplicationInvoiceWithFee(
  applicationId: string,
  data: GenerateInvoiceRequest
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  // Endpoint /api/Applications/{id}/generate-invoice does not exist in swagger.json
  // Use generateApplicationInvoice() instead
  return {
    success: false,
    error: { message: "Endpoint /api/Applications/{id}/generate-invoice does not exist. Use generateApplicationInvoice() instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

// ============================================================================
// Admin/Officer Functions
// ============================================================================

/**
 * Approve application (Officer/Admin only)
 * ⚠️ DEPRECATED: The /seafarer/api/v1/Applications/{id}/approve endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function approveApplication(
  applicationId: string,
  approvalData?: { comments?: string }
): Promise<ApiResponse<ApplicationDto>> {
  // Endpoint /seafarer/api/v1/Applications/{id}/approve does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/Applications/{id}/approve does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Reject application (Officer/Admin only)
 * ⚠️ DEPRECATED: The /seafarer/api/v1/Applications/{id}/reject endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function rejectApplication(
  applicationId: string,
  rejectionData: { reason?: string; comments?: string }
): Promise<ApiResponse<ApplicationDto>> {
  // Endpoint /seafarer/api/v1/Applications/{id}/reject does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/Applications/{id}/reject does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Get paginated list of applications with optional filtering
 * ⚠️ DEPRECATED: The GET /seafarer/api/v1/Applications endpoint does not exist in swagger.json
 * Only POST /seafarer/api/v1/Applications exists (for creating applications).
 * Use getMyApplications() instead which calls GET /seafarer/api/v1/Applications/my-applications
 * or getApplicationsWithHistory() which calls GET /seafarer/api/v1/Applications/history
 * 
 * @deprecated Use getMyApplications() or getApplicationsWithHistory() instead
 */
export async function getApplications(
  filters: ApplicationFilters = {}
): Promise<ApiResponse<PaginatedApplications>> {
  // Endpoint GET /seafarer/api/v1/Applications does not exist in swagger.json
  // Only POST exists. Use getMyApplications() or getApplicationsWithHistory() instead
  return {
    success: false,
    error: { message: "GET /seafarer/api/v1/Applications does not exist. Use getMyApplications() or getApplicationsWithHistory() instead.", code: "ENDPOINT_NOT_FOUND" },
    data: {
      items: [],
      totalCount: 0,
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 20,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}