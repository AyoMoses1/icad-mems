---
name: Training Documents Management
overview: Create a comprehensive admin interface for managing training documents (SubTypeTraining) with full CRUD operations. The backend already supports the Category field. The frontend page exists but needs to be verified/updated to match the plan requirements.
todos:
  - id: verify-types
    content: Verify TypeScript interfaces (TrainingCertificateDto, CreateTrainingCertificateRequest, UpdateTrainingCertificateRequest) exist in frontend/src/types/index.ts with Category field
    status: pending
  - id: verify-page
    content: Verify training certificates page exists and has all required features (DataTable, pagination, CRUD modals with Category field)
    status: pending
    dependencies:
      - verify-types
  - id: update-if-needed
    content: Update page if any features are missing or Category field is not properly implemented
    status: pending
    dependencies:
      - verify-page
---

# Training Documents Management

System

## Overview

Create a comprehensive admin interface for managing training documents (SubTypeTraining) with full CRUD operations. The backend already includes Category field support. Verify and ensure the frontend page matches all requirements.

## Backend Status

✅ Already complete:

- `TrainingDto` includes Category field
- `CreateSubTypeTrainingRequest` includes Category field  
- `UpdateSubTypeTrainingRequest` includes Category field
- `SubTypeTrainingService` handles Category in CreateAsync, UpdateAsync, and ToDto
- Validators validate Category field (must be one of: Mandatory, Preparatory, Non-Conventional, Tanker / Specialized Training)

## Frontend Changes

### 1. Verify/Add TypeScript Types

**File:** `frontend/src/types/index.ts`**Verify interfaces exist:**

- `TrainingCertificateDto` interface with Category field
- `CreateTrainingCertificateRequest` interface with Category field
- `UpdateTrainingCertificateRequest` interface with Category field

### 2. Verify/Create Main Training Certificates Page

**File:** `frontend/src/app/(dashboard)/certification/training-certificates/page.tsx`**Required Features:**

- PageHeader with title "Training Certificates" and "Add Training Certificate" button
- DataTable displaying training certificates with columns:
- Name (sortable)
- Category (badge)
- STCW Code
- IMO Model Course
- Refresher Cycle Years
- Has Practical Assessment (badge)
- Created At (sortable)
- Actions (dropdown with View, Edit, Delete)
- Pagination controls
- Sort by name (asc/desc)

**Modals:**

- **Create Modal**: Form with fields:
- Name (required)
- STCW Code (optional)
- Description (optional, textarea)
- Category (Select dropdown: Mandatory, Preparatory, Non-Conventional, Tanker / Specialized Training)
- IMO Model Course (optional)
- Refresher Cycle Years (optional, number input)
- Has Practical Assessment (checkbox)
- **Edit Modal**: Same fields as Create, pre-filled with selected certificate data
- **View Modal**: Read-only display of all certificate fields
- **Delete Modal**: ConfirmDialog for deletion confirmation

**API Integration:**

- Use `apiGetMain`, `apiPostMain`, `apiPutMain`, `apiDeleteMain`
- Endpoint: `/api/Trainings-Certificates`
- Handle pagination: `?pageNumber={page}&pageSize={pageSize}&sortDirection={direction}`

### 3. Implementation Details

**State Management:**

- `trainings`: TrainingCertificateDto[]
- `isLoading`: boolean
- `isCreateOpen`, `isEditOpen`, `isViewOpen`, `isDeleteOpen`: boolean
- `selectedTraining`: TrainingCertificateDto | null
- `formData`: CreateTrainingCertificateRequest / UpdateTrainingCertificateRequest
- `pageNumber`, `pageSize`, `sortDirection`, `totalCount`: pagination state

**Form Validation:**

- Name: required, max 255 characters
- STCW Code: max 50 characters (if provided)
- IMO Model Course: max 80 characters (if provided)
- Refresher Cycle Years: >= 0 (if provided)
- Category: must be one of the 4 allowed values (if provided)

**UI Components:**

- Use existing shared components: `PageHeader`, `DataTable`, `ConfirmDialog`
- Use shadcn/ui: `Dialog`, `Input`, `Textarea`, `Select`, `Checkbox`, `Button`, `Badge`
- Follow same styling patterns as certificates page

## File Structure

```javascript
frontend/
  src/
    app/(dashboard)/certification/
      training-certificates/
        page.tsx (verify/update)
    types/
      index.ts (verify/update)
```



## API Endpoints Used

- `GET /api/Trainings-Certificates?pageNumber={n}&pageSize={n}&sortDirection={asc|desc}` - List all
- `GET /api/Trainings-Certificates/{id}` - Get by ID
- `POST /api/Trainings-Certificates` - Create
- `PUT /api/Trainings-Certificates/{id}` - Update
- `DELETE /api/Trainings-Certificates/{id}` - Delete (soft)

## Notes

- Follow the same patterns and structure as `frontend/src/app/(dashboard)/certification/certificates/page.tsx`
- Use `apiClientMain` helpers for all API calls
- Category field is optional but when provided must match one of the 4 allowed values
- All date fields should use `formatDate` utility for display