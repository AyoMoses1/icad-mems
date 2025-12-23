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

const API_BASE = "/api/v1/Enrollments";

/**
 * Get paginated list of enrollments
 */
export async function getEnrollments(
  filters: EnrollmentFilters = {}
): Promise<ApiResponse<PaginatedResponse<EnrollmentDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    applicantId,
    courseId,
    programId,
    status,
    searchTerm,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (applicantId) params.append("applicantId", applicantId.toString());
  if (courseId) params.append("courseId", courseId.toString());
  if (programId) params.append("programId", programId.toString());
  if (status) params.append("status", status);
  if (searchTerm) params.append("searchTerm", searchTerm);

  return apiGetMain<PaginatedResponse<EnrollmentDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get enrollment by ID
 */
export async function getEnrollmentById(
  enrollmentId: number
): Promise<ApiResponse<EnrollmentDto>> {
  return apiGetMain<EnrollmentDto>(`${API_BASE}/${enrollmentId}`);
}

/**
 * Create enrollment
 */
export async function createEnrollment(
  enrollmentData: CreateEnrollmentDto
): Promise<ApiResponse<EnrollmentDto>> {
  return apiPostMain<EnrollmentDto>(API_BASE, enrollmentData);
}

/**
 * Update enrollment
 */
export async function updateEnrollment(
  enrollmentId: number,
  updates: {
    enrollmentDate?: string;
    status?: string | null;
    completionDate?: string | null;
    grade?: string | null;
  }
): Promise<ApiResponse<EnrollmentDto>> {
  return apiPutMain<EnrollmentDto>(`${API_BASE}/${enrollmentId}`, updates);
}

/**
 * Delete enrollment
 */
export async function deleteEnrollment(
  enrollmentId: number
): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${enrollmentId}`);
}

