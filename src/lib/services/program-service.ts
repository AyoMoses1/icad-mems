/**
 * Program Service - API integration for program operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  ProgramDto,
  ProgramFilters,
  CreateProgramDto,
  UpdateProgramDto,
  PaginatedResponse,
} from "@/types/seafarer";

const API_BASE = "/seafarer/api/v1/programs";

/**
 * Get paginated list of programs
 */
export async function getPrograms(
  filters: ProgramFilters = {}
): Promise<ApiResponse<PaginatedResponse<ProgramDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    searchTerm,
    programType,
    department,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm) params.append("searchTerm", searchTerm);
  if (programType) params.append("programType", programType);
  if (department) params.append("department", department);

  return apiGetMain<PaginatedResponse<ProgramDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get program by ID
 */
export async function getProgramById(
  programId: number,
  includeCourses?: boolean
): Promise<ApiResponse<ProgramDto>> {
  const params = new URLSearchParams();
  if (includeCourses) params.append("includeCourses", "true");
  const query = params.toString();
  return apiGetMain<ProgramDto>(
    `${API_BASE}/${programId}${query ? `?${query}` : ""}`
  );
}

/**
 * Create program
 */
export async function createProgram(
  programData: CreateProgramDto
): Promise<ApiResponse<ProgramDto>> {
  return apiPostMain<ProgramDto>(API_BASE, programData);
}

/**
 * Update program
 */
export async function updateProgram(
  programId: number,
  updates: UpdateProgramDto
): Promise<ApiResponse<ProgramDto>> {
  return apiPutMain<ProgramDto>(`${API_BASE}/${programId}`, updates);
}

