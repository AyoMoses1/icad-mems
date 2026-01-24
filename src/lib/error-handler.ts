/**
 * Central API error mapping for user-facing messages.
 * Use with ApiError thrown from api-client (apiClientMain).
 */

import { ApiError } from "@/lib/api-client";
import {
  OnboardingErrorCodes,
  RequirementListErrorCodes,
  ApplicationRequirementErrorCodes,
} from "@/types/errors";

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case OnboardingErrorCodes.PENDING_ONBOARDING_EXISTS:
        return "You already have a pending onboarding application. Please wait for approval.";
      case OnboardingErrorCodes.DRAFT_ONBOARDING_EXISTS:
        return "You have a draft onboarding. Please submit it before creating a new one.";
      case OnboardingErrorCodes.ACTIVE_ONBOARDING_EXISTS:
        return "You have an active approved onboarding. Please complete it first.";
      case OnboardingErrorCodes.ONBOARDING_NOT_FOUND:
        return "Onboarding record not found.";
      case RequirementListErrorCodes.DUPLICATE_DOCUMENT_TYPE_IDS:
        return "Duplicate document type IDs are not allowed.";
      case RequirementListErrorCodes.DOCUMENT_TYPE_ASSOCIATION_FAILED:
        return "Failed to associate document types with requirement list.";
      case RequirementListErrorCodes.DOCUMENT_TYPE_ASSOCIATION_UPDATE_FAILED:
        return "Failed to update document type associations for requirement list.";
      case ApplicationRequirementErrorCodes.DOCUMENT_TYPE_REQUIRED:
        return "This requirement requires at least one document type to be specified.";
      case ApplicationRequirementErrorCodes.MISSING_DOCUMENT:
        return "Please upload at least one document of an allowed type for this requirement.";
      case ApplicationRequirementErrorCodes.REQUIREMENT_CREATION_FAILED:
        return "Failed to create requirement. Please ensure all document types are properly configured.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }
  if (error instanceof Error) {
    return error.message || "An unexpected error occurred.";
  }
  return "An unexpected error occurred.";
}
