/**
 * Medical Institutes Service - API integration for medical institute operations
 * Based on swagger.txt - /api/MedicalInstitutes endpoint
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

// NOTE: Medical institutes endpoint not found in swagger.json
// The endpoint /seafarer/api/v1/medical-institutes might not exist on backend
// Consider using /seafarer/api/v1/Accreditation/institutions with institutionType filter
// or check with backend team for correct endpoint
const API_BASE = "/seafarer/api/v1/medical-institutes";

export interface MedicalInstituteDto {
  institutionId: string;
  clinicLicenseNo?: string | null;
  numApprovedDoctors?: number | null;
  laboratoryEquipped?: boolean | null;
}

export interface CreateMedicalInstituteRequest {
  institutionId: string;
  clinicLicenseNo?: string | null;
  numApprovedDoctors?: number | null;
  laboratoryEquipped?: boolean | null;
}

export interface UpdateMedicalInstituteRequest {
  clinicLicenseNo?: string | null;
  numApprovedDoctors?: number | null;
  laboratoryEquipped?: boolean | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

/**
 * Get all medical institutes
 * GET /api/MedicalInstitutes
 */
export async function getMedicalInstitutes(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<PagedResult<MedicalInstituteDto>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);

  const response = await apiGetMain<any>(
    `${API_BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(
      response.error?.message ||
        response.message ||
        "Failed to fetch medical institutes"
    );
  }

  const data = response.data;
  const items =
    (data && Array.isArray(data.items) && data.items) ||
    (Array.isArray(data) ? data : []);

  return {
    items,
    pageNumber: data?.pageNumber || params?.pageNumber || 1,
    pageSize: data?.pageSize || params?.pageSize || items.length || 0,
    totalNumber: data?.totalNumber || items.length,
  };
}

/**
 * Get medical institute by ID
 * GET /api/MedicalInstitutes/{institutionId}
 */
export async function getMedicalInstituteById(
  institutionId: string
): Promise<MedicalInstituteDto> {
  const response = await apiGetMain<MedicalInstituteDto>(
    `${API_BASE}/${institutionId}`
  );

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(
      response.error?.message || response.message || "Failed to fetch medical institute"
    );
  }

  return response.data;
}

/**
 * Create a new medical institute
 * POST /api/MedicalInstitutes
 */
export async function createMedicalInstitute(
  data: CreateMedicalInstituteRequest
): Promise<MedicalInstituteDto> {
  const response = await apiPostMain<MedicalInstituteDto>(API_BASE, data);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(
      response.error?.message || response.message || "Failed to create medical institute"
    );
  }

  return response.data;
}

/**
 * Update a medical institute
 * PUT /api/MedicalInstitutes/{institutionId}
 */
export async function updateMedicalInstitute(
  institutionId: string,
  data: UpdateMedicalInstituteRequest
): Promise<boolean> {
  const response = await apiPutMain<boolean>(`${API_BASE}/${institutionId}`, data);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(
      response.error?.message || response.message || "Failed to update medical institute"
    );
  }

  return response.data ?? true;
}

/**
 * Delete a medical institute
 * DELETE /api/MedicalInstitutes/{institutionId}
 */
export async function deleteMedicalInstitute(
  institutionId: string
): Promise<boolean> {
  const response = await apiDeleteMain<boolean>(`${API_BASE}/${institutionId}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(
      response.error?.message || response.message || "Failed to delete medical institute"
    );
  }

  return response.data ?? true;
}

