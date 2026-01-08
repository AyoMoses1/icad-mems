/**
 * Previous Certificates Service - API integration for previous certificate operations
 * Based on swagger.txt - /api/PreviousCertificates endpoints
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/previous-certificates";

export interface PreviousCertificateDto {
  id: string;
  seafarerId?: string | null;
  certificateNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  certificateType?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

/**
 * Get paginated list of previous certificates
 * GET /api/PreviousCertificates
 */
export async function getPreviousCertificates(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<PreviousCertificateDto>>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params?.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params?.sortDirection) {
    queryParams.append("sortDirection", params.sortDirection);
  }

  const url = queryParams.toString()
    ? `${API_BASE}?${queryParams.toString()}`
    : API_BASE;
  return apiGetMain<PagedResult<PreviousCertificateDto>>(url);
}

/**
 * Get previous certificate by ID
 * GET /api/PreviousCertificates/{id}
 */
export async function getPreviousCertificateById(
  id: string
): Promise<ApiResponse<PreviousCertificateDto>> {
  return apiGetMain<PreviousCertificateDto>(`${API_BASE}/${id}`);
}

