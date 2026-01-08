/**
 * Statistics Service - API integration for statistics endpoints
 * Based on COMPLETE_API_INTEGRATION_GUIDE.md
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/statistics";

/**
 * Statistics DTO
 */
export interface StatisticsDto {
  totalSeafarers?: number;
  totalApplications?: number;
  totalInstitutions?: number;
  totalServices?: number;
  pendingApplications?: number;
  approvedApplications?: number;
  rejectedApplications?: number;
  totalRevenue?: number;
  [key: string]: unknown; // Allow additional fields
}

/**
 * Get public statistics (no authentication required)
 * GET /seafarer/api/v1/Statistics/public
 */
export async function getPublicStatistics(): Promise<
  ApiResponse<StatisticsDto>
> {
  return apiGetMain<StatisticsDto>(`${API_BASE}/public`);
}

/**
 * Get admin statistics (requires admin authentication)
 * GET /seafarer/api/v1/Statistics/admin
 */
export async function getAdminStatistics(): Promise<
  ApiResponse<StatisticsDto>
> {
  return apiGetMain<StatisticsDto>(`${API_BASE}/admin`);
}

