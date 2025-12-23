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

const API_BASE = "/api/v1/Payments";

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

