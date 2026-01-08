# Onboarding and Documents Workflow

## ⚠️ Important: Documents are Directly Linked to Onboarding

**Key Principle**: Documents are **NOT separate entities**. They are **directly linked** to the onboarding process. For Seafarers, Training Institutions, and Agents, all required documents must be uploaded as part of the onboarding workflow.

## Workflow

### 1. Create Onboarding Request

First, create the onboarding request using `createOnboarding()` from `onboarding-service.ts`:

```typescript
import { createOnboarding, UserSeafarerRole } from "@/lib/services/onboarding-service";

const onboarding = await createOnboarding({
  role: UserSeafarerRole.SEAFAER,
  sin: "SIN123456",
  notes: "New seafarer registration"
});
```

### 2. Upload Required Documents

**After creating the onboarding request**, you must upload all required documents. Documents are automatically linked to the onboarding record.

#### For Seafarers:

**Education Documents** (linked to education records):
```typescript
import { uploadEducationDocument } from "@/lib/services/document-service";

// First, create education details (see profile-service.ts)
// Then upload documents for each education record
await uploadEducationDocument(educationId, {
  file: documentFile,
  documentTypesId: "document-type-guid",
  documentNumber: "CERT-2020-12345",
  issueDate: "2020-07-01",
  expiryDate: "2025-07-01",
  issuingAuthority: "Maritime Academy"
});
```

**Profile Documents** (passport, medical, CoC, etc.):
```typescript
import { uploadProfileDocument } from "@/lib/services/document-service";

// Use the RN from onboarding (may be "PENDING-{userId}" until approved)
await uploadProfileDocument({
  file: passportFile,
  rn: onboarding.data.rn || `PENDING-${onboarding.data.userId}`,
  documentTypesId: "passport-type-guid",
  documentNumber: "A12345678",
  issueDate: "2020-01-01",
  expiryDate: "2030-01-01"
});
```

### 3. Check Onboarding Status

The onboarding status reflects document completion:

```typescript
import { getMyOnboarding } from "@/lib/services/onboarding-service";

const status = await getMyOnboarding();

// Check completion status
if (status.data.hasEducationDetails && 
    status.data.hasContactDetails && 
    status.data.educationDocumentCount > 0) {
  // Ready for admin review
}
```

### 4. Admin Approval

Admin reviews the onboarding request with all linked documents. The approval depends on:
- ✅ Education details completed
- ✅ Contact details completed
- ✅ All required documents uploaded
- ✅ Documents properly linked to onboarding record

## Key Points

1. **Documents are not separate**: They are part of the onboarding entity
2. **Upload order matters**: Create onboarding first, then upload documents
3. **Status tracking**: `hasEducationDetails`, `hasContactDetails`, and `educationDocumentCount` reflect document completion
4. **RN requirement**: Profile documents require the Registration Number (RN) from the onboarding record
5. **Approval dependency**: Admin cannot approve onboarding until all required documents are uploaded

## Service Files

- **Onboarding**: `src/lib/services/onboarding-service.ts`
- **Documents**: `src/lib/services/document-service.ts`
- **Profile**: `src/lib/services/profile-service.ts` (for education and contact details)

## API Endpoints

- Create Onboarding: `POST /seafarer/api/v1/Onboarding`
- Upload Education Document: `POST /seafarer/api/v1/documents/education/{educationId}/upload`
- Upload Profile Document: `POST /seafarer/api/v1/documents/profile/upload`
- Get Onboarding Status: `GET /seafarer/api/v1/Onboarding/my-onboarding`



