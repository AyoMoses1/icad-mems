/**
 * Medical Service - API integration for medical services and appointments
 */

import {
  apiGetMain,
  apiPostMain,
  apiPutMain,
  apiDeleteMain,
  type ApiResponse,
} from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/medical";

export interface MedicalServiceDto {
  id: string;
  institutionId?: string;
  serviceName: string;
  description?: string;
  duration?: number; // in minutes
  price?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalServiceRequest {
  institutionId?: string;
  serviceName: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

export interface UpdateMedicalServiceRequest {
  serviceName?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

export interface MedicalAppointmentDto {
  id: string;
  institutionId?: string;
  seafarerId?: string;
  seafarerName?: string;
  serviceId?: string;
  serviceName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status?: string; // Scheduled, Completed, Cancelled, NoShow
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalAppointmentRequest {
  institutionId?: string;
  seafarerId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

export interface UpdateMedicalAppointmentRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  notes?: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
}

/**
 * Get all medical services for an institution
 */
export async function getMedicalServices(
  institutionId?: string,
  params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
  }
): Promise<ApiResponse<PagedResult<MedicalServiceDto>>> {
  const queryParams = new URLSearchParams();
  if (institutionId) queryParams.append("institutionId", institutionId);
  if (params?.pageNumber)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params?.searchTerm) queryParams.append("searchTerm", params.searchTerm);

  return apiGetMain<PagedResult<MedicalServiceDto>>(
    `${API_BASE}/services${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );
}

/**
 * Get medical service by ID
 */
export async function getMedicalServiceById(
  serviceId: string
): Promise<ApiResponse<MedicalServiceDto>> {
  return apiGetMain<MedicalServiceDto>(`${API_BASE}/services/${serviceId}`);
}

/**
 * Create a medical service
 */
export async function createMedicalService(
  data: CreateMedicalServiceRequest
): Promise<ApiResponse<MedicalServiceDto>> {
  return apiPostMain<MedicalServiceDto>(`${API_BASE}/services`, data);
}

/**
 * Update a medical service
 */
export async function updateMedicalService(
  serviceId: string,
  data: UpdateMedicalServiceRequest
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(`${API_BASE}/services/${serviceId}`, data);
}

/**
 * Delete a medical service
 */
export async function deleteMedicalService(
  serviceId: string
): Promise<ApiResponse<boolean>> {
  return apiDeleteMain<boolean>(`${API_BASE}/services/${serviceId}`);
}

/**
 * Get all medical appointments
 */
export async function getMedicalAppointments(
  institutionId?: string,
  params?: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<PagedResult<MedicalAppointmentDto>>> {
  const queryParams = new URLSearchParams();
  if (institutionId) queryParams.append("institutionId", institutionId);
  if (params?.pageNumber)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params?.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  return apiGetMain<PagedResult<MedicalAppointmentDto>>(
    `${API_BASE}/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
  );
}

/**
 * Get medical appointment by ID
 */
export async function getMedicalAppointmentById(
  appointmentId: string
): Promise<ApiResponse<MedicalAppointmentDto>> {
  return apiGetMain<MedicalAppointmentDto>(
    `${API_BASE}/appointments/${appointmentId}`
  );
}

/**
 * Create a medical appointment
 */
export async function createMedicalAppointment(
  data: CreateMedicalAppointmentRequest
): Promise<ApiResponse<MedicalAppointmentDto>> {
  return apiPostMain<MedicalAppointmentDto>(
    `${API_BASE}/appointments`,
    data
  );
}

/**
 * Update a medical appointment
 */
export async function updateMedicalAppointment(
  appointmentId: string,
  data: UpdateMedicalAppointmentRequest
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(
    `${API_BASE}/appointments/${appointmentId}`,
    data
  );
}

/**
 * Cancel a medical appointment
 */
export async function cancelMedicalAppointment(
  appointmentId: string
): Promise<ApiResponse<boolean>> {
  return apiPutMain<boolean>(`${API_BASE}/appointments/${appointmentId}/cancel`, {});
}

