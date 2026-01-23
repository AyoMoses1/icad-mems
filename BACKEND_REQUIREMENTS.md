# Backend Requirements for MEMS Seafarer Frontend

**Date:** January 23, 2026  
**Project:** MEMS Seafarer Frontend  
**Purpose:** This document outlines backend API changes and enhancements required to support frontend functionality improvements.

---

## Table of Contents

1. [Onboarding Document Display Enhancement](#1-onboarding-document-display-enhancement)
2. [Multiple Document Upload for Requirement Lists](#2-multiple-document-upload-for-requirement-lists)
3. [Total Sea Time Display on Dashboard](#3-total-sea-time-display-on-dashboard)
4. [Onboarding Status and Completion Tracking](#4-onboarding-status-and-completion-tracking)

---

## 1. Onboarding Document Display Enhancement

### Current Issue
When an admin reviews a seafarer's onboarding application, only **Education** and **Contact Details** tabs are visible. Other onboarding sections (Voyage Activities, Training Records, Profile Documents, etc.) are not displayed, even though seafarers upload documents for these sections during onboarding.

### Required Changes

#### 1.1. Enhance `GET /seafarer/api/v1/onboarding/{id}` Response

The current response includes:
- `educationDetails` (array)
- `contactDetails` (object)

**Additional fields required:**
- `seafarerTrainings` (array) - Training records with STCW accreditations
- `voyageActivities` (array) - Voyage records with sea time
- `profileDocuments` (array) - Profile documents (passport, medical certificates, CoC, etc.)
- `educationDocuments` (array) - Documents linked to education records (already partially available)
- `voyageDocuments` (array) - Documents linked to voyage activities
- `trainingDocuments` (array) - Documents linked to training records

#### 1.2. Data Structure Requirements

**SeafarerTrainingDto:**
```typescript
{
  trainingId: string;
  rn?: string | null;
  institutionSTCWAccreditationId: string;
  institutionSTCWAccreditationName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  trainingStatusId: string;
  trainingStatusDescription?: string | null;
  result?: string | null;
  certificateName?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  documents?: TrainingDocumentDto[] | null;
  dateCreated?: string | null;
  dateModified?: string | null;
}
```

**VoyageActivityDto:**
```typescript
{
  voyageActivityId: string;
  rn?: string | null;
  seamanBookNo?: string | null;
  vesselName?: string | null;
  imoNumber?: string | null;
  flagState?: string | null;
  operatorCompany?: string | null;
  portOfEngagement?: string | null;
  portOfDischarge?: string | null;
  dateJoined?: string | null;
  dateLeft?: string | null;
  totalSeaTimeDays?: number | null;
  remarks?: string | null;
  documents?: VoyageDocumentDto[] | null;
  dateCreated?: string | null;
  dateModified?: string | null;
}
```

**ProfileDocumentDto:**
```typescript
{
  documentId: string;
  rn?: string | null;
  documentTypesId: string;
  documentTypeDescription?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  filePathOrUrl?: string | null;
  dateCreated?: string | null;
}
```

**TrainingDocumentDto & VoyageDocumentDto:**
```typescript
{
  documentId: string;
  trainingId?: string | null; // For training documents
  voyageActivityId?: string | null; // For voyage documents
  documentTypesId: string;
  documentTypeDescription?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  filePathOrUrl?: string | null;
  dateCreated?: string | null;
}
```

#### 1.3. Updated UserSeafarerOnboardingDto

Add the following fields to the existing `UserSeafarerOnboardingDto`:
```typescript
{
  // ... existing fields ...
  seafarerTrainings?: SeafarerTrainingDto[] | null;
  voyageActivities?: VoyageActivityDto[] | null;
  profileDocuments?: ProfileDocumentDto[] | null;
  trainingDocuments?: TrainingDocumentDto[] | null;
  voyageDocuments?: VoyageDocumentDto[] | null;
  
  // Helper flags for frontend
  hasSeafarerTrainings?: boolean;
  hasVoyageActivities?: boolean;
  hasProfileDocuments?: boolean;
  seafarerTrainingCount?: number;
  voyageActivityCount?: number;
  profileDocumentCount?: number;
}
```

---

## 2. Multiple Document Upload for Requirement Lists

### Current Issue
When creating a requirement list for a service, admins can only specify one document type per requirement. However, a single requirement may need multiple documents (e.g., "Medical Certificate" requirement might need both a medical exam certificate and a vaccination record).

### Required Changes

#### 2.1. Update Requirement List Creation API

**Current:** `POST /seafarer/api/v1/requirement-lists`

**Current Request:**
```typescript
{
  description: string;
  metricId: string;
  documentTypesId: string | null; // Single document type
  isActive: boolean;
}
```

**New Request (Support Multiple Documents):**
```typescript
{
  description: string;
  metricId: string;
  documentTypesId: string | null; // Keep for backward compatibility
  documentTypeIds: string[] | null; // NEW: Array of document type IDs
  isActive: boolean;
}
```

**Note:** 
- If `documentTypeIds` is provided, use it (preferred)
- If `documentTypeIds` is null/empty, fall back to `documentTypesId` for backward compatibility
- Both fields can coexist, but `documentTypeIds` takes precedence

#### 2.2. Update Requirement List Response

**Current Response:**
```typescript
{
  requirementListId: string;
  description: string;
  metricId: string;
  metricDescription: string;
  documentTypesId: string | null;
  documentTypeDescription: string | null;
  isActive: boolean;
  // ... other fields
}
```

**New Response:**
```typescript
{
  requirementListId: string;
  description: string;
  metricId: string;
  metricDescription: string;
  documentTypesId: string | null; // Keep for backward compatibility
  documentTypeDescription: string | null; // Keep for backward compatibility
  documentTypeIds: string[] | null; // NEW: Array of document type IDs
  documentTypes: DocumentTypeDto[] | null; // NEW: Array of full document type objects
  isActive: boolean;
  // ... other fields
}
```

**DocumentTypeDto:**
```typescript
{
  documentTypesId: string;
  description: string;
  code?: string | null;
  isActive?: boolean;
}
```

#### 2.3. Update Requirement List Update API

**Current:** `PUT /seafarer/api/v1/requirement-lists/{id}`

Apply the same changes as creation API - support both single `documentTypesId` and array `documentTypeIds`.

---

## 3. Total Sea Time Display on Dashboard

### Current Issue
After completing onboarding, seafarers should see their total sea time on the dashboard, but this information is not currently available.

### Required Changes

#### 3.1. Add Total Sea Time to User/Seafarer Profile

**Option A: Add to User Profile Response**
When fetching user info (`GET /connect/userinfo` or similar), include:
```typescript
{
  // ... existing user fields ...
  totalSeaTimeDays?: number | null;
  totalSeaTimeMonths?: number | null; // Calculated from days (optional, for display)
  totalSeaTimeYears?: number | null; // Calculated from days (optional, for display)
}
```

**Option B: Add to Seafarer Profile Response**
If there's a seafarer-specific endpoint (`GET /seafarer/api/v1/seafarers/me` or similar), add:
```typescript
{
  // ... existing seafarer fields ...
  totalSeaTimeDays?: number | null;
  totalSeaTimeMonths?: number | null;
  totalSeaTimeYears?: number | null;
}
```

#### 3.2. Calculation Logic

Total sea time should be calculated from:
- All `voyageActivities` where the seafarer has `totalSeaTimeDays` recorded
- Sum all `totalSeaTimeDays` values from approved/completed voyage activities
- Only count voyages that are:
  - Linked to the seafarer's RN (Registration Number)
  - Have valid `dateJoined` and `dateLeft` dates
  - Are not marked as deleted/inactive

**Calculation Formula:**
```sql
-- Pseudocode
SELECT SUM(totalSeaTimeDays) 
FROM VoyageActivities 
WHERE rn = @seafarerRN 
  AND dateJoined IS NOT NULL 
  AND dateLeft IS NOT NULL
  AND isActive = true
```

#### 3.3. Update Dashboard API (if separate endpoint exists)

If there's a dashboard-specific endpoint (`GET /seafarer/api/v1/Applications/dashboard`), add:
```typescript
{
  // ... existing dashboard fields ...
  seafarerProfile?: {
    totalSeaTimeDays: number;
    totalSeaTimeMonths: number;
    totalSeaTimeYears: number;
  } | null;
}
```

---

## 4. Onboarding Status and Completion Tracking

### Current Issues
1. After admin approval, `is_onboarding_complete` remains `false` instead of `true`
2. When onboarding is submitted (not draft), status should show as `PENDING`, but this may not be reflected correctly
3. Users can apply for multiple onboarding types (Seafarer, Agent, Training Institution) simultaneously, but only one should be allowed at a time

### Required Changes

#### 4.1. Fix `is_onboarding_complete` Flag

**When onboarding is approved:**
- Set `is_onboarding_complete = true` in the user's profile/record
- This should happen automatically when admin approves via `PATCH /seafarer/api/v1/onboarding/{id}/status` with `status: "APPROVED"`

**Update User Profile:**
```typescript
// When onboarding is approved
UPDATE Users 
SET is_onboarding_complete = true 
WHERE userId = @userId;
```

**Response Update:**
When fetching user info, ensure `is_onboarding_complete` reflects the current state:
- `true` if user has at least one approved onboarding
- `false` if no approved onboarding exists

#### 4.2. Onboarding Status Management

**Status Flow:**
1. **DRAFT** - When `saveAsDraft: true` is sent during onboarding creation
2. **PENDING** - When `saveAsDraft: false` or not provided (submitted for review)
3. **APPROVED** - When admin approves via status update
4. **REJECTED** - When admin rejects
5. **SUSPENDED** - When admin suspends an approved onboarding

**Ensure:**
- When onboarding is created with `saveAsDraft: false`, status is immediately set to `PENDING`
- Status is properly returned in `GET /seafarer/api/v1/onboarding/{id}` response
- Status changes are properly logged/audited

#### 4.3. Prevent Multiple Active Onboarding Applications

**Business Rule:**
A user should only be able to have **one active onboarding application** at a time. If a user has:
- A PENDING onboarding → Block creation of new onboarding
- An APPROVED onboarding → Allow new onboarding only if previous is completed/closed
- A DRAFT onboarding → Allow submission, but block new onboarding creation until current is resolved

**API Changes:**

**1. Update `POST /seafarer/api/v1/onboarding` (Create Onboarding):**

Add validation:
```typescript
// Pseudocode
const existingOnboarding = await getActiveOnboardingByUserId(userId);

if (existingOnboarding) {
  if (existingOnboarding.status === 'PENDING') {
    return {
      success: false,
      message: 'You already have a pending onboarding application. Please wait for approval or cancel the existing application.',
      code: 'PENDING_ONBOARDING_EXISTS'
    };
  }
  
  if (existingOnboarding.status === 'APPROVED' && !existingOnboarding.isCompleted) {
    return {
      success: false,
      message: 'You have an approved onboarding that is still active. Please complete or close it before creating a new one.',
      code: 'ACTIVE_ONBOARDING_EXISTS'
    };
  }
  
  // Allow if status is DRAFT, REJECTED, or SUSPENDED (user can create new)
}
```

**2. Update `GET /seafarer/api/v1/onboarding/my-onboarding`:**

Return information about existing onboarding:
```typescript
{
  // ... existing fields ...
  hasActiveOnboarding: boolean;
  activeOnboardingRole?: string | null; // 'SEAFARER', 'AGENT', 'TRAINING_INSTITUTION'
  activeOnboardingStatus?: string | null; // 'PENDING', 'APPROVED', etc.
  canCreateNewOnboarding: boolean; // Helper flag for frontend
  blockingReason?: string | null; // Why user cannot create new onboarding
}
```

**3. Helper Function (Backend):**

Create a function to check if user can create new onboarding:
```typescript
async function canCreateNewOnboarding(userId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  existingOnboarding?: UserSeafarerOnboardingDto;
}> {
  const activeOnboarding = await getActiveOnboardingByUserId(userId);
  
  if (!activeOnboarding) {
    return { canCreate: true };
  }
  
  if (activeOnboarding.status === 'PENDING') {
    return {
      canCreate: false,
      reason: 'You have a pending onboarding application. Please wait for approval.',
      existingOnboarding: activeOnboarding
    };
  }
  
  if (activeOnboarding.status === 'APPROVED' && activeOnboarding.isActive) {
    return {
      canCreate: false,
      reason: 'You have an active approved onboarding. Please complete it before creating a new one.',
      existingOnboarding: activeOnboarding
    };
  }
  
  // DRAFT, REJECTED, SUSPENDED allow new onboarding
  return { canCreate: true };
}
```

**4. Frontend Integration:**

The frontend will:
- Check `canCreateNewOnboarding` flag before showing onboarding options
- Hide/disable onboarding types that conflict with existing active onboarding
- Show appropriate messages when user tries to create duplicate onboarding

---

## Summary of API Endpoints to Modify

1. **`GET /seafarer/api/v1/onboarding/{id}`** - Add all document types (trainings, voyages, profile docs)
2. **`POST /seafarer/api/v1/requirement-lists`** - Support multiple document types
3. **`PUT /seafarer/api/v1/requirement-lists/{id}`** - Support multiple document types
4. **`GET /seafarer/api/v1/requirement-lists/{id}`** - Return multiple document types
5. **`GET /connect/userinfo`** or seafarer profile endpoint - Add `totalSeaTimeDays`
6. **`PATCH /seafarer/api/v1/onboarding/{id}/status`** - Set `is_onboarding_complete = true` on approval
7. **`POST /seafarer/api/v1/onboarding`** - Validate and prevent multiple active onboardings
8. **`GET /seafarer/api/v1/onboarding/my-onboarding`** - Return active onboarding status and blocking info

---

## Testing Recommendations

1. **Onboarding Documents:**
   - Create onboarding with all sections (education, training, voyage, documents)
   - Verify all sections are returned in admin review endpoint
   - Test document download/viewing for all document types

2. **Multiple Documents:**
   - Create requirement list with multiple document types
   - Verify all document types are saved and returned
   - Test backward compatibility with single document type

3. **Total Sea Time:**
   - Create voyage activities with sea time
   - Verify total is calculated correctly
   - Test with multiple voyages
   - Verify display on dashboard

4. **Onboarding Status:**
   - Test status transitions (DRAFT → PENDING → APPROVED)
   - Verify `is_onboarding_complete` is set to `true` on approval
   - Test blocking of multiple onboardings
   - Verify status is correctly returned in all endpoints

---

## Questions or Clarifications

If you need any clarification on these requirements, please contact the frontend development team.

**Priority:** High - These changes are needed for proper functionality of the onboarding and dashboard features.

---

**Document Version:** 1.0  
**Last Updated:** January 23, 2026
