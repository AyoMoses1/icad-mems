/**
 * Audit Log Service
 * GET /seafarer/api/v1/audit-logs/my-logs - current user's audit logs
 * GET /seafarer/api/v1/audit-logs/admin - admin view (filtered, all users)
 * Types match swagger: AuditLogDto, AuditLogAdminDto
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";

const MY_LOGS_PATH = "/seafarer/api/v1/audit-logs/my-logs";
const ADMIN_LOGS_PATH = "/seafarer/api/v1/audit-logs/admin";

// ============================================================================
// Types (from swagger)
// ============================================================================

/** Single audit log entry for normal user (no userId in response) */
export interface AuditLogDto {
  auditLogId: string;
  timestamp: string;
  auditType?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  action?: string | null;
  details?: string | null;
  success?: boolean | null;
  requestPath?: string | null;
  httpMethod?: string | null;
}

/** Admin audit log entry (includes userId) */
export interface AuditLogAdminDto extends AuditLogDto {
  userId: string;
}

export interface AuditLogsAdminFilters {
  userId?: string;
  entityType?: string;
  action?: string;
  fromDate?: string; // ISO date-time
  toDate?: string;
  success?: boolean;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// API functions
// ============================================================================

/**
 * Get current user's audit logs (for seafarer/normal user).
 * GET /seafarer/api/v1/audit-logs/my-logs?page=&pageSize=
 */
export async function getMyAuditLogs(
  page?: number,
  pageSize?: number
): Promise<ApiResponse<AuditLogDto[]>> {
  const params = new URLSearchParams();
  if (page != null) params.append("page", String(page));
  if (pageSize != null) params.append("pageSize", String(pageSize));
  const query = params.toString();
  return apiGetMain<AuditLogDto[]>(
    `${MY_LOGS_PATH}${query ? `?${query}` : ""}`
  );
}

/**
 * Get audit logs for admin (all users, with filters).
 * GET /seafarer/api/v1/audit-logs/admin
 */
export async function getAdminAuditLogs(
  filters?: AuditLogsAdminFilters
): Promise<ApiResponse<AuditLogAdminDto[]>> {
  const params = new URLSearchParams();
  if (filters?.userId) params.append("userId", filters.userId);
  if (filters?.entityType) params.append("entityType", filters.entityType);
  if (filters?.action) params.append("action", filters.action);
  if (filters?.fromDate) params.append("fromDate", filters.fromDate);
  if (filters?.toDate) params.append("toDate", filters.toDate);
  if (filters?.success !== undefined)
    params.append("success", String(filters.success));
  if (filters?.page != null) params.append("page", String(filters.page));
  if (filters?.pageSize != null)
    params.append("pageSize", String(filters.pageSize));
  const query = params.toString();
  return apiGetMain<AuditLogAdminDto[]>(
    `${ADMIN_LOGS_PATH}${query ? `?${query}` : ""}`
  );
}
