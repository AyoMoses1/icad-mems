import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
} from "@/lib/api-client";

export interface RankDto {
  id: string;
  departmentId: string;
  title?: string;
  seniorityLevel: number;
  category?: string;
  description?: string;
  createdAt?: string;
}

export interface CreateRankRequest {
  departmentId: string;
  title?: string;
  seniorityLevel: number;
  category?: string;
  description?: string;
}

export interface UpdateRankRequest {
  departmentId?: string;
  title?: string;
  seniorityLevel?: number;
  category?: string;
  description?: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

export async function getRanks(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<PagedResult<RankDto>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection) queryParams.append("sortDirection", params.sortDirection);

  const response = await apiGetMain<PagedResult<RankDto>>(
    `/api/Ranks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch ranks");
  }

  return response.data;
}

export async function getRankById(id: string): Promise<RankDto> {
  const response = await apiGetMain<RankDto>(`/api/Ranks/${id}`);

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch rank");
  }

  return response.data;
}

export async function createRank(data: CreateRankRequest): Promise<RankDto> {
  const response = await apiPostMain<RankDto>("/api/Ranks", data);

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || "Failed to create rank");
  }

  return response.data;
}

export async function updateRank(id: string, data: UpdateRankRequest): Promise<boolean> {
  const response = await apiPutMain<boolean>(`/api/Ranks/${id}`, data);

  if (!response.success) {
    throw new Error(response.error?.message || "Failed to update rank");
  }

  return response.data ?? true;
}

export async function deleteRank(id: string): Promise<boolean> {
  const response = await apiDeleteMain<boolean>(`/api/Ranks/${id}`);

  if (!response.success) {
    throw new Error(response.error?.message || "Failed to delete rank");
  }

  return response.data ?? true;
}

