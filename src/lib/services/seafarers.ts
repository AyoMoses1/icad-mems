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

/**
 * ⚠️ DEPRECATED: This endpoint does not exist in swagger.json
 * The /api/Seafarers endpoint returns 404.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function createSeafarer(
  data: CreateSeafarerRequest,
): Promise<ApiResponse<any>> {
  // Endpoint /api/Seafarers does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Seafarers does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * ⚠️ DEPRECATED: This endpoint does not exist in swagger.json
 * The /api/Seafarers endpoint returns 404.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getSeafarers(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  sortDirection?: string;
}): Promise<ApiResponse<PagedResult<SeafarerDto>>> {
  // Endpoint /api/Seafarers does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Seafarers does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: {
      items: [],
      pageNumber: params?.pageNumber || 1,
      pageSize: params?.pageSize || 100,
      totalNumber: 0,
    },
  };
}

export interface SeafarerOnboardingStatus {
  completed?: boolean;
  message?: string;
  nextStep?: string;
}

/**
 * ⚠️ DEPRECATED: This endpoint does not exist in swagger.json
 * The /api/Seafarers/me/onboarding-status endpoint returns 404.
 * Use onboarding-service.ts getMyOnboarding() instead.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getMySeafarerOnboardingStatus(): Promise<
  ApiResponse<SeafarerOnboardingStatus>
> {
  // Endpoint /api/Seafarers/me/onboarding-status does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Seafarers/me/onboarding-status does not exist in the API. Use onboarding-service.ts getMyOnboarding() instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

/**
 * Get current seafarer's profile
 * ⚠️ DEPRECATED: This endpoint does not exist in swagger.json
 * The /api/Seafarers/me endpoint returns 404.
 * Use profile-service.ts getContactDetails() or getEducation() instead for profile data.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getMySeafarer(): Promise<ApiResponse<SeafarerDto>> {
  // Endpoint /api/Seafarers/me does not exist in swagger.json
  return {
    success: false,
    error: { message: "Endpoint /api/Seafarers/me does not exist in the API", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
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
 * ⚠️ DEPRECATED: This endpoint does not exist in swagger.json
 * The /api/Seafarers/{seafarerId}/documents endpoint returns 404.
 * Use document-service.ts getProfileDocuments(rn) instead with the user's RN.
 * 
 * @deprecated This endpoint does not exist in the API
 */
export async function getMySeafarerDocuments(): Promise<ApiResponse<SeafarerHeldDocumentDto[]>> {
  // Endpoint /api/Seafarers/{seafarerId}/documents does not exist in swagger.json
  // Use document-service.ts getProfileDocuments(rn) instead
  return {
    success: false,
    error: { message: "Endpoint /api/Seafarers/{seafarerId}/documents does not exist in the API. Use document-service.ts getProfileDocuments(rn) instead.", code: "ENDPOINT_NOT_FOUND" },
    data: undefined,
  };
}

