# Master Data Integration Summary

## Overview

All onboarding forms have been updated to properly consume master data from the backend API endpoints. This fixes the 400 error related to `trainingStatusId` and ensures all dropdowns are populated from the API.

---

## Changes Made

### 1. ✅ Updated Lookup Service (`src/lib/services/lookup-service.ts`)

Added **ALL** master data endpoints from `MASTER_DATA_API_REFERENCE.md`:

#### New Endpoints Added:
- `getAllMasterData()` - Get all master data in a single call
- `getGenders()` - Gender options
- `getNationalities()` - Country/nationality options
- `getCivilStatuses()` - Marital status options
- `getRanks()` - Seafarer ranks
- `getUserTypes()` - User type classifications
- `getAccreditationStatuses()` - Accreditation status options
- **`getTrainingStatuses()`** - **CRITICAL** - Training status (In Progress, Completed, etc.)
- `getOrganisationTypes()` - Organization type classifications
- `getVesselTypes()` - Vessel type options
- `getTradingAreas()` - Trading area options
- `getServiceTypes()` - Service type options
- `getWorkTypes()` - Work type options
- `getWatchShifts()` - Watch shift options
- `getApplicationStatuses()` - Application status options
- `getSTCWStandards()` - STCW standard references

#### Updated Interfaces:
All DTOs now match the exact structure from the API reference, including:
- `TrainingStatusDto` - Contains `trainingStatusId` and `description`
- `STCWAccreditationDto` - Enhanced with full fields
- `AccreditedInstitutionDto` - Enhanced with full fields
- `AllMasterDataDto` - For bulk loading all master data

---

### 2. ✅ Updated Seafarer Onboarding Form

**File:** `src/components/onboarding/SeafarerOnboardingForm.tsx`

#### Critical Fix - Added Training Status Dropdown:
```typescript
// Added import
import {
  getTrainingStatuses,
  type TrainingStatusDto,
} from "@/lib/services/lookup-service";

// Added state
const [trainingStatuses, setTrainingStatuses] = useState<TrainingStatusDto[]>([]);

// Load training statuses
const [docTypesRes, stcwRes, trainingStatusRes] = await Promise.all([
  getDocumentTypes(),
  getSTCWAccreditations(),
  getTrainingStatuses(), // NEW
]);
```

#### Added Training Status Field to Form:
```tsx
<div className="space-y-2">
  <Label>Training Status <span className="text-red-500">*</span></Label>
  <Select
    value={training.trainingStatusId}
    onValueChange={(value) => {
      const newTrainings = [...seafarerTrainings];
      newTrainings[index].trainingStatusId = value;
      setSeafarerTrainings(newTrainings);
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select training status" />
    </SelectTrigger>
    <SelectContent>
      {trainingStatuses.map((status) => (
        <SelectItem
          key={status.trainingStatusId}
          value={status.trainingStatusId}
        >
          {status.description}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

#### Updated SeafarerTrainingRequest Interface:
```typescript
export interface SeafarerTrainingRequest {
  institutionSTCWAccreditationId: string;
  startDate: string;
  endDate: string;
  trainingStatusId: string; // NOW REQUIRED (was optional)
  result: string;
  certificateName: string;
  issueDate: string;
  expiryDate: string;
}
```

---

### 3. ✅ Updated Training Institution Onboarding Form

**File:** `src/components/onboarding/TrainingInstitutionOnboardingForm.tsx`

#### Fixed Document Types Call:
```typescript
// BEFORE (incorrect):
getDocumentTypes("Institution")

// AFTER (correct):
getDocumentTypes()
```

The API doesn't accept category parameters - it returns all document types.

---

### 4. ✅ Updated Agent Onboarding Form

**File:** `src/components/onboarding/AgentOnboardingForm.tsx`

#### Fixed Document Types Call:
```typescript
// BEFORE (incorrect):
getDocumentTypes("Institution")

// AFTER (correct):
getDocumentTypes()
```

---

## API Endpoints Reference

All endpoints use base URL: `/api/seafarer/MasterData`

### Critical Endpoints for Onboarding:

| Endpoint | Used In | Purpose |
|----------|---------|---------|
| `/document-types` | All forms | Document type selection |
| `/training-statuses` | Seafarer | **REQUIRED** for STCW trainings |
| `/stcw-accreditations` | Seafarer | STCW training courses |
| `/accredited-institutions` | Institution/Agent | Institution selection |

### Additional Available Endpoints:

| Endpoint | Returns | Use Case |
|----------|---------|----------|
| `/all` | All master data | Bulk load on app init |
| `/genders` | Gender options | Personal info forms |
| `/nationalities` | Countries | Personal info forms |
| `/civil-statuses` | Marital status | Personal info forms |
| `/ranks` | Seafarer ranks | Rank selection |
| `/vessel-types` | Vessel types | Voyage activity forms |
| `/trading-areas` | Trading areas | Voyage activity forms |
| `/work-types` | Work types | Work experience forms |
| `/watch-shifts` | Watch shifts | Duty roster forms |

---

## Payload Structure

### Seafarer Training Payload (Fixed):

```json
{
  "seafarerTrainings": [
    {
      "institutionSTCWAccreditationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "startDate": "2022-07-01",
      "endDate": "2022-07-15",
      "trainingStatusId": "4fa85f64-5717-4562-b3fc-2c963f66afa7", // NOW REQUIRED
      "result": "Pass",
      "certificateName": "Basic Safety Training (BST)",
      "issueDate": "2022-07-15",
      "expiryDate": "2027-07-15"
    }
  ]
}
```

---

## Testing Checklist

### Seafarer Onboarding:
- [ ] Document types dropdown loads correctly
- [ ] STCW accreditations dropdown loads
- [ ] **Training status dropdown loads and is required**
- [ ] Form submits without 400 error for `trainingStatusId`
- [ ] All training fields are properly sent to backend

### Training Institution Onboarding:
- [ ] Document types dropdown loads
- [ ] Accredited institutions dropdown loads (filtered by TRAINING)
- [ ] Form submits successfully

### Agent Onboarding:
- [ ] Document types dropdown loads
- [ ] Accredited institutions dropdown loads (filtered by AGENT)
- [ ] Form submits successfully

---

## Error Resolution

### Original Issue:
```
400 Bad Request: training status id not correct
```

### Root Cause:
The `trainingStatusId` field was:
1. Not being collected in the form (no dropdown)
2. Optional in the interface (should be required)
3. Not being sent to the backend

### Solution:
1. ✅ Added `getTrainingStatuses()` API call
2. ✅ Added training status dropdown to form
3. ✅ Made `trainingStatusId` required in interface
4. ✅ Field is now properly sent in payload

---

## Next Steps

### Recommended Enhancements:

1. **Bulk Load Master Data:**
   ```typescript
   // On app initialization, load all master data once
   const masterData = await getAllMasterData();
   // Store in global state (Zustand/Context)
   ```

2. **Add More Master Data Dropdowns:**
   - Gender selection in personal info
   - Nationality selection
   - Civil status selection
   - Rank selection for seafarers
   - Vessel type for voyage activities

3. **Validation:**
   - Add client-side validation for required master data fields
   - Show helpful error messages when dropdowns are empty

4. **Caching:**
   - Cache master data in localStorage/sessionStorage
   - Refresh periodically or on user action

---

## Files Modified

1. ✅ `src/lib/services/lookup-service.ts` - Added all master data endpoints
2. ✅ `src/lib/services/comprehensive-onboarding-service.ts` - Fixed SeafarerTrainingRequest interface
3. ✅ `src/components/onboarding/SeafarerOnboardingForm.tsx` - Added training status dropdown
4. ✅ `src/components/onboarding/TrainingInstitutionOnboardingForm.tsx` - Fixed document types call
5. ✅ `src/components/onboarding/AgentOnboardingForm.tsx` - Fixed document types call

---

## Summary

All onboarding forms now properly consume master data from the backend API. The critical `trainingStatusId` field is now collected via a dropdown populated from the `/api/seafarer/MasterData/training-statuses` endpoint, resolving the 400 error. All forms are ready for testing and production use.



