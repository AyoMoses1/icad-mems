---
name: Certificate Management Admin Pages
overview: "Create comprehensive admin pages for managing certificates with full CRUD operations. The system includes three main areas: Certificates (with fees), Certificate Requirements, and Certificate Fees. Each area will have its own management interface with modals for create, update, view, and delete operations."
todos: []
---

# Certificate Management Admin Pages

## Overview

Build a comprehensive certificate management system with three interconnected areas:

1. **Certificates** - Main certificate types (CoP/CoC) with basic info and fees
2. **Certificate Requirements** - Documents required to obtain certificates
3. **Certificate Fees** - Fee structures for certificates (by nationality, processing speed, etc.)

## Architecture

The system will use a tabbed or nested interface where:

- Main page shows certificates list
- Clicking a certificate opens detail view with tabs for Requirements and Fees
- Each section has its own CRUD modals

## Files to Create/Modify

### 1. TypeScript Types (`frontend/src/types/index.ts`)

Add type definitions:

- `CertificateDto` interface
- `CreateCertificateRequest` interface
- `UpdateCertificateRequest` interface
- `CertificateRequirementDto` interface
- `CreateCertificateRequirementRequest` interface
- `UpdateCertificateRequirementRequest` interface
- `CertificateFeeDto` interface
- `CertificateFeeInput` interface
- `PagedResult<T>` interface (if not exists)

### 2. Main Certificates List Page (`frontend/src/app/(dashboard)/certification/certificates/page.tsx`)

Main page displaying all certificates:

- **PageHeader** with title, description, and "Add Certificate" button
- **DataTable** with columns:
- Name
- Category Type (badge)
- Cert Type (CoP/CoC badge)
- STCW Code
- Rank Level
- Tonnage Limit
- Fees Count
- Created Date
- Actions (View Details, Edit, Delete)
- **Pagination** support (pageNumber, pageSize, sortDirection)
- **Search/Filter** capability (optional enhancement)
- **State Management**:
- Certificates list (paginated)
- Loading state
- Selected certificate for operations
- Modal states

### 3. Certificate Detail Page (`frontend/src/app/(dashboard)/certification/certificates/[id]/page.tsx`)

Detail view for a single certificate with tabs:

- **Tab 1: Overview**
- Certificate basic info (read-only or editable)
- Edit button opens edit modal
- **Tab 2: Requirements**
- List of certificate requirements
- "Add Requirement" button
- Table showing:
    - Required Document Name
    - Requirement Group ID
    - Is Mandatory (badge)
    - Actions (Edit, Delete)
- **Tab 3: Fees**
- List of certificate fees
- "Add Fee" button
- Table showing:
    - Nationality Type
    - Processing Speed
    - Amount & Currency
    - Effective From/To dates
    - Actions (Edit, Delete)

### 4. Certificate Create Modal (`frontend/src/app/(dashboard)/certification/certificates/page.tsx`)

Dialog with form:

- **Name** - Text input (required, max 255 chars)
- **Cert Type** - Select dropdown (CoP, CoC) - required
- **STCW Code** - Text input (optional)
- **Description** - Textarea (optional)
- **Rank Level** - Text input (optional)
- **Tonnage Limit** - Text input (optional)
- **Fees** - Dynamic list section:
- Add Fee button
- Each fee row: Nationality Type, Processing Speed, Amount, Currency, Effective From/To
- Remove fee button per row
- Form validation with Zod schema
- Submit creates certificate with fees

### 5. Certificate Edit Modal (`frontend/src/app/(dashboard)/certification/certificates/page.tsx`)

Similar to create modal but:

- Pre-populated with certificate data
- Uses PUT endpoint
- Updates existing certificate

### 6. Certificate View Modal (`frontend/src/app/(dashboard)/certification/certificates/page.tsx`)

Read-only dialog showing:

- All certificate details
- List of fees
- Created date

### 7. Certificate Delete Confirmation (`frontend/src/app/(dashboard)/certification/certificates/page.tsx`)

Uses `ConfirmDialog` component:

- Shows certificate name
- Confirms soft deletion
- Calls DELETE endpoint

### 8. Requirement Create Modal (`frontend/src/app/(dashboard)/certification/certificates/[id]/page.tsx`)

Dialog for adding requirements:

- **Target Document** - Pre-filled (current certificate)
- **Required Document** - Select dropdown (from DocumentMaster list) - required
- **Requirement Group ID** - Number input (optional)
- **Is Mandatory** - Checkbox (optional)
- Form validation
- Submit creates requirement

### 9. Requirement Edit Modal (`frontend/src/app/(dashboard)/certification/certificates/[id]/page.tsx`)

Similar to create but:

- Pre-populated with requirement data
- Uses PUT endpoint
- Updates existing requirement

### 10. Requirement Delete Confirmation (`frontend/src/app/(dashboard)/certification/certificates/[id]/page.tsx`)

Uses `ConfirmDialog`:

- Shows required document name
- Confirms deletion

### 11. Fee Create Modal (`frontend/src/app/(dashboard)/certification/certificates/[id]/page.tsx`)

Dialog for adding fees:

- **Nationality Type** - Select dropdown (Nigerian, Foreign) - optional
- **Processing Speed** - Select dropdown (Express, Standard) - optional
- **Amount** - Number input (required, >= 0)
- **Currency** - Text input (optional, max 10 chars)
- **Effective From** - Date picker (required)
- **Effective To** - Date picker (optional, must be >= Effective From)
- Form validation
- Submit creates fee

### 12. Fee Edit Modal (`frontend/src/app/(dashboard)/certification/certificates/[id]/page.tsx`)

Similar to create but:

- Pre-populated with fee data
- Uses PUT endpoint
- Updates existing fee

### 13. Fee Delete Confirmation (`frontend/src/app/(dashboard)/certification/certificates/[id]/page.tsx`)

Uses `ConfirmDialog`:

- Shows fee details (amount, currency)
- Confirms expiration (sets EffectiveTo to today)

## API Integration

### Certificate Endpoints

- `GET /api/Certificates?pageNumber=1&pageSize=20&sortDirection=asc` - List certificates
- `GET /api/Certificates/{id}` - Get certificate by ID
- `POST /api/Certificates` - Create certificate
- `PUT /api/Certificates/{id}` - Update certificate
- `DELETE /api/Certificates/{id}` - Delete certificate (soft)

### Requirement Endpoints

- `GET /api/Certificates/{certificateId}/requirements` - Get requirements
- `GET /api/Certificates/requirements/{requirementId}` - Get requirement by ID
- `POST /api/Certificates/{certificateId}/requirements` - Create requirement
- `PUT /api/Certificates/requirements/{requirementId}` - Update requirement
- `DELETE /api/Certificates/requirements/{requirementId}` - Delete requirement

### Fee Endpoints

- `GET /api/Certificates/{certificateId}/fees` - Get fees
- `GET /api/Certificates/{certificateId}/fees/{feeId}` - Get fee by ID
- `POST /api/Certificates/{certificateId}/fees` - Create fee
- `PUT /api/Certificates/{certificateId}/fees/{feeId}` - Update fee
- `DELETE /api/Certificates/{certificateId}/fees/{feeId}` - Delete fee (expires)

## Implementation Details

### Form Validation (Zod Schemas)

```typescript
// Certificate
- Name: string, required, max 255
- CertType: enum ["CoP", "CoC"], required
- StcwCode: string, optional
- Description: string, optional
- RankLevel: string, optional
- TonnageLimit: string, optional
- Fees: array of CertificateFeeInput, optional

// CertificateFeeInput
- NationalityType: enum ["Nigerian", "Foreign"], optional
- ProcessingSpeed: enum ["Express", "Standard"], optional
- Amount: number, required, >= 0
- Currency: string, optional, max 10
- EffectiveFrom: Date, required
- EffectiveTo: Date, optional, >= EffectiveFrom

// CertificateRequirement
- RequiredDocumentMasterId: UUID, required
- RequirementGroupId: number, optional
- IsMandatory: boolean, optional
```



### Component Structure

- Use existing UI components: Dialog, Select, Input, Textarea, Button, Badge, Tabs
- Use `DataTable` for listings
- Use `PageHeader` for page titles
- Use `ConfirmDialog` for deletions
- Use React Hook Form + Zod for form handling

### State Management

- Use `useState` for local component state
- Fetch data on mount and after mutations
- Handle loading and error states
- Optimistic updates (optional)

### User Experience

- Loading states during API calls
- Toast notifications for success/error
- Form validation with inline errors
- Clear forms on modal close
- Refresh data after mutations
- Disable form submission during API calls
- Date picker for effective dates

## Data Flow

```javascript
Certificates List Page:
  Load → Fetch Certificates (paginated) → Display Table
  Click "Add" → Open Create Modal → Submit → POST → Refresh
  Click "Edit" → Open Edit Modal → Submit → PUT → Refresh
  Click "View" → Navigate to Detail Page
  Click "Delete" → Confirm → DELETE → Refresh

Certificate Detail Page:
  Load → Fetch Certificate + Requirements + Fees → Display Tabs
  Requirements Tab:
    Click "Add" → Open Create Modal → Submit → POST → Refresh
    Click "Edit" → Open Edit Modal → Submit → PUT → Refresh
    Click "Delete" → Confirm → DELETE → Refresh
  Fees Tab:
    Click "Add" → Open Create Modal → Submit → POST → Refresh
    Click "Edit" → Open Edit Modal → Submit → PUT → Refresh
    Click "Delete" → Confirm → DELETE → Refresh
```



## Error Handling

- Network errors: Toast notification
- Validation errors: Inline form errors
- 404 errors: Appropriate message
- API error responses: Extract and display error message

## Additional Considerations

- Document Master dropdown: Fetch from `/api/Documents` for requirement selection
- Date handling: Use date-fns or similar for date formatting
- Currency formatting: Display amounts with currency symbol
- Pagination: Handle page navigation for certificates list
- Empty states: Show appropriate messages when no data

## Future Enhancements (Out of Scope)

- Bulk operations
- Export functionality
- Advanced filtering/search
- Certificate type filtering