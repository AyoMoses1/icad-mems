import { apiGetMain, type ApiResponse } from "@/lib/api-client";
import type { UserProfileDto } from "@/types/seafarer";

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

export async function getSeafarers(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
}): Promise<ApiResponse<PagedResult<UserProfileDto>>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.searchTerm) queryParams.append("searchTerm", params.searchTerm);
  if (params?.status) queryParams.append("status", params.status);

  return apiGetMain<PagedResult<UserProfileDto>>(
    `/api/Seafarers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );
}

export interface SeafarerOnboardingStatus {
  completed?: boolean;
  message?: string;
  nextStep?: string;
}

export async function getMySeafarerOnboardingStatus(): Promise<
  ApiResponse<SeafarerOnboardingStatus>
> {
  return apiGetMain<SeafarerOnboardingStatus>(
    "/api/Seafarers/me/onboarding-status",
  );
}

