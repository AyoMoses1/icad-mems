/**
 * Requirement Helper Functions
 * Utilities for working with requirements and document types
 */

import type {
  ApplicationRequirementDto,
  ServiceRequirementDto,
} from "@/lib/services/application-service";

/** Requirement-like shape (document type fields + metricDescription). */
export type RequirementLike =
  | ApplicationRequirementDto
  | ServiceRequirementDto
  | {
      documentTypesId?: string | null;
      documentTypeDescription?: string | null;
      documentTypeIds?: string[] | null;
      documentTypes?: { documentTypesId: string; description: string }[] | null;
      metricDescription?: string | null;
    };

/**
 * DocumentTypeDto interface (re-exported for convenience)
 */
export interface DocumentTypeDto {
  documentTypesId: string;
  description: string;
}

/**
 * Get allowed document types for a requirement
 * Prefers new multi-doc fields, falls back to legacy single-doc fields
 *
 * @param req - Requirement-like (ApplicationRequirementDto, ServiceRequirementDto, RequirementListDto, etc.)
 * @returns Array of DocumentTypeDto objects
 */
export function getAllowedDocumentTypes(req: RequirementLike): DocumentTypeDto[] {
  // Prefer new multi-doc fields
  if (req.documentTypes && req.documentTypes.length > 0) {
    return req.documentTypes;
  }
  
  // Fall back to legacy single-doc fields
  if (req.documentTypesId && req.documentTypeDescription) {
    return [
      {
        documentTypesId: req.documentTypesId,
        description: req.documentTypeDescription,
      },
    ];
  }
  
  return [];
}

/**
 * Get allowed document type IDs for a requirement
 * Use this when uploading (single documentTypesId per request) or validating locally
 *
 * @param req - Requirement-like (ApplicationRequirementDto, ServiceRequirementDto, RequirementListDto, etc.)
 * @returns Array of document type ID strings
 */
export function getAllowedDocumentTypeIds(req: RequirementLike): string[] {
  // Prefer new multi-doc fields
  if (req.documentTypeIds && req.documentTypeIds.length > 0) {
    return req.documentTypeIds;
  }
  
  // Fall back to legacy single-doc field
  if (req.documentTypesId) {
    return [req.documentTypesId];
  }
  
  return [];
}

/**
 * Check if a requirement needs documents
 *
 * @param req - Requirement-like
 * @returns true if the requirement is a File/Document type
 */
export function isDocumentRequirement(req: RequirementLike): boolean {
  return req.metricDescription === "File/Document";
}

/**
 * Check if all document requirements have at least one uploaded document
 * of an allowed type
 *
 * @param requirements - Array of requirements to check
 * @param uploadedDocumentTypeIds - Array of document type IDs that have been uploaded
 * @returns true if all document requirements are satisfied
 */
export function hasAllDocumentUploads(
  requirements: RequirementLike[],
  uploadedDocumentTypeIds: string[]
): boolean {
  const docReqs = requirements.filter((r) => isDocumentRequirement(r));
  
  if (docReqs.length === 0) {
    return true; // No document requirements
  }
  
  return docReqs.every((r) => {
    const allowed = getAllowedDocumentTypeIds(r);
    if (allowed.length === 0) {
      return false; // Requirement has no allowed types (invalid state)
    }
    return allowed.some((id) => uploadedDocumentTypeIds.includes(id));
  });
}
