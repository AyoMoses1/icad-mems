# Comprehensive Onboarding Integration

The `POST /seafarer/api/v1/onboarding/comprehensive` endpoint lets the frontend create a full onboarding package (details, contacts, education, documents) in a single multipart/form-data request. It supports the `SEAFARER`, `TRAINING_INSTITUTION`, and `AGENT` roles and always relies on the caller’s IAM token to determine the user/profile identities that are created.

## Endpoint

- **URL:** `{{baseUrl}}/seafarer/api/v1/onboarding/comprehensive`
- **Method:** `POST`
- **Content Type:** `multipart/form-data`
- **Authentication:** Bearer token in `Authorization` header (e.g., `Bearer {{seafarerToken}}`, `{{trainingToken}}`, `{{agentToken}}`).
- **Size limits:** 50 MB maximum per request.

The request is hosted in a transaction: if any nested object fails validation or file persistence fails, the whole call rolls back.

## Request payload structure

Every request must include the basic onboarding scalars; nested objects and files are optional depending on the role.

### Core onboarding fields (always sent as text form entries)

| Field | Description | Notes |
| --- | --- | --- |
| `Role` | `"SEAFARER"`, `"TRAINING_INSTITUTION"`, or `"AGENT"` | Determines which nested data is required/allowed. |
| `SaveAsDraft` | `true` or `false` | Defaults to `false`; if `true`, the onboarding status becomes `DRAFT`. |
| `AccreditedInstitutionId` | GUID | Required for `TRAINING_INSTITUTION` and `AGENT`. Must come from `/api/seafarer/masterdata/accredited-institutions`. |
| `RoleSpecificIdentifier` | Identifier string | e.g., RN for seafarer, registration/license for institutions. |
| `SIN` | Seafarer ID | Optional for seafarers. |
| `Department`, `JobTitle`, `EmployeeId`, `Notes` | Supplemental metadata | Optional. |

### Contact details (`ContactDetails.*`)

| Field | Description |
| --- | --- |
| `ContactDetails.Phone` | Primary phone number |
| `ContactDetails.Email` | Email address |
| `ContactDetails.Address` | Mailing address |
| `ContactDetails.EmergencyContactPerson`, `.Relationship`, `.EmergencyContactNumber`, `.EmergencyContactAddress` | Emergency contact info |

### Education records (`EducationDetails[N].*`)

These describe schools/courses for seafarers and must include an `Index` (used to link documents).

| Field | Description |
| --- | --- |
| `EducationDetails[0].Institution` | School or academy |
| `EducationDetails[0].CertificateObtained` | Certificate name |
| `EducationDetails[0].StartDate`/`EndDate` | ISO date strings |
| `EducationDetails[0].Index` | `0`, `1`, ... (`Index` must match `EducationDocuments` entries) |

### Training, voyage logs, and additional seafarer sections

- `SeafarerTrainings[N]`: STCW accreditation IDs, dates, status GUIDs, certificates, etc.
- `VoyageActivities[N]`: voyage metadata + `Index` to link to `VoyageDocuments[N]`.

### Document uploads

Files are sent as separate multipart entries. Obtain `DocumentTypesId` values using `/api/seafarer/masterdata/document-types`.

| Section | Key format | Description |
| --- | --- | --- |
| Profile docs | `ProfileDocuments[0].DocumentTypesId`, `.File`, `.DocumentNumber`, `.IssuingAuthority`, etc. | For seafarers (passport, medical, CoC). |
| Education docs | `EducationDocuments[0].EducationIndex`, `.DocumentTypesId`, `.File` | Links to `EducationDetails[Index]`. |
| Voyage docs | `VoyageDocuments[0].VoyageActivityIndex`, `.DocumentTypesId`, `.File` | Links to voyages by `Index`. |
| Institution docs | `InstitutionDocuments[0].DocumentTypesId`, `.File`, optional metadata | Required for training institutions/agents. |

For every file field, also send `.DocumentNumber`, `.IssueDate`, `.ExpiryDate`, `.IssuingAuthority` as needed. Use Postman variables (`{{profileDocumentFile}}`, `{{institutionDocumentFile}}`, etc.) to wire up the actual files.

### Sample request (seafarer)

```http
POST {{baseUrl}}/seafarer/api/v1/onboarding/comprehensive
Authorization: Bearer {{seafarerToken}}
Content-Type: multipart/form-data; boundary=---

---form-data---
Role: SEAFARER
SaveAsDraft: false
SIN: SIN-SEA-0001
ContactDetails.Phone: +234800000001
ContactDetails.Email: seafarer@datacollect.com
EducationDetails[0].Index: 0
EducationDetails[0].Institution: Maritime Academy
EducationDocuments[0].EducationIndex: 0
EducationDocuments[0].DocumentTypesId: {{documentTypeId}}
EducationDocuments[0].File: [file]
ProfileDocuments[0].DocumentTypesId: {{documentTypeId}}
ProfileDocuments[0].File: [file]
ProfileDocuments[0].DocumentNumber: PASSPORT-SEA-001
---
```

Adjust the fields for `TRAINING_INSTITUTION`/`AGENT` roles by setting `AccreditedInstitutionId`, `RoleSpecificIdentifier`, and adding `InstitutionDocuments` entries instead of seafarer-only sections.

## Response payload

The API replies with `ApiResponse<ComprehensiveOnboardingDto>`:

- `success`: `true` when the call succeeded.
- `data`: the `ComprehensiveOnboardingDto` that contains:
  - `Onboarding`: `UserSeafarerOnboardingDto` (status, role, IDs, dates, RNs).
  - `ContactDetails`: optional contact data.
  - `EducationDetails`, `SeafarerTrainings`, `VoyageActivities`: lists of nested records you can display.
  - `ProfileDocuments`, `EducationDocuments`, `VoyageDocuments`, `InstitutionDocuments`: metadata and storage URLs for uploaded files.
  - `Summary`: aggregation counts (`ProfileDocumentsUploaded`, `InstitutionDocumentsUploaded`, `IsDraft`, etc.) plus warnings if something was skipped.
- `message`, `errors`: standard API response metadata.

Example success response (truncated):

```json
{
  "success": true,
  "data": {
    "onboarding": {
      "userSeafarerOnboardingId": "guid",
      "status": "PENDING",
      "role": "SEAFARER",
      "notes": "Created via comprehensive frontend form"
    },
    "contactDetails": {
      "phone": "+234800000001",
      "email": "seafarer@datacollect.com"
    },
    "profileDocuments": [
      {
        "documentId": "guid",
        "documentTypesId": "guid",
        "documentNumber": "PASSPORT-SEA-001",
        "isUploaded": true
      }
    ],
    "summary": {
      "onboardingCreated": true,
      "profileDocumentsUploaded": 1,
      "isDraft": false,
      "message": "Comprehensive onboarding saved",
      "warnings": []
    }
  }
}
```

## Frontend integration guidance

1. **Fetch master data first.** Call `/api/seafarer/masterdata/document-types` and `/api/seafarer/masterdata/accredited-institutions`, store the IDs needed for documents/institutions.
2. **Gather files locally.** Provide file inputs in the UI (seafarer passport, institution accreditation, etc.) and attach them to the multipart request.
3. **Build `FormData`.** Append scalars (`Role`, `SIN`, etc.) and nested arrays using the `BracketNotation` format shown above (e.g., `EducationDetails[0].Institution`). Each file uses `FormData.append('ProfileDocuments[0].File', file)`.
4. **Send request.** POST to `/onboarding/comprehensive` with the bearer token for the current role user. Respect the 50 MB limit per request.
5. **Handle response.** Use `data` to confirm the onboarding status, show document metadata, and surface warnings. If `summary.isDraft` is `true`, the frontend may prompt the user to complete the form.
6. **Admin follow-up.** Pending requests are reviewed via `/onboarding/pending` and status updates `/onboarding/{id}/status`. Keep `UserSeafarerOnboardingId` for later queries.

## Errors and validation

- Missing required fields (e.g., `Role`, `DocumentTypesId`) returns `400` with `errors`.
- File size or format issues respond with `413`/`400` depending on the middleware.
- The service ensures user identity from the IAM token; mismatched roles or scopes result in `403`.

Always surface the backend `errors`/`message` values to the user if the request fails so they understand what to correct.
