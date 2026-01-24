---
name: Onboarding Requirements Admin Page
overview: Create an admin page with modals for managing onboarding requirements. The page will allow admins to view, create, update, and delete onboarding requirements filtered by user type (Seafarer, MTI, Medical), with document master selection and mandatory flag management.
todos: []
---

# Onboarding Requirements Admin Page

## Overview

Build a comprehensive admin page for managing onboarding requirements with full CRUD operations. The page will display requirements in a table format with filtering by user type, and include modals for creating, editing, viewing, and deleting requirements.

## Files to Create/Modify

### 1. TypeScript Types (`frontend/src/types/index.ts`)

Add type definitions for onboarding requirements:

- `OnboardingRequirementDto` interface matching backend DTO

- `CreateOnboardingRequirementRequest` interface
- `UpdateOnboardingRequirementRequest` interface
- `DocumentMasterDto` interface (if not already present)
- `UserType` enum/constants

### 2. Main Page Component (`frontend/src/app/(dashboard)/onboarding-requirements/page.tsx`)

Create the main admin page with:

- **PageHeader** with title, description, and "Add Requirement" button

- **User Type Filter** - Select dropdown to filter by Seafarer, MTI, Medical, or All
- **DataTable** displaying:

- User Type (badge)

- Document Name (from DocumentMaster)
- Category Type
- Mandatory status (badge)

- Actions dropdown (Edit, Delete)
- **State Management**:
- Requirements list

- Loading state
- Selected user type filter

- Modal open states (create, edit, delete, view)
- Selected requirement for edit/delete
- **API Integration**:
- `loadRequirements(userType?)` - GET `/api/OnboardingRequirements?userType={userType}`

- `handleCreate` - POST `/api/OnboardingRequirements`

- `handleUpdate` - PUT `/api/OnboardingRequirements/{id}`

- `handleDelete` - DELETE `/api/OnboardingRequirements/{id}`

- `loadDocumentMasters` - GET `/api/Documents` (for dropdown)

### 3. Create Modal (`frontend/src/app/(dashboard)/onboarding-requirements/page.tsx`)

Dialog component with form:

- **User Type** - Select dropdown (Seafarer, MTI, Medical) - required

- **Document Master** - Select dropdown populated from `/api/Documents` - required
- **Is Mandatory** - Checkbox/Switch - optional

- Form validation using React Hook Form + Zod
- Submit button with loading state
- Cancel button

### 4. Edit Modal (`frontend/src/app/(dashboard)/onboarding-requirements/page.tsx`)

Dialog component similar to create, but:

- Pre-populated with selected requirement data
- Uses PUT endpoint

- Updates existing requirement

### 5. View Modal (Optional - `frontend/src/app/(dashboard)/onboarding-requirements/page.tsx`)

Read-only dialog showing:

- All requirement details

- Document master information
- User type
- Mandatory status

### 6. Delete Confirmation (`frontend/src/app/(dashboard)/onboarding-requirements/page.tsx`)

Use existing `ConfirmDialog` component:

- Shows requirement name/document name
- Confirms deletion action
- Calls DELETE endpoint

## Implementation Details

### API Client Usage

- Use `apiGet`, `apiPost`, `apiPut`, `apiDelete` from `@/lib/api-client`

- Handle `ApiResponse<T>` wrapper structure
- Extract `data` property from responses

- Handle errors with toast notifications

### Form Handling

- Use React Hook Form for form state
- Zod schema validation:

- UserType: enum validation (Seafarer, MTI, Medical)
- DocumentMasterId: UUID validation

- IsMandatory: optional boolean

- Show validation errors inline

### Document Master Selection

- Fetch document masters on component mount

- Store in state for dropdown population

- Display document name and category in dropdown

- Filter or search capability (optional enhancement)

### User Experience

- Loading states during API calls
- Toast notifications for success/error

- Optimistic updates (optional)

- Refresh data after create/update/delete

- Clear form on modal close
- Disable form submission during API calls

### Styling & Components

- Use existing UI components:

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`

- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`

- `Input`, `Label`, `Button`, `Badge`

- `Checkbox` or `Switch` for mandatory flag
- `DataTable` for listing
- `PageHeader` for page title

- `ConfirmDialog` for delete confirmation

## Data Flow

```javascript
Page Load → Fetch Requirements (with userType filter) → Display in Table
Click "Add" → Open Create Modal → Fill Form → Submit → POST API → Refresh Table
Click "Edit" → Open Edit Modal (pre-filled) → Modify → Submit → PUT API → Refresh Table
Click "Delete" → Open Confirm Dialog → Confirm → DELETE API → Refresh Table
Change User Type Filter → Fetch Filtered Requirements → Update Table
```



## Error Handling

- Network errors: Show toast with error message

- Validation errors: Display inline form errors
- 404 errors: Show appropriate message

- API error responses: Extract and display error message from `ApiResponse.error`

## Testing Considerations

- Test with different user types
- Test form validation

- Test API error scenarios
- Test empty states

- Test filtering functionality

## Future Enhancements (Out of Scope)

- Bulk operations

- Export functionality
- Advanced filtering/search

- Pagination (if requirements list grows large)