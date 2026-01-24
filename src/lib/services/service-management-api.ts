/**
 * Service Management API - Admin-only mutations
 * Based on frontend-service-management-guide.md
 * 
 * ⚠️ CRITICAL: All mutation operations (POST, PUT, DELETE) are ADMIN-ONLY
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";
import { canManageServices } from "@/utils/permissions";
import { useAuthStore } from "@/store";
import type {
  ServiceDto,
  ServiceRequirementDto,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateServiceRequirementRequest,
  UpdateServiceRequirementRequest,
  RequirementListDto,
  CreateRequirementListRequest,
  UpdateRequirementListRequest,
} from "@/types/service-management";

const API_BASE = "/seafarer/api/v1";

/**
 * Get current user from auth store
 */
function getCurrentUser() {
  const state = useAuthStore.getState();
  return state.user;
}

/**
 * Build requirement list create/update payload.
 * Prefer documentTypeIds when provided; omit documentTypesId to avoid conflict.
 */
function buildRequirementListPayload(
  request: CreateRequirementListRequest | UpdateRequirementListRequest
): Record<string, unknown> {
  const hasMultiple = Array.isArray(request.documentTypeIds) && request.documentTypeIds.length > 0;
  const out: Record<string, unknown> = { ...request };
  if (hasMultiple) {
    (out as Record<string, unknown>).documentTypeIds = request.documentTypeIds;
    delete (out as Record<string, unknown>).documentTypesId;
  }
  return out;
}

/**
 * Service Management API - Admin-only mutations
 */
export const serviceManagementApi = {
  /**
   * Create Service (ADMIN ONLY)
   */
  createService: async (
    request: CreateServiceRequest
  ): Promise<ServiceDto> => {
    const user = getCurrentUser();

    // Frontend protection - prevent unauthorized calls
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const response = await apiPostMain<ServiceDto>(
      `${API_BASE}/services`,
      request
    );

    // Handle 403 from backend
    if (!response.success && response.error?.code === "FORBIDDEN") {
      throw new Error("Forbidden: Admin access required");
    }

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to create service"
      );
    }
    return response.data!;
  },

  /**
   * Update Service (ADMIN ONLY)
   */
  updateService: async (
    serviceId: string,
    request: UpdateServiceRequest
  ): Promise<ServiceDto> => {
    const user = getCurrentUser();

    // Frontend protection
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const response = await apiPutMain<ServiceDto>(
      `${API_BASE}/services/${serviceId}`,
      request
    );

    if (!response.success && response.error?.code === "FORBIDDEN") {
      throw new Error("Forbidden: Admin access required");
    }

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to update service"
      );
    }
    return response.data!;
  },

  /**
   * Delete Service (ADMIN ONLY)
   */
  deleteService: async (serviceId: string): Promise<boolean> => {
    const user = getCurrentUser();

    // Frontend protection
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const response = await apiDeleteMain<boolean>(
      `${API_BASE}/services/${serviceId}`
    );

    if (!response.success && response.error?.code === "FORBIDDEN") {
      throw new Error("Forbidden: Admin access required");
    }

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete service"
      );
    }
    return response.data ?? true;
  },

  /**
   * Create Service Requirement (ADMIN ONLY)
   */
  createServiceRequirement: async (
    serviceId: string,
    request: CreateServiceRequirementRequest
  ): Promise<ServiceRequirementDto> => {
    const user = getCurrentUser();

    // Frontend protection
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Ensure serviceId matches route
    const payload = { ...request, serviceId };

    const response = await apiPostMain<ServiceRequirementDto>(
      `${API_BASE}/services/${serviceId}/requirements`,
      payload
    );

    if (!response.success && response.error?.code === "FORBIDDEN") {
      throw new Error("Forbidden: Admin access required");
    }

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to create requirement"
      );
    }
    return response.data!;
  },

  /**
   * Update Service Requirement (ADMIN ONLY)
   */
  updateServiceRequirement: async (
    serviceId: string,
    requirementId: string,
    request: UpdateServiceRequirementRequest
  ): Promise<ServiceRequirementDto> => {
    const user = getCurrentUser();

    // Frontend protection
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const response = await apiPutMain<ServiceRequirementDto>(
      `${API_BASE}/services/${serviceId}/requirements/${requirementId}`,
      request
    );

    if (!response.success && response.error?.code === "FORBIDDEN") {
      throw new Error("Forbidden: Admin access required");
    }

    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to update requirement"
      );
    }
    return response.data!;
  },

  /**
   * Delete Service Requirement (ADMIN ONLY)
   */
  deleteServiceRequirement: async (
    serviceId: string,
    requirementId: string
  ): Promise<boolean> => {
    const user = getCurrentUser();

    // Frontend protection
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const response = await apiDeleteMain<boolean>(
      `${API_BASE}/services/${serviceId}/requirements/${requirementId}`
    );

    if (!response.success && response.error?.code === "FORBIDDEN") {
      throw new Error("Forbidden: Admin access required");
    }

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete requirement"
      );
    }
    return response.data ?? true;
  },
};

/**
 * Read operations (available to all authenticated users)
 * These use the ApplicationsController endpoints
 */
export const servicesApi = {
  /**
   * Get all services (from ApplicationsController)
   */
  getServices: async (): Promise<ServiceDto[]> => {
    const response = await apiGetMain<ServiceDto[]>(
      `${API_BASE}/applications/services`
    );
    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to fetch services"
      );
    }
    return response.data!;
  },

  /**
   * Get service by ID (from ApplicationsController)
   */
  getServiceById: async (serviceId: string): Promise<ServiceDto> => {
    const response = await apiGetMain<ServiceDto>(
      `${API_BASE}/applications/services/${serviceId}`
    );
    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to fetch service"
      );
    }
    return response.data!;
  },
};

/**
 * Requirement Lists API (read operations available to all authenticated users)
 */
export const requirementListsApi = {
  /**
   * Get all requirement lists
   * GET /seafarer/api/v1/services/requirement-lists
   */
  getRequirementLists: async (): Promise<RequirementListDto[]> => {
    const response = await apiGetMain<RequirementListDto[]>(
      `${API_BASE}/services/requirement-lists`
    );
    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to fetch requirement lists"
      );
    }
    return response.data!;
  },

  /**
   * Get requirement list by ID
   * GET /seafarer/api/v1/services/requirement-lists/{requirementListId}
   */
  getRequirementListById: async (
    requirementListId: string
  ): Promise<RequirementListDto> => {
    const response = await apiGetMain<RequirementListDto>(
      `${API_BASE}/services/requirement-lists/${requirementListId}`
    );
    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to fetch requirement list"
      );
    }
    return response.data!;
  },

  /**
   * Create a new requirement list
   * POST /seafarer/api/v1/services/requirement-lists
   * Admin only
   * Prefers documentTypeIds when provided; omits documentTypesId to avoid conflict.
   */
  createRequirementList: async (
    request: CreateRequirementListRequest
  ): Promise<RequirementListDto> => {
    const user = getCurrentUser();
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const payload = buildRequirementListPayload(request);
    const response = await apiPostMain<RequirementListDto>(
      `${API_BASE}/services/requirement-lists`,
      payload
    );
    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to create requirement list"
      );
    }
    return response.data!;
  },

  /**
   * Update a requirement list
   * PUT /seafarer/api/v1/services/requirement-lists/{requirementListId}
   * Admin only
   * Prefers documentTypeIds when provided; omits documentTypesId to avoid conflict.
   */
  updateRequirementList: async (
    requirementListId: string,
    request: UpdateRequirementListRequest
  ): Promise<RequirementListDto> => {
    const user = getCurrentUser();
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const payload = buildRequirementListPayload(request);
    const response = await apiPutMain<RequirementListDto>(
      `${API_BASE}/services/requirement-lists/${requirementListId}`,
      payload
    );
    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to update requirement list"
      );
    }
    return response.data!;
  },

  /**
   * Delete a requirement list (soft delete)
   * DELETE /seafarer/api/v1/services/requirement-lists/{requirementListId}
   * Admin only
   */
  deleteRequirementList: async (
    requirementListId: string
  ): Promise<boolean> => {
    const user = getCurrentUser();
    if (!canManageServices(user)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const response = await apiDeleteMain<boolean>(
      `${API_BASE}/services/requirement-lists/${requirementListId}`
    );
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete requirement list"
      );
    }
    return response.data ?? true;
  },
};
