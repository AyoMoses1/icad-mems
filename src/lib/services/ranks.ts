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
  if (params?.pageNumber)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);

  const response = await apiGetMain<any>(
    `/api/Ranks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(
      response.error?.message || response.message || "Failed to fetch ranks",
    );
  }

  const data = response.data;
  const items =
    (data && Array.isArray(data.items) && data.items) ||
    (Array.isArray(data) ? data : []);

  return {
    items,
    pageNumber: data?.pageNumber || params?.pageNumber || 1,
    pageSize: data?.pageSize || params?.pageSize || items.length || 0,
    totalNumber: data?.totalNumber || items.length,
  };
}

export async function getRankById(id: string): Promise<RankDto> {
  const response = await apiGetMain<RankDto>(`/api/Ranks/${id}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch rank");
  }

  return response.data;
}

export async function createRank(data: CreateRankRequest): Promise<RankDto> {
  const response = await apiPostMain<RankDto>("/seafarer/api/Ranks", data);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to create rank");
  }

  return response.data;
}

export async function updateRank(
  id: string,
  data: UpdateRankRequest,
): Promise<boolean> {
  const response = await apiPutMain<boolean>(`/api/Ranks/${id}`, data);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(response.error?.message || "Failed to update rank");
  }

  return response.data ?? true;
}

export async function deleteRank(id: string): Promise<boolean> {
  const response = await apiDeleteMain<boolean>(`/api/Ranks/${id}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(response.error?.message || "Failed to delete rank");
  }

  return response.data ?? true;
}

/**
 * Get all ranks from MasterData for dropdowns/lookups
 * GET /api/seafarer/MasterData/ranks
 * 
 * API Response format:
 * { ranksId: "guid", rankId: 1, description: "Cadet" }
 */
export async function getAllRanks(): Promise<RankDto[]> {
  const response = await apiGetMain<any>("/api/seafarer/MasterData/ranks");

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(
      response.error?.message || response.message || "Failed to fetch ranks"
    );
  }

  const data = response.data;
  const items = Array.isArray(data) ? data : [];

  // Map API response to RankDto format
  return items.map((item: any) => ({
    id: item.ranksId || item.id || "",
    departmentId: item.departmentId || "",
    title: item.description || item.title || "", // Use description as title for display
    seniorityLevel: item.rankId || item.seniorityLevel || 0,
    category: item.category || "",
    description: item.description || "",
    createdAt: item.createdAt || "",
  }));
}
