/**
 * Maritime Departments Service - API integration for maritime department operations
 * Based on swagger.txt - /api/MaritimeDepartments endpoint
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";

const API_BASE = "/api/MaritimeDepartments";

export interface MaritimeDepartmentDto {
  id: string;
  name?: string | null;
}

/**
 * Get all maritime departments
 * GET /api/MaritimeDepartments
 * Uses pagination parameters: page, pageSize, sortDirection
 */
export async function getMaritimeDepartments(params?: {
  page?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<MaritimeDepartmentDto[]>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection) queryParams.append("sortDirection", params.sortDirection);

  const response = await apiGetMain<MaritimeDepartmentDto[]>(
    `${API_BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );

  // Handle response structure: data can be an array directly or wrapped
  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(
      response.error?.message || response.message || "Failed to fetch maritime departments"
    );
  }

  // Return response with data as array
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : [],
  };
}

