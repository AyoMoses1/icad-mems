---
name: ID Documents Management
overview: Create a comprehensive admin interface for managing ID documents (SubTypeId) with full CRUD operations, including a frontend page with create, update, view, and delete modals following the same patterns as the training certificates page.
todos:
  - id: add-id-document-types
    content: Add TypeScript interfaces (IdDocumentDto, CreateIdDocumentRequest, UpdateIdDocumentRequest) to frontend/src/types/index.ts
    status: pending
  - id: create-id-documents-page
    content: Create main ID documents page at frontend/src/app/(dashboard)/certification/id-documents/page.tsx with DataTable, pagination, and CRUD modals
    status: pending
    dependencies:
      - add-id-document-types
---

# ID Documents Management System

## Overview

Create a comprehensive admin interface for managing ID documents (SubTypeId) with full CRUD operations. The page will display ID documents in a table format with pagination, and include modals for creating, editing, viewing, and deleting ID documents.

## Backend Structure

The backend is already complete with:

- `IdDto` - Contains: Id, Name, CategoryType, StcwCode, Description, CreatedAt, IssuingBodyType, IsBiometric
- `CreateSubTypeIdRequest` - Contains: Name (required), StcwCode, Description, IssuingBodyType, IsBiometric
- `UpdateSubTypeIdRequest` - Contains: Name, StcwCode, Description, IssuingBodyType, IsBiometric (all optional)
- API Endpoints: `/api/Ids` with GET (paginated), GET by ID, POST, PUT, DELETE

## Frontend Changes

### 1. Add TypeScript Types

**File:** `frontend/src/types/index.ts`**Add interfaces:**

```typescript
export interface IdDocumentDto {
  id: string;
  name: string;
  categoryType: string;
  stcwCode?: string;
  description?: string;
  createdAt?: string;
  issuingBodyType?: string;
  isBiometric?: boolean;
}

export interface CreateIdDocumentRequest {
  name: string;
  stcwCode?: string;
  description?: string;
  issuingBodyType?: string;
  isBiometric?: boolean;
}

export interface UpdateIdDocumentRequest {
  name?: string;
  stcwCode?: string;
  description?: string;
  issuingBodyType?: string;
  isBiometric?: boolean;
}
```



### 2. Create Main ID Documents Page

**File:** `frontend/src/app/(dashboard)/certification/id-documents/page.tsx`**Features:**

- PageHeader with title "ID Documents" and "Add ID Document" button
- DataTable displaying ID documents with columns:
- Name (sortable)
- Issuing Body Type
- Is Biometric (badge: Yes/No)
- STCW Code
- Created At (sortable)
- Actions (dropdown with View, Edit, Delete)
- Pagination controls
- Sort by name (asc/desc)

**Modals:**

- **Create Modal**: Form with fields:
- Name (required)
- STCW Code (optional)
- Description (optional, textarea)
- Issuing Body Type (optional, text input)
- Is Biometric (checkbox)

- **Edit Modal**: Same fields as Create, pre-filled with selected document data

- **View Modal**: Read-only display of all document fields

- **Delete Modal**: ConfirmDialog for deletion confirmation

**API Integration:**

- Use `apiGetMain`, `apiPostMain`, `apiPutMain`, `apiDeleteMain`
- Endpoint: `/api/Ids`
- Handle pagination: `?pageNumber={page}&pageSize={pageSize}&sortDirection={direction}`

### 3. Implementation Details

**State Management:**

- `idDocuments`: IdDocumentDto[]
- `isLoading`: boolean
- `isCreateOpen`, `isEditOpen`, `isViewOpen`, `isDeleteOpen`: boolean
- `selectedIdDocument`: IdDocumentDto | null
- `formData`: CreateIdDocumentRequest / UpdateIdDocumentRequest
- `pageNumber`, `pageSize`, `sortDirection`, `totalCount`: pagination state

**Form Validation:**

- Name: required, max 255 characters
- STCW Code: max 50 characters (if provided)
- Issuing Body Type: max 50 characters (if provided, based on database constraint)
- Is Biometric: optional boolean

**UI Components:**

- Use existing shared components: `PageHeader`, `DataTable`, `ConfirmDialog`
- Use shadcn/ui: `Dialog`, `Input`, `Textarea`, `Select`, `Checkbox`, `Button`, `Badge`
- Follow same styling patterns as training certificates page

## File Structure

```javascript
frontend/
  src/
    app/(dashboard)/certification/
      id-documents/
        page.tsx (new)
    types/
      index.ts (update)
```



## API Endpoints Used

- `GET /api/Ids?pageNumber={n}&pageSize={n}&sortDirection={asc|desc}` - List all
- `GET /api/Ids/{id}` - Get by ID
- `POST /api/Ids` - Create
- `PUT /api/Ids/{id}` - Update
- `DELETE /api/Ids/{id}` - Delete (soft)

## Notes

- Follow the same patterns and structure as `frontend/src/app/(dashboard)/certification/training-certificates/page.tsx`
- Use `apiClientMain` helpers for all API calls
- IssuingBodyType is a free-form text field (no predefined values)
- IsBiometric is an optional boolean field
- All date fields should use `formatDate` utility for display
- Error handling via toast notifications