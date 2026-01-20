/**
 * Invoice Service - API integration for invoice operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiDeleteMain,
  apiPatchMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  ApplicationInvoiceDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceFilters,
  PaginatedResponse,
} from "@/types/payment";

// Note: General invoices list endpoint doesn't exist in API
// Use application-specific invoice endpoints instead
const API_BASE = "/api/Invoices"; // This endpoint returns 404

/**
 * Get paginated list of invoices with optional filtering
 * NOTE: This endpoint doesn't exist in the API (returns 404)
 * Use getMyInvoices() from payment-service.ts for seafarer invoices instead
 * Or use getInvoiceForApplication() for application-specific invoices
 */
export async function getInvoices(
  filters: InvoiceFilters = {}
): Promise<ApiResponse<PaginatedResponse<ApplicationInvoiceDto>>> {
  // This endpoint doesn't exist - return empty result
  console.warn("getInvoices: This endpoint doesn't exist in the API. Use getMyInvoices() or getInvoiceForApplication() instead.");
  const pageNumber = filters.pageNumber || 1;
  const pageSize = filters.pageSize || 20;
  return {
    success: false,
    message: "Invoices list endpoint not available. Use application-specific invoice endpoints instead.",
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
 * Get invoice by ID
 */
export async function getInvoiceById(
  invoiceId: number
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  return apiGetMain<ApplicationInvoiceDto>(`${API_BASE}/${invoiceId}`);
}

/**
 * Get invoice for an application
 */
export async function getInvoiceForApplication(
  applicationId: number
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  return apiGetMain<ApplicationInvoiceDto>(
    `${API_BASE}/applications/${applicationId}/invoice`
  );
}

/**
 * Create invoice (Officer/Admin only)
 */
export async function createInvoice(
  invoiceData: CreateInvoiceDto
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  return apiPostMain<ApplicationInvoiceDto>(API_BASE, invoiceData);
}

/**
 * Update invoice (Officer/Admin only)
 */
export async function updateInvoice(
  invoiceId: number,
  updates: UpdateInvoiceDto
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  return apiPatchMain<ApplicationInvoiceDto>(
    `${API_BASE}/${invoiceId}`,
    updates
  );
}

/**
 * Delete invoice (Officer/Admin only)
 */
export async function deleteInvoice(
  invoiceId: number
): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${invoiceId}`);
}

