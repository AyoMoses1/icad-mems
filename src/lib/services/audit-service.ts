/**
 * Audit Service
 * Handles follow-up audits (Officer schedules, Inspector/Officer updates)
 */

import { apiGetMain, apiPostMain, apiPutMain } from "@/lib/api-client";

// Match swagger.json paths exactly
const API_BASE = "/seafarer/api/v1/audit";

// ============================================================================
// Types
// ============================================================================

export interface AuditDto {
  id: string;
  institutionId: string;
  institutionName?: string;
  scheduledDate: string;
  auditType: string;
  status: string;
  reason?: string;
  inspectorId?: string;
  inspectorName?: string;
  findings?: string;
  recommendations?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAuditRequest {
  institutionId: string;
  scheduledDate: string;
  auditType: string;
  reason?: string;
  inspectorId?: string;
}

export interface UpdateAuditRequest {
  scheduledDate?: string;
  reason?: string;
  findings?: string;
  recommendations?: string;
}

export interface AuditFilters {
  institutionId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Audit type values
export const AUDIT_TYPE = {
  FOLLOW_UP: "FOLLOW_UP",
  ROUTINE: "ROUTINE",
  SPECIAL: "SPECIAL",
  COMPLIANCE: "COMPLIANCE",
} as const;

// Audit status values
export const AUDIT_STATUS = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

// ============================================================================
// Functions
// ============================================================================

/**
 * Schedule a follow-up audit (Officer only)
 */
export async function createAudit(request: CreateAuditRequest) {
  return apiPostMain<AuditDto>(`${API_BASE}`, request);
}

/**
 * Update a follow-up audit (Inspector/Officer)
 */
export async function updateAudit(auditId: string, request: UpdateAuditRequest) {
  return apiPutMain<AuditDto>(`${API_BASE}/${auditId}`, request);
}

/**
 * Get follow-up audits with filters
 */
export async function getAudits(filters?: AuditFilters) {
  const params = new URLSearchParams();
  if (filters?.institutionId) params.append("institutionId", filters.institutionId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.fromDate) params.append("fromDate", filters.fromDate);
  if (filters?.toDate) params.append("toDate", filters.toDate);
  if (filters?.pageNumber) params.append("pageNumber", filters.pageNumber.toString());
  if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());

  const query = params.toString();
  return apiGetMain<AuditDto[]>(`${API_BASE}${query ? `?${query}` : ""}`);
}

/**
 * Get follow-up audit by ID
 */
export async function getAuditById(auditId: string) {
  return apiGetMain<AuditDto>(`${API_BASE}/${auditId}`);
}

