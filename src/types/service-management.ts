/**
 * Service Management Types
 * Based on frontend-service-management-guide.md
 */

// ============================================================================
// Service DTOs (from API)
// ============================================================================

export interface ServiceDto {
  serviceId: string;
  serviceName: string;
  description?: string;
  serviceTypeId: string;
  serviceTypeDescription: string;
  isActive: boolean;
  requirements: ServiceRequirementDto[];
}

export interface ServiceRequirementDto {
  serviceRequirementId: string;
  requirementListId: string;
  requirementName: string;
  rankId: string;
  rankDescription: string;
  requiredValue: string;
  metricId: string;
  metricDescription: string;
  // Legacy – single document type
  documentTypesId?: string | null;
  documentTypeDescription?: string | null;
  // New – multiple document types
  documentTypeIds?: string[] | null;
  documentTypes?: DocumentTypeDto[] | null;
}

// ============================================================================
// Request DTOs
// ============================================================================

export interface CreateServiceRequest {
  serviceTypeId: string;
  currencyId: string;
  description?: string | null;
  requirements?: CreateServiceRequirementRequest[];
}

export interface UpdateServiceRequest {
  description?: string | null;
  serviceTypeId: string;
  currencyId: string;
  isActive: boolean;
}

export interface CreateServiceRequirementRequest {
  serviceId: string; // Will be set from route parameter
  requirementListId: string;
  rankId: string;
  requiredValue: string;
}

export interface UpdateServiceRequirementRequest {
  requirementListId: string;
  rankId: string;
  requiredValue: string;
}

/** Document type (for requirement lists). Reusable; matches API DocumentTypeDto. */
export interface DocumentTypeDto {
  documentTypesId: string;
  description: string;
  code?: string | null;
  isActive?: boolean;
}

export interface RequirementListDto {
  requirementListId: string; // UUID
  description: string;
  metricId: string; // UUID
  metricDescription: string; // e.g., "File/Document", "Text", "Date", "Yes/No"
  documentTypesId?: string | null; // backward compatibility (single)
  documentTypeDescription?: string | null;
  documentTypeIds?: string[] | null;
  documentTypes?: DocumentTypeDto[] | null;
  isActive: boolean;
}

export interface CreateRequirementListRequest {
  description: string;
  metricId: string; // UUID - the metric type
  documentTypesId?: string | null; // backward compatibility
  documentTypeIds?: string[] | null; // preferred for multiple document types
  isActive?: boolean; // Defaults to true
}

export interface UpdateRequirementListRequest {
  description: string;
  metricId: string; // UUID
  documentTypesId?: string | null; // backward compatibility
  documentTypeIds?: string[] | null; // preferred for multiple document types
  isActive: boolean;
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

// ============================================================================
// Error Codes
// ============================================================================

export enum ServiceManagementErrorCode {
  UNAUTHENTICATED_USER = "UNAUTHENTICATED_USER",
  SERVICE_NOT_FOUND = "SERVICE_NOT_FOUND",
  SERVICE_TYPE_NOT_FOUND = "SERVICE_TYPE_NOT_FOUND",
  CURRENCY_NOT_FOUND = "CURRENCY_NOT_FOUND",
  DUPLICATE_SERVICE = "DUPLICATE_SERVICE",
  SERVICE_HAS_APPLICATIONS = "SERVICE_HAS_APPLICATIONS",
  REQUIREMENT_LIST_NOT_FOUND = "REQUIREMENT_LIST_NOT_FOUND",
  RANK_NOT_FOUND = "RANK_NOT_FOUND",
  DOCUMENT_TYPE_REQUIRED = "DOCUMENT_TYPE_REQUIRED",
  DUPLICATE_REQUIREMENT = "DUPLICATE_REQUIREMENT",
}
