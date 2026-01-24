# Comprehensive Onboarding Implementation

## Overview

This document describes the implementation of the comprehensive onboarding flow for seafarers in the mems-seafarer-frontend application, based on the API specification in `API_SPEC_COMPREHENSIVE_ONBOARDING.md`.

## Implementation Date

December 30, 2024

## What Was Implemented

### 1. Comprehensive Onboarding Service (`src/lib/services/comprehensive-onboarding-service.ts`)

Created a new service module that handles the comprehensive onboarding API endpoint:

- **Endpoint**: `POST /seafarer/api/v1/onboarding/comprehensive`
- **Features**:
  - Single transaction onboarding (all-or-nothing)
  - Support for SEAFARER, TRAINING_INSTITUTION, and AGENT roles
  - Contact details submission
  - Education history with multiple records
  - Profile document uploads
  - Education document uploads (linked to education records)
  - Institution document uploads

**Key Functions**:
- `submitComprehensiveOnboarding()`: Main function to submit all onboarding data in one transaction
- Comprehensive TypeScript types for all request and response structures

### 2. Multistep Onboarding Form (`src/app/(dashboard)/onboarding/comprehensive/page.tsx`)

Created a comprehensive multistep form component with the following steps:

#### Step 1: Basic Information
- Pre-populated user data from `userInfo` (name, email, phone - all read-only)
- Information message about pre-filled data
- No editable fields on this step

#### Step 2: Contact Information
- Phone number (pre-populated from userInfo)
- Email (pre-populated from userInfo)
- Residential address (pre-populated from userInfo address)
- Emergency contact details:
  - Contact person name
  - Relationship
  - Phone number
  - Address

#### Step 3: Education History
- Add multiple education records
- Each record includes:
  - Institution name
  - Certificate obtained
  - Start date
  - End date
- Ability to add/remove education records dynamically

#### Step 4: Document Uploads
- **Profile Documents**: Upload documents like passport, medical certificates, etc.
- **Education Documents**: Upload documents linked to specific education records
- Each document includes:
  - Document Type ID (GUID)
  - Document number
  - Issue date
  - Expiry date
  - Issuing authority
  - File upload (PDF, JPG, PNG, DOC, DOCX)

#### Step 5: Review & Submit
- Summary of all entered information
- Final submission button
- Single transaction submission - all data is saved together

**Features**:
- Progress indicator showing completion percentage
- Tab-based navigation between steps
- Form validation
- File size validation (max 10MB per file)
- Loading states during submission
- Success/error notifications
- Automatic redirect to dashboard after successful submission

### 3. Dashboard Updates (`src/app/(dashboard)/seafarer/dashboard/page.tsx`)

Updated the seafarer dashboard to conditionally show onboarding status:

**When `is_onboarding_complete === false`**:
- Shows a prominent orange-bordered card
- Alert message indicating onboarding is required
- "Start Onboarding Process" button linking to `/onboarding/comprehensive`

**When `is_onboarding_complete === true`**:
- Shows a green success card
- Displays completed onboarding steps
- No action button needed

### 4. User Type Updates (`src/types/index.ts`)

Extended the `UserInfo` interface to include:
- `is_onboarding_complete?: boolean` - Flag to check onboarding status
- Additional user fields from the IAM system:
  - `middle_name`
  - `phone_number`
  - `phone_number_verified`
  - `date_of_birth`
  - `created_at`, `updated_at`, `last_login`
  - `address` object with full address details
  - `workspaces` array
  - `workspace_id`, `workspace_name`, `tenant_id`
  - `is_workspace_bound`

### 5. API Endpoint Path Corrections

Fixed endpoint paths across service files to use lowercase and include `/v1`:

**Files Updated**:
- `src/lib/services/onboarding-service.ts`:
  - Changed from `/seafarer/api/v1/Onboarding` to `/seafarer/api/v1/onboarding`
- `src/lib/services/seafarers.ts`:
  - Changed from `/api/Seafarers` to `/api/v1/seafarers`

**Affected Endpoints**:
- `GET /seafarer/api/v1/onboarding/my-onboarding`
- `GET /seafarer/api/v1/onboarding/{id}`
- `POST /seafarer/api/v1/onboarding/auto-create`
- `GET /seafarer/api/v1/onboarding/pending`
- `GET /seafarer/api/v1/onboarding/all`
- `PATCH /seafarer/api/v1/onboarding/{id}/status`
- `GET /api/v1/seafarers/me`
- `GET /api/v1/seafarers/me/onboarding-status`
- `GET /api/v1/seafarers/{seafarerId}/documents`
- `POST /api/v1/seafarers`

## User Flow

1. **User logs in** with valid credentials
2. **After userInfo is fetched**, user is automatically redirected to `/seafarer/dashboard`
3. **Dashboard loads** and checks `user.is_onboarding_complete`
4. **If onboarding is NOT complete**:
   - Dashboard shows onboarding alert card
   - User clicks "Start Onboarding Process"
   - User is taken to `/onboarding/comprehensive`
5. **User completes multistep form**:
   - Step 1: Reviews pre-filled basic info (read-only)
   - Step 2: Confirms contact details, adds emergency contact
   - Step 3: Adds education history
   - Step 4: Uploads profile and education documents
   - Step 5: Reviews all information and submits
6. **Backend processes onboarding**:
   - Creates onboarding record
   - Saves contact details
   - Saves education records
   - Uploads all documents
   - Links documents to education records
   - All in a single transaction
7. **User is redirected** to seafarer dashboard
8. **Admin reviews and approves** onboarding
9. **User's account is updated** with `is_onboarding_complete = true`

## Key Features

### 1. Pre-populated Fields
User data from the IAM `userInfo` endpoint is pre-populated and made read-only (without "(From Account)" labels):
- First name, middle name, last name
- Email address
- Phone number
- Residential address (from address object)

### 2. Transaction Safety
The comprehensive onboarding API ensures:
- All-or-nothing submission
- Automatic rollback on failure
- No partial data saves
- Data consistency

### 3. User Experience
- Clear progress indicator
- Step-by-step guidance
- Form validation
- Error handling with user-friendly messages
- Success notifications
- Warning messages for non-critical issues

### 4. Flexible Data Entry
- Optional fields throughout (only Role is required)
- Add/remove education records dynamically
- Add/remove documents as needed
- Link documents to specific education records

## Technical Details

### API Integration

The comprehensive onboarding uses `multipart/form-data` encoding to support file uploads:

```typescript
const formData = new FormData();
formData.append("Role", "SEAFARER");
formData.append("ContactDetails.Phone", "+234...");
formData.append("EducationDetails[0].Institution", "...");
formData.append("ProfileDocuments[0].File", file);
// etc.
```

### Response Structure

The API returns a comprehensive response including:
- Created onboarding record with temporary RN (`PENDING-{UserId}`)
- Contact details
- Education records
- Uploaded document details (file paths, sizes, etc.)
- Summary with counts and warnings

### Error Handling

The implementation handles various error scenarios:
- Missing required fields
- Duplicate onboarding attempts
- Invalid file types or sizes
- Network errors
- Authentication issues

## Files Created/Modified

### Created:
1. `src/lib/services/comprehensive-onboarding-service.ts` - Service module
2. `src/app/(dashboard)/onboarding/comprehensive/page.tsx` - Form component
3. `COMPREHENSIVE_ONBOARDING_IMPLEMENTATION.md` - This documentation

### Modified:
1. `src/types/index.ts` - Added UserInfo properties
2. `src/app/(dashboard)/seafarer/dashboard/page.tsx` - Added conditional onboarding button
3. `src/app/(dashboard)/layout.tsx` - Added redirect to seafarer dashboard after userInfo fetch
4. `src/app/(dashboard)/page.tsx` - Added redirect for seafarers to their dashboard
5. `src/app/(auth)/auth/signin/page.tsx` - Updated redirect to seafarer dashboard
6. `src/lib/services/onboarding-service.ts` - Fixed endpoint paths
7. `src/lib/services/seafarers.ts` - Fixed endpoint paths

## Testing Recommendations

1. **Test with different user states**:
   - New user with `is_onboarding_complete = false`
   - Existing user with `is_onboarding_complete = true`

2. **Test form validation**:
   - Try submitting without required fields
   - Test file size limits
   - Test invalid file types

3. **Test step navigation**:
   - Navigate forward and backward through steps
   - Verify data persists when moving between steps

4. **Test document uploads**:
   - Upload different file types
   - Upload multiple documents
   - Link education documents to correct education records

5. **Test error scenarios**:
   - Network failures
   - Server errors
   - Duplicate onboarding attempts

6. **Test responsiveness**:
   - Mobile devices
   - Tablet devices
   - Desktop browsers

## Future Enhancements

1. **Document Type Selection**: 
   - Implement dropdown/select for document types instead of GUID input
   - Fetch available document types from `/seafarer/api/v1/lookups/document-types`

2. **File Preview**:
   - Add preview functionality for uploaded documents
   - Show thumbnail for images

3. **Save Draft**:
   - Allow users to save progress and return later
   - Store draft data in local storage or database

4. **Progress Tracking**:
   - Show which documents are mandatory vs optional
   - Highlight missing mandatory documents

5. **Document Management**:
   - Allow editing/replacing uploaded documents
   - Show upload progress for large files

## References

- API Specification: `API_SPEC_COMPREHENSIVE_ONBOARDING.md`
- Swagger Documentation: `swagger.json`
- Backend Endpoint: `POST /seafarer/api/v1/onboarding/comprehensive`

## Support

For questions or issues, refer to:
- `API_SPEC_COMPREHENSIVE_ONBOARDING.md` for API details
- `swagger.json` for complete API documentation
- This document for implementation details

