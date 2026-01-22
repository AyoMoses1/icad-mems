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

const API_BASE = "/seafarer/api/v1/cohorts"; // ⚠️ This endpoint does not exist in swagger.json

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
 * ⚠️ DEPRECATED: The /seafarer/api/v1/cohorts endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCohorts(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<CohortDto>>> {
  // Endpoint /seafarer/api/v1/cohorts does not exist in swagger.json
  const pageNumber = params?.pageNumber || 1;
  const pageSize = params?.pageSize || 100;
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/cohorts does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: {
      items: [],
      pageNumber,
      pageSize,
      totalNumber: 0,
    },
  };
}

/**
 * Get cohort by ID
 * ⚠️ DEPRECATED: The /seafarer/api/v1/cohorts/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCohortById(id: string): Promise<ApiResponse<CohortDto>> {
  // Endpoint /seafarer/api/v1/cohorts/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/cohorts/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Create a new cohort
 * ⚠️ DEPRECATED: The /seafarer/api/v1/cohorts endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createCohort(
  data: CreateCohortRequest
): Promise<ApiResponse<CohortDto>> {
  // Endpoint /seafarer/api/v1/cohorts does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/cohorts does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Update a cohort
 * ⚠️ DEPRECATED: The /seafarer/api/v1/cohorts/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateCohort(
  id: string,
  data: UpdateCohortRequest
): Promise<ApiResponse<CohortDto>> {
  // Endpoint /seafarer/api/v1/cohorts/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/cohorts/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Delete a cohort
 * ⚠️ DEPRECATED: The /seafarer/api/v1/cohorts/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteCohort(id: string): Promise<ApiResponse<void>> {
  // Endpoint /seafarer/api/v1/cohorts/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/cohorts/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Get enrollments for a cohort
 * ⚠️ DEPRECATED: The /seafarer/api/v1/cohorts/{cohortId}/enrollments endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCohortEnrollments(
  cohortId: string
): Promise<ApiResponse<any[]>> {
  // Endpoint /seafarer/api/v1/cohorts/{cohortId}/enrollments does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/cohorts/{cohortId}/enrollments does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

