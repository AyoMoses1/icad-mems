# Frontend Integration: Multiple Document Types per Requirement

This guide helps frontend teams integrate with the backend changes that support **multiple document types per requirement**. Use it alongside the [Document Upload Flow](document-upload-flow.md) and [Frontend Service Management Guide](frontend-service-management-guide.md).

**Base API path:** `/seafarer/api/v1/`

---

## Table of Contents

1. [Overview](#overview)
2. [TypeScript Types](#typescript-types)
3. [Affected Endpoints and Responses](#affected-endpoints-and-responses)
4. [Using Single vs Multiple Document Types](#using-single-vs-multiple-document-types)
5. [Document Upload Flow](#document-upload-flow)
6. [Submit Validation](#submit-validation)
7. [UI Examples](#ui-examples)
8. [Error Handling](#error-handling)

---

## Overview

**What changed**

- A requirement can now accept **multiple** document types (e.g. “Passport **or** National ID”).
- The backend exposes:
  - **Legacy:** `documentTypesId` and `documentTypeDescription` (single, kept for backward compatibility).
  - **New:** `documentTypeIds` (array of GUIDs) and `documentTypes` (array of `{ documentTypesId, description }`).

**When to use which**

- Prefer **`documentTypeIds` / `documentTypes`** when present (they reflect the full set of allowed types).
- Fall back to **`documentTypesId` / `documentTypeDescription`** when the new fields are `null` or empty (single-doc or legacy requirements).

**Submit validation**

- For document requirements, the user must upload **at least one** document whose type is in the allowed set.
- A document of **any** of the allowed types satisfies the requirement.

---

## TypeScript Types

### DocumentTypeDto

```ts
export interface DocumentTypeDto {
  documentTypesId: string;
  description: string;
}
```

### ServiceRequirementDto

Used in **services** and **service requirements** (e.g. `GET /services/{id}`, `GET /services/{id}/requirements`).

```ts
export interface ServiceRequirementDto {
  serviceRequirementId: string;
  requirementListId: string;
  requirementName: string;
  rankId: string;
  rankDescription: string;
  requiredValue: string;
  metricId: string;
  metricDescription: string;

  // Legacy – single document type
  documentTypesId?: string | null;
  documentTypeDescription?: string | null;

  // New – multiple document types
  documentTypeIds?: string[] | null;
  documentTypes?: DocumentTypeDto[] | null;
}
```

### ApplicationRequirementDto

Used in **checklist**, **application**, and **application history** (e.g. `GET .../checklist`, `GET /applications/{id}`, `GET .../history`).

```ts
export interface ApplicationRequirementDto {
  applicationRequirementId?: string;
  requirementListId: string;
  requirementName: string;
  metricId: string;
  metricDescription: string;

  // Legacy – single document type
  documentTypesId?: string | null;
  documentTypeDescription?: string | null;

  // New – multiple document types
  documentTypeIds?: string[] | null;
  documentTypes?: DocumentTypeDto[] | null;

  requiredValue: string;
  actualValue?: string | null;
  isSubmitted: boolean;
  dateSubmitted?: string | null;
}
```

### ServiceDto

```ts
export interface ServiceDto {
  serviceId: string;
  serviceName: string;
  description?: string | null;
  serviceTypeId: string;
  serviceTypeDescription: string;
  isActive: boolean;
  requirements: ServiceRequirementDto[];
}
```

### ApiResponse wrapper

```ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}
```

---

## Affected Endpoints and Responses

| Endpoint | Response | Multi-doc fields |
|----------|----------|------------------|
| `GET /applications/services` | `List<ServiceDto>` | `requirements[].documentTypeIds`, `requirements[].documentTypes` |
| `GET /applications/services/{serviceId}` | `ServiceDto` | same |
| `GET /applications/services/{serviceId}/checklist` | `List<ApplicationRequirementDto>` | `documentTypeIds`, `documentTypes` |
| `GET /applications/{id}` | `ApplicationDto` | `requirements[].documentTypeIds`, `requirements[].documentTypes` |
| `GET /applications/history` (paginated) | `List<ApplicationHistoryDto>` | each item’s `requirements[].documentTypeIds`, `requirements[].documentTypes` |
| `GET /applications/{id}/history` | `ApplicationHistoryDto` | same |
| `GET /services/{serviceId}` | `ServiceDto` | same as above |
| `GET /services/{serviceId}/requirements` | `List<ServiceRequirementDto>` | `documentTypeIds`, `documentTypes` |
| `GET /services/{serviceId}/requirements/{requirementId}` | `ServiceRequirementDto` | same |
| `POST /services/{serviceId}/requirements` | `ServiceRequirementDto` | same |
| `PUT /services/{serviceId}/requirements/{requirementId}` | `ServiceRequirementDto` | same |

All of these continue to return `documentTypesId` and `documentTypeDescription` where applicable.

---

## Using Single vs Multiple Document Types

### Helper: get allowed document types for a requirement

Use this for **display** and **upload** (e.g. which types the user can choose).

```ts
function getAllowedDocumentTypes(req: ApplicationRequirementDto | ServiceRequirementDto): DocumentTypeDto[] {
  if (req.documentTypes && req.documentTypes.length > 0) return req.documentTypes;
  if (req.documentTypesId && req.documentTypeDescription)
    return [{ documentTypesId: req.documentTypesId, description: req.documentTypeDescription }];
  return [];
}
```

### Helper: get allowed document type IDs

Use this when **uploading** (single `documentTypesId` per request) or **validating** locally.

```ts
function getAllowedDocumentTypeIds(req: ApplicationRequirementDto | ServiceRequirementDto): string[] {
  if (req.documentTypeIds && req.documentTypeIds.length > 0) return req.documentTypeIds;
  if (req.documentTypesId) return [req.documentTypesId];
  return [];
}
```

### Check if a requirement needs documents

```ts
const isDocumentRequirement = (r: ApplicationRequirementDto | ServiceRequirementDto) =>
  r.metricDescription === 'File/Document';
```

---

## Document Upload Flow

1. **Checklist**  
   `GET /applications/services/{serviceId}/checklist` → filter `metricDescription === 'File/Document'`.

2. **Create application** (if needed)  
   `POST /applications` with `{ serviceId }`.

3. **For each document requirement**
   - Use `getAllowedDocumentTypes(req)`.
   - If **multiple** types: show a selector (e.g. dropdown or list) and let the user pick **one** type per upload.
   - If **single**: use `documentTypesId` / `documentTypeDescription` as before.

4. **Upload**  
   `POST /documents/applications/{applicationId}/upload` with `documentTypesId` set to the **chosen** type (must be one of `getAllowedDocumentTypeIds(req)`).

5. **Submit**  
   `POST /applications/{id}/submit` with `RequirementValues` for non-document requirements.  
   Document requirements are validated by the backend: **at least one** uploaded document whose type is in the requirement’s allowed set.

**Important:** The upload API still takes a **single** `documentTypesId` per request. For multi-doc requirements, the frontend chooses which allowed type each upload satisfies.

---

## Submit Validation

- **Backend:** For each `File/Document` requirement, the API checks that there exists at least one **non-deleted** application document whose `documentTypesId` is in the requirement’s allowed set (`documentTypesId` or `documentTypeIds`).
- **Frontend:** Before calling submit, you can avoid obvious errors by ensuring every document requirement has at least one upload whose type is in `getAllowedDocumentTypeIds(req)`.

---

## UI Examples

### Document requirement with multiple allowed types

```tsx
interface DocRequirementProps {
  req: ApplicationRequirementDto;
  applicationId: string;
  onUploaded: () => void;
}

function DocumentRequirementUpload({ req, applicationId, onUploaded }: DocRequirementProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const types = getAllowedDocumentTypes(req);

  return (
    <div>
      <h4>{req.requirementName}</h4>
      {types.length > 1 ? (
        <select
          value={selectedTypeId ?? ''}
          onChange={(e) => setSelectedTypeId(e.target.value || null)}
        >
          <option value="">Select document type</option>
          {types.map((t) => (
            <option key={t.documentTypesId} value={t.documentTypesId}>
              {t.description}
            </option>
          ))}
        </select>
      ) : types.length === 1 ? (
        <span>{types[0].description}</span>
      ) : null}
      <UploadButton
        applicationId={applicationId}
        documentTypesId={selectedTypeId ?? types[0]?.documentTypesId}
        disabled={types.length > 1 && !selectedTypeId}
        onSuccess={onUploaded}
      />
    </div>
  );
}
```

### Filtering document requirements from checklist

```ts
const checklistRes = await api.get<ApiResponse<ApplicationRequirementDto[]>>(
  `/applications/services/${serviceId}/checklist`
);
const requirements = checklistRes.data ?? [];
const documentReqs = requirements.filter((r) => r.metricDescription === 'File/Document');
```

### Verifying required uploads before submit

```ts
function hasAllDocumentUploads(
  requirements: ApplicationRequirementDto[],
  uploadedDocumentTypeIds: string[]
): boolean {
  const docReqs = requirements.filter((r) => r.metricDescription === 'File/Document');
  return docReqs.every((r) => {
    const allowed = getAllowedDocumentTypeIds(r);
    return allowed.some((id) => uploadedDocumentTypeIds.includes(id));
  });
}
```

`uploadedDocumentTypeIds` would come from your app state (e.g. list of documents already uploaded for the application).

---

## Error Handling

| Code | Meaning |
|------|---------|
| `DOCUMENT_TYPE_REQUIRED` | Creating/updating a service requirement: the requirement list is `File/Document` but has no document type (`DocumentTypesId` or `RequirementListDocumentTypes`). |
| `MISSING_DOCUMENT` | Submit: a document requirement has no uploaded document of any allowed type. |
| `REQUIREMENT_CREATION_FAILED` | Creating a service with initial requirements: one requirement failed validation (e.g. missing doc type). Message mentions “DocumentTypesId or RequirementListDocumentTypes”. |

Handle these in the UI (e.g. toast, inline message) and point users to fix the missing document or configuration.

---

## Summary

- **Types:** Add `documentTypeIds` and `documentTypes` to `ServiceRequirementDto` and `ApplicationRequirementDto`; keep `documentTypesId` / `documentTypeDescription`.
- **Logic:** Use `getAllowedDocumentTypes` / `getAllowedDocumentTypeIds` for display and upload. For multi-doc requirements, user picks one allowed type per upload.
- **Upload:** Still one `documentTypesId` per upload; it must be in the requirement’s allowed set.
- **Submit:** Backend accepts **any** allowed type per document requirement; ensure all document requirements have at least one such upload before submit.

For existing flows that only use `documentTypesId` / `documentTypeDescription`, behavior is unchanged. Extend them to use `documentTypeIds` / `documentTypes` when you add support for multiple document types per requirement.
