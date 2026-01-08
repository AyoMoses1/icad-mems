/**
 * Inspection Service
 * Handles inspection schedules and reports (Officer/Inspector only)
 */

import { apiGetMain, apiPostMain, apiPutMain, apiPatchMain } from "@/lib/api-client";

// Match swagger.json paths exactly
const API_BASE = "/seafarer/api/v1/inspection";

// ============================================================================
// Types
// ============================================================================

export interface InspectionScheduleDto {
  id: string;
  institutionId: string;
  institutionName?: string;
  scheduledDate: string;
  inspectionType: string;
  inspectorId?: string;
  inspectorName?: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInspectionScheduleRequest {
  institutionId: string;
  scheduledDate: string;
  inspectionType: string;
  inspectorId?: string;
  notes?: string;
}

export interface UpdateInspectionScheduleRequest {
  scheduledDate?: string;
  inspectionType?: string;
  notes?: string;
}

export interface InspectionReportDto {
  id: string;
  inspectionScheduleId: string;
  institutionId: string;
  institutionName?: string;
  reportStatus: string;
  findings?: string;
  recommendations?: string;
  complianceScore?: number;
  inspectorId?: string;
  inspectorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInspectionReportRequest {
  inspectionScheduleId: string;
  institutionId: string;
  reportStatus?: string;
  findings?: string;
  recommendations?: string;
  complianceScore?: number;
}

export interface UpdateInspectionReportRequest {
  reportStatus?: string;
  findings?: string;
  recommendations?: string;
  complianceScore?: number;
}

export interface ApproveInspectionReportRequest {
  approved: boolean;
  notes?: string;
}

export interface InspectionFilters {
  institutionId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ReportFilters {
  institutionId?: string;
  reportStatus?: string;
  pageNumber?: number;
  pageSize?: number;
}

// ============================================================================
// Inspection Schedule Functions
// ============================================================================

/**
 * Create a new inspection schedule (Officer only)
 */
export async function createInspectionSchedule(request: CreateInspectionScheduleRequest) {
  return apiPostMain<InspectionScheduleDto>(`${API_BASE}/schedules`, request);
}

/**
 * Update an inspection schedule
 */
export async function updateInspectionSchedule(
  inspectionScheduleId: string,
  request: UpdateInspectionScheduleRequest
) {
  return apiPatchMain<InspectionScheduleDto>(
    `${API_BASE}/schedules/${inspectionScheduleId}`,
    request
  );
}

/**
 * Get scheduled inspections with filters
 */
export async function getInspectionSchedules(filters?: InspectionFilters) {
  const params = new URLSearchParams();
  if (filters?.institutionId) params.append("institutionId", filters.institutionId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.fromDate) params.append("fromDate", filters.fromDate);
  if (filters?.toDate) params.append("toDate", filters.toDate);
  if (filters?.pageNumber) params.append("pageNumber", filters.pageNumber.toString());
  if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());

  const query = params.toString();
  return apiGetMain<InspectionScheduleDto[]>(
    `${API_BASE}/schedules${query ? `?${query}` : ""}`
  );
}

/**
 * Get inspection schedule by ID
 */
export async function getInspectionScheduleById(inspectionScheduleId: string) {
  return apiGetMain<InspectionScheduleDto>(
    `${API_BASE}/schedules/${inspectionScheduleId}`
  );
}

// ============================================================================
// Inspection Report Functions
// ============================================================================

/**
 * Create an inspection report (Inspector only)
 */
export async function createInspectionReport(request: CreateInspectionReportRequest) {
  return apiPostMain<InspectionReportDto>(`${API_BASE}/reports`, request);
}

/**
 * Update an inspection report (Inspector only - DRAFT status only)
 */
export async function updateInspectionReport(
  inspectionReportId: string,
  request: UpdateInspectionReportRequest
) {
  return apiPutMain<InspectionReportDto>(
    `${API_BASE}/reports/${inspectionReportId}`,
    request
  );
}

/**
 * Submit an inspection report for approval (Inspector only)
 */
export async function submitInspectionReport(inspectionReportId: string) {
  return apiPostMain<InspectionReportDto>(
    `${API_BASE}/reports/${inspectionReportId}/submit`
  );
}

/**
 * Approve/reject an inspection report (Officer only)
 */
export async function approveInspectionReport(
  inspectionReportId: string,
  request: ApproveInspectionReportRequest
) {
  return apiPostMain<InspectionReportDto>(
    `${API_BASE}/reports/${inspectionReportId}/approve`,
    request
  );
}

/**
 * Get inspection reports with filters
 */
export async function getInspectionReports(filters?: ReportFilters) {
  const params = new URLSearchParams();
  if (filters?.institutionId) params.append("institutionId", filters.institutionId);
  if (filters?.reportStatus) params.append("reportStatus", filters.reportStatus);
  if (filters?.pageNumber) params.append("pageNumber", filters.pageNumber.toString());
  if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());

  const query = params.toString();
  return apiGetMain<InspectionReportDto[]>(
    `${API_BASE}/reports${query ? `?${query}` : ""}`
  );
}

/**
 * Get inspection report by ID
 */
export async function getInspectionReportById(inspectionReportId: string) {
  return apiGetMain<InspectionReportDto>(
    `${API_BASE}/reports/${inspectionReportId}`
  );
}

