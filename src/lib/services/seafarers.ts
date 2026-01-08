import { apiGetMain, apiPostMain, type ApiResponse } from "@/lib/api-client";

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

// SeafarerDto based on swagger.txt
export interface SeafarerDto {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  ninNumber?: string | null;
  sidNumber?: string | null;
  dischargeBookNo?: string | null;
  currentRankId?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  homeAddress?: string | null;
  isActive?: boolean | null;
  walletAddress?: string | null;
  profilePictureUrl?: string | null;
  authUserId?: string | null;
  createdAt?: string | null;
  lastModified?: string | null;
  nationalityId?: string | null;
}

export interface CreateSeafarerRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  nationality?: string;
  ninNumber?: string;
  sidNumber?: string;
  dischargeBookNo?: string;
  currentRankId?: string;
  email: string;
  phoneNumber: string;
  homeAddress?: string;
  isActive?: boolean;
  walletAddress?: string;
  profilePictureUrl?: string;
  nationalityId?: string;
  authUserId?: string;
  middleName?: string;
  alternativePhoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  residentialAddress?: string;
  meansOfIdentification?: string;
  idNumber?: string;
}

export async function createSeafarer(
  data: CreateSeafarerRequest,
): Promise<ApiResponse<any>> {
  return apiPostMain<any>("/seafarer/api/v1/seafarers", data);
}

export async function getSeafarers(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<SeafarerDto>>> {
  const queryParams = new URLSearchParams();
  if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.searchTerm) queryParams.append("searchTerm", params.searchTerm);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.sortDirection) queryParams.append("sortDirection", params.sortDirection);

  return apiGetMain<PagedResult<SeafarerDto>>(
    `/seafarer/api/v1/seafarers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
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
    "/seafarer/api/v1/seafarers/me/onboarding-status",
  );
}

/**
 * Get current seafarer's profile
 * GET /seafarer/api/v1/seafarers/me
 */
export async function getMySeafarer(): Promise<ApiResponse<SeafarerDto>> {
  return apiGetMain<SeafarerDto>("/seafarer/api/v1/seafarers/me");
}

/**
 * SeafarerHeldDocumentDto based on swagger.txt
 */
export interface SeafarerHeldDocumentDto {
  id: string;
  seafarerId?: string | null;
  documentMasterId?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  fileUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Get current seafarer's documents
 * GET /api/v1/seafarers/{seafarerId}/documents
 * First gets the seafarer ID from /api/v1/seafarers/me, then fetches documents
 */
export async function getMySeafarerDocuments(): Promise<ApiResponse<SeafarerHeldDocumentDto[]>> {
  // First get the seafarer profile to get the ID
  const seafarerResponse = await getMySeafarer();
  const ok = seafarerResponse.success ?? (seafarerResponse as any).successful;
  
  if (!ok || !seafarerResponse.data || !seafarerResponse.data.id) {
    throw new Error("Failed to get seafarer profile");
  }
  
  const seafarerId = seafarerResponse.data.id;
  
  // Then get the documents using the seafarer ID
  return apiGetMain<SeafarerHeldDocumentDto[]>(`/api/v1/seafarers/${seafarerId}/documents`);
}

