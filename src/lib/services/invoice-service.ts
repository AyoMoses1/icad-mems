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
 * ⚠️ DEPRECATED: The /api/Invoices/{id} endpoint does not exist in swagger.json
 * Use getApplicationInvoice() from application-service.ts for application-specific invoices instead.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getInvoiceById(
  invoiceId: number
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  // Endpoint /api/Invoices/{id} does not exist in swagger.json
  // Use getApplicationInvoice() from application-service.ts instead
  return {
    success: false,
    error: { message: "Endpoint /api/Invoices/{id} does not exist in the API. Use getApplicationInvoice() from application-service.ts instead.", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Get invoice for an application
 * ⚠️ DEPRECATED: The /api/Invoices/applications/{id}/invoice endpoint does not exist in swagger.json
 * Use getApplicationInvoice() from application-service.ts instead which calls /seafarer/api/v1/Applications/{id}/invoice
 * 
 * @deprecated Use getApplicationInvoice() from application-service.ts instead
 */
export async function getInvoiceForApplication(
  applicationId: number
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  // Endpoint /api/Invoices/applications/{id}/invoice does not exist in swagger.json
  // Use getApplicationInvoice() from application-service.ts instead
  // Import: import { getApplicationInvoice } from "@/lib/services/application-service";
  return {
    success: false,
    error: { message: "Endpoint /api/Invoices/applications/{id}/invoice does not exist. Use getApplicationInvoice() from application-service.ts instead.", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Create invoice (Officer/Admin only)
 * ⚠️ DEPRECATED: The /api/Invoices endpoint does not exist in swagger.json
 * Use generateApplicationInvoice() from application-service.ts instead which calls /seafarer/api/v1/Applications/{id}/invoice
 * 
 * @deprecated Use generateApplicationInvoice() from application-service.ts instead
 */
export async function createInvoice(
  invoiceData: CreateInvoiceDto
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  // Endpoint /api/Invoices does not exist in swagger.json
  // Use generateApplicationInvoice() from application-service.ts instead
  return {
    success: false,
    error: { message: "Endpoint /api/Invoices does not exist. Use generateApplicationInvoice() from application-service.ts instead.", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Update invoice (Officer/Admin only)
 * ⚠️ DEPRECATED: The /api/Invoices/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateInvoice(
  invoiceId: number,
  updates: UpdateInvoiceDto
): Promise<ApiResponse<ApplicationInvoiceDto>> {
  // Endpoint /api/Invoices/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Invoices/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Delete invoice (Officer/Admin only)
 * ⚠️ DEPRECATED: The /api/Invoices/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteInvoice(
  invoiceId: number
): Promise<ApiResponse<void>> {
  // Endpoint /api/Invoices/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Invoices/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

