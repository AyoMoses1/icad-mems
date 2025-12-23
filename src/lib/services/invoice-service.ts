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

const API_BASE = "/api/v1/Invoices";

/**
 * Get paginated list of invoices with optional filtering
 */
export async function getInvoices(
  filters: InvoiceFilters = {}
): Promise<ApiResponse<PaginatedResponse<ApplicationInvoiceDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    userId,
    applicationId,
    statusId,
    searchTerm,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (userId) params.append("userId", userId.toString());
  if (applicationId) params.append("applicationId", applicationId.toString());
  if (statusId) params.append("statusId", statusId.toString());
  if (searchTerm) params.append("searchTerm", searchTerm);

  return apiGetMain<PaginatedResponse<ApplicationInvoiceDto>>(
    `${API_BASE}?${params.toString()}`
  );
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

