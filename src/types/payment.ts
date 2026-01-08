// ============================================================================
// Payment Types
// ============================================================================

export interface PaymentDto {
  id: number;
  paymentId?: string | null;
  paymentDate?: string;
  paymentReference?: string | null;
  applicationId?: number;
  applicationNumber?: string | null;
  invoiceId?: number | null;
  invoiceNumber?: string | null;
  userProfileId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  paymentServiceProviderId?: number | null;
  paymentServiceProviderName?: string | null;
  amount: number;
  currency?: string | null;
  status?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  paidAt?: string | null;
  transactionId?: string | null;
  failureReason?: string | null;
  isManual: boolean;
  recordedBy?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface InitiatePaymentDto {
  paymentMethod: string;
  // Additional payment method-specific fields may be required
  [key: string]: unknown;
}

export interface RecordManualPaymentDto {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  // Additional fields as required
  [key: string]: unknown;
}

export interface PaymentFilters {
  pageNumber?: number;
  pageSize?: number;
  userId?: number;
  invoiceId?: number;
  status?: string;
  searchTerm?: string;
}

// ============================================================================
// Invoice Types
// ============================================================================

export interface ApplicationInvoiceDto {
  id: number;
  invoiceNumber?: string | null;
  applicationId?: number;
  applicationNumber?: string | null;
  userProfileId?: number;
  userName?: string | null;
  userEmail?: string | null;
  invoiceStatusId?: number;
  invoiceStatusName?: string | null;
  invoiceStatusCode?: string | null;
  amount: number;
  currency?: string | null;
  dueDate?: string;
  paidDate?: string | null;
  notes?: string | null;
  paymentReference?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateInvoiceDto {
  applicationId: number;
  amount: number;
  currency?: string; // Default: "NGN"
  description?: string;
  dueDate?: string; // ISO 8601 date string
  // Additional fields as required
  [key: string]: unknown;
}

export interface UpdateInvoiceDto {
  amount?: number;
  currency?: string;
  dueDate?: string;
  notes?: string;
  description?: string;
  // Additional fields as required
  [key: string]: unknown;
}

export interface InvoiceFilters {
  pageNumber?: number;
  pageSize?: number;
  userId?: number;
  applicationId?: number;
  statusId?: number;
  searchTerm?: string;
}

// ============================================================================
// Application Types
// ============================================================================

export interface ApplicationDto {
  id: number;
  applicationNumber?: string | null;
  applicationDate?: string;
  status?: string | null;
  programAppliedFor?: string | null;
  academicYear?: string | null;
  semester?: string | null;
  decision?: string | null;
  decisionDate?: string | null;
  comments?: string | null;
  applicantId?: number;
  applicantName?: string | null;
  programId?: number;
  programName?: string | null;
  nationalityId?: number | null;
  nationalityName?: string | null;
  applicationStatusId?: number;
  applicationStatusName?: string | null;
  applicationStatusCode?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ApplicationFilters {
  pageNumber?: number;
  pageSize?: number;
  applicantId?: number;
  programId?: number;
  statusId?: number;
  searchTerm?: string;
}

export interface CreateApplicationDto {
  serviceId: number;
  programId?: number;
  applicantId?: number;
  programAppliedFor?: string | null;
  academicYear?: string | null;
  semester?: string | null;
  nationalityId?: number | null;
  remarks?: string | null;
  [key: string]: unknown;
}

export interface FulfillRequirementDto {
  profileDocumentId?: number | null;
  educationDocumentId?: number | null;
  organizationDocumentId?: number | null;
  metricValue?: string | null;
  metricNotes?: string | null;
  [key: string]: unknown;
}

// ============================================================================
// Common Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

