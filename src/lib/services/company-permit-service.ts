/**
 * Company Permit service — records validated permit on the Seafarer backend.
 * POST /seafarer/api/v1/CompanyPermit/record
 * Used when Seafarer Employer or Training Institution clicks "Set up your account on Seafarer"
 * after permit verification; this call onboards them (replaces the multi-step Agent/TI form).
 */

import { apiPostMain, type ApiResponse } from "@/lib/api-client";
import type { StoredPermitValidation } from "@/lib/services/permit-validation-service";

const API_RECORD = "/seafarer/api/v1/CompanyPermit/record";

/** Request body for POST CompanyPermit/record (matches Swagger). */
export interface CompanyPermitRecordRequest {
  valid: boolean;
  permitNumber: string;
  serviceTypeCode: string;
  requestedServiceTypeCode: string;
  serviceTypeMatch: boolean;
  status: string;
  validFrom: string | null;
  validTo: string | null;
  isCurrentlyValid: boolean;
  message: string;
  company: {
    id: string;
    legalName: string;
    email: string | null;
  } | null;
  companyOwnerEmail: string | null;
  workspaceRoleId: string;
}

/**
 * Build the request body for CompanyPermit/record from stored permit validation.
 * workspaceRoleId comes from stored (set when user selects Seafarer Employer or Training Institution) or fallback.
 */
export function buildCompanyPermitRecordBody(
  stored: StoredPermitValidation,
  workspaceRoleIdFallback?: string | null
): CompanyPermitRecordRequest {
  const serviceTypeCode = stored.serviceTypeCode ?? "";
  const workspaceRoleId =
    stored.workspaceRoleId ?? workspaceRoleIdFallback ?? "";
  if (!workspaceRoleId) {
    console.warn(
      "CompanyPermit/record: workspaceRoleId is missing; request may fail."
    );
  }
  return {
    valid: true,
    permitNumber: stored.permitNumber,
    serviceTypeCode,
    requestedServiceTypeCode: serviceTypeCode,
    serviceTypeMatch: true,
    status: stored.status ?? "ACTIVE",
    validFrom: stored.validFrom ?? null,
    validTo: stored.validTo ?? null,
    isCurrentlyValid: true,
    message: stored.message ?? "Permit verified for onboarding",
    company: stored.company
      ? {
          id: stored.company.id,
          legalName: stored.company.legalName,
          email: stored.company.email ?? null,
        }
      : null,
    companyOwnerEmail: stored.companyOwnerEmail ?? null,
    workspaceRoleId,
  };
}

/**
 * Record the company permit on the Seafarer backend (onboard Seafarer Employer / Training Institution).
 * Call this when the user clicks "Set up your account on Seafarer" on the verify-success page.
 * workspaceRoleId is taken from stored (set when user selects role); pass fallback from URL if needed.
 */
export async function recordCompanyPermit(
  stored: StoredPermitValidation,
  workspaceRoleIdFallback?: string | null
): Promise<ApiResponse<unknown>> {
  const body = buildCompanyPermitRecordBody(stored, workspaceRoleIdFallback);
  return apiPostMain<unknown>(API_RECORD, body);
}
