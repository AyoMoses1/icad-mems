# Frontend Integration Guide - Comprehensive Onboarding API

## 📋 Overview
This guide provides complete request/response specifications for integrating the comprehensive onboarding API for all three user types:
- **SEAFARER** - Maritime professionals
- **TRAINING_INSTITUTION** - Training institution representatives
- **AGENT** - Shipping agent representatives

---

## 🔗 API Endpoint

```
POST /api/seafarer/onboarding/comprehensive
Content-Type: multipart/form-data
Authorization: Bearer {JWT_TOKEN}
```

**Base URL:** `https://api.yourdomain.com` (or your API base URL)

---

## 🎯 User Type Detection

The API automatically detects the user type from the JWT token's `role` claim:
- `SEAFARER` → Creates seafarer onboarding with full profile
- `TRAINING_INSTITUTION` → Creates training institution representative onboarding
- `AGENT` → Creates shipping agent representative onboarding

---

## 📤 Request Structure

### Content-Type
```
multipart/form-data
```

**Important:** All document uploads use `multipart/form-data` encoding.

### Common Fields (All User Types)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `SaveAsDraft` | boolean | No | `true` = DRAFT, `false` = PENDING (default: false) |
| `Notes` | string | No | Additional notes about the onboarding |
| `ContactDetails.Phone` | string | Yes | Phone number |
| `ContactDetails.Email` | string | Yes | Email address |
| `ContactDetails.Address` | string | Yes | Physical address |
| `ContactDetails.EmergencyContactPerson` | string | No | Emergency contact name |
| `ContactDetails.Relationship` | string | No | Relationship to emergency contact |
| `ContactDetails.EmergencyContactNumber` | string | No | Emergency contact phone |
| `ContactDetails.EmergencyContactAddress` | string | No | Emergency contact address |

---

## 1️⃣ SEAFARER - Complete Request Specification

### Required Fields

```
SaveAsDraft: false (or true for draft)
SIN: "SIN-2025-TEST-001" (Seafarer Identification Number)

// Contact Details (Required)
ContactDetails.Phone: "+234-803-456-7890"
ContactDetails.Email: "seafarer@test.com"
ContactDetails.Address: "45 Marina Street, Lagos"
ContactDetails.EmergencyContactPerson: "John Doe"
ContactDetails.Relationship: "Brother"
ContactDetails.EmergencyContactNumber: "+234-805-123-4567"
ContactDetails.EmergencyContactAddress: "12 Park Avenue, Lagos"
```

### Education Details (Array - Optional but recommended)

Each education record requires an `Index` for linking documents:

```
EducationDetails[0].Index: "0"
EducationDetails[0].Institution: "Nigerian Maritime Academy"
EducationDetails[0].CertificateObtained: "Higher National Diploma in Nautical Science"
EducationDetails[0].StartDate: "2018-09-01"
EducationDetails[0].EndDate: "2021-06-30"

EducationDetails[1].Index: "1"
EducationDetails[1].Institution: "Maritime Academy of Nigeria"
EducationDetails[1].CertificateObtained: "STCW Basic Safety Training"
EducationDetails[1].StartDate: "2021-07-01"
EducationDetails[1].EndDate: "2021-08-15"
```

### Seafarer Trainings (Array - Optional)

```
SeafarerTrainings[0].InstitutionSTCWAccreditationId: "5A7C9E1F-3B4D-6A8C-2E5F-7D9B1C3E5A7F"
SeafarerTrainings[0].StartDate: "2021-07-05"
SeafarerTrainings[0].EndDate: "2021-07-30"
SeafarerTrainings[0].Result: "Pass"
SeafarerTrainings[0].CertificateName: "STCW Basic Training Certificate"
SeafarerTrainings[0].IssueDate: "2021-08-01"
SeafarerTrainings[0].ExpiryDate: "2026-07-31"
SeafarerTrainings[0].TrainingStatusId: "GUID" (optional)
```

**Get STCW Accreditation IDs:** Call `GET /api/seafarer/stcw-accreditations`

### Voyage Activities (Array - Optional)

Each voyage requires an `Index` for linking documents:

```
VoyageActivities[0].Index: "0"
VoyageActivities[0].SeamanBookNo: "SB-NGA-2021-00123"
VoyageActivities[0].VesselName: "MV Atlantic Explorer"
VoyageActivities[0].IMONumber: "IMO-9876543"
VoyageActivities[0].FlagState: "Nigeria"
VoyageActivities[0].OperatorCompany: "West African Shipping Lines"
VoyageActivities[0].PortOfEngagement: "Lagos, Nigeria"
VoyageActivities[0].PortOfDischarge: "Rotterdam, Netherlands"
VoyageActivities[0].DateJoined: "2022-06-15"
VoyageActivities[0].DateLeft: "2022-12-20"
VoyageActivities[0].TotalSeaTimeDays: "188"
VoyageActivities[0].Remarks: "Served as Deck Cadet"
```

### Profile Documents (Array - Required, minimum 1)

```
ProfileDocuments[0].DocumentTypesId: "2B3C4D5E-6F7A-8B9C-0D1E-2F3A4B5C6D7E" (Passport)
ProfileDocuments[0].DocumentNumber: "A12345678"
ProfileDocuments[0].IssueDate: "2020-01-15"
ProfileDocuments[0].ExpiryDate: "2030-01-14"
ProfileDocuments[0].IssuingAuthority: "Nigerian Immigration Service"
ProfileDocuments[0].File: [FILE - PDF/Image]

ProfileDocuments[1].DocumentTypesId: "3C4D5E6F-7A8B-9C0D-1E2F-3A4B5C6D7E8F" (Seamans Book)
ProfileDocuments[1].DocumentNumber: "SB-NGA-2021-00123"
ProfileDocuments[1].IssueDate: "2021-03-20"
ProfileDocuments[1].ExpiryDate: "2026-03-19"
ProfileDocuments[1].IssuingAuthority: "NIMASA"
ProfileDocuments[1].File: [FILE - PDF/Image]
```

**Get Document Type IDs:** Call `GET /api/seafarer/document-types?category=Identity`

### Education Documents (Array - Links to Education Records)

```
EducationDocuments[0].EducationIndex: "0" (Links to EducationDetails[0])
EducationDocuments[0].DocumentTypesId: "B2C3D4E5-F6A7-8B9C-0D1E-2F3A4B5C6D7E" (Diploma)
EducationDocuments[0].DocumentNumber: "HND-NS-2021-0456"
EducationDocuments[0].IssueDate: "2021-07-15"
EducationDocuments[0].IssuingAuthority: "Nigerian Maritime Academy"
EducationDocuments[0].File: [FILE - PDF/Image]

EducationDocuments[1].EducationIndex: "0" (Another doc for same education)
EducationDocuments[1].DocumentTypesId: "C3D4E5F6-A7B8-9C0D-1E2F-3A4B5C6D7E8F" (Transcript)
EducationDocuments[1].File: [FILE - PDF/Image]
```

### Voyage Documents (Array - Links to Voyage Activities)

```
VoyageDocuments[0].VoyageActivityIndex: "0" (Links to VoyageActivities[0])
VoyageDocuments[0].DocumentTypesId: "F6A7B8C9-D0E1-2F3A-4B5C-6D7E8F9A0B1C" (Discharge Book)
VoyageDocuments[0].DocumentNumber: "DISC-2022-001"
VoyageDocuments[0].IssueDate: "2022-12-22"
VoyageDocuments[0].IssuingAuthority: "West African Shipping Lines"
VoyageDocuments[0].File: [FILE - PDF/Image]
```

### Seafarer Response Example

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "onboarding": {
      "userSeafarerOnboardingId": "f3a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
      "userId": "574b3c6e-cf39-4e4e-8318-eba17ea37cb7",
      "email": "seafarer@test.com",
      "firstName": "John",
      "lastName": "Doe",
      "rn": "SEA-2025-0001",
      "sin": "SIN-2025-TEST-001",
      "role": "SEAFARER",
      "status": "PENDING",
      "notes": "Comprehensive onboarding test",
      "dateCreated": "2025-12-31T10:30:00Z",
      "approvedDate": null,
      "approvedBy": null
    },
    "contactDetails": {
      "contactDetailsId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "rn": "SEA-2025-0001",
      "phone": "+234-803-456-7890",
      "email": "seafarer@test.com",
      "emergencyContactPerson": "John Doe",
      "relationship": "Brother",
      "emergencyContactNumber": "+234-805-123-4567",
      "address": "45 Marina Street, Lagos",
      "emergencyContactAddress": "12 Park Avenue, Lagos"
    },
    "educationDetails": [
      {
        "educationId": "e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b",
        "rn": "SEA-2025-0001",
        "institution": "Nigerian Maritime Academy",
        "certificateObtained": "Higher National Diploma in Nautical Science",
        "startDate": "2018-09-01",
        "endDate": "2021-06-30",
        "documents": [
          {
            "documentId": "d1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6",
            "documentTypesId": "B2C3D4E5-F6A7-8B9C-0D1E-2F3A4B5C6D7E",
            "documentNumber": "HND-NS-2021-0456",
            "filePathOrUrl": "/documents/education/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/d1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6.pdf"
          }
        ]
      }
    ],
    "seafarerTrainings": [
      {
        "recordId": "t1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "rn": "SEA-2025-0001",
        "institutionSTCWAccreditationId": "5A7C9E1F-3B4D-6A8C-2E5F-7D9B1C3E5A7F",
        "certificateName": "STCW Basic Training Certificate",
        "startDate": "2021-07-05",
        "endDate": "2021-07-30",
        "result": "Pass",
        "issueDate": "2021-08-01",
        "expiryDate": "2026-07-31"
      }
    ],
    "voyageActivities": [
      {
        "logId": "v1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "rn": "SEA-2025-0001",
        "seamanBookNo": "SB-NGA-2021-00123",
        "vesselName": "MV Atlantic Explorer",
        "imoNumber": "IMO-9876543",
        "flagState": "Nigeria",
        "operatorCompany": "West African Shipping Lines",
        "portOfEngagement": "Lagos, Nigeria",
        "portOfDischarge": "Rotterdam, Netherlands",
        "dateJoined": "2022-06-15",
        "dateLeft": "2022-12-20",
        "totalSeaTimeDays": 188,
        "remarks": "Served as Deck Cadet"
      }
    ],
    "profileDocuments": [
      {
        "documentId": "p1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "filePathOrUrl": "/documents/profile/SEA-2025-0001/p1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6.pdf",
        "fileName": "passport.pdf",
        "fileSize": 245678,
        "contentType": "application/pdf"
      }
    ],
    "educationDocuments": [
      {
        "educationId": "e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b",
        "educationIndex": 0,
        "document": {
          "documentId": "d1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6",
          "filePathOrUrl": "/documents/education/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/d1e2f3a4-b5c6-d7e8-f9a0-b1c2d3e4f5a6.pdf",
          "fileName": "diploma.pdf",
          "fileSize": 156789,
          "contentType": "application/pdf"
        }
      }
    ],
    "voyageDocuments": [
      {
        "voyageActivityLogId": "v1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "voyageActivityIndex": 0,
        "document": {
          "documentId": "vd1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
          "filePathOrUrl": "/documents/voyage/v1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6/vd1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6.pdf",
          "fileName": "discharge_book.pdf",
          "fileSize": 123456,
          "contentType": "application/pdf"
        }
      }
    ],
    "summary": {
      "onboardingCreated": true,
      "contactDetailsCreated": true,
      "educationRecordsCreated": 2,
      "trainingRecordsCreated": 2,
      "voyageActivitiesCreated": 2,
      "profileDocumentsUploaded": 3,
      "educationDocumentsUploaded": 3,
      "voyageDocumentsUploaded": 3,
      "institutionDocumentsUploaded": 0,
      "isDraft": false,
      "message": "Comprehensive onboarding completed successfully.",
      "warnings": []
    }
  }
}
```

---

## 2️⃣ TRAINING INSTITUTION - Complete Request Specification

### Required Fields

```
SaveAsDraft: false

// Institution Details (Required)
AccreditedInstitutionId: "A7F3C8E2-9B4D-4A1E-8F6C-2D5E8B9A1C3F"
RoleSpecificIdentifier: "INST-2025-001" (Institution registration number)
Department: "Training & Certification"
JobTitle: "Training Coordinator"

// Contact Details (Required)
ContactDetails.Phone: "+234-803-456-7890"
ContactDetails.Email: "training@institution.edu.ng"
ContactDetails.Address: "P.M.B 1089, Oron, Akwa Ibom State"
ContactDetails.EmergencyContactPerson: "Deputy Director"
ContactDetails.Relationship: "Colleague"
ContactDetails.EmergencyContactNumber: "+234-806-555-9999"
ContactDetails.EmergencyContactAddress: "Same as institution"
```

**Get Accredited Institution IDs:** Call `GET /api/seafarer/accredited-institutions?type=TRAINING`

### Institution Documents (Array - Required, minimum 1)

```
InstitutionDocuments[0].DocumentTypesId: "E1F2A3B4-C5D6-7E8F-9A0B-1C2D3E4F5A6B" (Accreditation)
InstitutionDocuments[0].DocumentNumber: "NIMASA-ACC-2023-001"
InstitutionDocuments[0].IssueDate: "2023-01-15"
InstitutionDocuments[0].ExpiryDate: "2028-01-14"
InstitutionDocuments[0].IssuingAuthority: "NIMASA"
InstitutionDocuments[0].File: [FILE - PDF/Image]

InstitutionDocuments[1].DocumentTypesId: "D0E1F2A3-B4C5-6D7E-8F9A-0B1C2D3E4F5A" (Business Reg)
InstitutionDocuments[1].DocumentNumber: "BIZ-REG-1985-NMA"
InstitutionDocuments[1].IssueDate: "1985-03-20"
InstitutionDocuments[1].IssuingAuthority: "Corporate Affairs Commission"
InstitutionDocuments[1].File: [FILE - PDF/Image]
```

### Training Institution Response Example

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "onboarding": {
      "userSeafarerOnboardingId": "t1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "userId": "574b3c6e-cf39-4e4e-8318-eba17ea37cb7",
      "email": "training@institution.edu.ng",
      "firstName": "Jane",
      "lastName": "Smith",
      "rn": "TRN-2025-0001",
      "role": "TRAINING_INSTITUTION",
      "accreditedInstitutionId": "A7F3C8E2-9B4D-4A1E-8F6C-2D5E8B9A1C3F",
      "roleSpecificIdentifier": "INST-2025-001",
      "department": "Training & Certification",
      "jobTitle": "Training Coordinator",
      "status": "PENDING",
      "dateCreated": "2025-12-31T10:30:00Z"
    },
    "contactDetails": {
      "contactDetailsId": "c1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "rn": "TRN-2025-0001",
      "phone": "+234-803-456-7890",
      "email": "training@institution.edu.ng",
      "address": "P.M.B 1089, Oron, Akwa Ibom State"
    },
    "institutionDocuments": [
      {
        "documentId": "id1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "filePathOrUrl": "/documents/institutions/uo-id-here/id1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6.pdf",
        "fileName": "accreditation_cert.pdf",
        "fileSize": 345678,
        "contentType": "application/pdf"
      },
      {
        "documentId": "id2a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "filePathOrUrl": "/documents/institutions/uo-id-here/id2a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6.pdf",
        "fileName": "business_reg.pdf",
        "fileSize": 234567,
        "contentType": "application/pdf"
      }
    ],
    "summary": {
      "onboardingCreated": true,
      "contactDetailsCreated": true,
      "institutionDocumentsUploaded": 2,
      "isDraft": false,
      "message": "Comprehensive onboarding completed successfully.",
      "warnings": []
    }
  }
}
```

---

## 3️⃣ AGENT - Complete Request Specification

### Required Fields

```
SaveAsDraft: false

// Agent Details (Required)
AccreditedInstitutionId: "3C6E8F1A-4D7B-5E9C-2A4F-7D9B1E3C5A8F"
RoleSpecificIdentifier: "AGENT-2025-001" (Agent registration number)
Department: "Crew Management"
JobTitle: "Crew Manager"
EmployeeId: "EMP-CM-2025-001" (optional)

// Contact Details (Required)
ContactDetails.Phone: "+234-809-888-7777"
ContactDetails.Email: "crew@agent.com.ng"
ContactDetails.Address: "45 Warehouse Road, Apapa, Lagos"
ContactDetails.EmergencyContactPerson: "Operations Manager"
ContactDetails.Relationship: "Supervisor"
ContactDetails.EmergencyContactNumber: "+234-809-777-8888"
ContactDetails.EmergencyContactAddress: "Same as company"
```

**Get Accredited Institution IDs:** Call `GET /api/seafarer/accredited-institutions?type=AGENT`

### Institution Documents (Array - Required, minimum 1)

```
InstitutionDocuments[0].DocumentTypesId: "D0E1F2A3-B4C5-6D7E-8F9A-0B1C2D3E4F5A" (Business Reg)
InstitutionDocuments[0].DocumentNumber: "RC-2015-WASA"
InstitutionDocuments[0].IssueDate: "2015-06-10"
InstitutionDocuments[0].IssuingAuthority: "Corporate Affairs Commission"
InstitutionDocuments[0].File: [FILE - PDF/Image]

InstitutionDocuments[1].DocumentTypesId: "C5D6E7F8-A9B0-1C2D-3E4F-5A6B7C8D9E0F" (License)
InstitutionDocuments[1].DocumentNumber: "NIMASA-LIC-2024-WASA"
InstitutionDocuments[1].IssueDate: "2024-01-15"
InstitutionDocuments[1].ExpiryDate: "2026-01-14"
InstitutionDocuments[1].IssuingAuthority: "NIMASA"
InstitutionDocuments[1].File: [FILE - PDF/Image]
```

### Agent Response Example

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "onboarding": {
      "userSeafarerOnboardingId": "a1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
      "userId": "574b3c6e-cf39-4e4e-8318-eba17ea37cb7",
      "email": "crew@agent.com.ng",
      "firstName": "Michael",
      "lastName": "Johnson",
      "rn": "AGT-2025-0001",
      "role": "AGENT",
      "accreditedInstitutionId": "3C6E8F1A-4D7B-5E9C-2A4F-7D9B1E3C5A8F",
      "roleSpecificIdentifier": "AGENT-2025-001",
      "department": "Crew Management",
      "jobTitle": "Crew Manager",
      "employeeId": "EMP-CM-2025-001",
      "status": "PENDING",
      "dateCreated": "2025-12-31T10:30:00Z"
    },
    "contactDetails": {
      "contactDetailsId": "ac1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "rn": "AGT-2025-0001",
      "phone": "+234-809-888-7777",
      "email": "crew@agent.com.ng",
      "address": "45 Warehouse Road, Apapa, Lagos"
    },
    "institutionDocuments": [
      {
        "documentId": "aid1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "filePathOrUrl": "/documents/institutions/uo-id-here/aid1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6.pdf",
        "fileName": "business_reg.pdf",
        "fileSize": 234567,
        "contentType": "application/pdf"
      },
      {
        "documentId": "aid2a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6",
        "filePathOrUrl": "/documents/institutions/uo-id-here/aid2a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6.pdf",
        "fileName": "license.pdf",
        "fileSize": 345678,
        "contentType": "application/pdf"
      }
    ],
    "summary": {
      "onboardingCreated": true,
      "contactDetailsCreated": true,
      "institutionDocumentsUploaded": 2,
      "isDraft": false,
      "message": "Comprehensive onboarding completed successfully.",
      "warnings": []
    }
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request - Validation Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "ContactDetails.Phone": ["Phone number is required"],
    "ContactDetails.Email": ["Invalid email format"],
    "ProfileDocuments": ["At least one profile document is required for Seafarer role"]
  }
}
```

### 401 Unauthorized - Invalid Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 409 Conflict - Duplicate Onboarding

```json
{
  "statusCode": 409,
  "message": "User already has an active onboarding request for role SEAFARER.",
  "errorCode": "DUPLICATE_ONBOARDING"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "An error occurred during comprehensive onboarding. All changes have been rolled back.",
  "errorCode": "ONBOARDING_FAILED"
}
```

---

## 🔍 Supporting Endpoints

### Get Document Types

```http
GET /api/seafarer/document-types
Query Parameters:
  - category: string (optional) - "Identity", "Education", "Voyage", "Institution"
  
Response:
{
  "statusCode": 200,
  "data": [
    {
      "documentTypesId": "2B3C4D5E-6F7A-8B9C-0D1E-2F3A4B5C6D7E",
      "description": "International Passport",
      "code": "PASSPORT",
      "category": "Identity"
    },
    {
      "documentTypesId": "3C4D5E6F-7A8B-9C0D-1E2F-3A4B5C6D7E8F",
      "description": "Seamans Book",
      "code": "SEAMANS_BOOK",
      "category": "Professional"
    }
  ]
}
```

### Get Accredited Institutions

```http
GET /api/seafarer/accredited-institutions
Query Parameters:
  - type: string (optional) - "TRAINING", "AGENT"
  
Response:
{
  "statusCode": 200,
  "data": [
    {
      "accreditedInstitutionsId": "A7F3C8E2-9B4D-4A1E-8F6C-2D5E8B9A1C3F",
      "accreditedInstitutionName": "Nigerian Maritime Academy",
      "accreditedInstitutionEmail": "info@nigerianmaritimeacademy.edu.ng",
      "accreditedInstitutionPhone": "+234-803-456-7890",
      "isApproved": true
    }
  ]
}
```

### Get STCW Accreditations

```http
GET /api/seafarer/stcw-accreditations
Query Parameters:
  - institutionId: string (optional) - Filter by institution
  
Response:
{
  "statusCode": 200,
  "data": [
    {
      "institutionSTCWAccreditationId": "5A7C9E1F-3B4D-6A8C-2E5F-7D9B1C3E5A7F",
      "accreditedInstitutionName": "Nigerian Maritime Academy",
      "stcwRef": "STCW-A-VI/1-BT-2023",
      "remarks": "Basic Training - All four modules",
      "effectiveDate": "2023-01-15",
      "expiryDate": "2028-01-14"
    }
  ]
}
```

### Get Onboarding Status

```http
GET /api/seafarer/onboarding/{id}

Response:
{
  "statusCode": 200,
  "data": {
    "userSeafarerOnboardingId": "...",
    "rn": "SEA-2025-0001",
    "status": "PENDING",
    "role": "SEAFARER",
    // ... full onboarding details
  }
}
```

---

## 💻 Frontend Implementation Examples

### React/JavaScript Example

```javascript
// Comprehensive Onboarding Form Submission
async function submitOnboarding(formData, files) {
  const url = `${process.env.REACT_APP_API_URL}/api/seafarer/onboarding/comprehensive`;
  
  // Create FormData object
  const multipartFormData = new FormData();
  
  // Add text fields
  multipartFormData.append('SaveAsDraft', formData.saveAsDraft || false);
  multipartFormData.append('SIN', formData.sin);
  multipartFormData.append('ContactDetails.Phone', formData.contactDetails.phone);
  multipartFormData.append('ContactDetails.Email', formData.contactDetails.email);
  multipartFormData.append('ContactDetails.Address', formData.contactDetails.address);
  
  // Add education details (array)
  formData.educationDetails.forEach((edu, index) => {
    multipartFormData.append(`EducationDetails[${index}].Index`, index);
    multipartFormData.append(`EducationDetails[${index}].Institution`, edu.institution);
    multipartFormData.append(`EducationDetails[${index}].CertificateObtained`, edu.certificate);
    multipartFormData.append(`EducationDetails[${index}].StartDate`, edu.startDate);
    multipartFormData.append(`EducationDetails[${index}].EndDate`, edu.endDate);
  });
  
  // Add profile documents with files
  files.profileDocuments.forEach((doc, index) => {
    multipartFormData.append(`ProfileDocuments[${index}].DocumentTypesId`, doc.documentTypeId);
    multipartFormData.append(`ProfileDocuments[${index}].DocumentNumber`, doc.documentNumber);
    multipartFormData.append(`ProfileDocuments[${index}].IssueDate`, doc.issueDate);
    multipartFormData.append(`ProfileDocuments[${index}].ExpiryDate`, doc.expiryDate);
    multipartFormData.append(`ProfileDocuments[${index}].IssuingAuthority`, doc.issuingAuthority);
    multipartFormData.append(`ProfileDocuments[${index}].File`, doc.file); // File object
  });
  
  // Add education documents (linked to education records)
  files.educationDocuments.forEach((doc, index) => {
    multipartFormData.append(`EducationDocuments[${index}].EducationIndex`, doc.educationIndex);
    multipartFormData.append(`EducationDocuments[${index}].DocumentTypesId`, doc.documentTypeId);
    multipartFormData.append(`EducationDocuments[${index}].File`, doc.file);
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        // Don't set Content-Type - browser will set it with boundary
      },
      body: multipartFormData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Onboarding failed');
    }
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Onboarding error:', error);
    throw error;
  }
}

// Usage
const formData = {
  saveAsDraft: false,
  sin: 'SIN-2025-001',
  contactDetails: {
    phone: '+234-803-456-7890',
    email: 'seafarer@test.com',
    address: '45 Marina Street, Lagos'
  },
  educationDetails: [
    {
      institution: 'Nigerian Maritime Academy',
      certificate: 'HND in Nautical Science',
      startDate: '2018-09-01',
      endDate: '2021-06-30'
    }
  ]
};

const files = {
  profileDocuments: [
    {
      documentTypeId: '2B3C4D5E-6F7A-8B9C-0D1E-2F3A4B5C6D7E',
      documentNumber: 'A12345678',
      issueDate: '2020-01-15',
      expiryDate: '2030-01-14',
      issuingAuthority: 'Nigerian Immigration',
      file: passportFileObject // File from input[type="file"]
    }
  ],
  educationDocuments: [
    {
      educationIndex: 0,
      documentTypeId: 'B2C3D4E5-F6A7-8B9C-0D1E-2F3A4B5C6D7E',
      file: diplomaFileObject
    }
  ]
};

const result = await submitOnboarding(formData, files);
console.log('Onboarding created:', result.onboarding.rn);
```

### Angular/TypeScript Example

```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';

export class OnboardingService {
  constructor(private http: HttpClient) {}
  
  submitComprehensiveOnboarding(formData: any, files: any) {
    const url = `${environment.apiUrl}/api/seafarer/onboarding/comprehensive`;
    
    const multipartFormData = new FormData();
    
    // Add fields
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((item: any, index: number) => {
          Object.keys(item).forEach(prop => {
            multipartFormData.append(`${key}[${index}].${prop}`, item[prop]);
          });
        });
      } else if (typeof formData[key] === 'object') {
        Object.keys(formData[key]).forEach(prop => {
          multipartFormData.append(`${key}.${prop}`, formData[key][prop]);
        });
      } else {
        multipartFormData.append(key, formData[key]);
      }
    });
    
    // Add files
    files.forEach((fileGroup: any) => {
      fileGroup.documents.forEach((doc: any, index: number) => {
        Object.keys(doc).forEach(key => {
          if (key === 'file') {
            multipartFormData.append(`${fileGroup.type}[${index}].File`, doc[key]);
          } else {
            multipartFormData.append(`${fileGroup.type}[${index}].${key}`, doc[key]);
          }
        });
      });
    });
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });
    
    return this.http.post(url, multipartFormData, { headers });
  }
}
```

---

## 📱 Mobile Implementation Notes

### File Upload Considerations

1. **File Size Limits:** Typically 5MB-10MB per file
2. **Supported Formats:** PDF, JPG, JPEG, PNG
3. **Multiple Files:** Can upload multiple documents in one request
4. **Progress Tracking:** Monitor upload progress for better UX

### Network Handling

```javascript
// Add timeout for large uploads
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

try {
  const response = await fetch(url, {
    method: 'POST',
    body: multipartFormData,
    signal: controller.signal
  });
  clearTimeout(timeoutId);
  // Handle response
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Upload timeout');
  }
}
```

---

## ✅ Best Practices

1. **Validate on Frontend First:**
   - Required fields before submission
   - File size and format
   - Date validations (e.g., EndDate > StartDate)
   - Email format

2. **Handle Large Files:**
   - Show upload progress
   - Compress images before upload if possible
   - Allow cancellation

3. **Save Draft Feature:**
   - Auto-save drafts periodically
   - Set `SaveAsDraft: true`
   - User can continue later

4. **Error Handling:**
   - Display validation errors per field
   - Retry failed uploads
   - Show friendly error messages

5. **User Experience:**
   - Multi-step wizard for complex forms
   - Save progress between steps
   - Preview documents before upload
   - Clear indication of required vs optional fields

---

## 🔐 Security Considerations

1. **JWT Token:**
   - Store securely (HttpOnly cookies recommended)
   - Refresh token before expiry
   - Handle 401 responses (redirect to login)

2. **File Upload:**
   - Validate file types on frontend
   - Backend validates again (never trust frontend)
   - Scan for malware (backend responsibility)

3. **Data Privacy:**
   - Use HTTPS only
   - Don't log sensitive data
   - Clear form data on logout

---

## 📞 Support & Testing

**Test Environment:** `https://api-test.yourdomain.com`  
**Production:** `https://api.yourdomain.com`

For issues or questions, contact: dev-support@yourdomain.com

---

## 📚 Additional Resources

- **Postman Collection:** Import `COMPREHENSIVE_ONBOARDING_POSTMAN_COLLECTION.json` for testing
- **API Documentation:** Full Swagger/OpenAPI docs at `/swagger`
- **Sample Files:** Test with sample PDFs from project repository

---

**Last Updated:** December 31, 2025  
**API Version:** v1.0

