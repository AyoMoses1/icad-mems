/**
 * Payment Service - API integration for payment operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiDeleteMain,
  apiPutMain,
  type ApiResponse,
  getApiBaseUrl,
} from "@/lib/api-client";
import type {
  PaymentDto,
  InitiatePaymentDto,
  RecordManualPaymentDto,
  PaymentFilters,
  PaginatedResponse,
} from "@/types/payment";

const API_BASE = "/api/v1/Payments";
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
 */
export async function getPayments(
  filters: PaymentFilters = {}
): Promise<ApiResponse<PaginatedResponse<PaymentDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    userId,
    invoiceId,
    status,
    searchTerm,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (userId) params.append("userId", userId.toString());
  if (invoiceId) params.append("invoiceId", invoiceId.toString());
  if (status) params.append("status", status);
  if (searchTerm) params.append("searchTerm", searchTerm);

  return apiGetMain<PaginatedResponse<PaymentDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get payment by ID
 */
export async function getPaymentById(
  paymentId: number
): Promise<ApiResponse<PaymentDto>> {
  return apiGetMain<PaymentDto>(`${API_BASE}/${paymentId}`);
}

/**
 * Initiate payment for an invoice
 */
export async function initiatePayment(
  invoiceId: number,
  paymentData: InitiatePaymentDto
): Promise<ApiResponse<PaymentDto>> {
  return apiPostMain<PaymentDto>(
    `${API_BASE}/invoices/${invoiceId}/pay`,
    paymentData
  );
}

/**
 * Verify payment status by payment reference
 */
export async function verifyPayment(
  paymentReference: string
): Promise<ApiResponse<PaymentDto>> {
  return apiGetMain<PaymentDto>(`${API_BASE}/verify/${paymentReference}`);
}

/**
 * Record manual payment (Officer/Admin only)
 */
export async function recordManualPayment(
  paymentData: RecordManualPaymentDto
): Promise<ApiResponse<PaymentDto>> {
  return apiPostMain<PaymentDto>(API_BASE, paymentData);
}

// ============================================================================
// Endpoints from frontend-api-integration.md (Payment Webhooks)
// ============================================================================

const API_BASE_LEGACY = "/api/payments"; // For endpoints from frontend-api-integration.md

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
 */
export async function paymentWebhook(
  data: PaymentWebhookRequest
): Promise<ApiResponse<PaymentWebhookResponse>> {
  return apiPostMain<PaymentWebhookResponse>(
    `${API_BASE_LEGACY}/webhook`,
    data
  );
}

/**
 * Simulate payment (for non-production environments)
 * POST /api/Payments/simulate
 */
export async function simulatePayment(
  data: PaymentWebhookRequest
): Promise<ApiResponse<boolean>> {
  return apiPostMain<boolean>(
    `/api/Payments/simulate`,
    data
  );
}

// ============================================================================
// Seafarer Invoice and Payment Functions
// ============================================================================

/**
 * Get invoices for the current seafarer user
 * GET /seafarer/api/v1/invoices/me
 */
export async function getMyInvoices(): Promise<ApiResponse<SeafarerInvoiceDto[]>> {
  return apiGetMain<SeafarerInvoiceDto[]>(`${SEAFARER_API_BASE}/invoices/me`);
}

/**
 * Initiate payment for an application
 * POST /seafarer/api/v1/applications/{applicationId}/pay
 */
export async function initiateApplicationPayment(
  applicationId: string
): Promise<ApiResponse<InitiatePaymentResponseDto>> {
  return apiPostMain<InitiatePaymentResponseDto>(
    `${SEAFARER_API_BASE}/applications/${applicationId}/pay`,
    {}
  );
}

/**
 * Get payment status for an application
 * GET /seafarer/api/v1/applications/{applicationId}/payment-status
 */
export async function getApplicationPaymentStatus(
  applicationId: string
): Promise<ApiResponse<PaymentStatusDto>> {
  return apiGetMain<PaymentStatusDto>(
    `${SEAFARER_API_BASE}/applications/${applicationId}/payment-status`
  );
}

/**
 * Download invoice as PDF blob
 * GET /seafarer/api/v1/invoices/{invoiceId}/download
 */
export async function downloadInvoice(invoiceId: string): Promise<Blob> {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured. Please check your .env.local file and restart the dev server."
    );
  }

  const url = `${API_BASE_URL}${SEAFARER_API_BASE}/invoices/${invoiceId}/download`;

  // Get auth token
  if (typeof window === "undefined") {
    throw new Error("downloadInvoice can only be called from the client side");
  }

  const { useAuthStore } = require("@/store");
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to download invoice: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while downloading invoice");
  }
}

