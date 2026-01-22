/**
 * Payment Service - API integration for payment operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiDeleteMain,
  apiPutMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  PaymentDto,
  InitiatePaymentDto,
  RecordManualPaymentDto,
  PaymentFilters,
  PaginatedResponse,
} from "@/types/payment";

const API_BASE = "/api/Payments";
const SEAFARER_API_BASE = "/seafarer/api/v1";

// ============================================================================
// Seafarer Invoice Types
// ============================================================================

export interface InvoiceLineItem {
  description?: string | null;
  quantity?: number;
  unitPrice?: number;
  total: number;
}

export interface SeafarerInvoiceDto {
  id: string;
  invoiceNumber?: string | null;
  applicationId?: string;
  serviceName?: string | null;
  amount?: number;
  totalAmount?: number;
  currency?: string | null;
  status?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  paymentReference?: string | null;
  issuedAt?: string | null;
  createdAt?: string | null;
  lineItems?: InvoiceLineItem[] | null;
}

export interface PaymentStatusDto {
  status?: string | null;
  paymentReference?: string | null;
  paymentRef?: string | null; // Alternative field name
  paidDate?: string | null;
  paymentDate?: string | null; // Alternative field name
  amount?: number;
  currency?: string | null;
  hasPayment?: boolean | null;
}

// Alias for backward compatibility
export type PaymentStatusResponse = PaymentStatusDto;

export interface InitiatePaymentResponseDto {
  paymentUrl?: string | null;
  authorizationUrl?: string | null;
  paymentReference?: string | null;
  transactionId?: string | null;
}

// Alias for backward compatibility
export type InitiatePaymentResponse = InitiatePaymentResponseDto;

/**
 * Get paginated list of payments with optional filtering
 * ⚠️ DEPRECATED: The /api/Payments endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getPayments(
  filters: PaymentFilters = {}
): Promise<ApiResponse<PaginatedResponse<PaymentDto>>> {
  // Endpoint /api/Payments does not exist in swagger.json
  const pageNumber = filters.pageNumber || 1;
  const pageSize = filters.pageSize || 20;
  return {
    success: false,
    error: { message: "Endpoint /api/Payments does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: {
      items: [],
      pageNumber,
      pageSize,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

/**
 * Get payment by ID
 * ⚠️ DEPRECATED: The /api/Payments/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getPaymentById(
  paymentId: number
): Promise<ApiResponse<PaymentDto>> {
  // Endpoint /api/Payments/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Payments/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Initiate payment for an invoice
 * ⚠️ DEPRECATED: The /api/Payments/invoices/{invoiceId}/pay endpoint does not exist in swagger.json
 * Use initiateApplicationPayment() instead which calls /seafarer/api/v1/Payment/applications/{id}/payment/initiate
 * 
 * @deprecated Use initiateApplicationPayment() instead
 */
export async function initiatePayment(
  invoiceId: number,
  paymentData: InitiatePaymentDto
): Promise<ApiResponse<PaymentDto>> {
  // Endpoint /api/Payments/invoices/{invoiceId}/pay does not exist in swagger.json
  // Use initiateApplicationPayment() instead
  return {
    success: false,
    error: { message: "Endpoint /api/Payments/invoices/{invoiceId}/pay does not exist. Use initiateApplicationPayment() instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Verify payment status by payment reference
 * ⚠️ DEPRECATED: The /api/Payments/verify/{reference} endpoint does not exist in swagger.json
 * Use verifyApplicationPayment() from application-service.ts or the Payment service verify endpoint instead.
 * 
 * @deprecated Use verifyApplicationPayment() or Payment service verify endpoint instead
 */
export async function verifyPayment(
  paymentReference: string
): Promise<ApiResponse<PaymentDto>> {
  // Endpoint /api/Payments/verify/{reference} does not exist in swagger.json
  // The correct endpoint is /seafarer/api/v1/Payment/payments/{reference}/verify
  return apiGetMain<PaymentDto>(`${SEAFARER_API_BASE}/Payment/payments/${paymentReference}/verify`);
}

/**
 * Record manual payment (Officer/Admin only)
 * ⚠️ DEPRECATED: The /api/Payments endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function recordManualPayment(
  paymentData: RecordManualPaymentDto
): Promise<ApiResponse<PaymentDto>> {
  // Endpoint /api/Payments does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Payments does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

// ============================================================================
// Payment Webhooks
// ============================================================================

export interface PaymentWebhookRequest {
  invoiceId: string;
  paymentReference?: string | null;
  rrrNumber?: string | null;
}

export interface PaymentWebhookResponse {
  success: boolean;
  message?: string;
  invoiceId?: string;
  applicationId?: string;
  accreditationId?: string;
}

export interface PaymentSimulateRequest {
  invoiceId?: string;
  amount?: number;
  paymentMethod?: string;
  simulateSuccess?: boolean;
}

export interface PaymentSimulateResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  paymentReference?: string;
}

/**
 * Payment webhook endpoint (for production payment gateways)
 * POST /seafarer/api/v1/Payment/webhook
 */
export async function paymentWebhook(
  data: PaymentWebhookRequest
): Promise<ApiResponse<PaymentWebhookResponse>> {
  return apiPostMain<PaymentWebhookResponse>(
    `${SEAFARER_API_BASE}/Payment/webhook`,
    data
  );
}

/**
 * Simulate payment (for non-production environments)
 * POST /seafarer/api/v1/Payment/applications/{id}/payment/simulate
 */
export async function simulatePayment(
  applicationId: string,
  data: PaymentSimulateRequest
): Promise<ApiResponse<PaymentSimulateResponse>> {
  return apiPostMain<PaymentSimulateResponse>(
    `${SEAFARER_API_BASE}/Payment/applications/${applicationId}/payment/simulate`,
    data
  );
}

// ============================================================================
// Seafarer Invoice and Payment Functions
// ============================================================================

/**
 * Get invoices for the current seafarer user
 * ⚠️ DEPRECATED: The /seafarer/api/v1/invoices/me endpoint does not exist in swagger.json
 * Use getApplicationInvoice() from application-service.ts for application-specific invoices instead.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getMyInvoices(): Promise<ApiResponse<SeafarerInvoiceDto[]>> {
  // Endpoint /seafarer/api/v1/invoices/me does not exist in swagger.json
  // Use getApplicationInvoice() from application-service.ts for application-specific invoices
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/invoices/me does not exist in the API. Use getApplicationInvoice() from application-service.ts instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Initiate payment for an application
 * POST /seafarer/api/v1/Payment/applications/{id}/payment/initiate
 */
export async function initiateApplicationPayment(
  applicationId: string
): Promise<ApiResponse<InitiatePaymentResponseDto>> {
  return apiPostMain<InitiatePaymentResponseDto>(
    `${SEAFARER_API_BASE}/Payment/applications/${applicationId}/payment/initiate`,
    {}
  );
}

/**
 * Get payment status for an application
 * GET /seafarer/api/v1/Payment/applications/{id}/payment-status
 */
export async function getApplicationPaymentStatus(
  applicationId: string
): Promise<ApiResponse<PaymentStatusDto>> {
  return apiGetMain<PaymentStatusDto>(
    `${SEAFARER_API_BASE}/Payment/applications/${applicationId}/payment-status`
  );
}

/**
 * Download invoice as PDF blob
 * ⚠️ DEPRECATED: The /seafarer/api/v1/invoices/{invoiceId}/download endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function downloadInvoice(invoiceId: string): Promise<Blob> {
  // Endpoint /seafarer/api/v1/invoices/{invoiceId}/download does not exist in swagger.json
  throw new Error("Endpoint /seafarer/api/v1/invoices/{invoiceId}/download does not exist in the API");
}