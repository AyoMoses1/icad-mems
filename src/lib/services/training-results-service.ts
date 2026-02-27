/**
 * Training Results API for training institutions
 * GET /seafarer/api/v1/training/results - list training results for the institution
 * Response shape: { data: { items: TrainingResultDto[], totalCount, pageNumber, pageSize, totalPages } }
 */

import { apiGetMain } from "@/lib/api-client";

const API_BASE = "/seafarer/api/v1/training/results";

/** SessionStorage key used to pass a single record to the view page */
export const TRAINING_RESULT_VIEW_KEY = "training-result-view";

export interface TrainingResultDto {
  resultId?: string;
  uploadId?: string;
  sin: string;
  institutionSTCWAccreditationId: string;
  seafarerName: string;
  trainingName: string;
  status: string | null;
  trainingStatusId: string | null;
  certificateId: string;
  certificateIssuanceDate: string | null;
  certificateExpiry: string | null;
  courseLocation: string;
  remarks: string;
  date: string;
  trainingProvider: string;
  batchNo: string;
  dateCreated?: string;
}

/** Paginated response from GET /seafarer/api/v1/training/results */
export interface TrainingResultsResponseDto {
  items: TrainingResultDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * GET /seafarer/api/v1/training/results
 * Returns training results for the current training institution (paginated).
 */
export async function getTrainingResults(params?: {
  pageNumber?: number;
  pageSize?: number;
}): Promise<{
  success: boolean;
  data?: TrainingResultDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  message?: string;
}> {
  const searchParams = new URLSearchParams();
  if (params?.pageNumber != null) searchParams.set("pageNumber", String(params.pageNumber));
  if (params?.pageSize != null) searchParams.set("pageSize", String(params.pageSize));
  const url = searchParams.toString() ? `${API_BASE}?${searchParams.toString()}` : API_BASE;
  const response = await apiGetMain<TrainingResultsResponseDto>(url);
  if (!response.success || response.data == null) {
    return {
      success: false,
      message: response.message ?? response.error?.message ?? "Failed to load training results",
    };
  }
  const payload = response.data;
  const items = Array.isArray(payload.items) ? payload.items : [];
  return {
    success: true,
    data: items,
    totalCount: payload.totalCount,
    pageNumber: payload.pageNumber,
    pageSize: payload.pageSize,
    totalPages: payload.totalPages,
  };
}
