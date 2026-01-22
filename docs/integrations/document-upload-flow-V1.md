# How to Determine Documents Required for an Application V1

This document explains the complete flow for determining which documents need to be uploaded when creating an application for a service.

## Overview

When applying for a service (e.g., "Certificate of Competency"), the system requires certain documents based on:
1. The service's defined requirements
2. The user's current rank
3. The requirement type (determined by Metric)

The relationship between requirements and documents is **implicit** - there's no direct foreign key linking them. Instead, you match requirement names to document type descriptions.

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
      "metricDescription": "File/Document"  // ← Indicates document needed
    },
    {
      "requirementListId": "guid-2",
      "requirementName": "Medical Certificate",
      "requiredValue": "Valid medical certificate",
      "metricId": "guid-metric-1",
      "metricDescription": "File/Document"  // ← Document needed
    },
    {
      "requirementListId": "guid-3",
      "requirementName": "Years of Experience",
      "requiredValue": "Minimum 5 years",
      "metricId": "guid-metric-2",
      "metricDescription": "Text"  // ← Not a document, just text input
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

### Step 3: Get Available Document Types

Retrieve the list of available document types from the master data endpoint.

**Endpoint:**
```
GET /api/seafarer/masterdata/document-types
```

**Optional Query Parameter:**
- `category`: Filter by category (Identity, Education, Voyage, Institution)

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "documentTypesId": "doc-guid-1",
      "description": "Passport"
    },
    {
      "documentTypesId": "doc-guid-2",
      "description": "Medical Certificate"
    },
    {
      "documentTypesId": "doc-guid-3",
      "description": "Certificate of Competency"
    },
    {
      "documentTypesId": "doc-guid-4",
      "description": "Seaman's Book"
    }
  ]
}
```

---

### Step 4: Match Requirement to Document Type

Match the `requirementName` from the checklist to a `description` in the document types list.

**Matching Logic:**
```javascript
const documentMapping = documentRequirements.map(req => {
  const docType = documentTypes.find(
    dt => dt.description === req.requirementName
  );
  return {
    requirementName: req.requirementName,
    requirementListId: req.requirementListId,
    documentTypesId: docType?.documentTypesId,
    documentTypeDescription: docType?.description
  };
});
```

**Example Mapping:**

| Requirement Name | Document Type Description | DocumentTypesId |
|-----------------|--------------------------|-----------------|
| "Passport" | "Passport" | `doc-guid-1` |
| "Medical Certificate" | "Medical Certificate" | `doc-guid-2` |

**⚠️ Important:** This is a **manual/conceptual match**. There is no explicit foreign key between `RequirementList.Description` and `DocumentTypes.Description`. The frontend/user must match them by name.

---

### Step 5: Create Application (if not exists)

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

### Step 6: Upload Documents

Upload each required document using the matched `DocumentTypesId`.

**Endpoint:**
```
POST /seafarer/api/v1/documents/applications/{applicationId}/upload
```

**Request Type:** `multipart/form-data`

**Form Fields:**
- `documentTypesId`: The matched DocumentTypesId from Step 4
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

### Step 7: Submit Application

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
       metricDescription: "File/Document"  ← Document needed!
     },
     {
       requirementName: "Medical Certificate",
       metricDescription: "File/Document"  ← Document needed!
     }
   ]

2. Filter Document Requirements
   ↓
   Filter where metricDescription === "File/Document"
   Result: ["Passport", "Medical Certificate"]

3. GET Document Types
   GET /api/seafarer/masterdata/document-types
   ↓
   Returns: List of DocumentTypeDto
   [
     { documentTypesId: "guid-1", description: "Passport" },
     { documentTypesId: "guid-2", description: "Medical Certificate" }
   ]

4. Match Requirement → DocumentType
   ↓
   "Passport" (requirement) → "Passport" (documentType)
   → Use documentTypesId: "guid-1"
   
   "Medical Certificate" (requirement) → "Medical Certificate" (documentType)
   → Use documentTypesId: "guid-2"

5. Create Application (if not exists)
   POST /applications
   ↓
   Returns: ApplicationDto with applicationId

6. Upload Each Document
   POST /documents/applications/{applicationId}/upload
   ↓
   For each document requirement:
   - documentTypesId: {matched guid}
   - file: [file]
   - documentNumber, issueDate, expiryDate, etc.

7. Submit Application
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
  req => req.metricDescription === "File/Document"
);

// 3. Get document types
const documentTypes = await getDocumentTypes();

// 4. Match requirements to document types
const documentMapping = documentRequirements.map(req => {
  const docType = documentTypes.data.find(
    dt => dt.description === req.requirementName
  );
  return {
    requirementName: req.requirementName,
    requirementListId: req.requirementListId,
    documentTypesId: docType?.documentTypesId,
    documentTypeDescription: docType?.description
  };
});

// 5. Show UI for user to upload documents
// For each item in documentMapping, show file upload field

// 6. Create application
const application = await createApplication({
  serviceId: serviceId,
  remarks: "Optional remarks"
});

// 7. Upload documents
for (const doc of documentMapping) {
  if (doc.documentTypesId && selectedFiles[doc.requirementName]) {
    await uploadApplicationDocument(application.applicationId, {
      documentTypesId: doc.documentTypesId,
      file: selectedFiles[doc.requirementName],
      documentNumber: docMetadata[doc.requirementName]?.documentNumber,
      issueDate: docMetadata[doc.requirementName]?.issueDate,
      expiryDate: docMetadata[doc.requirementName]?.expiryDate,
      issuingAuthority: docMetadata[doc.requirementName]?.issuingAuthority
    });
  }
}

// 8. Submit application
await submitApplication(application.applicationId, {
  requirementValues: textRequirementValues // For non-document requirements
});
```

---

## Important Notes

### 1. No Automatic Mapping
There's **no database foreign key** linking `RequirementList` to `DocumentTypes`. The relationship is **implicit** and requires:
- Matching `RequirementList.Description` to `DocumentTypes.Description` by name
- Manual/conceptual matching in the frontend or application logic

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
  └─ MetricId → MetricList ("File/Document")
  
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
- `RequirementList.Description` should conceptually match `DocumentTypes.Description`
- When `Metric.Description = "File/Document"`, a document of the matching type should be uploaded
- No explicit FK - matching is done by name/description

---

## Potential Improvements

### Current Limitation
The current design requires manual matching of requirement names to document type descriptions, which can lead to:
- Mismatches if names don't exactly match
- No validation that the correct document type is being uploaded
- Potential for errors in the frontend matching logic

### Suggested Enhancement
Consider adding an explicit link between `RequirementList` and `DocumentTypes`:

**Option 1: Add nullable FK to RequirementList**
```csharp
public class RequirementList : BaseEntity
{
    public Guid RequirementListId { get; set; }
    public string Description { get; set; }
    public Guid MetricId { get; set; }
    public Guid? DocumentTypesId { get; set; } // ← Add this (nullable)
    
    public virtual DocumentTypes? DocumentType { get; set; }
}
```

**Option 2: Create Mapping Table**
```csharp
public class RequirementDocumentTypeMapping
{
    public Guid RequirementListId { get; set; }
    public Guid DocumentTypesId { get; set; }
    
    public virtual RequirementList RequirementList { get; set; }
    public virtual DocumentTypes DocumentType { get; set; }
}
```

This would:
- Eliminate the need for manual name matching
- Make the relationship explicit in the database
- Enable validation that correct document types are uploaded
- Improve data integrity

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|----------|
| `/applications/services/{serviceId}/checklist` | GET | Get requirements checklist for a service |
| `/api/seafarer/masterdata/document-types` | GET | Get all available document types |
| `/applications` | POST | Create a new application |
| `/documents/applications/{applicationId}/upload` | POST | Upload a document for an application |
| `/applications/{id}/submit` | POST | Submit application with all requirements |

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

---

## Conclusion

The document upload process for applications involves:
1. Getting the service checklist to identify document requirements
2. Matching requirement names to document types
3. Uploading documents with the correct `DocumentTypesId`
4. Submitting the application after all requirements are satisfied

The key challenge is the implicit relationship between requirements and document types, which requires careful matching logic in the frontend or application layer.
