/**
 * Permit Validation Service
 *
 * Validates NIMASA service-type permits for onboarding (Seafarer Employer,
 * Training Institution, Waste Management) per permit-validation-integration-guide.
 *
 * Uses a separate backend (reg & cert) — set NEXT_PUBLIC_PERMIT_VERIFY_BASE_URL.
 * Endpoint: GET {BASE_URL}/verify/permit/{permitNumber}/service-type/{serviceTypeCode}
 * No authentication required.
 */

/** Base URL for the permit verification API (reg & cert backend). */
export function getPermitVerifyBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_PERMIT_VERIFY_BASE_URL?.trim() ?? "";
  return baseUrl;
}

/** Service type codes supported by the permit verification API */
export const PERMIT_SERVICE_TYPE = {
  SEAFARER_EMPLOYER: "SEAFARER_EMPLOYER",
  TRAINING_INSTITUTIONS: "TRAINING_INSTITUTIONS",
  WASTE_MANAGEMENT_COMPANY: "WASTE_MANAGEMENT_COMPANY",
} as const;

export type PermitServiceTypeCode =
  (typeof PERMIT_SERVICE_TYPE)[keyof typeof PERMIT_SERVICE_TYPE];

/** Onboarding role in the app → service type code for the API */
export const ONBOARDING_ROLE_TO_SERVICE_TYPE: Record<
  "AGENT" | "TRAINING_INSTITUTION",
  PermitServiceTypeCode
> = {
  AGENT: PERMIT_SERVICE_TYPE.SEAFARER_EMPLOYER,
  TRAINING_INSTITUTION: PERMIT_SERVICE_TYPE.TRAINING_INSTITUTIONS,
};

export interface PermitValidationCompany {
  id: string;
  legalName: string;
  email: string | null;
}

export interface PermitValidationResult {
  valid: boolean;
  permitNumber: string;
  permitNo: string;
  serviceTypeCode: string;
  requestedServiceTypeCode: string;
  serviceTypeMatch: boolean;
  status: string;
  validFrom: string | null;
  validTo: string | null;
  isCurrentlyValid: boolean;
  message: string;
  company: PermitValidationCompany | null;
  companyOwnerEmail: string | null;
}

/** Session storage key for passing validated permit/company to onboarding forms */
export const PERMIT_VALIDATION_STORAGE_KEY = "mems_permit_validation";

export interface StoredPermitValidation {
  permitNumber: string;
  company: PermitValidationCompany | null;
  companyOwnerEmail: string | null;
  validTo: string | null;
  validFrom?: string | null;
  status?: string;
  message?: string;
  serviceTypeCode?: string;
  /** Workspace role ID for the selected role (Seafarer Employer or Training Institution); sent to CompanyPermit/record */
  workspaceRoleId?: string | null;
}

/**
 * Read stored permit validation without clearing (e.g. for verify-success page).
 */
export function getStoredPermitValidation(): StoredPermitValidation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PERMIT_VALIDATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredPermitValidation;
  } catch {
    return null;
  }
}

/**
 * Read and clear the permit validation stored after successful verify-identity.
 * Use in onboarding forms to prefill permit number and company info.
 */
export function getAndClearStoredPermitValidation(): StoredPermitValidation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PERMIT_VALIDATION_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PERMIT_VALIDATION_STORAGE_KEY);
    return JSON.parse(raw) as StoredPermitValidation;
  } catch {
    return null;
  }
}

/** When true, use mock responses instead of calling the API (for local testing). */
export function isMockPermitVerifyEnabled(): boolean {
  return (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_MOCK_PERMIT_VERIFY === "true"
  );
}

/** Show the "Simulate verification" control on verify-identity (dev or explicit flag). */
export function isPermitSimulateUiEnabled(): boolean {
  return (
    typeof process !== "undefined" &&
    (process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_SHOW_PERMIT_SIMULATE === "true" ||
      isMockPermitVerifyEnabled())
  );
}

/**
 * Simulated permit validation — same shape as the reg & cert API, no network call.
 * Use when the verify endpoint is down or for local onboarding testing.
 * Enter "MOCK-INVALID" as the permit number to test the failure path.
 */
export function simulatePermitValidation(
  permitNumber: string,
  onboardingRole: "AGENT" | "TRAINING_INSTITUTION"
): Promise<PermitValidationResult> {
  return mockValidatePermit(permitNumber, onboardingRole);
}

function mockValidatePermit(
  permitNumber: string,
  onboardingRole: "AGENT" | "TRAINING_INSTITUTION"
): Promise<PermitValidationResult> {
  const trimmed = permitNumber.trim();
  const serviceTypeCode = ONBOARDING_ROLE_TO_SERVICE_TYPE[onboardingRole];
  // Use "MOCK-INVALID" to test the invalid path without hitting the API
  if (trimmed.toUpperCase() === "MOCK-INVALID") {
    return Promise.resolve({
      valid: false,
      permitNumber: trimmed,
      permitNo: trimmed,
      serviceTypeCode: "",
      requestedServiceTypeCode: serviceTypeCode,
      serviceTypeMatch: false,
      status: "EXPIRED",
      validFrom: null,
      validTo: null,
      isCurrentlyValid: false,
      message: "Permit is expired or not active (mock).",
      company: null,
      companyOwnerEmail: null,
    });
  }
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          valid: true,
          permitNumber: trimmed,
          permitNo: trimmed,
          serviceTypeCode,
          requestedServiceTypeCode: serviceTypeCode,
          serviceTypeMatch: true,
          status: "ACTIVE",
          validFrom: "2026-01-01",
          validTo: "2027-12-31",
          isCurrentlyValid: true,
          message: `Permit is valid for ${serviceTypeCode} (mock).`,
          company: {
            id: "mock-company-id",
            legalName: "Mock Test Company Ltd",
            email: "contact@mock-company.com",
          },
          companyOwnerEmail: "admin@mock-company.com",
        }),
      600
    );
  });
}

/**
 * Validate a permit number for the given onboarding role (Seafarer Employer or Training Institution).
 * Calls the MEMS backend verify endpoint. No auth required.
 *
 * @param permitNumber - Full permit number as on the NIMASA certificate (e.g. PERMIT-SEAFARER_EMPLOYER-2026-000001)
 * @param onboardingRole - AGENT (Seafarer Employer) or TRAINING_INSTITUTION
 * @returns Validation result; check result.valid to allow onboarding
 */
export async function validatePermit(
  permitNumber: string,
  onboardingRole: "AGENT" | "TRAINING_INSTITUTION",
  options?: { useMock?: boolean }
): Promise<PermitValidationResult> {
  const trimmed = permitNumber.trim();
  if (!trimmed) {
    throw new Error("Please enter your permit number.");
  }

  if (options?.useMock || isMockPermitVerifyEnabled()) {
    return mockValidatePermit(trimmed, onboardingRole);
  }

  const baseUrl = getPermitVerifyBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_PERMIT_VERIFY_BASE_URL is not set. Add it to your .env.local for the reg & cert permit verification API."
    );
  }

  const serviceTypeCode = ONBOARDING_ROLE_TO_SERVICE_TYPE[onboardingRole];
  const path = `/verify/permit/${encodeURIComponent(trimmed)}/service-type/${serviceTypeCode}`;
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 404) {
      return {
        valid: false,
        permitNumber: trimmed,
        permitNo: trimmed,
        serviceTypeCode: "",
        requestedServiceTypeCode: serviceTypeCode,
        serviceTypeMatch: false,
        status: "",
        validFrom: null,
        validTo: null,
        isCurrentlyValid: false,
        message: data?.message ?? "Permit not found. Please check the permit number and try again.",
        company: null,
        companyOwnerEmail: null,
      };
    }
    throw new Error(
      (data?.message as string) || `Validation failed (${res.status}). Please try again.`
    );
  }

  return data as PermitValidationResult;
}
