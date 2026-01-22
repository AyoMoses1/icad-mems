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

/**
 * ⚠️ DEPRECATED: The /api/Ranks endpoint does not exist in swagger.json
 * Use getAllRanks() instead which calls /api/seafarer/MasterData/ranks
 * 
 * @deprecated Use getAllRanks() instead
 */
export async function getRanks(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<PagedResult<RankDto>> {
  // Endpoint /api/Ranks does not exist in swagger.json
  // Use getAllRanks() instead which calls /api/seafarer/MasterData/ranks
  const allRanks = await getAllRanks();
  const pageNumber = params?.pageNumber || 1;
  const pageSize = params?.pageSize || 100;
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRanks = allRanks.slice(startIndex, endIndex);
  
  return {
    items: paginatedRanks,
    pageNumber,
    pageSize,
    totalNumber: allRanks.length,
  };
}

export async function getRankById(id: string): Promise<RankDto> {
  // Endpoint /api/Ranks/{id} does not exist in swagger.json
  // Try to find in MasterData ranks
  const allRanks = await getAllRanks();
  const rank = allRanks.find(r => r.id === id);
  if (!rank) {
    throw new Error(`Rank with id ${id} not found`);
  }
  return rank;
}

/**
 * ⚠️ DEPRECATED: This endpoint does not exist in swagger.json
 * The /seafarer/api/Ranks endpoint returns 404.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createRank(data: CreateRankRequest): Promise<RankDto> {
  // Endpoint /seafarer/api/Ranks does not exist in swagger.json
  throw new Error("Endpoint /seafarer/api/Ranks does not exist in the API");
}

/**
 * ⚠️ DEPRECATED: This endpoint does not exist in swagger.json
 * The /api/Ranks/{id} endpoint returns 404.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function updateRank(
  id: string,
  data: UpdateRankRequest,
): Promise<boolean> {
  // Endpoint /api/Ranks/{id} does not exist in swagger.json
  throw new Error("Endpoint /api/Ranks/{id} does not exist in the API");
}

/**
 * ⚠️ DEPRECATED: This endpoint does not exist in swagger.json
 * The /api/Ranks/{id} endpoint returns 404.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function deleteRank(id: string): Promise<boolean> {
  // Endpoint /api/Ranks/{id} does not exist in swagger.json
  throw new Error("Endpoint /api/Ranks/{id} does not exist in the API");
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
