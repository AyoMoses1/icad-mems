/**
 * Course Service - API integration for course operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  CourseDto,
  CourseFilters,
  CreateCourseDto,
  UpdateCourseDto,
  PaginatedResponse,
} from "@/types/seafarer";

const API_BASE = "/seafarer/api/v1/courses";

/**
 * Get paginated list of courses
 * ⚠️ DEPRECATED: The /seafarer/api/v1/courses endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCourses(
  filters: CourseFilters = {}
): Promise<ApiResponse<PaginatedResponse<CourseDto>>> {
  // Endpoint /seafarer/api/v1/courses does not exist in swagger.json
  const pageNumber = filters.pageNumber || 1;
  const pageSize = filters.pageSize || 20;
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/courses does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
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
 * Get courses for a specific program
 * ⚠️ DEPRECATED: The /seafarer/api/v1/courses endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCoursesByProgram(
  programId: number
): Promise<ApiResponse<CourseDto[]>> {
  // Endpoint /seafarer/api/v1/courses does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/courses does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Get course by ID
 * ⚠️ DEPRECATED: The /seafarer/api/v1/courses endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getCourseById(
  courseId: number,
  includeProgram?: boolean,
  includeEnrollments?: boolean
): Promise<ApiResponse<CourseDto>> {
  // Endpoint /seafarer/api/v1/courses does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/courses does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Create course
 * ⚠️ DEPRECATED: The /seafarer/api/v1/courses endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createCourse(
  courseData: CreateCourseDto
): Promise<ApiResponse<CourseDto>> {
  // Endpoint /seafarer/api/v1/courses does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/courses does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Update course
 * ⚠️ DEPRECATED: The /seafarer/api/v1/courses endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateCourse(
  courseId: number,
  updates: UpdateCourseDto
): Promise<ApiResponse<CourseDto>> {
  // Endpoint /seafarer/api/v1/courses does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/courses does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

/**
 * Delete course
 * ⚠️ DEPRECATED: The /seafarer/api/v1/courses endpoint does not exist in swagger.json
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteCourse(
  courseId: number
): Promise<ApiResponse<void>> {
  // Endpoint /seafarer/api/v1/courses does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /seafarer/api/v1/courses does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: null,
  };
}

