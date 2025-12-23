/**
 * Accreditation Service - API integration for accreditation operations (Officer/Admin only)
 */

import { apiGetMain, apiPostMain, type ApiResponse } from "@/lib/api-client";

const API_BASE = "/api/v1/Accreditations";

export interface AccreditationDto {
  id: number;
  userOrganizationId?: number;
  organizationName?: string | null;
  applicationNumber?: string | null;
  applicationDate?: string;
  accreditationStatusId?: number;
  accreditationStatusName?: string | null;
  accreditationStartDate?: string | null;
  accreditationEndDate?: string | null;
  accreditationExpiryDate?: string | null;
  accreditationNumber?: string | null;
  certificateNumber?: string | null;
  [key: string]: unknown;
}

export interface AccreditationFilters {
  pageNumber?: number;
  pageSize?: number;
  organizationId?: number;
  statusId?: number;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Get paginated list of accreditations (Officer/Admin only)
 */
export async function getAccreditations(
  filters: AccreditationFilters = {}
): Promise<ApiResponse<PaginatedResponse<AccreditationDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    organizationId,
    statusId,
    isActive,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (organizationId)
    params.append("organizationId", organizationId.toString());
  if (statusId) params.append("statusId", statusId.toString());
  if (isActive !== undefined) params.append("isActive", isActive.toString());

  return apiGetMain<PaginatedResponse<AccreditationDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get accreditation by ID
 */
export async function getAccreditationById(
  accredId: number
): Promise<ApiResponse<AccreditationDto>> {
  return apiGetMain<AccreditationDto>(`${API_BASE}/${accredId}`);
}

/**
 * Approve accreditation (Officer/Admin only)
 */
export async function approveAccreditation(
  accredId: number,
  approvalData: {
    accreditationStartDate: string;
    accreditationEndDate: string;
    accreditationNumber: string;
    certificateNumber?: string;
    [key: string]: unknown;
  }
): Promise<ApiResponse<AccreditationDto>> {
  return apiPostMain<AccreditationDto>(
    `${API_BASE}/${accredId}/approve`,
    approvalData
  );
}

/**
 * Reject accreditation (Officer/Admin only)
 */
export async function rejectAccreditation(
  accredId: number,
  rejectionData: { reason?: string; [key: string]: unknown }
): Promise<ApiResponse<AccreditationDto>> {
  return apiPostMain<AccreditationDto>(
    `${API_BASE}/${accredId}/reject`,
    rejectionData
  );
}

/**
 * Suspend accreditation (Officer/Admin only)
 */
export async function suspendAccreditation(
  accredId: number,
  suspensionData: { reason?: string; [key: string]: unknown }
): Promise<ApiResponse<AccreditationDto>> {
  return apiPostMain<AccreditationDto>(
    `${API_BASE}/${accredId}/suspend`,
    suspensionData
  );
}

