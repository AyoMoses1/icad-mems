# How to Determine Documents Required for an Application

This document explains the complete flow for determining which documents need to be uploaded when creating an application for a service.

## Overview

When applying for a service (e.g., "Certificate of Competency"), the system requires certain documents based on:
1. The service's defined requirements
2. The user's current rank
3. The requirement type (determined by Metric)

The relationship between requirements and documents is now **explicit** - `RequirementList` has a direct foreign key `DocumentTypesId` that links to `DocumentTypes`. This eliminates the need for manual name-based matching.

---

## Step-by-Step Process

### Step 1: Get Service Checklist (Requirements)

First, retrieve the checklist of requirements for the service you want to apply for.

**Endpoint:**
```
GET /seafarer/api/v1/applications/services/{serviceId}/checklist
```

**What it does:**
- Returns all requirements for the service
- Filters requirements by the current user's rank
- Includes the metric type for each requirement

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "requirementListId": "guid-1",
      "requirementName": "Passport",
      "requiredValue": "Valid passport required",
      "metricId": "guid-metric-1",
      "metricDescription": "File/Document",  // ← Indicates document needed
      "documentTypesId": "doc-guid-1",  // ← Direct mapping to document type
      "documentTypeDescription": "Passport"  // ← Document type name
    },
    {
      "requirementListId": "guid-2",
      "requirementName": "Medical Certificate",
      "requiredValue": "Valid medical certificate",
      "metricId": "guid-metric-1",
      "metricDescription": "File/Document",  // ← Document needed
      "documentTypesId": "doc-guid-2",  // ← Direct mapping to document type
      "documentTypeDescription": "Medical Certificate"  // ← Document type name
    },
    {
      "requirementListId": "guid-3",
      "requirementName": "Years of Experience",
      "requiredValue": "Minimum 5 years",
      "metricId": "guid-metric-2",
      "metricDescription": "Text",  // ← Not a document, just text input
      "documentTypesId": null,  // ← No document type for non-file requirements
      "documentTypeDescription": null
    }
  ]
}
```

**Key Fields:**
- `requirementName`: The name/description of what's required (e.g., "Passport", "Medical Certificate")
- `metricDescription`: Determines the requirement type:
  - `"File/Document"` = Document upload required
  - `"Text"` = Text input required
  - `"Date"` = Date input required
  - `"Yes/No"` = Boolean input required
- `documentTypesId`: **Direct foreign key** to the document type (only set when `metricDescription = "File/Document"`)
- `documentTypeDescription`: The name of the document type (e.g., "Passport", "Medical Certificate")

---

### Step 2: Identify Document Requirements

Filter the requirements to find which ones need documents.

**Filter Criteria:**
```javascript
const documentRequirements = requirements.filter(
  req => req.metricDescription === "File/Document"
);
```

**Example Result:**
- ✅ **"Passport"** → Document needed
- ✅ **"Medical Certificate"** → Document needed
- ❌ **"Years of Experience"** → Text input, not a document

---

### Step 3: Use Direct Document Type Mapping

**✅ NEW:** The checklist response now includes `documentTypesId` directly! No manual matching needed.

For requirements where `metricDescription === "File/Document"`, the response includes:
- `documentTypesId`: The GUID of the document type to upload
- `documentTypeDescription`: The name of the document type

**Example:**
```json
{
  "requirementName": "Passport",
  "metricDescription": "File/Document",
  "documentTypesId": "doc-guid-1",  // ← Use this directly!
  "documentTypeDescription": "Passport"
}
```

**No matching needed!** The `documentTypesId` is already provided in the checklist response.

---

### Step 4: Create Application (if not exists)

Before uploading documents, you need to create the application.

**Endpoint:**
```
POST /seafarer/api/v1/applications
```

**Request Body:**
```json
{
  "serviceId": "service-guid",
  "remarks": "Optional remarks"
}
```

**Response:**
Returns `ApplicationDto` with `applicationId` that you'll use for document uploads.

---

### Step 5: Upload Documents

Upload each required document using the `documentTypesId` from the checklist response.

**Endpoint:**
```
POST /seafarer/api/v1/documents/applications/{applicationId}/upload
```

**Request Type:** `multipart/form-data`

**Form Fields:**
- `documentTypesId`: The `documentTypesId` from the checklist response (Step 1)
- `file`: The actual file to upload
- `documentNumber`: (Optional) Document number/reference
- `issueDate`: (Optional) Date when document was issued
- `expiryDate`: (Optional) Date when document expires
- `issuingAuthority`: (Optional) Authority that issued the document

**Example Request:**
```
POST /seafarer/api/v1/documents/applications/{applicationId}/upload
Content-Type: multipart/form-data

documentTypesId: doc-guid-1
file: [binary file data]
documentNumber: P123456
issueDate: 2024-01-15
expiryDate: 2034-01-15
issuingAuthority: NIMASA
```

**File Constraints:**
- Maximum file size: **10MB**
- Allowed extensions: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`

---

### Step 6: Submit Application

After uploading all required documents and filling in other requirements, submit the application.

**Endpoint:**
```
POST /seafarer/api/v1/applications/{id}/submit
```

**Request Body:**
```json
{
  "applicationId": "application-guid",
  "requirementValues": [
    {
      "requirementListId": "guid-1",
      "actualValue": "text value for text requirements"
    },
    {
      "requirementListId": "guid-2",
      "actualValue": "another value"
    }
  ]
}
```

**What Happens:**
- System validates all requirements are satisfied
- For document requirements, it checks that `ApplicationDocument` records exist
- Updates `ApplicationRequirement.IsSubmitted = true`
- Changes application status from "DRAFT" to "SUBMITTED"

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT UPLOAD FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. GET Service Checklist
   GET /applications/services/{serviceId}/checklist
   ↓
   Returns: List of ApplicationRequirementDto
   [
     {
       requirementName: "Passport",
       metricDescription: "File/Document",
       documentTypesId: "doc-guid-1",  ← Direct mapping!
       documentTypeDescription: "Passport"
     },
     {
       requirementName: "Medical Certificate",
       metricDescription: "File/Document",
       documentTypesId: "doc-guid-2",  ← Direct mapping!
       documentTypeDescription: "Medical Certificate"
     }
   ]

2. Filter Document Requirements
   ↓
   Filter where metricDescription === "File/Document"
   Result: Requirements with documentTypesId already included

3. Create Application (if not exists)
   POST /applications
   ↓
   Returns: ApplicationDto with applicationId

4. Upload Each Document
   POST /documents/applications/{applicationId}/upload
   ↓
   For each document requirement:
   - documentTypesId: {from checklist response}
   - file: [file]
   - documentNumber, issueDate, expiryDate, etc.

5. Submit Application
   POST /applications/{id}/submit
   ↓
   System validates all requirements (including documents) are provided
```

---

## Frontend Implementation Example

```javascript
// 1. Get service checklist
const checklist = await getServiceChecklist(serviceId);

// 2. Filter document requirements
const documentRequirements = checklist.data.filter(
  req => req.metricDescription === "File/Document" && req.documentTypesId != null
);

// ✅ No matching needed! documentTypesId is already in the response

// 3. Show UI for user to upload documents
// For each item in documentRequirements, show file upload field
// Use req.documentTypesId directly

// 4. Create application
const application = await createApplication({
  serviceId: serviceId,
  remarks: "Optional remarks"
});

// 5. Upload documents
for (const req of documentRequirements) {
  if (req.documentTypesId && selectedFiles[req.requirementName]) {
    await uploadApplicationDocument(application.applicationId, {
      documentTypesId: req.documentTypesId,  // ← Use directly from checklist
      file: selectedFiles[req.requirementName],
      documentNumber: docMetadata[req.requirementName]?.documentNumber,
      issueDate: docMetadata[req.requirementName]?.issueDate,
      expiryDate: docMetadata[req.requirementName]?.expiryDate,
      issuingAuthority: docMetadata[req.requirementName]?.issuingAuthority
    });
  }
}

// 6. Submit application
await submitApplication(application.applicationId, {
  requirementValues: textRequirementValues // For non-document requirements
});
```

---

## Important Notes

### 1. Direct Database Mapping
There's now a **direct database foreign key** linking `RequirementList` to `DocumentTypes` via `DocumentTypesId`. The relationship is **explicit**:
- `RequirementList.DocumentTypesId` → `DocumentTypes.DocumentTypesId`
- No manual matching needed - the `documentTypesId` is included in the checklist response
- Database-enforced relationship ensures data integrity

### 2. Metric Determines Type
Only requirements with `MetricDescription = "File/Document"` need documents. Other metrics require different input types:
- `"Text"` → Text input field
- `"Date"` → Date picker
- `"Yes/No"` → Checkbox/radio button

### 3. Rank-Specific Requirements
Requirements are **filtered by the user's current rank**. This means:
- Different ranks may have different document requirements for the same service
- The checklist automatically filters to show only requirements for the user's rank

### 4. Upload Before Submission
Documents should be uploaded **before** submitting the application. The submission endpoint validates that all requirements (including documents) are satisfied.

### 5. Validation on Submit
When you submit an application, the system:
- Validates all `ApplicationRequirement` records have `ActualValue` or corresponding `ApplicationDocument`
- Checks that document requirements have matching uploaded documents
- Updates requirement status to `IsSubmitted = true`

---

## Model Relationships

### How Requirements Link to Documents

```
Service
  ↓ (1:N)
ServiceRequirements
  ↓ (N:1)
RequirementList
  ├─ Description: "Passport"
  ├─ MetricId → MetricList ("File/Document")
  └─ DocumentTypesId → DocumentTypes (explicit FK) ✅
     └─ Description: "Passport"
  
Application
  ├─ (1:N) → ApplicationRequirement
  │            └─ RequirementListId → RequirementList
  │            └─ MetricId → MetricList
  │
  └─ (1:N) → ApplicationDocument
               └─ DocumentTypesId → DocumentTypes
                  └─ Description: "Passport"
```

**The Link:**
- `RequirementList.DocumentTypesId` → `DocumentTypes.DocumentTypesId` (explicit FK)
- When `Metric.Description = "File/Document"`, `DocumentTypesId` should be set
- Direct database-enforced relationship ensures data integrity
- No manual matching needed - `documentTypesId` is included in API responses

---

## Service Management Endpoints

Administrators can now manage services, requirements, and requirement lists through dedicated endpoints:

### Service Endpoints

| Method | Route | Description | Auth | Admin Only |
|--------|-------|-------------|------|------------|
| POST | `/seafarer/api/v1/services` | Create new service | ✅ | ✅ |
| PUT | `/seafarer/api/v1/services/{serviceId}` | Update existing service | ✅ | ✅ |
| DELETE | `/seafarer/api/v1/services/{serviceId}` | Soft delete service | ✅ | ✅ |

### Service Requirement Endpoints

| Method | Route | Description | Auth | Admin Only |
|--------|-------|-------------|------|------------|
| GET | `/seafarer/api/v1/services/{serviceId}/requirements` | Get all requirements for a service | ✅ | ❌ |
| GET | `/seafarer/api/v1/services/{serviceId}/requirements/{requirementId}` | Get specific service requirement by ID | ✅ | ❌ |
| POST | `/seafarer/api/v1/services/{serviceId}/requirements` | Add requirement to service | ✅ | ✅ |
| PUT | `/seafarer/api/v1/services/{serviceId}/requirements/{requirementId}` | Update service requirement | ✅ | ✅ |
| DELETE | `/seafarer/api/v1/services/{serviceId}/requirements/{requirementId}` | Remove requirement from service | ✅ | ✅ |

### Requirement List Endpoints (Master Data)

| Method | Route | Description | Auth | Admin Only |
|--------|-------|-------------|------|------------|
| POST | `/seafarer/api/v1/services/requirement-lists` | Create new requirement list | ✅ | ✅ |
| GET | `/seafarer/api/v1/services/requirement-lists` | Get all requirement lists | ✅ | ❌ |
| GET | `/seafarer/api/v1/services/requirement-lists/{requirementListId}` | Get requirement list by ID | ✅ | ❌ |
| PUT | `/seafarer/api/v1/services/requirement-lists/{requirementListId}` | Update requirement list | ✅ | ✅ |
| DELETE | `/seafarer/api/v1/services/requirement-lists/{requirementListId}` | Soft delete requirement list | ✅ | ✅ |

**Important Notes:**
- When creating service requirements with `Metric = "File/Document"`, the system validates that the `RequirementList` has `DocumentTypesId` configured.
- Requirement lists can now be managed via API (previously only via seeders/database scripts).
- When creating/updating a requirement list with `Metric = "File/Document"`, `DocumentTypesId` is required.
- Requirement lists cannot be deleted if they are in use by any service requirements or application requirements.

---

## API Endpoints Summary

### Application Flow Endpoints

| Endpoint | Method | Purpose |
|----------|--------|----------|
| `/seafarer/api/v1/applications/services/{serviceId}/checklist` | GET | Get requirements checklist for a service |
| `/api/seafarer/masterdata/document-types` | GET | Get all available document types |
| `/seafarer/api/v1/applications` | POST | Create a new application |
| `/seafarer/api/v1/documents/applications/{applicationId}/upload` | POST | Upload a document for an application |
| `/seafarer/api/v1/applications/{id}/submit` | POST | Submit application with all requirements |

### Service Management Endpoints

See [Service Management Endpoints](#service-management-endpoints) section above for complete list.

---

## File Upload Constraints

- **Maximum File Size:** 10MB
- **Allowed Extensions:** `.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`
- **Storage Location:** `wwwroot/documents/applications/{applicationId}/`

---

## Error Scenarios

### Document Type Not Found
If you try to upload with a `DocumentTypesId` that doesn't exist:
```json
{
  "success": false,
  "message": "Document type not found",
  "code": "DOCUMENT_TYPE_NOT_FOUND"
}
```

### File Too Large
If file exceeds 10MB:
```json
{
  "success": false,
  "message": "File size exceeds maximum allowed size of 10MB",
  "code": "FILE_TOO_LARGE"
}
```

### Invalid File Type
If file extension is not allowed:
```json
{
  "success": false,
  "message": "File type not allowed. Allowed types: .pdf, .jpg, .jpeg, .png, .doc, .docx",
  "code": "INVALID_FILE_TYPE"
}
```

### Missing Requirements on Submit
If you try to submit without all required documents:
```json
{
  "success": false,
  "message": "All mandatory requirements must have actual values",
  "code": "MISSING_REQUIREMENTS"
}
```

### Requirement List Errors

**Requirement List Not Found:**
```json
{
  "success": false,
  "message": "Requirement list not found",
  "code": "REQUIREMENT_LIST_NOT_FOUND"
}
```

**Requirement List In Use (Cannot Delete):**
```json
{
  "success": false,
  "message": "Cannot delete requirement list that is in use by services",
  "code": "REQUIREMENT_LIST_IN_USE"
}
```

**Duplicate Requirement List:**
```json
{
  "success": false,
  "message": "A requirement list with this description already exists",
  "code": "DUPLICATE_REQUIREMENT_LIST"
}
```

**Metric Not Found:**
```json
{
  "success": false,
  "message": "Metric not found",
  "code": "METRIC_NOT_FOUND"
}
```

**Document Type Required (for File/Document):**
```json
{
  "success": false,
  "message": "Document type must be set for File/Document requirements",
  "code": "DOCUMENT_TYPE_REQUIRED"
}
```

---

## Creating Document Requirements

### Admin Workflow: Creating a Document Requirement

To create a document requirement that can be used in services:

1. **Get File/Document Metric ID**
   - Query MetricLists to find the metric with `Description = "File/Document"`
   - Note the `MetricId` (you can get this from MasterData or database)

2. **Get Document Type ID**
   - Use: `GET /api/seafarer/masterdata/document-types`
   - Find the document type you need (e.g., "Medical Certificate", "Passport")
   - Note the `DocumentTypesId`

3. **Create Requirement List**
   ```
   POST /seafarer/api/v1/services/requirement-lists
   Content-Type: application/json
   
   {
     "description": "Valid Medical Certificate",
     "metricId": "file-document-metric-guid",
     "documentTypesId": "medical-cert-doc-type-guid"  // Required for File/Document
   }
   ```
   
   **Response:**
   ```json
   {
     "success": true,
     "data": {
       "requirementListId": "new-requirement-list-guid",
       "description": "Valid Medical Certificate",
       "metricId": "file-document-metric-guid",
       "metricDescription": "File/Document",
       "documentTypesId": "medical-cert-doc-type-guid",
       "documentTypeDescription": "Medical Certificate",
       "isActive": true
     }
   }
   ```

4. **Add Requirement List to Service**
   ```
   POST /seafarer/api/v1/services/{serviceId}/requirements
   Content-Type: application/json
   
   {
     "requirementListId": "requirement-list-guid-from-step-3",
     "rankId": "rank-guid",
     "requiredValue": "Valid medical certificate issued within last 12 months"
   }
   ```
   
   **Response:**
   ```json
   {
     "success": true,
     "data": {
       "serviceRequirementId": "new-service-requirement-guid",
       "requirementListId": "requirement-list-guid",
       "requirementName": "Valid Medical Certificate",
       "rankId": "rank-guid",
       "rankDescription": "Third Officer",
       "requiredValue": "Valid medical certificate issued within last 12 months",
       "metricId": "file-document-metric-guid",
       "metricDescription": "File/Document",
       "documentTypesId": "medical-cert-doc-type-guid",
       "documentTypeDescription": "Medical Certificate"
     }
   }
   ```

**Validation Rules:**
- If `Metric = "File/Document"`, `DocumentTypesId` **must** be provided when creating the RequirementList
- The system validates that the DocumentType exists and is not deleted
- The system validates that the Metric exists and is not deleted
- Duplicate requirement list descriptions are prevented (case-insensitive check)
- Requirement lists cannot be deleted if they are in use by any service requirements or application requirements

**Example: Complete Workflow for Passport Requirement**

```javascript
// Step 1: Get Document Type
const docTypes = await fetch('/api/seafarer/masterdata/document-types');
const passportDocType = docTypes.data.find(dt => dt.description === 'Passport');

// Step 2: Get File/Document Metric (from MasterData or database)
const fileDocumentMetricId = 'file-document-metric-guid';

// Step 3: Create Requirement List
const requirementList = await fetch('/seafarer/api/v1/services/requirement-lists', {
  method: 'POST',
  body: JSON.stringify({
    description: 'Valid Passport',
    metricId: fileDocumentMetricId,
    documentTypesId: passportDocType.documentTypesId
  })
});

// Step 4: Add to Service
const serviceRequirement = await fetch(`/seafarer/api/v1/services/${serviceId}/requirements`, {
  method: 'POST',
  body: JSON.stringify({
    requirementListId: requirementList.data.requirementListId,
    rankId: 'officer-rank-guid',
    requiredValue: 'Passport must be valid for at least 6 months'
  })
});
```

**Updating Requirement Lists:**

You can update an existing requirement list, including changing its DocumentTypesId:

```
PUT /seafarer/api/v1/services/requirement-lists/{requirementListId}
{
  "description": "Valid Medical Certificate",
  "metricId": "file-document-metric-guid",
  "documentTypesId": "updated-medical-cert-doc-type-guid",
  "isActive": true
}
```

**Note:** If you change the `DocumentTypesId` of a requirement list that's already in use, existing service requirements will automatically reflect the new document type when queried (since they reference the RequirementList via foreign key).

---

## Conclusion

The document upload process for applications involves:
1. Getting the service checklist to identify document requirements
2. Using the `documentTypesId` directly from the checklist (no matching needed)
3. Uploading documents with the correct `DocumentTypesId`
4. Submitting the application after all requirements are satisfied

**Key Improvements:**
- ✅ Direct database foreign key relationship (`RequirementList.DocumentTypesId` → `DocumentTypes.DocumentTypesId`)
- ✅ No manual matching needed - `documentTypesId` is included in API responses
- ✅ Requirement lists can now be managed via API (CRUD operations available)
- ✅ Complete CRUD for service requirements (including GET endpoints)
