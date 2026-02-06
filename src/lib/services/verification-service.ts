/**
 * Verification Service - Veriff identity verification
 * Integrates with backend for session creation and status checks
 */

import { apiGetMain, apiPostMain, type ApiResponse } from "@/lib/api-client";

// ============================================================================
// Types
// ============================================================================

/** Single verification record from the API */
export interface VerificationRecord {
  id?: string;
  status?: string;
  message?: string;
  completedAt?: string;
  createdAt?: string;
  /** Document number extracted from verified ID (passport, national ID, etc.) */
  documentNumber?: string;
  idNumber?: string;
}

/** API response for GET /api/verification/status */
export interface VerificationStatusResponse {
  userId: string;
  hasVerification: boolean;
  isVerified: boolean;
  latestVerification: VerificationRecord | null;
  verifications: VerificationRecord[];
}

export interface StartVerificationResponse {
  success: boolean;
  verification?: {
    id: string;
    url: string;
    sessionToken?: string;
  };
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Start Veriff verification session
 * Backend creates a Veriff session and returns the URL for the verification popup
 * POST /api/verification/start - expects { userId } in body
 */
export async function startVerificationSession(
  userId: string
): Promise<ApiResponse<StartVerificationResponse>> {
  const response = await apiPostMain<StartVerificationResponse>(
    "/api/verification/start",
    { userId }
  );
  return response;
}

/**
 * Get verification status for a user
 * GET /api/verification/status?userId={userId}
 *
 * Expected response: { success, data: { userId, hasVerification, isVerified, latestVerification, verifications } }
 */
export async function getVerificationStatus(
  userId: string
): Promise<ApiResponse<VerificationStatusResponse>> {
  try {
    return await apiGetMain<VerificationStatusResponse>(
      `/api/verification/status?userId=${encodeURIComponent(userId)}`
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch verification status",
    };
  }
}
