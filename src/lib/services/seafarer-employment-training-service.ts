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
  contractType: string | null;
  startDate: string | null;
  endDate: string | null;
  basicWage: number | null;
  overtimeRate: number | null;
  leavePay: string | null;
  repatriation: string | null;
  insurance: string | null;
  specialTerms: string | null;
  contractStatus: string;
  employmentStatus: string | null;
  acceptanceStatus: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  dateCreated: string | null;
}

export interface CreateSeafarerEmploymentRequest {
  seafarerRN: string;
  rankId: string;
  contractType?: string;
  startDate?: string;
  endDate?: string;
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

export interface PagedSeafarerEmploymentsDto {
  items: SeafarerEmploymentDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface GetSeafarerEmploymentsParams {
  acceptanceStatus?: string;
  activeOnly?: boolean;
  contractStatus?: string;
  employmentStatus?: string;
  seafarerRn?: string;
  rankId?: string;
  dateFrom?: string;
  dateTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

function buildEmploymentsQuery(params?: GetSeafarerEmploymentsParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.acceptanceStatus != null && params.acceptanceStatus !== "")
    search.set("acceptanceStatus", params.acceptanceStatus);
  if (params.activeOnly === true) search.set("activeOnly", "true");
  if (params.contractStatus != null && params.contractStatus !== "")
    search.set("contractStatus", params.contractStatus);
  if (params.employmentStatus != null && params.employmentStatus !== "")
    search.set("employmentStatus", params.employmentStatus);
  if (params.seafarerRn != null && params.seafarerRn !== "")
    search.set("seafarerRn", params.seafarerRn);
  if (params.rankId != null && params.rankId !== "")
    search.set("rankId", params.rankId);
  if (params.dateFrom != null && params.dateFrom !== "")
    search.set("dateFrom", params.dateFrom);
  if (params.dateTo != null && params.dateTo !== "")
    search.set("dateTo", params.dateTo);
  if (params.pageNumber != null) search.set("pageNumber", String(params.pageNumber));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  const q = search.toString();
  return q ? `?${q}` : "";
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

/** List current company employments (paged). Requires SEAFARER_EMPLOYER permit. */
export async function getSeafarerEmployments(
  params?: GetSeafarerEmploymentsParams
): Promise<PagedSeafarerEmploymentsDto> {
  const query = buildEmploymentsQuery(params);
  const response = await apiGetMain<PagedSeafarerEmploymentsDto>(
    `${BASE}/seafarer-employment${query}`
  );
  if (!response.success) {
    throw new Error(
      response.error?.message ?? response.message ?? "List employments failed."
    );
  }
  return (
    response.data ?? {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
    }
  );
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

/** List employment offers for the current seafarer. Optional: pending only. */
export async function getMyEmploymentOffers(
  pendingOnly = false
): Promise<SeafarerEmploymentDto[]> {
  const q = pendingOnly ? "?pendingOnly=true" : "";
  const response = await apiGetMain<SeafarerEmploymentDto[]>(
    `${BASE}/seafarer-employment/my-offers${q}`
  );
  if (!response.success) {
    throw new Error(
      response.error?.message ?? response.message ?? "List my offers failed."
    );
  }
  return response.data ?? [];
}

/** Seafarer accepts an employment offer. */
export async function acceptEmploymentOffer(
  id: string
): Promise<SeafarerEmploymentDto> {
  const response = await apiPost<SeafarerEmploymentDto>(
    `${BASE}/seafarer-employment/${id}/accept`,
    {}
  );
  if (!response.success || !response.data) {
    throw new ApiError(
      response.error?.code ?? "UNKNOWN",
      response.error?.message ?? response.message ?? "Accept offer failed."
    );
  }
  return response.data;
}

/** Seafarer rejects an employment offer. */
export async function rejectEmploymentOffer(
  id: string
): Promise<SeafarerEmploymentDto> {
  const response = await apiPost<SeafarerEmploymentDto>(
    `${BASE}/seafarer-employment/${id}/reject`,
    {}
  );
  if (!response.success || !response.data) {
    throw new ApiError(
      response.error?.code ?? "UNKNOWN",
      response.error?.message ?? response.message ?? "Reject offer failed."
    );
  }
  return response.data;
}

// --- Ship assignments (API docs: https://localhost:64486/index.html) ---
export interface SeafarerShipAssignmentDto {
  seafarerShipAssignmentId: string;
  seafarerEmploymentId: string;
  vesselName: string | null;
  vesselIMO: string | null;
  joiningPort: string | null;
  tradingArea: string | null;
  assignmentStartDate: string | null;
  assignmentEndDate: string | null;
  status: string;
  dateCreated: string | null;
  seafarerRN: string | null;
  seafarerFullName: string | null;
  rankDescription: string | null;
}

export interface CreateShipAssignmentRequest {
  vesselName?: string;
  vesselIMO?: string;
  joiningPort?: string;
  tradingArea?: string;
  assignmentStartDate?: string;
  assignmentEndDate?: string;
}

/** Create ship assignment for an accepted employment. Requires SEAFARER_EMPLOYER permit. */
export async function createShipAssignment(
  employmentId: string,
  body: CreateShipAssignmentRequest
): Promise<SeafarerShipAssignmentDto> {
  const response = await apiPost<SeafarerShipAssignmentDto>(
    `${BASE}/seafarer-employment/${employmentId}/ship-assignments`,
    body
  );
  if (!response.success || !response.data) {
    throw new Error(
      response.error?.message ?? response.message ?? "Create ship assignment failed."
    );
  }
  return response.data;
}

/** List ship assignments for an employment. */
export async function getShipAssignments(
  employmentId: string
): Promise<SeafarerShipAssignmentDto[]> {
  const response = await apiGetMain<SeafarerShipAssignmentDto[]>(
    `${BASE}/seafarer-employment/${employmentId}/ship-assignments`
  );
  if (!response.success) {
    throw new Error(
      response.error?.message ?? response.message ?? "List ship assignments failed."
    );
  }
  return response.data ?? [];
}

/** End a ship assignment. */
export async function endShipAssignment(
  assignmentId: string
): Promise<SeafarerShipAssignmentDto> {
  const response = await apiPut<SeafarerShipAssignmentDto>(
    `${BASE}/ship-assignments/${assignmentId}/end`,
    {}
  );
  if (!response.success || !response.data) {
    throw new Error(
      response.error?.message ?? response.message ?? "End ship assignment failed."
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
