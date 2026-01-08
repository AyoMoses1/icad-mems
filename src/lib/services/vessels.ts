import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
} from "@/lib/api-client";

export interface VesselDto {
  id: number;
  name?: string;
  imoNumber?: string;
  builtDate: string;
  isActive: boolean;
}

export interface CreateVesselRequest {
  name?: string;
  imoNumber?: string;
  builtDate: string;
  isActive: boolean;
}

export interface UpdateVesselRequest {
  name?: string;
  imoNumber?: string;
  builtDate?: string;
  isActive?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

export async function getVessels(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<PagedResult<VesselDto>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection) queryParams.append("sortDirection", params.sortDirection);

  const response = await apiGetMain<PagedResult<VesselDto>>(
    `/api/v1/vessels${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch vessels");
  }

  return response.data;
}

export async function getVesselById(id: number): Promise<VesselDto> {
  const response = await apiGetMain<VesselDto>(`/api/v1/vessels/${id}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch vessel");
  }

  return response.data;
}

export async function createVessel(data: CreateVesselRequest): Promise<VesselDto> {
  const response = await apiPostMain<VesselDto>("/seafarer/api/v1/vessels", data);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to create vessel");
  }

  return response.data;
}

export async function updateVessel(id: number, data: UpdateVesselRequest): Promise<boolean> {
  const response = await apiPutMain<boolean>(`/api/v1/vessels/${id}`, data);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(response.error?.message || "Failed to update vessel");
  }

  return response.data ?? true;
}

export async function deleteVessel(id: number): Promise<boolean> {
  const response = await apiDeleteMain<boolean>(`/api/v1/vessels/${id}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(response.error?.message || "Failed to delete vessel");
  }

  return response.data ?? true;
}

