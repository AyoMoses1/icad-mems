/**
 * Enrollment Service - API integration for enrollment operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  EnrollmentDto,
  CreateEnrollmentDto,
  EnrollmentFilters,
  PaginatedResponse,
} from "@/types/seafarer";

const API_BASE = "/api/Enrollments"; // ⚠️ This endpoint does not exist in swagger.json

/**
 * Get paginated list of enrollments
 * ⚠️ DEPRECATED: The /api/Enrollments endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getEnrollments(
  filters: EnrollmentFilters = {}
): Promise<ApiResponse<PaginatedResponse<EnrollmentDto>>> {
  // Endpoint /api/Enrollments does not exist in swagger.json
  const pageNumber = filters.pageNumber || 1;
  const pageSize = filters.pageSize || 20;
  return {
    success: false,
    error: { message: "Endpoint /api/Enrollments does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
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
 * Get enrollment by ID
 * ⚠️ DEPRECATED: The /api/Enrollments/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getEnrollmentById(
  enrollmentId: string
): Promise<ApiResponse<EnrollmentDto>> {
  // Endpoint /api/Enrollments/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Enrollments/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Create enrollment
 * ⚠️ DEPRECATED: The /api/Enrollments endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createEnrollment(
  enrollmentData: {
    cohortId: string;
    studentId: string;
    enrollmentDate?: string | null;
  }
): Promise<ApiResponse<EnrollmentDto>> {
  // Endpoint /api/Enrollments does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Enrollments does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Update enrollment
 * ⚠️ DEPRECATED: The /api/Enrollments/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateEnrollment(
  enrollmentId: string,
  updates: {
    enrollmentDate?: string;
    status?: string | null;
    completionDate?: string | null;
    grade?: string | null;
  }
): Promise<ApiResponse<EnrollmentDto>> {
  // Endpoint /api/Enrollments/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Enrollments/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Delete enrollment
 * ⚠️ DEPRECATED: The /api/Enrollments/{id} endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteEnrollment(
  enrollmentId: string
): Promise<ApiResponse<void>> {
  // Endpoint /api/Enrollments/{id} does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Enrollments/{id} does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

