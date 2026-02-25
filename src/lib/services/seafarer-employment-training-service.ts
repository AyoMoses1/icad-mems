/**
 * Seafarer Employment & Training API
 * Integrates with seafarer/api/v1/ per seafarer-employment-training-frontend-guide.md
 * and seafarer-search-and-employment-frontend-guide.md
 */

import {
  apiGetMain,
  apiPost,
  apiPut,
  apiPostMultipart,
  ApiError,
} from "@/lib/api-client";

const BASE = "/seafarer/api/v1";

// --- Seafarer search ---
export interface SeafarerSearchResultDto {
  rn: string;
  sin: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  currentRankId: string;
  currentRankDescription: string | null;
  nationalityDescription: string | null;
  dob: string | null;
  isApprove: boolean;
}

/** Search seafarer by SIN or RN (GET). Requires SEAFARER_EMPLOYER permit. Returns null if not found (404). */
export async function searchSeafarer(
  identification: string
): Promise<SeafarerSearchResultDto | null> {
  try {
    const response = await apiGetMain<SeafarerSearchResultDto>(
      `${BASE}/seafarers/search?identification=${encodeURIComponent(identification)}`
    );
    if (response.success && response.data) return response.data;
    if (response.error?.code === "SEAFARER_NOT_FOUND") return null;
    throw new Error(
      response.error?.message ?? response.message ?? "Search failed."
    );
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) return null;
    throw e;
  }
}

// --- Employment ---
export interface SeafarerEmploymentDto {
  seafarerEmploymentId: string;
  companyId: string;
  companyLegalName: string | null;
  seafarerRN: string;
  seafarerSIN: string | null;
  seafarerFullName: string | null;
  rankId: string;
  rankDescription: string | null;
  vesselName: string | null;
  vesselIMO: string | null;
  contractType: string | null;
  startDate: string | null;
  endDate: string | null;
  joiningPort: string | null;
  tradingArea: string | null;
  basicWage: number | null;
  overtimeRate: number | null;
  leavePay: string | null;
  repatriation: string | null;
  insurance: string | null;
  specialTerms: string | null;
  contractStatus: string;
  employmentStatus: string | null;
  dateCreated: string | null;
}

export interface CreateSeafarerEmploymentRequest {
  seafarerRN: string;
  rankId: string;
  vesselName?: string;
  vesselIMO?: string;
  contractType?: string;
  startDate?: string;
  endDate?: string;
  joiningPort?: string;
  tradingArea?: string;
  basicWage?: number;
  overtimeRate?: number;
  leavePay?: string;
  repatriation?: string;
  insurance?: string;
  specialTerms?: string;
  contractStatus?: string;
  employmentStatus?: string;
}

export interface UpdateSeafarerEmploymentStatusRequest {
  contractStatus: string;
}

/** Create employment. Requires SEAFARER_EMPLOYER permit. */
export async function createSeafarerEmployment(
  body: CreateSeafarerEmploymentRequest
): Promise<SeafarerEmploymentDto> {
  const response = await apiPost<SeafarerEmploymentDto>(
    `${BASE}/seafarer-employment`,
    body
  );
  if (!response.success || !response.data) {
    throw new Error(
      response.error?.message ?? response.message ?? "Create employment failed."
    );
  }
  return response.data;
}

/** List current company employments. Requires SEAFARER_EMPLOYER permit. */
export async function getSeafarerEmployments(): Promise<SeafarerEmploymentDto[]> {
  const response = await apiGetMain<SeafarerEmploymentDto[]>(
    `${BASE}/seafarer-employment`
  );
  if (!response.success) {
    throw new Error(
      response.error?.message ?? response.message ?? "List employments failed."
    );
  }
  return response.data ?? [];
}

/** Update contract status (e.g. Draft → Sent → Signed). */
export async function updateSeafarerEmploymentStatus(
  id: string,
  contractStatus: string
): Promise<SeafarerEmploymentDto> {
  const response = await apiPut<SeafarerEmploymentDto>(
    `${BASE}/seafarer-employment/${id}/status`,
    { contractStatus }
  );
  if (!response.success || !response.data) {
    throw new Error(
      response.error?.message ?? response.message ?? "Update status failed."
    );
  }
  return response.data;
}

// --- Training upload ---
export interface SeafarerTrainingRowErrorDto {
  rowIndex: number;
  message: string;
  column?: string | null;
}

export interface SeafarerTrainingUploadResultDto {
  uploadId: string;
  fileName: string;
  totalRows: number;
  savedCount: number;
  errorCount: number;
  errors: SeafarerTrainingRowErrorDto[];
}

/** Upload training result file (xlsx, xls, csv). Requires training institute permit. */
export async function uploadTrainingResult(
  file: File
): Promise<SeafarerTrainingUploadResultDto> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiPostMultipart<SeafarerTrainingUploadResultDto>(
    `${BASE}/training/upload`,
    formData
  );
  if (!response.success || !response.data) {
    throw new Error(
      response.error?.message ?? response.message ?? "Upload failed."
    );
  }
  return response.data;
}
