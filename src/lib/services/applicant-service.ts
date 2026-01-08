/**
 * Applicant Service - API integration for applicant operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiPatchMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  ApplicantDto,
  CreateApplicantDto,
  UpdateApplicantDto,
  ApplicantFilters,
  PaginatedResponse,
} from "@/types/seafarer";

const API_BASE = "/seafarer/api/v1/applicants";

/**
 * Get paginated list of applicants
 */
export async function getApplicants(
  filters: ApplicantFilters = {}
): Promise<ApiResponse<PaginatedResponse<ApplicantDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    searchTerm,
    nationalityId,
    genderId,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm) params.append("searchTerm", searchTerm);
  if (nationalityId) params.append("nationalityId", nationalityId.toString());
  if (genderId) params.append("genderId", genderId.toString());

  return apiGetMain<PaginatedResponse<ApplicantDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get applicant by ID
 */
export async function getApplicantById(
  applicantId: number
): Promise<ApiResponse<ApplicantDto>> {
  return apiGetMain<ApplicantDto>(`${API_BASE}/${applicantId}`);
}

/**
 * Create applicant
 */
export async function createApplicant(
  applicantData: CreateApplicantDto
): Promise<ApiResponse<ApplicantDto>> {
  return apiPostMain<ApplicantDto>(API_BASE, applicantData);
}

/**
 * Update applicant
 */
export async function updateApplicant(
  applicantId: number,
  applicantData: UpdateApplicantDto
): Promise<ApiResponse<ApplicantDto>> {
  return apiPutMain<ApplicantDto>(`${API_BASE}/${applicantId}`, applicantData);
}

