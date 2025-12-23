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

const API_BASE = "/api/v1/Courses";

/**
 * Get paginated list of courses
 */
export async function getCourses(
  filters: CourseFilters = {}
): Promise<ApiResponse<PaginatedResponse<CourseDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    programId,
    searchTerm,
    department,
    semesterOffered,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (programId) params.append("programId", programId.toString());
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (department) params.append("department", department);
  if (semesterOffered) params.append("semesterOffered", semesterOffered);

  return apiGetMain<PaginatedResponse<CourseDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get courses for a specific program
 */
export async function getCoursesByProgram(
  programId: number
): Promise<ApiResponse<CourseDto[]>> {
  return apiGetMain<CourseDto[]>(`${API_BASE}/program/${programId}`);
}

/**
 * Get course by ID
 */
export async function getCourseById(
  courseId: number,
  includeProgram?: boolean,
  includeEnrollments?: boolean
): Promise<ApiResponse<CourseDto>> {
  const params = new URLSearchParams();
  if (includeProgram) params.append("includeProgram", "true");
  if (includeEnrollments) params.append("includeEnrollments", "true");
  const query = params.toString();
  return apiGetMain<CourseDto>(
    `${API_BASE}/${courseId}${query ? `?${query}` : ""}`
  );
}

/**
 * Create course
 */
export async function createCourse(
  courseData: CreateCourseDto
): Promise<ApiResponse<CourseDto>> {
  return apiPostMain<CourseDto>(API_BASE, courseData);
}

/**
 * Update course
 */
export async function updateCourse(
  courseId: number,
  updates: UpdateCourseDto
): Promise<ApiResponse<CourseDto>> {
  return apiPutMain<CourseDto>(`${API_BASE}/${courseId}`, updates);
}

/**
 * Delete course
 */
export async function deleteCourse(
  courseId: number
): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${courseId}`);
}

