/**
 * Vessels Service - API integration for vessel operations
 * Based on swagger.txt - /api/Vessels endpoints
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/vessels";

// ============================================================================
// Types
// ============================================================================

export interface VesselDto {
  id: number;
  name?: string | null;
  imoNumber?: string | null;
  builtDate: string;
  isActive: boolean;
}

export interface CreateVesselRequest {
  name?: string | null;
  imoNumber?: string | null;
  builtDate: string;
  isActive?: boolean;
}

export interface UpdateVesselRequest {
  name?: string | null;
  imoNumber?: string | null;
  builtDate?: string;
  isActive?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

// ============================================================================
// Vessel CRUD
// ============================================================================

/**
 * Get paginated list of vessels
 * GET /api/Vessels
 */
export async function getVessels(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<VesselDto>>> {
  const searchParams = new URLSearchParams();
  if (params?.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize) searchParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection) searchParams.append("sortDirection", params.sortDirection);
  
  const url = searchParams.toString() ? `${API_BASE}?${searchParams.toString()}` : API_BASE;
  return apiGetMain<PagedResult<VesselDto>>(url);
}

/**
 * Get vessel by ID
 * GET /api/Vessels/{id}
 */
export async function getVesselById(id: number): Promise<ApiResponse<VesselDto>> {
  return apiGetMain<VesselDto>(`${API_BASE}/${id}`);
}

/**
 * Create a new vessel
 * POST /api/Vessels
 */
export async function createVessel(
  data: CreateVesselRequest
): Promise<ApiResponse<VesselDto>> {
  return apiPostMain<VesselDto>(API_BASE, data);
}

/**
 * Update a vessel
 * PUT /api/Vessels/{id}
 */
export async function updateVessel(
  id: number,
  data: UpdateVesselRequest
): Promise<ApiResponse<VesselDto>> {
  return apiPutMain<VesselDto>(`${API_BASE}/${id}`, data);
}

/**
 * Delete a vessel
 * DELETE /api/Vessels/{id}
 */
export async function deleteVessel(id: number): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${id}`);
}

