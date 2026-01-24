# Comprehensive Onboarding Payloads Reference

Base URL: `seafarer/api/v1/Onboarding`

All endpoints require **Authorization** header with Bearer token.

---

## Overview

The system supports **3 types of onboarding**:

| Role | Value | Description |
|------|-------|-------------|
| SEAFARER | 1 | Individual seafarers (captains, officers, ratings) |
| TRAINING_INSTITUTION | 2 | Maritime training centers and academies |
| AGENT | 3 | Manning agents and recruitment agencies |

> **Note:** Staff roles (ACCREDITATION_OFFICER, INSPECTOR, FINANCE, ADMIN) do NOT require onboarding. They get access automatically based on their IAM role assignment.

---

## Comprehensive Onboarding Endpoint

**Endpoint:** `POST /seafarer/api/v1/Onboarding/comprehensive`

**Content-Type:** `multipart/form-data`

**Max Request Size:** 50 MB

---

# 1. SEAFARER Onboarding

Complete onboarding payload for seafarers with all possible fields.

## Request Payload (multipart/form-data)

```json
{
  "role": 1,
  "saveAsDraft": false,
  "sin": "SIN123456789",
  "roleSpecificIdentifier": null,
  "department": null,
  "jobTitle": null,
  "employeeId": null,
  "notes": "Experienced deck officer applying for registration",
  
  "contactDetails": {
    "phone": "+234-801-234-5678",
    "email": "john.doe@example.com",
    "emergencyContactPerson": "Jane Doe",
    "relationship": "Spouse",
    "emergencyContactNumber": "+234-802-345-6789",
    "address": "123 Marina Road, Victoria Island, Lagos",
    "emergencyContactAddress": "456 Palm Avenue, Ikeja, Lagos"
  },
  
  "educationDetails": [
    {
      "index": 0,
      "institution": "Maritime Academy of Nigeria, Oron",
      "certificateObtained": "Certificate of Competency - Deck Officer Class II",
      "startDate": "2018-09-01",
      "endDate": "2022-06-30"
    },
    {
      "index": 1,
      "institution": "Federal College of Fisheries and Marine Technology",
      "certificateObtained": "National Diploma in Nautical Science",
      "startDate": "2016-09-01",
      "endDate": "2018-06-30"
    }
  ],
  
  "seafarerTrainings": [
    {
      "institutionSTCWAccreditationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "startDate": "2022-07-01",
      "endDate": "2022-07-15",
      "trainingStatusId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "result": "Pass",
      "certificateName": "Basic Safety Training (BST)",
      "issueDate": "2022-07-15",
      "expiryDate": "2027-07-15"
    },
    {
      "institutionSTCWAccreditationId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "startDate": "2022-08-01",
      "endDate": "2022-08-10",
      "trainingStatusId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "result": "Pass",
      "certificateName": "Advanced Fire Fighting",
      "issueDate": "2022-08-10",
      "expiryDate": "2027-08-10"
    }
  ],
  
  "voyageActivities": [
    {
      "index": 0,
      "seamanBookNo": "SBK-2022-001234",
      "vesselName": "MV Ocean Spirit",
      "imoNumber": "IMO9876543",
      "flagState": "Nigeria",
      "operatorCompany": "Nigerian Maritime Shipping Ltd",
      "portOfEngagement": "Lagos, Nigeria",
      "portOfDischarge": "Rotterdam, Netherlands",
      "dateJoined": "2022-10-01",
      "dateLeft": "2023-04-01",
      "totalSeaTimeDays": 182,
      "remarks": "Chief Officer - Cargo Operations"
    },
    {
      "index": 1,
      "seamanBookNo": "SBK-2022-001234",
      "vesselName": "MV Atlantic Star",
      "imoNumber": "IMO9876544",
      "flagState": "Panama",
      "operatorCompany": "Global Shipping Corp",
      "portOfEngagement": "Rotterdam, Netherlands",
      "portOfDischarge": "Singapore",
      "dateJoined": "2023-05-01",
      "dateLeft": "2023-11-01",
      "totalSeaTimeDays": 184,
      "remarks": "Second Officer - Navigation Watch"
    }
  ],
  
  "profileDocuments": [
    {
      "documentTypesId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "file": "[Binary File - passport.pdf]",
      "documentNumber": "A12345678",
      "issueDate": "2020-01-15",
      "expiryDate": "2030-01-14",
      "issuingAuthority": "Nigeria Immigration Service"
    },
    {
      "documentTypesId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "file": "[Binary File - seaman_book.pdf]",
      "documentNumber": "SBK-2022-001234",
      "issueDate": "2022-01-01",
      "expiryDate": "2032-01-01",
      "issuingAuthority": "NIMASA"
    },
    {
      "documentTypesId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "file": "[Binary File - medical_cert.pdf]",
      "documentNumber": "MED-2023-5678",
      "issueDate": "2023-06-01",
      "expiryDate": "2025-06-01",
      "issuingAuthority": "Approved Medical Examiner"
    }
  ],
  
  "educationDocuments": [
    {
      "educationIndex": 0,
      "documentTypesId": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
      "file": "[Binary File - coc_certificate.pdf]",
      "documentNumber": "COC-2022-12345",
      "issueDate": "2022-06-30",
      "expiryDate": "2027-06-30",
      "issuingAuthority": "NIMASA"
    },
    {
      "educationIndex": 1,
      "documentTypesId": "7fa85f64-5717-4562-b3fc-2c963f66afaa",
      "file": "[Binary File - nd_certificate.pdf]",
      "documentNumber": "ND-2018-67890",
      "issueDate": "2018-06-30",
      "expiryDate": null,
      "issuingAuthority": "Federal College of Fisheries"
    }
  ],
  
  "voyageDocuments": [
    {
      "voyageActivityIndex": 0,
      "documentTypesId": "8fa85f64-5717-4562-b3fc-2c963f66afab",
      "file": "[Binary File - discharge_book_1.pdf]",
      "documentNumber": "DISCH-2023-001",
      "issueDate": "2023-04-01",
      "expiryDate": null,
      "issuingAuthority": "MV Ocean Spirit"
    },
    {
      "voyageActivityIndex": 1,
      "documentTypesId": "8fa85f64-5717-4562-b3fc-2c963f66afab",
      "file": "[Binary File - discharge_book_2.pdf]",
      "documentNumber": "DISCH-2023-002",
      "issueDate": "2023-11-01",
      "expiryDate": null,
      "issuingAuthority": "MV Atlantic Star"
    }
  ]
}
```

## Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "onboarding": {
      "userSeafarerOnboardingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "userId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "role": 1,
      "roleDescription": "SEAFARER",
      "rn": null,
      "sin": "SIN123456789",
      "accreditedInstitutionId": null,
      "accreditedInstitutionName": null,
      "roleSpecificIdentifier": null,
      "department": null,
      "jobTitle": null,
      "employeeId": null,
      "status": 1,
      "statusDescription": "PENDING",
      "approvedDate": null,
      "approvedBy": null,
      "rejectionReason": null,
      "notes": "Experienced deck officer applying for registration",
      "dateCreated": "2024-12-31T10:30:00Z",
      "dateModified": "2024-12-31T10:30:00Z",
      "isActive": true,
      "educationDetails": [],
      "contactDetails": null,
      "institutionDocuments": [],
      "hasEducationDetails": true,
      "hasContactDetails": true,
      "hasInstitutionDocuments": false,
      "educationDocumentCount": 2,
      "institutionDocumentCount": 0
    },
    "contactDetails": {
      "contactDetailsId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "rn": "RN-2024-001234",
      "phone": "+234-801-234-5678",
      "email": "john.doe@example.com",
      "emergencyContactPerson": "Jane Doe",
      "relationship": "Spouse",
      "emergencyContactNumber": "+234-802-345-6789",
      "address": "123 Marina Road, Victoria Island, Lagos",
      "emergencyContactAddress": "456 Palm Avenue, Ikeja, Lagos",
      "dateCreated": "2024-12-31T10:30:00Z",
      "dateModified": "2024-12-31T10:30:00Z"
    },
    "educationDetails": [
      {
        "educationId": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
        "rn": "RN-2024-001234",
        "institution": "Maritime Academy of Nigeria, Oron",
        "certificateObtained": "Certificate of Competency - Deck Officer Class II",
        "startDate": "2018-09-01T00:00:00Z",
        "endDate": "2022-06-30T00:00:00Z",
        "documents": [],
        "dateCreated": "2024-12-31T10:30:00Z",
        "dateModified": "2024-12-31T10:30:00Z"
      },
      {
        "educationId": "7fa85f64-5717-4562-b3fc-2c963f66afaa",
        "rn": "RN-2024-001234",
        "institution": "Federal College of Fisheries and Marine Technology",
        "certificateObtained": "National Diploma in Nautical Science",
        "startDate": "2016-09-01T00:00:00Z",
        "endDate": "2018-06-30T00:00:00Z",
        "documents": [],
        "dateCreated": "2024-12-31T10:30:00Z",
        "dateModified": "2024-12-31T10:30:00Z"
      }
    ],
    "seafarerTrainings": [
      {
        "recordId": "TRN-2024-001",
        "rn": "RN-2024-001234",
        "institutionSTCWAccreditationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "startDate": "2022-07-01T00:00:00Z",
        "endDate": "2022-07-15T00:00:00Z",
        "trainingStatusId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
        "result": "Pass",
        "certificateName": "Basic Safety Training (BST)",
        "issueDate": "2022-07-15T00:00:00Z",
        "expiryDate": "2027-07-15T00:00:00Z",
        "institutionName": "Maritime Academy of Nigeria",
        "trainingStatusName": "Completed",
        "stcwReference": "VI/1"
      }
    ],
    "voyageActivities": [
      {
        "logId": "VAL-2024-001",
        "rn": "RN-2024-001234",
        "seamanBookNo": "SBK-2022-001234",
        "vesselName": "MV Ocean Spirit",
        "imoNumber": "IMO9876543",
        "flagState": "Nigeria",
        "operatorCompany": "Nigerian Maritime Shipping Ltd",
        "portOfEngagement": "Lagos, Nigeria",
        "portOfDischarge": "Rotterdam, Netherlands",
        "dateJoined": "2022-10-01T00:00:00Z",
        "dateLeft": "2023-04-01T00:00:00Z",
        "totalSeaTimeDays": 182,
        "createdOn": "2024-12-31T10:30:00Z",
        "remarks": "Chief Officer - Cargo Operations"
      }
    ],
    "profileDocuments": [
      {
        "documentId": "8fa85f64-5717-4562-b3fc-2c963f66afab",
        "filePathOrUrl": "/uploads/documents/passport_abc123.pdf",
        "fileName": "passport.pdf",
        "fileSize": 1048576,
        "contentType": "application/pdf"
      }
    ],
    "educationDocuments": [
      {
        "educationId": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
        "educationIndex": 0,
        "document": {
          "documentId": "9fa85f64-5717-4562-b3fc-2c963f66afac",
          "filePathOrUrl": "/uploads/documents/coc_cert_xyz789.pdf",
          "fileName": "coc_certificate.pdf",
          "fileSize": 524288,
          "contentType": "application/pdf"
        }
      }
    ],
    "voyageDocuments": [
      {
        "voyageActivityLogId": "VAL-2024-001",
        "voyageActivityIndex": 0,
        "document": {
          "documentId": "afa85f64-5717-4562-b3fc-2c963f66afad",
          "filePathOrUrl": "/uploads/documents/discharge_book_1.pdf",
          "fileName": "discharge_book_1.pdf",
          "fileSize": 262144,
          "contentType": "application/pdf"
        }
      }
    ],
    "institutionDocuments": null,
    "summary": {
      "onboardingCreated": true,
      "contactDetailsCreated": true,
      "educationRecordsCreated": 2,
      "trainingRecordsCreated": 2,
      "voyageActivitiesCreated": 2,
      "profileDocumentsUploaded": 3,
      "educationDocumentsUploaded": 2,
      "voyageDocumentsUploaded": 2,
      "institutionDocumentsUploaded": 0,
      "isDraft": false,
      "message": "Comprehensive onboarding completed successfully for role: SEAFARER",
      "warnings": []
    }
  }
}
```

---

# 2. TRAINING_INSTITUTION Onboarding

Complete onboarding payload for training institutions.

## Request Payload (multipart/form-data)

```json
{
  "role": 2,
  "saveAsDraft": false,
  "accreditedInstitutionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "roleSpecificIdentifier": "NIMASA-TI-2024-001",
  "sin": null,
  "department": "Training Department",
  "jobTitle": "Training Coordinator",
  "employeeId": "EMP-001",
  "notes": "Registering as authorized representative for Maritime Academy of Nigeria",
  
  "contactDetails": {
    "phone": "+234-803-456-7890",
    "email": "training@maritime-academy.edu.ng",
    "emergencyContactPerson": "Admin Office",
    "relationship": "Institution",
    "emergencyContactNumber": "+234-803-456-7891",
    "address": "Maritime Academy of Nigeria, Oron, Akwa Ibom State",
    "emergencyContactAddress": "Same as above"
  },
  
  "institutionDocuments": [
    {
      "documentTypesId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "file": "[Binary File - accreditation_certificate.pdf]",
      "documentNumber": "NIMASA-ACC-2024-001",
      "issueDate": "2024-01-01",
      "expiryDate": "2029-01-01",
      "issuingAuthority": "NIMASA"
    },
    {
      "documentTypesId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "file": "[Binary File - business_registration.pdf]",
      "documentNumber": "RC-123456",
      "issueDate": "2000-05-15",
      "expiryDate": null,
      "issuingAuthority": "Corporate Affairs Commission"
    },
    {
      "documentTypesId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "file": "[Binary File - quality_certificate.pdf]",
      "documentNumber": "ISO-9001-2024",
      "issueDate": "2024-03-01",
      "expiryDate": "2027-03-01",
      "issuingAuthority": "ISO Certification Body"
    }
  ]
}
```

## Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "onboarding": {
      "userSeafarerOnboardingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "userId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "role": 2,
      "roleDescription": "TRAINING_INSTITUTION",
      "rn": null,
      "sin": null,
      "accreditedInstitutionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "accreditedInstitutionName": "Maritime Academy of Nigeria",
      "roleSpecificIdentifier": "NIMASA-TI-2024-001",
      "department": "Training Department",
      "jobTitle": "Training Coordinator",
      "employeeId": "EMP-001",
      "status": 1,
      "statusDescription": "PENDING",
      "approvedDate": null,
      "approvedBy": null,
      "rejectionReason": null,
      "notes": "Registering as authorized representative for Maritime Academy of Nigeria",
      "dateCreated": "2024-12-31T10:30:00Z",
      "dateModified": "2024-12-31T10:30:00Z",
      "isActive": true,
      "educationDetails": [],
      "contactDetails": null,
      "institutionDocuments": [],
      "hasEducationDetails": false,
      "hasContactDetails": true,
      "hasInstitutionDocuments": true,
      "educationDocumentCount": 0,
      "institutionDocumentCount": 3
    },
    "contactDetails": {
      "contactDetailsId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "rn": "TI-2024-001234",
      "phone": "+234-803-456-7890",
      "email": "training@maritime-academy.edu.ng",
      "emergencyContactPerson": "Admin Office",
      "relationship": "Institution",
      "emergencyContactNumber": "+234-803-456-7891",
      "address": "Maritime Academy of Nigeria, Oron, Akwa Ibom State",
      "emergencyContactAddress": "Same as above",
      "dateCreated": "2024-12-31T10:30:00Z",
      "dateModified": "2024-12-31T10:30:00Z"
    },
    "educationDetails": null,
    "seafarerTrainings": null,
    "voyageActivities": null,
    "profileDocuments": null,
    "educationDocuments": null,
    "voyageDocuments": null,
    "institutionDocuments": [
      {
        "documentId": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
        "filePathOrUrl": "/uploads/documents/accreditation_cert.pdf",
        "fileName": "accreditation_certificate.pdf",
        "fileSize": 2097152,
        "contentType": "application/pdf"
      },
      {
        "documentId": "7fa85f64-5717-4562-b3fc-2c963f66afaa",
        "filePathOrUrl": "/uploads/documents/business_reg.pdf",
        "fileName": "business_registration.pdf",
        "fileSize": 1048576,
        "contentType": "application/pdf"
      },
      {
        "documentId": "8fa85f64-5717-4562-b3fc-2c963f66afab",
        "filePathOrUrl": "/uploads/documents/iso_cert.pdf",
        "fileName": "quality_certificate.pdf",
        "fileSize": 524288,
        "contentType": "application/pdf"
      }
    ],
    "summary": {
      "onboardingCreated": true,
      "contactDetailsCreated": true,
      "educationRecordsCreated": 0,
      "trainingRecordsCreated": 0,
      "voyageActivitiesCreated": 0,
      "profileDocumentsUploaded": 0,
      "educationDocumentsUploaded": 0,
      "voyageDocumentsUploaded": 0,
      "institutionDocumentsUploaded": 3,
      "isDraft": false,
      "message": "Comprehensive onboarding completed successfully for role: TRAINING_INSTITUTION",
      "warnings": []
    }
  }
}
```

---

# 3. AGENT Onboarding

Complete onboarding payload for manning agents.

## Request Payload (multipart/form-data)

```json
{
  "role": 3,
  "saveAsDraft": false,
  "accreditedInstitutionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "roleSpecificIdentifier": "NIMASA-AGT-2024-001",
  "sin": null,
  "department": "Recruitment",
  "jobTitle": "Manning Agent Representative",
  "employeeId": "AGT-001",
  "notes": "Registering as authorized agent for crew recruitment services",
  
  "contactDetails": {
    "phone": "+234-804-567-8901",
    "email": "recruitment@manning-agent.com",
    "emergencyContactPerson": "Operations Manager",
    "relationship": "Company",
    "emergencyContactNumber": "+234-804-567-8902",
    "address": "25 Apapa Wharf Road, Apapa, Lagos",
    "emergencyContactAddress": "Same as above"
  },
  
  "institutionDocuments": [
    {
      "documentTypesId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "file": "[Binary File - manning_license.pdf]",
      "documentNumber": "NIMASA-ML-2024-001",
      "issueDate": "2024-01-01",
      "expiryDate": "2026-01-01",
      "issuingAuthority": "NIMASA"
    },
    {
      "documentTypesId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "file": "[Binary File - company_registration.pdf]",
      "documentNumber": "RC-789012",
      "issueDate": "2010-08-20",
      "expiryDate": null,
      "issuingAuthority": "Corporate Affairs Commission"
    },
    {
      "documentTypesId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "file": "[Binary File - insurance_certificate.pdf]",
      "documentNumber": "INS-2024-001",
      "issueDate": "2024-01-01",
      "expiryDate": "2025-01-01",
      "issuingAuthority": "Insurance Company Ltd"
    }
  ]
}
```

## Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "onboarding": {
      "userSeafarerOnboardingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "userId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "role": 3,
      "roleDescription": "AGENT",
      "rn": null,
      "sin": null,
      "accreditedInstitutionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "accreditedInstitutionName": "Global Manning Services Ltd",
      "roleSpecificIdentifier": "NIMASA-AGT-2024-001",
      "department": "Recruitment",
      "jobTitle": "Manning Agent Representative",
      "employeeId": "AGT-001",
      "status": 1,
      "statusDescription": "PENDING",
      "approvedDate": null,
      "approvedBy": null,
      "rejectionReason": null,
      "notes": "Registering as authorized agent for crew recruitment services",
      "dateCreated": "2024-12-31T10:30:00Z",
      "dateModified": "2024-12-31T10:30:00Z",
      "isActive": true,
      "educationDetails": [],
      "contactDetails": null,
      "institutionDocuments": [],
      "hasEducationDetails": false,
      "hasContactDetails": true,
      "hasInstitutionDocuments": true,
      "educationDocumentCount": 0,
      "institutionDocumentCount": 3
    },
    "contactDetails": {
      "contactDetailsId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "rn": "AGT-2024-001234",
      "phone": "+234-804-567-8901",
      "email": "recruitment@manning-agent.com",
      "emergencyContactPerson": "Operations Manager",
      "relationship": "Company",
      "emergencyContactNumber": "+234-804-567-8902",
      "address": "25 Apapa Wharf Road, Apapa, Lagos",
      "emergencyContactAddress": "Same as above",
      "dateCreated": "2024-12-31T10:30:00Z",
      "dateModified": "2024-12-31T10:30:00Z"
    },
    "educationDetails": null,
    "seafarerTrainings": null,
    "voyageActivities": null,
    "profileDocuments": null,
    "educationDocuments": null,
    "voyageDocuments": null,
    "institutionDocuments": [
      {
        "documentId": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
        "filePathOrUrl": "/uploads/documents/manning_license.pdf",
        "fileName": "manning_license.pdf",
        "fileSize": 1048576,
        "contentType": "application/pdf"
      },
      {
        "documentId": "7fa85f64-5717-4562-b3fc-2c963f66afaa",
        "filePathOrUrl": "/uploads/documents/company_reg.pdf",
        "fileName": "company_registration.pdf",
        "fileSize": 524288,
        "contentType": "application/pdf"
      },
      {
        "documentId": "8fa85f64-5717-4562-b3fc-2c963f66afab",
        "filePathOrUrl": "/uploads/documents/insurance.pdf",
        "fileName": "insurance_certificate.pdf",
        "fileSize": 262144,
        "contentType": "application/pdf"
      }
    ],
    "summary": {
      "onboardingCreated": true,
      "contactDetailsCreated": true,
      "educationRecordsCreated": 0,
      "trainingRecordsCreated": 0,
      "voyageActivitiesCreated": 0,
      "profileDocumentsUploaded": 0,
      "educationDocumentsUploaded": 0,
      "voyageDocumentsUploaded": 0,
      "institutionDocumentsUploaded": 3,
      "isDraft": false,
      "message": "Comprehensive onboarding completed successfully for role: AGENT",
      "warnings": []
    }
  }
}
```

---

# Field Reference

## Role Values

| Role | Value | Required Fields |
|------|-------|-----------------|
| SEAFARER | 1 | contactDetails, educationDetails, profileDocuments |
| TRAINING_INSTITUTION | 2 | accreditedInstitutionId, contactDetails, institutionDocuments |
| AGENT | 3 | accreditedInstitutionId, contactDetails, institutionDocuments |

## Onboarding Status Values

| Status | Value | Description |
|--------|-------|-------------|
| DRAFT | 0 | Saved as draft, not submitted |
| PENDING | 1 | Submitted, awaiting approval |
| APPROVED | 2 | Approved by admin |
| REJECTED | 3 | Rejected by admin |
| SUSPENDED | 4 | Temporarily suspended |

## Document Linking

### Education Documents
Link education documents to education records using the `educationIndex` field:
- `educationDetails[0].index = 0` → `educationDocuments[*].educationIndex = 0`

### Voyage Documents
Link voyage documents to voyage activities using the `voyageActivityIndex` field:
- `voyageActivities[0].index = 0` → `voyageDocuments[*].voyageActivityIndex = 0`

---

# Other Onboarding Endpoints

## Simple Onboarding (without documents)

**Endpoint:** `POST /seafarer/api/v1/Onboarding`

**Content-Type:** `application/json`

```json
{
  "role": 1,
  "accreditedInstitutionId": null,
  "roleSpecificIdentifier": null,
  "sin": "SIN123456789",
  "department": null,
  "jobTitle": null,
  "employeeId": null,
  "notes": "Initial onboarding request"
}
```

## Get My Onboarding

**Endpoint:** `GET /seafarer/api/v1/Onboarding/my-onboarding`

## Get Onboarding by ID

**Endpoint:** `GET /seafarer/api/v1/Onboarding/{id}`

## Get Pending Onboardings (Admin)

**Endpoint:** `GET /seafarer/api/v1/Onboarding/pending`

## Get All Onboardings (Admin)

**Endpoint:** `GET /seafarer/api/v1/Onboarding/all`

## Update Onboarding Status (Admin)

**Endpoint:** `PATCH /seafarer/api/v1/Onboarding/{id}/status`

```json
{
  "status": 2,
  "rejectionReason": null,
  "notes": "Approved after document verification"
}
```

---

# Error Responses

## Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "AccreditedInstitutionId is required for TRAINING_INSTITUTION role"
  },
  "data": null
}
```

## Duplicate Onboarding

```json
{
  "success": false,
  "message": "User already has an active onboarding request for role SEAFARER",
  "error": {
    "code": "DUPLICATE_ONBOARDING",
    "details": null
  },
  "data": null
}
```

## Invalid Role

```json
{
  "success": false,
  "message": "IAM role 'ADMIN' cannot be mapped to a seafarer role. Supported roles: SEAFARER, TRAINING_INSTITUTION, AGENT.",
  "error": {
    "code": "INVALID_IAM_ROLE",
    "details": null
  },
  "data": null
}
```

