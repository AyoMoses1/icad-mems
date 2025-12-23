/**
 * User Service - API integration for user/seafarer profile operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiPatchMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  UserProfileDto,
  UpdateUserProfileDto,
  UserStatusHistoryDto,
  UserFilters,
  PaginatedResponse,
} from "@/types/seafarer";

const API_BASE = "/api/v1/Users";

/**
 * Get paginated list of users
 */
export async function getUsers(
  filters: UserFilters = {}
): Promise<ApiResponse<PaginatedResponse<UserProfileDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    searchTerm,
    userTypeId,
    status,
    isActive,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm) params.append("searchTerm", searchTerm);
  if (userTypeId) params.append("userTypeId", userTypeId.toString());
  if (status) params.append("status", status);
  if (isActive !== undefined) params.append("isActive", isActive.toString());

  return apiGetMain<PaginatedResponse<UserProfileDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get current user profile (me)
 */
export async function getCurrentUserProfile(): Promise<
  ApiResponse<UserProfileDto>
> {
  return apiGetMain<UserProfileDto>(`${API_BASE}/me`);
}

/**
 * Get current user profile details
 */
export async function getCurrentUserProfileDetails(): Promise<
  ApiResponse<UserProfileDto>
> {
  return apiGetMain<UserProfileDto>(`${API_BASE}/me/profile`);
}

/**
 * Update current user profile
 */
export async function updateCurrentUserProfile(
  profileData: UpdateUserProfileDto
): Promise<ApiResponse<UserProfileDto>> {
  return apiPutMain<UserProfileDto>(`${API_BASE}/me/profile`, profileData);
}

/**
 * Get user status history
 */
export async function getUserStatusHistory(): Promise<
  ApiResponse<UserStatusHistoryDto[]>
> {
  return apiGetMain<UserStatusHistoryDto[]>(`${API_BASE}/me/status-history`);
}

/**
 * Get user by ID
 */
export async function getUserById(
  userId: number
): Promise<ApiResponse<UserProfileDto>> {
  return apiGetMain<UserProfileDto>(`${API_BASE}/${userId}`);
}

/**
 * Update user status (admin only)
 */
export async function updateUserStatus(
  userId: number,
  statusData: { status: string; reason?: string }
): Promise<ApiResponse<UserProfileDto>> {
  return apiPatchMain<UserProfileDto>(
    `${API_BASE}/${userId}/status`,
    statusData
  );
}

