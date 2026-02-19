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
}

/**
 * Build the request body for CompanyPermit/record from stored permit validation.
 */
export function buildCompanyPermitRecordBody(
  stored: StoredPermitValidation
): CompanyPermitRecordRequest {
  const serviceTypeCode = stored.serviceTypeCode ?? "";
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
  };
}

/**
 * Record the company permit on the Seafarer backend (onboard Seafarer Employer / Training Institution).
 * Call this when the user clicks "Set up your account on Seafarer" on the verify-success page.
 */
export async function recordCompanyPermit(
  stored: StoredPermitValidation
): Promise<ApiResponse<unknown>> {
  const body = buildCompanyPermitRecordBody(stored);
  return apiPostMain<unknown>(API_RECORD, body);
}
