import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
} from "@/lib/api-client";

export interface InstitutionDto {
  id: string;
  name?: string;
  institutionType?: string;
  nimasaAccreditationNo?: string;
  accreditationExpiry?: string;
  physicalAddress?: string;
  email?: string;
  isActive?: boolean;
  authUserId?: string;
  createdAt?: string;
}

export interface CreateInstitutionRequest {
  name?: string;
  institutionType?: string;
  nimasaAccreditationNo?: string;
  accreditationExpiry?: string;
  physicalAddress?: string;
  email?: string;
  isActive?: boolean;
  authUserId?: string;
}

export interface UpdateInstitutionRequest {
  name?: string;
  institutionType?: string;
  nimasaAccreditationNo?: string;
  accreditationExpiry?: string;
  physicalAddress?: string;
  email?: string;
  isActive?: boolean;
  authUserId?: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

export async function getInstitutions(params?: {
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: string;
}): Promise<PagedResult<InstitutionDto>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortDirection)
    queryParams.append("sortDirection", params.sortDirection);

  const response = await apiGetMain<PagedResult<InstitutionDto>>(
    `/api/Institutions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch institutions");
  }

  return response.data;
}

export async function getInstitutionById(id: string): Promise<InstitutionDto> {
  const response = await apiGetMain<InstitutionDto>(`/api/Institutions/${id}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch institution");
  }

  return response.data;
}

export async function createInstitution(
  data: CreateInstitutionRequest,
): Promise<InstitutionDto> {
  const response = await apiPostMain<InstitutionDto>("/api/Institutions", data);

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to create institution");
  }

  return response.data;
}

export async function updateInstitution(
  id: string,
  data: UpdateInstitutionRequest,
): Promise<boolean> {
  const response = await apiPutMain<boolean>(`/api/Institutions/${id}`, data);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(response.error?.message || "Failed to update institution");
  }

  return response.data ?? true;
}

export async function deleteInstitution(id: string): Promise<boolean> {
  const response = await apiDeleteMain<boolean>(`/api/Institutions/${id}`);

  const ok = response.success ?? (response as any).successful;
  if (!ok) {
    throw new Error(response.error?.message || "Failed to delete institution");
  }

  return response.data ?? true;
}
