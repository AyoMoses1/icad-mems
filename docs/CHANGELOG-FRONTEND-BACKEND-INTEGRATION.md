# Frontend Backend Integration – Change Summary

This document summarizes all changes made to align the frontend with the backend updates described in `docs/api/frontend-integration-guide-update.md` and the implementation plan.

---

## 1. Types and Error Codes

### `src/types/errors.ts` (new file)

- **`OnboardingErrorCodes`** enum:
  - `PENDING_ONBOARDING_EXISTS`
  - `DRAFT_ONBOARDING_EXISTS`
  - `ACTIVE_ONBOARDING_EXISTS`
  - `ONBOARDING_NOT_FOUND`
- **`RequirementListErrorCodes`** enum:
  - `DUPLICATE_DOCUMENT_TYPE_IDS`
  - `DOCUMENT_TYPE_ASSOCIATION_FAILED`
  - `DOCUMENT_TYPE_ASSOCIATION_UPDATE_FAILED`

### `src/types/service-management.ts`

- **`DocumentTypeDto`**: `documentTypesId`, `description`, optional `code`, `isActive`.
- **`RequirementListDto`**:
  - Added `documentTypeIds?: string[]`, `documentTypes?: DocumentTypeDto[]`.
  - Kept `documentTypesId`, `documentTypeDescription` for backward compatibility.
- **`CreateRequirementListRequest`** / **`UpdateRequirementListRequest`**:
  - Added `documentTypeIds?: string[]`.
  - Kept `documentTypesId` optional.

### `src/lib/services/lookup-service.ts`

- **`DocumentTypeDto`**: added optional `code` and `isActive`.

### `src/lib/services/onboarding-service.ts`

- New DTOs: **`ProfileDocumentDto`**, **`VoyageDocumentDto`**, **`TrainingDocumentDto`**, **`SeafarerTrainingDto`**, **`VoyageActivityDto`** (with nested `documents`, `filePathOrUrl`, `totalSeaTimeDays`, etc.).
- **`UserSeafarerOnboardingDto`** extended with:
  - Arrays: `seafarerTrainings`, `voyageActivities`, `profileDocuments`, `trainingDocuments`, `voyageDocuments`.
  - Flags/counts: `hasSeafarerTrainings`, `hasVoyageActivities`, `hasProfileDocuments`, `seafarerTrainingCount`, `voyageActivityCount`, `profileDocumentCount`.
  - Status: `isOnboardingComplete`, `hasActiveOnboarding`, `canCreateNewOnboarding`, `blockingReason`, `activeOnboardingRole`, `activeOnboardingStatus`, `userSeafarerOnboardingId`.
- **API base** updated from `/seafarer/api/v1/onboarding` to `/seafarer/api/v1/Onboarding` (PascalCase).

### `src/lib/services/application-service.ts`

- **`ApplicationDashboardDto`**: added `totalSeaTimeDays`, `totalSeaTimeMonths`, `totalSeaTimeYears`.

---

## 2. API Layer

### `src/lib/api-client.ts`

- **`ApiErrorPayload`** interface: `message`, `code` (shape of error in API JSON).
- **`ApiError`** class (extends `Error`): `code`, `message`, optional `statusCode`; used for throw-on-error and `handleApiError`.
- **`ApiResponse<T>`**: `error` typed as `ApiErrorPayload`.
- **`apiClientMain`**:
  - On non-2xx: throws `ApiError` with `data.error?.code`, `data.error?.message` (or fallbacks), and `response.status`.
  - In `catch`: rethrows `ApiError` as-is; still rethrows `Error` and handles network failures.

### `src/lib/error-handler.ts` (new file)

- **`handleApiError(error: unknown): string`**:
  - Maps `OnboardingErrorCodes` and `RequirementListErrorCodes` to user-facing messages.
  - Falls back to `error.message` or a generic message.
  - Handles both `ApiError` and plain `Error`.

### `src/lib/services/service-management-api.ts`

- **`buildRequirementListPayload`** helper:
  - When `documentTypeIds` is non-empty, sends `documentTypeIds` and omits `documentTypesId`.
  - Otherwise keeps `documentTypesId` for backward compatibility.
- **`createRequirementList`** / **`updateRequirementList`**: use `buildRequirementListPayload` before `apiPostMain` / `apiPutMain`.

---

## 3. Requirement Lists UI

### `src/app/(dashboard)/admin/requirement-lists/page.tsx`

- **Imports**: `handleApiError`, `Checkbox`.
- **Form state**: added `documentTypeIds: string[]`; kept `documentTypesId` for backward compatibility.
- **Create**:
  - Validation: “at least one document type” when metric is File/Document (`documentTypeIds` or `documentTypesId`).
  - Builds payload with `documentTypeIds` or `documentTypesId`; calls `createRequirementList`.
  - Reset includes `documentTypeIds: []`.
  - Catch uses `handleApiError(error)`.
- **Update**:
  - Same validation and payload logic for File/Document.
  - Catch uses `handleApiError(error)`.
- **Delete**: catch uses `handleApiError(error)`.
- **`handleEdit`**: sets `documentTypeIds` from `requirementList.documentTypeIds` or `[requirementList.documentTypesId]`.
- **`toggleDocumentType`**: toggles `documentTypeIds` in form state.
- **Create/Edit modals**:
  - File/Document: single Select replaced with **multi-select checkboxes** over document types (description, optional code).
  - Metric change clears `documentTypeIds` when switching away from File/Document.
  - Create/Update buttons disabled when File/Document and no document type selected.
- **View modal**: if `documentTypes?.length > 0`, renders list of `documentTypes` (description, code); else uses `documentTypeDescription`.
- **Table**: “Document Type” column shows `documentTypes.map(t => t.description).join(", ")` when present, else `documentTypeDescription` or `"N/A"`.

---

## 4. Seafarer Dashboard – Total Sea Time

### `src/app/(dashboard)/seafarer/dashboard/page.tsx`

- **`formatSeaTime()`**:
  - Returns `"No sea time recorded"` when `totalSeaTimeDays` is missing or zero.
  - Otherwise builds `"X years, Y months, Z days"` from `totalSeaTimeYears`, `totalSeaTimeMonths`, `totalSeaTimeDays`.
- **Total Sea Time** block (new card):
  - Title: “Total Sea Time” (Ship icon).
  - Three stat cells: Days, Months, Years from `ApplicationDashboardDto`.
  - Formatted line via `formatSeaTime()`.

---

## 5. Admin Onboarding Review

### `src/app/(dashboard)/admin/onboarding/[id]/page.tsx`

- **Imports**: `Award`, `Ship` from lucide-react; `CardDescription` from card.
- **`handleDownloadDocument`**:
  - Signature: `(filePathOrUrl: string | null | undefined)`.
  - No-op when `filePathOrUrl` is missing or empty.
  - Supports full `http` URLs; otherwise prepends `getApiBaseUrl()` and normalizes leading slash.
- **Tabs**:
  - `TabsList`: `flex flex-wrap`; conditional **Training**, **Voyages**, **Profile docs** triggers when `hasSeafarerTrainings`, `hasVoyageActivities`, `hasProfileDocuments` respectively.
- **Training tab** (when `hasSeafarerTrainings`):
  - Lists `seafarerTrainings`; each card shows `certificateName`, `institutionSTCWAccreditationName`, `trainingStatusDescription`, start/end dates.
  - “Documents” subsection: `training.documents` with `documentTypeDescription`, “View” → `handleDownloadDocument(doc.filePathOrUrl)`; View disabled when no `filePathOrUrl`.
- **Voyages tab** (when `hasVoyageActivities`):
  - Lists `voyageActivities`; each card shows vessel, IMO, flag, dates, `totalSeaTimeDays`.
  - “Documents” subsection: same pattern as training; View disabled when no `filePathOrUrl`.
- **Profile docs tab** (when `hasProfileDocuments`):
  - Lists `profileDocuments`; each row shows `documentTypeDescription`, `documentNumber`, issue/expiry, “View” → `handleDownloadDocument(doc.filePathOrUrl)`; View disabled when no `filePathOrUrl`.
- **Education / Documents tabs**: View buttons for education and institution documents use `disabled={!doc.filePathOrUrl?.trim()}` and `handleDownloadDocument(doc.filePathOrUrl)`.

---

## 6. Onboarding Gating

### `src/app/(dashboard)/onboarding/page.tsx`

- **Imports**: `getMyOnboarding`, `UserSeafarerOnboardingDto`, `Link`, `Button`.
- **State**: `myOnboarding`, `onboardingCheckDone`.
- **`finishOnboardingRole(role)`** (used when role is SEAFARER / AGENT / TRAINING_INSTITUTION):
  - Sets `userRole`.
  - Calls `getMyOnboarding()`, sets `myOnboarding` from `res.data` (or `null` on error).
  - Sets `onboardingCheckDone` in `finally`.
- **Blocked UI** (when `myOnboarding != null` and `canCreateNewOnboarding === false`):
  - Card: “Cannot Create New Onboarding.”
  - Shows `blockingReason` when present.
  - When `hasActiveOnboarding` and `userSeafarerOnboardingId`: shows active role/status and “View active onboarding” link → `/admin/onboarding/{userSeafarerOnboardingId}`.
  - Form and create entry are not shown.
- **Form display**: when not blocked, same role-based forms (Seafarer, Agent, Training Institution) as before.

---

## 7. Error Handling in Onboarding Forms

### `src/components/onboarding/SeafarerOnboardingForm.tsx`

- Import `handleApiError`.
- On submit error: `toast.error(handleApiError(error))` instead of `error instanceof Error ? error.message : "..."`.

### `src/components/onboarding/AgentOnboardingForm.tsx`

- Same: `handleApiError` import and `toast.error(handleApiError(error))` on submit error.

### `src/components/onboarding/TrainingInstitutionOnboardingForm.tsx`

- Same: `handleApiError` import and `toast.error(handleApiError(error))` on submit error.

---

## 8. Files Touched (Summary)

| File | Action |
|------|--------|
| `src/types/errors.ts` | **New** – onboarding & requirement-list error codes |
| `src/types/service-management.ts` | Extended – `DocumentTypeDto`, `RequirementListDto`, create/update requests |
| `src/lib/error-handler.ts` | **New** – `handleApiError` |
| `src/lib/api-client.ts` | `ApiError` class, `ApiErrorPayload`, `apiClientMain` throw behaviour |
| `src/lib/services/lookup-service.ts` | `DocumentTypeDto` + `code`, `isActive` |
| `src/lib/services/service-management-api.ts` | `buildRequirementListPayload`, create/update wiring |
| `src/lib/services/onboarding-service.ts` | New DTOs, extended `UserSeafarerOnboardingDto`, API base casing |
| `src/lib/services/application-service.ts` | `ApplicationDashboardDto` sea time fields |
| `src/app/(dashboard)/admin/requirement-lists/page.tsx` | Multi-select doc types, view/table, create/edit, `handleApiError` |
| `src/app/(dashboard)/admin/onboarding/[id]/page.tsx` | Training, Voyages, Profile tabs; document links; `handleDownloadDocument` |
| `src/app/(dashboard)/seafarer/dashboard/page.tsx` | Sea time block, `formatSeaTime` |
| `src/app/(dashboard)/onboarding/page.tsx` | `getMyOnboarding`, gating, blocked UI |
| `src/components/onboarding/SeafarerOnboardingForm.tsx` | `handleApiError` on submit |
| `src/components/onboarding/AgentOnboardingForm.tsx` | `handleApiError` on submit |
| `src/components/onboarding/TrainingInstitutionOnboardingForm.tsx` | `handleApiError` on submit |

---

## 9. Backward Compatibility

- Requirement lists: support both `documentTypes` / `documentTypeIds` and `documentTypeDescription` / `documentTypesId`.
- Onboarding: works when new fields (trainings, voyages, profile) are absent.
- Existing flows (non–File/Document metrics, non-seafarer onboardings, dashboard apps/invoices) unchanged.
