/**
 * Deficiency Service
 * Handles deficiency reports (Officer creates, Institution/Agent responds, Officer resolves)
 */

import { apiGetMain, apiPostMain } from "@/lib/api-client";

// Match swagger.json paths exactly
const API_BASE = "/seafarer/api/v1/deficiency";

// ============================================================================
// Types
// ============================================================================

export interface DeficiencyReportDto {
  id: string;
  institutionId: string;
  institutionName?: string;
  deficiencyType: string;
  description?: string;
  severity: string;
  status: string;
  dueDate?: string;
  response?: string;
  evidenceUrls?: string[];
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeficiencyRequest {
  institutionId: string;
  deficiencyType: string;
  description?: string;
  severity: string;
  dueDate?: string;
}

export interface RespondToDeficiencyRequest {
  response: string;
  evidenceUrls?: string[];
}

export interface ResolveDeficiencyRequest {
  resolved: boolean;
  notes?: string;
}

export interface DeficiencyFilters {
  institutionId?: string;
  status?: string;
  severity?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Deficiency severity levels
export const DEFICIENCY_SEVERITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

// Deficiency status values
export const DEFICIENCY_STATUS = {
  OPEN: "OPEN",
  RESPONDED: "RESPONDED",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

// Deficiency type values
export const DEFICIENCY_TYPE = {
  FACILITY: "FACILITY",
  EQUIPMENT: "EQUIPMENT",
  DOCUMENTATION: "DOCUMENTATION",
  PERSONNEL: "PERSONNEL",
  TRAINING: "TRAINING",
  SAFETY: "SAFETY",
  OTHER: "OTHER",
} as const;

// ============================================================================
// Functions
// ============================================================================

/**
 * Create a deficiency report (Officer only)
 */
export async function createDeficiencyReport(request: CreateDeficiencyRequest) {
  return apiPostMain<DeficiencyReportDto>(`${API_BASE}`, request);
}

/**
 * Respond to a deficiency (Institution/Agent only)
 */
export async function respondToDeficiency(
  deficiencyReportId: string,
  request: RespondToDeficiencyRequest
) {
  return apiPostMain<DeficiencyReportDto>(
    `${API_BASE}/${deficiencyReportId}/respond`,
    request
  );
}

/**
 * Resolve a deficiency (Officer only)
 */
export async function resolveDeficiency(
  deficiencyReportId: string,
  request: ResolveDeficiencyRequest
) {
  return apiPostMain<DeficiencyReportDto>(
    `${API_BASE}/${deficiencyReportId}/resolve`,
    request
  );
}

/**
 * Get deficiency reports with filters
 */
export async function getDeficiencyReports(filters?: DeficiencyFilters) {
  const params = new URLSearchParams();
  if (filters?.institutionId) params.append("institutionId", filters.institutionId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.severity) params.append("severity", filters.severity);
  if (filters?.pageNumber) params.append("pageNumber", filters.pageNumber.toString());
  if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());

  const query = params.toString();
  return apiGetMain<DeficiencyReportDto[]>(`${API_BASE}${query ? `?${query}` : ""}`);
}

/**
 * Get deficiency report by ID
 */
export async function getDeficiencyReportById(deficiencyReportId: string) {
  return apiGetMain<DeficiencyReportDto>(`${API_BASE}/${deficiencyReportId}`);
}

