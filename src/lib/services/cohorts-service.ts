/**
 * Cohorts Service - API integration for cohort operations
 * Based on swagger.txt - /api/Cohorts endpoints
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/api/Cohorts";

export interface CohortDto {
  id: string;
  courseId: string;
  startDate: string; // date format
  endDate: string; // date format
  instructorId?: string | null;
  capacity?: number | null;
  status?: string | null;
}

export interface CreateCohortRequest {
  courseId: string;
  startDate: string; // date format
  endDate: string; // date format
  instructorId?: string | null;
  capacity?: number | null;
  status?: string | null;
}

export interface UpdateCohortRequest {
  courseId?: string;
  startDate?: string; // date format
  endDate?: string; // date format
  instructorId?: string | null;
  capacity?: number | null;
  status?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

/**
 * Get paginated list of cohorts
 * GET /api/Cohorts
 */
export async function getCohorts(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<CohortDto>>> {
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
  return apiGetMain<PagedResult<CohortDto>>(url);
}

/**
 * Get cohort by ID
 * GET /api/Cohorts/{id}
 */
export async function getCohortById(id: string): Promise<ApiResponse<CohortDto>> {
  return apiGetMain<CohortDto>(`${API_BASE}/${id}`);
}

/**
 * Create a new cohort
 * POST /api/Cohorts
 */
export async function createCohort(
  data: CreateCohortRequest
): Promise<ApiResponse<CohortDto>> {
  return apiPostMain<CohortDto>(API_BASE, data);
}

/**
 * Update a cohort
 * PUT /api/Cohorts/{id}
 */
export async function updateCohort(
  id: string,
  data: UpdateCohortRequest
): Promise<ApiResponse<CohortDto>> {
  return apiPutMain<CohortDto>(`${API_BASE}/${id}`, data);
}

/**
 * Delete a cohort
 * DELETE /api/Cohorts/{id}
 */
export async function deleteCohort(id: string): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${id}`);
}

/**
 * Get enrollments for a cohort
 * GET /api/Cohorts/{cohortId}/enrollments
 */
export async function getCohortEnrollments(
  cohortId: string
): Promise<ApiResponse<any[]>> {
  return apiGetMain<any[]>(`${API_BASE}/${cohortId}/enrollments`);
}

