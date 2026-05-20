/**
 * Payment Service - API integration for payment operations
 */

import {
  apiGetMain,
  apiPostMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  PaymentDto,
  InitiatePaymentDto,
  RecordManualPaymentDto,
  PaymentFilters,
  PaginatedResponse,
} from "@/types/payment";

const SEAFARER_API_BASE = "/seafarer/api/v1";

// ============================================================================
// Seafarer Invoice Types (API-aligned)
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
  payments?: ApiSeafarerPaymentDto[] | null;
}

export interface ApiSeafarerPaymentDto {
  paymentRef?: string | null;
  invoiceId?: string;
  amount?: number;
  paymentDate?: string | null;
  paymentServiceProviderId?: string;
  paymentServiceProvider?: string | null;
  paymentStatusId?: string;
  paymentStatus?: string | null;
  dateCreated?: string | null;
}

export interface ApiApplicationInvoiceDto {
  invoiceId?: string;
  applicationId?: string;
  serviceId?: string;
  serviceName?: string | null;
  invoiceStatusId?: string;
  invoiceStatus?: string | null;
  invoiceDate?: string | null;
  amount?: number;
  hasPayment?: boolean;
  paymentRef?: string | null;
  paymentStatus?: string | null;
  dateCreated?: string | null;
  invoiceNumber?: string | null;
  currency?: string | null;
  payments?: ApiSeafarerPaymentDto[] | null;
  rn?: string | null;
  applicationStatus?: string | null;
  applicationDate?: string | null;
}

export interface PagedInvoicesDto {
  items?: ApiApplicationInvoiceDto[] | null;
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface MyInvoicesQuery {
  serviceId?: string;
  statusId?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaymentStatusDto {
  status?: string | null;
  paymentReference?: string | null;
  paymentRef?: string | null;
  paidDate?: string | null;
  paymentDate?: string | null;
  amount?: number;
  currency?: string | null;
  hasPayment?: boolean | null;
}

export type PaymentStatusResponse = PaymentStatusDto;

export interface InitiatePaymentResponseDto {
  paymentUrl?: string | null;
  authorizationUrl?: string | null;
  paymentReference?: string | null;
  transactionId?: string | null;
}

export type InitiatePaymentResponse = InitiatePaymentResponseDto;

function isApiSuccess(response: ApiResponse<unknown>): boolean {
  return (
    response.success === true ||
    (response as { successful?: boolean }).successful === true
  );
}

function buildMyInvoicesQuery(query: MyInvoicesQuery = {}): string {
  const params = new URLSearchParams();
  if (query.serviceId) params.set("serviceId", query.serviceId);
  if (query.statusId) params.set("statusId", query.statusId);
  if (query.fromDate) params.set("fromDate", query.fromDate);
  if (query.toDate) params.set("toDate", query.toDate);
  if (query.pageNumber != null) params.set("pageNumber", String(query.pageNumber));
  if (query.pageSize != null) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function mapInvoiceToSeafarerDto(
  invoice: ApiApplicationInvoiceDto
): SeafarerInvoiceDto {
  return {
    id: invoice.invoiceId || "",
    invoiceNumber: invoice.invoiceNumber,
    applicationId: invoice.applicationId,
    serviceName: invoice.serviceName,
    amount: invoice.amount,
    totalAmount: invoice.amount,
    currency: invoice.currency,
    status: invoice.invoiceStatus,
    paymentReference: invoice.paymentRef,
    issuedAt: invoice.invoiceDate,
    createdAt: invoice.dateCreated,
    payments: invoice.payments,
  };
}

function paymentRowId(paymentRef: string, index: number): number {
  let hash = 0;
  for (let i = 0; i < paymentRef.length; i++) {
    hash = (hash << 5) - hash + paymentRef.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || index + 1;
}

export function mapPaymentFromInvoice(
  payment: ApiSeafarerPaymentDto,
  invoice: ApiApplicationInvoiceDto,
  index: number
): PaymentDto {
  const ref =
    payment.paymentRef?.trim() ||
    invoice.paymentRef?.trim() ||
    `payment-${index}`;
  return {
    id: paymentRowId(ref, index),
    paymentReference: ref,
    amount: payment.amount ?? invoice.amount ?? 0,
    currency: invoice.currency,
    status: payment.paymentStatus || invoice.paymentStatus || undefined,
    paymentStatus: payment.paymentStatus || invoice.paymentStatus || undefined,
    paymentMethod: payment.paymentServiceProvider || undefined,
    paymentDate: payment.paymentDate || payment.dateCreated || undefined,
    invoiceNumber: invoice.invoiceNumber ?? undefined,
    createdAt: payment.dateCreated || invoice.dateCreated || undefined,
    isManual: false,
    seafarerInvoiceId: invoice.invoiceId ?? null,
    seafarerApplicationId: invoice.applicationId ?? null,
    serviceName: invoice.serviceName ?? null,
    applicationRn: invoice.rn ?? null,
    applicationStatus: invoice.applicationStatus ?? null,
    applicationDate: invoice.applicationDate ?? null,
    invoiceStatus: invoice.invoiceStatus ?? null,
    invoiceDate: invoice.invoiceDate ?? null,
    paymentStatusId: payment.paymentStatusId ?? null,
    paymentServiceProviderId: payment.paymentServiceProviderId ?? null,
  };
}

function mapInvoiceSummaryPayment(
  invoice: ApiApplicationInvoiceDto,
  index: number
): PaymentDto {
  const ref = invoice.paymentRef?.trim() || `invoice-${invoice.invoiceId}`;
  return {
    id: paymentRowId(ref, index),
    paymentReference: ref,
    amount: invoice.amount ?? 0,
    currency: invoice.currency,
    status: invoice.paymentStatus || undefined,
    paymentStatus: invoice.paymentStatus || undefined,
    paymentDate: invoice.invoiceDate || invoice.dateCreated || undefined,
    invoiceNumber: invoice.invoiceNumber ?? undefined,
    createdAt: invoice.dateCreated || undefined,
    isManual: false,
    seafarerInvoiceId: invoice.invoiceId ?? null,
    seafarerApplicationId: invoice.applicationId ?? null,
    serviceName: invoice.serviceName ?? null,
    applicationRn: invoice.rn ?? null,
    applicationStatus: invoice.applicationStatus ?? null,
    applicationDate: invoice.applicationDate ?? null,
    invoiceStatus: invoice.invoiceStatus ?? null,
    invoiceDate: invoice.invoiceDate ?? null,
  };
}

export function extractPaymentsFromInvoices(
  invoices: ApiApplicationInvoiceDto[]
): PaymentDto[] {
  const payments: PaymentDto[] = [];
  let index = 0;

  for (const invoice of invoices) {
    if (invoice.payments?.length) {
      for (const payment of invoice.payments) {
        payments.push(mapPaymentFromInvoice(payment, invoice, index++));
      }
    } else if (invoice.hasPayment && invoice.paymentRef) {
      payments.push(mapInvoiceSummaryPayment(invoice, index++));
    }
  }

  return payments;
}

export interface InvoicePaymentDetailResult {
  invoice: ApiApplicationInvoiceDto;
  payment: ApiSeafarerPaymentDto;
  /** All payments recorded on this invoice */
  invoicePayments: ApiSeafarerPaymentDto[];
}

/**
 * Resolve invoice + payment row from my-invoices using payment reference (e.g. TXN-…).
 * Paginates until found or invoices are exhausted.
 */
export async function getInvoicePaymentDetailByRef(
  paymentRef: string
): Promise<ApiResponse<InvoicePaymentDetailResult>> {
  const normalized = paymentRef.trim();
  if (!normalized) {
    return {
      success: false,
      error: { message: "Payment reference is required", code: "INVALID" },
    };
  }

  let pageNumber = 1;
  const pageSize = 50;
  const maxPages = 50;

  for (let page = 0; page < maxPages; page++) {
    const response = await getMyInvoices({ pageNumber, pageSize });
    if (!isApiSuccess(response) || !response.data?.items) {
      return {
        success: false,
        message: response.message || response.error?.message,
        error: response.error || {
          message: "Failed to load invoices",
          code: "LOAD_ERROR",
        },
      };
    }

    const { items, totalPages = 1 } = response.data;

    for (const invoice of items) {
      const list = invoice.payments || [];
      const match = list.find((p) => (p.paymentRef || "").trim() === normalized);
      if (match) {
        return {
          success: true,
          data: {
            invoice,
            payment: match,
            invoicePayments: list,
          },
        };
      }
      if (
        list.length === 0 &&
        invoice.hasPayment &&
        (invoice.paymentRef || "").trim() === normalized
      ) {
        const synthetic: ApiSeafarerPaymentDto = {
          paymentRef: invoice.paymentRef,
          invoiceId: invoice.invoiceId,
          amount: invoice.amount,
          paymentDate: invoice.invoiceDate,
          paymentStatus: invoice.paymentStatus,
          dateCreated: invoice.dateCreated,
        };
        return {
          success: true,
          data: {
            invoice,
            payment: synthetic,
            invoicePayments: [synthetic],
          },
        };
      }
    }

    if (pageNumber >= totalPages || items.length < pageSize) {
      break;
    }
    pageNumber++;
  }

  return {
    success: false,
    error: { message: "Payment not found", code: "NOT_FOUND" },
  };
}

/**
 * GET /seafarer/api/v1/Invoices/my-invoices
 */
export async function getMyInvoices(
  query: MyInvoicesQuery = {}
): Promise<ApiResponse<PagedInvoicesDto>> {
  return apiGetMain<PagedInvoicesDto>(
    `${SEAFARER_API_BASE}/Invoices/my-invoices${buildMyInvoicesQuery(query)}`
  );
}

/**
 * Payment history for the current user — derived from my-invoices (each invoice includes payments[]).
 */
export async function getMyPayments(
  filters: PaymentFilters = {}
): Promise<ApiResponse<PaginatedResponse<PaymentDto>>> {
  const pageNumber = filters.pageNumber || 1;
  const pageSize = filters.pageSize || 50;

  const response = await getMyInvoices({ pageNumber, pageSize });

  if (!isApiSuccess(response) || !response.data) {
    return {
      success: false,
      message: response.message || response.error?.message,
      error: response.error,
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

  let items = extractPaymentsFromInvoices(response.data.items || []);

  if (filters.status) {
    const status = filters.status.toLowerCase();
    items = items.filter(
      (p) =>
        (p.status || p.paymentStatus || "").toLowerCase() === status
    );
  }

  if (filters.searchTerm?.trim()) {
    const term = filters.searchTerm.trim().toLowerCase();
    items = items.filter(
      (p) =>
        (p.paymentReference || "").toLowerCase().includes(term) ||
        (p.invoiceNumber || "").toLowerCase().includes(term)
    );
  }

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (pageNumber - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize);

  return {
    success: true,
    data: {
      items: pagedItems,
      pageNumber,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
  };
}

/**
 * @deprecated Use getMyPayments() — no global /api/Payments list in Seafarer API
 */
export async function getPayments(
  filters: PaymentFilters = {}
): Promise<ApiResponse<PaginatedResponse<PaymentDto>>> {
  return getMyPayments(filters);
}

/**
 * @deprecated No payment-by-id endpoint; use verifyPayment(reference) or invoice payments[]
 */
export async function getPaymentById(
  paymentId: number
): Promise<ApiResponse<PaymentDto>> {
  const response = await getMyPayments({ pageSize: 200 });
  const match = response.data?.items.find((p) => p.id === paymentId);
  if (match) {
    return { success: true, data: match };
  }
  return {
    success: false,
    error: {
      message: "Payment not found",
      code: "NOT_FOUND",
    },
  };
}

/**
 * @deprecated Use initiateApplicationPayment()
 */
export async function initiatePayment(
  _invoiceId: number,
  _paymentData: InitiatePaymentDto
): Promise<ApiResponse<PaymentDto>> {
  return {
    success: false,
    error: {
      message:
        "Use initiateApplicationPayment() for Seafarer payments.",
      code: "ENDPOINT_NOT_FOUND",
    },
  };
}

/**
 * GET /seafarer/api/v1/Payment/payments/{reference}/verify
 */
export async function verifyPayment(
  paymentReference: string
): Promise<ApiResponse<PaymentDto>> {
  const response = await apiGetMain<ApiSeafarerPaymentDto>(
    `${SEAFARER_API_BASE}/Payment/payments/${encodeURIComponent(paymentReference)}/verify`
  );

  if (!isApiSuccess(response) || !response.data) {
    return {
      success: false,
      message: response.message,
      error: response.error,
    };
  }

  const p = response.data;
  const ref = p.paymentRef || paymentReference;
  return {
    success: true,
    data: {
      id: paymentRowId(ref, 0),
      paymentReference: ref,
      amount: p.amount ?? 0,
      status: p.paymentStatus || undefined,
      paymentStatus: p.paymentStatus || undefined,
      paymentMethod: p.paymentServiceProvider || undefined,
      paymentDate: p.paymentDate || p.dateCreated || undefined,
      isManual: false,
    },
  };
}

/**
 * @deprecated Not exposed in Seafarer API for end users
 */
export async function recordManualPayment(
  _paymentData: RecordManualPaymentDto
): Promise<ApiResponse<PaymentDto>> {
  return {
    success: false,
    error: {
      message: "Manual payment recording is not available in the Seafarer API",
      code: "ENDPOINT_NOT_FOUND",
    },
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
  amount?: number;
  currency?: string;
  transactionReference?: string;
  paymentMethod?: string;
  notes?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
}

export interface PaymentSimulateResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  paymentReference?: string;
}

export async function paymentWebhook(
  data: PaymentWebhookRequest
): Promise<ApiResponse<PaymentWebhookResponse>> {
  return apiPostMain<PaymentWebhookResponse>(
    `${SEAFARER_API_BASE}/Payment/webhook`,
    data
  );
}

export async function simulatePayment(
  applicationId: string,
  data: PaymentSimulateRequest
): Promise<ApiResponse<PaymentSimulateResponse>> {
  return apiPostMain<PaymentSimulateResponse>(
    `${SEAFARER_API_BASE}/Payment/applications/${applicationId}/payment/simulate`,
    data
  );
}

/**
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
 * Invoice PDF download is not in the current OpenAPI spec.
 */
export async function downloadInvoice(_invoiceId: string): Promise<Blob> {
  throw new Error(
    "Invoice download is not available in the Seafarer API specification"
  );
}
