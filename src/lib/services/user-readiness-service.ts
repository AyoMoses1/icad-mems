/**
 * User Readiness Status — single source of truth for whether the user should see
 * onboarding, permit submission, or the main app.
 *
 * @see user-readiness-status-frontend-guide.md
 *
 * Call GET /seafarer/api/v1/UserReadiness/status first (before my-onboarding)
 * to decide: show onboarding role selection vs dashboard.
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";

const API_STATUS = "/seafarer/api/v1/UserReadiness/status";

/**
 * Deduplicate concurrent UserReadiness/status calls and cache the result briefly.
 * Many components/effects can ask for readiness at once (layout, dashboard page,
 * onboarding pages, status pages). Without this, a quick redirect chain can issue
 * dozens of calls per second and trip the backend's 60-req/min rate limit.
 */
const READINESS_CACHE_TTL_MS = 5_000;
let cachedResponse: ApiResponse<UserReadinessStatusDto> | null = null;
let cachedAt = 0;
let inFlight: Promise<ApiResponse<UserReadinessStatusDto>> | null = null;

/** Clear cached readiness — call after onboarding submit/refresh/logout. */
export function invalidateUserReadinessCache(): void {
  cachedResponse = null;
  cachedAt = 0;
  inFlight = null;
}

/** Onboarding status enum (numeric, matches backend) */
export enum UserReadinessOnboardingStatus {
  DRAFT = 0,
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
  SUSPENDED = 4,
}

export interface UserReadinessStatusDto {
  source: "onboarding" | "permit";
  role: string | null; // "Seafarer" | "training_institute" | "seafarer_employer" | "training_institute_or_seafarer_employer"
  /** Populated when source === "onboarding" */
  hasOnboarded?: boolean | null;
  /** Backend may return number (e.g. 2) or string (e.g. "APPROVED") */
  onboardingStatus?: UserReadinessOnboardingStatus | number | string | null;
  userSeafarerOnboardingId?: string | null;
  /** Populated when source === "permit" */
  hasSubmittedPermit?: boolean | null;
  isPermitExpired?: boolean | null;
  permitValidTo?: string | null;
  permitValidFrom?: string | null;
  companyPermitId?: string | null;
}

/** Error code when user has no onboarding and no permit */
export const READINESS_NOT_FOUND_CODE = "READINESS_NOT_FOUND";

/**
 * Get user readiness status. Call this first on app load / after login;
 * then call my-onboarding only when source === "onboarding" for full details.
 *
 * - 200 + source "permit" + hasSubmittedPermit → user is ready (no onboarding form).
 * - 200 + source "onboarding" → use hasOnboarded / onboardingStatus; call my-onboarding for details.
 * - 400 + error.code READINESS_NOT_FOUND → show onboarding role selection (welcome).
 */
export async function getUserReadinessStatus(options?: {
  force?: boolean;
}): Promise<ApiResponse<UserReadinessStatusDto>> {
  const force = options?.force === true;

  if (!force) {
    if (inFlight) {
      return inFlight;
    }
    if (cachedResponse && Date.now() - cachedAt < READINESS_CACHE_TTL_MS) {
      return cachedResponse;
    }
  }

  inFlight = apiGetMain<UserReadinessStatusDto>(API_STATUS)
    .then((res) => {
      cachedResponse = res;
      cachedAt = Date.now();
      return res;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * Returns true if the user is "ready" and should see the app (not onboarding welcome).
 * - Permit: hasSubmittedPermit and not expired.
 * - Onboarding: hasOnboarded true or status APPROVED (2 or "APPROVED").
 */
export function isUserReadyFromReadiness(
  data: UserReadinessStatusDto | null | undefined
): boolean {
  if (!data) return false;
  if (data.source === "permit") {
    return data.hasSubmittedPermit === true && data.isPermitExpired !== true;
  }
  if (data.source === "onboarding") {
    const status = data.onboardingStatus;
    const isApproved =
      data.hasOnboarded === true ||
      status === UserReadinessOnboardingStatus.APPROVED ||
      status === 2 ||
      (typeof status === "string" && status.toUpperCase() === "APPROVED");
    return !!isApproved;
  }
  return false;
}

/**
 * Returns the dashboard role for routing when source is "permit".
 * "seafarer_employer" → Agent, "training_institute" → Training Institution.
 */
export function getDashboardRoleFromReadiness(
  data: UserReadinessStatusDto | null | undefined
): "AGENT" | "TRAINING_INSTITUTION" | "SEAFARER" | null {
  if (!data?.role) return null;
  const r = data.role.toLowerCase();
  if (r === "seafarer_employer") return "AGENT";
  if (r === "training_institute") return "TRAINING_INSTITUTION";
  if (r === "seafarer") return "SEAFARER";
  if (r.includes("training") || r.includes("employer")) return "AGENT"; // training_institute_or_seafarer_employer
  return null;
}
