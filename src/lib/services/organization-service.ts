/**
 * Organization Service - API integration for organization/MTI operations
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiPatchMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";
import type {
  UserOrganizationDto,
  ContactDetailsDto,
  OrganizationFilters,
  PaginatedResponse,
} from "@/types/seafarer";

const API_BASE = "/api/v1/Organizations";

/**
 * Get paginated list of organizations
 */
export async function getOrganizations(
  filters: OrganizationFilters = {}
): Promise<ApiResponse<PaginatedResponse<UserOrganizationDto>>> {
  const {
    pageNumber = 1,
    pageSize = 20,
    searchTerm,
    organizationTypeId,
    isActive,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm) params.append("searchTerm", searchTerm);
  if (organizationTypeId)
    params.append("organizationTypeId", organizationTypeId.toString());
  if (isActive !== undefined) params.append("isActive", isActive.toString());

  return apiGetMain<PaginatedResponse<UserOrganizationDto>>(
    `${API_BASE}?${params.toString()}`
  );
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(
  orgId: number
): Promise<ApiResponse<UserOrganizationDto>> {
  return apiGetMain<UserOrganizationDto>(`${API_BASE}/${orgId}`);
}

/**
 * Get accreditations for an organization
 */
export async function getOrganizationAccreditations(
  orgId: number
): Promise<ApiResponse<UserOrganizationDto[]>> {
  return apiGetMain<UserOrganizationDto[]>(
    `${API_BASE}/${orgId}/accreditations`
  );
}

/**
 * Get contacts for an organization
 */
export async function getOrganizationContacts(
  orgId: number
): Promise<ApiResponse<ContactDetailsDto[]>> {
  return apiGetMain<ContactDetailsDto[]>(`${API_BASE}/${orgId}/contacts`);
}

/**
 * Get contact by ID
 */
export async function getOrganizationContact(
  orgId: number,
  contactId: number
): Promise<ApiResponse<ContactDetailsDto>> {
  return apiGetMain<ContactDetailsDto>(
    `${API_BASE}/${orgId}/contacts/${contactId}`
  );
}

/**
 * Create organization contact
 */
export async function createOrganizationContact(
  orgId: number,
  contactData: Omit<ContactDetailsDto, "id" | "organizationId">
): Promise<ApiResponse<ContactDetailsDto>> {
  return apiPostMain<ContactDetailsDto>(
    `${API_BASE}/${orgId}/contacts`,
    contactData
  );
}

/**
 * Update organization contact
 */
export async function updateOrganizationContact(
  orgId: number,
  contactId: number,
  contactData: Partial<ContactDetailsDto>
): Promise<ApiResponse<ContactDetailsDto>> {
  return apiPutMain<ContactDetailsDto>(
    `${API_BASE}/${orgId}/contacts/${contactId}`,
    contactData
  );
}

/**
 * Delete organization contact
 */
export async function deleteOrganizationContact(
  orgId: number,
  contactId: number
): Promise<ApiResponse<void>> {
  return apiDeleteMain<void>(`${API_BASE}/${orgId}/contacts/${contactId}`);
}

