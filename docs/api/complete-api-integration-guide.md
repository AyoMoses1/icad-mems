rocess# MEMS Seafarer API - Complete Integration Guide

**Base URL**: `https://localhost:44388` (Development)  
**API Version**: `v1`  
**Base Path**: `/seafarer/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [1. Authentication & Setup](#1-authentication--setup)
3. [2. Onboarding](#2-onboarding)
4. [3. Profile Management (Seafarer Only)](#3-profile-management-seafarer-only)
5. [4. Document Upload](#4-document-upload)
6. [5. Applications (Seafarer Only)](#5-applications-seafarer-only)
7. [6. Billing & Payments](#6-billing--payments)
8. [7. Accreditation (Training/Agent)](#7-accreditation-trainingagent)
9. [8. Inspection & Audit (Officer/Inspector)](#8-inspection--audit-officerinspector)
10. [9. Statistics](#9-statistics)

---

## Authentication

All endpoints (except those marked as `[AllowAnonymous]`) require a Bearer token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

**Token Types:**
- `seafarerToken` - For Seafarer users
- `trainingToken` - For Training Institution users
- `agentToken` - For Agent users
- `adminToken` - For Admin users
- `officerToken` - For Accreditation Officer users
- `inspectorToken` - For Inspector users

---

## 1. Authentication & Setup

### 1.1 Get Public Statistics (No Auth)

**Description**: Get public statistics without authentication. Use this to verify API is running.

**URL**: `GET /seafarer/api/v1/statistics/public`

**Headers**: None (No authentication required)

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Statistics retrieved successfully",
  "data": {
    "totalSeafarers": 0,
    "totalApplications": 0,
    "totalInstitutions": 0,
    "totalServices": 0
  }
}
```

---

## 2. Onboarding

### 2.1 Create Onboarding Request

**Description**: Create onboarding request for Seafarer, Training Institution, or Agent.

**URL**: `POST /seafarer/api/v1/onboarding`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "role": "SEAFARER",
  "accreditedInstitutionId": null,
  "roleSpecificIdentifier": null,
  "sin": "SIN123456",
  "department": null,
  "jobTitle": null,
  "employeeId": null,
  "notes": null
}
```

**Role Values**: `SEAFARER`, `TRAINING_INSTITUTION`, `AGENT`, `OFFICER`, `INSPECTOR`, `ADMIN`

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Onboarding created successfully",
  "data": {
    "id": "guid",
    "userId": "guid",
    "role": "SEAFARER",
    "status": "PENDING",
    "sin": "SIN123456",
    "rn": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 2.2 Get My Onboarding

**Description**: Get current user's onboarding status. Auto-creates if not exists.

**URL**: `GET /seafarer/api/v1/onboarding/my-onboarding`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Request Body**: None

**Response**: Same as 2.1

---

### 2.3 Auto-Create Onboarding

**Description**: Auto-create onboarding based on IAM role from JWT token.

**URL**: `POST /seafarer/api/v1/onboarding/auto-create`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Request Body**: None

**Response**: Same as 2.1

---

### 2.4 Get Pending Onboardings (Admin)

**Description**: Get all pending onboarding requests (Admin only).

**URL**: `GET /seafarer/api/v1/onboarding/pending`

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Pending onboardings retrieved successfully",
  "data": [
    {
      "id": "guid",
      "userId": "guid",
      "role": "SEAFARER",
      "status": "PENDING",
      "sin": "SIN123456",
      "rn": null,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2.5 Get All Onboardings (Admin)

**Description**: Get all onboarding requests (Admin only).

**URL**: `GET /seafarer/api/v1/onboarding/all`

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Request Body**: None

**Response**: Same as 2.4 (array of all onboardings)

---

### 2.6 Get Onboarding by ID

**Description**: Get onboarding details by ID.

**URL**: `GET /seafarer/api/v1/onboarding/{id}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `id` (Guid) - Onboarding ID

**Request Body**: None

**Response**: Same as 2.1 (single onboarding object)

---

### 2.7 Approve/Reject Onboarding (Admin)

**Description**: Approve/reject/suspend onboarding request (Admin only).

**URL**: `PATCH /seafarer/api/v1/onboarding/{id}/status`

**Headers**:
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Path Parameters**:
- `id` (Guid) - Onboarding ID

**Request Body**:
```json
{
  "status": "APPROVED",
  "rn": "SEAF001234",
  "notes": "Onboarding approved"
}
```

**Status Values**: `APPROVED`, `REJECTED`, `SUSPENDED`

**Response**: Same as 2.1 (updated onboarding object)

---

## 3. Profile Management (Seafarer Only)

### 3.1 Create Education Details

**Description**: Create education details for seafarer.

**URL**: `POST /seafarer/api/v1/profile/education`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "institution": "Maritime Academy of Nigeria",
  "certificateObtained": "Certificate of Competency",
  "startDate": "2020-01-15T00:00:00Z",
  "endDate": "2022-06-30T00:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Education details created successfully",
  "data": {
    "id": "guid",
    "institution": "Maritime Academy of Nigeria",
    "certificateObtained": "Certificate of Competency",
    "startDate": "2020-01-15T00:00:00Z",
    "endDate": "2022-06-30T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 3.2 Get My Education Details

**Description**: Get all education details for current seafarer.

**URL**: `GET /seafarer/api/v1/profile/education`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Education details retrieved successfully",
  "data": [
    {
      "id": "guid",
      "institution": "Maritime Academy of Nigeria",
      "certificateObtained": "Certificate of Competency",
      "startDate": "2020-01-15T00:00:00Z",
      "endDate": "2022-06-30T00:00:00Z"
    }
  ]
}
```

---

### 3.3 Get Education Details by ID

**Description**: Get education details by ID.

**URL**: `GET /seafarer/api/v1/profile/education/{educationId}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `educationId` (Guid) - Education ID

**Request Body**: None

**Response**: Same as 3.1 (single education object)

---

### 3.4 Update Education Details

**Description**: Update education details.

**URL**: `PUT /seafarer/api/v1/profile/education/{educationId}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: application/json
```

**Path Parameters**:
- `educationId` (Guid) - Education ID

**Request Body**: Same as 3.1

**Response**: Same as 3.1 (updated education object)

---

### 3.5 Delete Education Details

**Description**: Delete education details.

**URL**: `DELETE /seafarer/api/v1/profile/education/{educationId}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `educationId` (Guid) - Education ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Education details deleted successfully",
  "data": true
}
```

---

### 3.6 Create/Update Contact Details

**Description**: Create or update contact details.

**URL**: `POST /seafarer/api/v1/profile/contact-details`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "phone": "+2348012345678",
  "email": "john.doe@example.com",
  "emergencyContactPerson": "Jane Doe",
  "relationship": "Spouse",
  "emergencyContactNumber": "+2348098765432",
  "address": "123 Maritime Street, Lagos",
  "emergencyContactAddress": "456 Emergency Lane, Lagos"
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Contact details saved successfully",
  "data": {
    "id": "guid",
    "phone": "+2348012345678",
    "email": "john.doe@example.com",
    "emergencyContactPerson": "Jane Doe",
    "relationship": "Spouse",
    "emergencyContactNumber": "+2348098765432",
    "address": "123 Maritime Street, Lagos",
    "emergencyContactAddress": "456 Emergency Lane, Lagos"
  }
}
```

---

### 3.7 Get My Contact Details

**Description**: Get contact details for current seafarer.

**URL**: `GET /seafarer/api/v1/profile/contact-details`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Request Body**: None

**Response**: Same as 3.6 (single contact details object)

---

### 3.8 Update Contact Details

**Description**: Update contact details.

**URL**: `PUT /seafarer/api/v1/profile/contact-details`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: application/json
```

**Request Body**: Same as 3.6

**Response**: Same as 3.6 (updated contact details object)

---

## 4. Document Upload

### 4.1 Upload Education Document

**Description**: Upload document for education record.

**URL**: `POST /seafarer/api/v1/documents/education/{educationId}/upload`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: multipart/form-data
```

**Path Parameters**:
- `educationId` (Guid) - Education ID

**Request Body** (Form Data):
- `DocumentTypesId` (Guid) - Document Type ID (e.g., Certificate, Diploma)
- `File` (File) - PDF, JPG, PNG file (max 10MB)
- `DocumentNumber` (string, optional) - Document number
- `IssueDate` (DateTime, optional) - Issue date (ISO format)
- `ExpiryDate` (DateTime, optional) - Expiry date (ISO format)
- `IssuingAuthority` (string, optional) - Issuing authority

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Document uploaded successfully",
  "data": {
    "id": "guid",
    "documentTypeId": "guid",
    "documentTypeName": "Certificate",
    "fileUrl": "https://storage.../document.pdf",
    "documentNumber": "CERT123456",
    "issueDate": "2022-06-30T00:00:00Z",
    "expiryDate": "2027-06-30T00:00:00Z",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 4.2 Upload Profile Document (Seafarer)

**Description**: Upload profile document (passport, medical, CoC, etc.).

**URL**: `POST /seafarer/api/v1/documents/profile/upload`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: multipart/form-data
```

**Request Body** (Form Data):
- `RN` (string) - Registration Number
- `DocumentTypesId` (Guid) - Document Type ID
- `File` (File) - PDF, JPG, PNG file
- `DocumentNumber` (string, optional) - Document number
- `IssueDate` (DateTime, optional) - Issue date
- `ExpiryDate` (DateTime, optional) - Expiry date
- `IssuingAuthority` (string, optional) - Issuing authority

**Response**: Same as 4.1

---

### 4.3 Upload Institution Document (Training/Agent)

**Description**: Upload document for training institution or agent.

**URL**: `POST /seafarer/api/v1/documents/institutions/{institutionId}/upload`

**Headers**:
```
Authorization: Bearer {trainingToken}
Content-Type: multipart/form-data
```

**Path Parameters**:
- `institutionId` (Guid) - UserOrganization ID

**Request Body** (Form Data):
- `DocumentTypesId` (Guid) - Document Type ID
- `File` (File) - PDF, JPG, PNG file
- `DocumentNumber` (string, optional) - Document number
- `IssueDate` (DateTime, optional) - Issue date
- `ExpiryDate` (DateTime, optional) - Expiry date
- `IssuingAuthority` (string, optional) - Issuing authority

**Response**: Same as 4.1

---

### 4.4 Upload Application Document

**Description**: Upload document for application.

**URL**: `POST /seafarer/api/v1/documents/applications/{applicationId}/upload`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: multipart/form-data
```

**Path Parameters**:
- `applicationId` (Guid) - Application ID

**Request Body** (Form Data):
- `DocumentTypesId` (Guid) - Document Type ID
- `File` (File) - PDF, JPG, PNG file
- `DocumentNumber` (string, optional) - Document number
- `IssueDate` (DateTime, optional) - Issue date
- `ExpiryDate` (DateTime, optional) - Expiry date
- `IssuingAuthority` (string, optional) - Issuing authority

**Response**: Same as 4.1

---

### 4.5 Get Education Documents

**Description**: Get all documents for an education record.

**URL**: `GET /seafarer/api/v1/documents/education/{educationId}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `educationId` (Guid) - Education ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Documents retrieved successfully",
  "data": [
    {
      "id": "guid",
      "documentTypeId": "guid",
      "documentTypeName": "Certificate",
      "fileUrl": "https://storage.../document.pdf",
      "documentNumber": "CERT123456",
      "issueDate": "2022-06-30T00:00:00Z",
      "expiryDate": "2027-06-30T00:00:00Z"
    }
  ]
}
```

---

### 4.6 Get Profile Documents

**Description**: Get all profile documents for a seafarer.

**URL**: `GET /seafarer/api/v1/documents/profile/{rn}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `rn` (string) - Registration Number

**Request Body**: None

**Response**: Same as 4.5 (array of profile documents)

---

### 4.7 Get Institution Documents

**Description**: Get all documents for an institution.

**URL**: `GET /seafarer/api/v1/documents/institutions/{institutionId}`

**Headers**:
```
Authorization: Bearer {trainingToken}
```

**Path Parameters**:
- `institutionId` (Guid) - Institution ID

**Request Body**: None

**Response**: Same as 4.5 (array of institution documents)

---

### 4.8 Delete Education Document

**Description**: Delete education document.

**URL**: `DELETE /seafarer/api/v1/documents/education/{documentId}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `documentId` (Guid) - Document ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Document deleted successfully",
  "data": true
}
```

---

### 4.9 Delete Profile Document

**Description**: Delete profile document.

**URL**: `DELETE /seafarer/api/v1/documents/profile/{documentId}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `documentId` (Guid) - Document ID

**Request Body**: None

**Response**: Same as 4.8

---

### 4.10 Delete Institution Document

**Description**: Delete institution document.

**URL**: `DELETE /seafarer/api/v1/documents/institutions/{documentId}`

**Headers**:
```
Authorization: Bearer {trainingToken}
```

**Path Parameters**:
- `documentId` (Guid) - Document ID

**Request Body**: None

**Response**: Same as 4.8

---

## 5. Applications (Seafarer Only)

### 5.1 Get Available Services

**Description**: Get all available services.

**URL**: `GET /seafarer/api/v1/applications/services`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Services retrieved successfully",
  "data": [
    {
      "id": "guid",
      "name": "Certificate of Competency",
      "description": "Application for Certificate of Competency",
      "serviceType": "CERTIFICATION",
      "isActive": true,
      "requirements": []
    }
  ]
}
```

---

### 5.2 Get Service by ID

**Description**: Get service details by ID.

**URL**: `GET /seafarer/api/v1/applications/services/{serviceId}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `serviceId` (Guid) - Service ID

**Request Body**: None

**Response**: Same as 5.1 (single service object)

---

### 5.3 Get Service Checklist

**Description**: Get requirements checklist for a service (based on user's rank).

**URL**: `GET /seafarer/api/v1/applications/services/{serviceId}/checklist`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `serviceId` (Guid) - Service ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Checklist retrieved successfully",
  "data": [
    {
      "requirementListId": "guid",
      "requirementName": "Medical Certificate",
      "requirementDescription": "Valid medical certificate",
      "isRequired": true,
      "metricType": "FILE",
      "metricId": "guid"
    }
  ]
}
```

---

### 5.4 Create Application

**Description**: Create a new application for a service.

**URL**: `POST /seafarer/api/v1/applications`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "serviceId": "guid",
  "remarks": "Application for Certificate of Competency"
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Application created successfully",
  "data": {
    "id": "guid",
    "serviceId": "guid",
    "serviceName": "Certificate of Competency",
    "status": "DRAFT",
    "remarks": "Application for Certificate of Competency",
    "createdAt": "2024-01-01T00:00:00Z",
    "requirements": []
  }
}
```

---

### 5.5 Submit Application

**Description**: Submit application with requirement values.

**URL**: `POST /seafarer/api/v1/applications/{id}/submit`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: application/json
```

**Path Parameters**:
- `id` (Guid) - Application ID

**Request Body**:
```json
{
  "applicationId": "guid",
  "remarks": "Application submitted",
  "requirementValues": [
    {
      "requirementListId": "guid",
      "actualValue": "Yes"
    }
  ]
}
```

**Response**: Same as 5.4 (application with status "SUBMITTED")

---

### 5.6 Get My Applications

**Description**: Get all applications for current seafarer.

**URL**: `GET /seafarer/api/v1/applications/my-applications`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Applications retrieved successfully",
  "data": [
    {
      "id": "guid",
      "serviceId": "guid",
      "serviceName": "Certificate of Competency",
      "status": "SUBMITTED",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 5.7 Get Application by ID

**Description**: Get application details by ID.

**URL**: `GET /seafarer/api/v1/applications/{id}`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `id` (Guid) - Application ID

**Request Body**: None

**Response**: Same as 5.4 (single application object with full details)

---

### 5.8 Get Application Dashboard

**Description**: Get application dashboard with summary statistics.

**URL**: `GET /seafarer/api/v1/applications/dashboard`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Dashboard retrieved successfully",
  "data": {
    "totalApplications": 10,
    "pendingApplications": 2,
    "approvedApplications": 5,
    "rejectedApplications": 1,
    "recentApplications": [
      {
        "id": "guid",
        "serviceName": "Certificate of Competency",
        "status": "SUBMITTED",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 5.9 Get Application History

**Description**: Get application with complete history (requirements, documents, invoices, payments, timeline).

**URL**: `GET /seafarer/api/v1/applications/{id}/history`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `id` (Guid) - Application ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Application history retrieved successfully",
  "data": {
    "application": {
      "id": "guid",
      "serviceName": "Certificate of Competency",
      "status": "SUBMITTED"
    },
    "requirements": [],
    "documents": [],
    "invoices": [],
    "payments": [],
    "statusHistory": []
  }
}
```

---

### 5.10 Get Applications with History (Filtered)

**Description**: Get filtered and paginated applications with history.

**URL**: `GET /seafarer/api/v1/applications/history`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Query Parameters**:
- `serviceId` (Guid, optional) - Filter by service
- `statusId` (Guid, optional) - Filter by status
- `fromDate` (DateTime, optional) - Start date (ISO format)
- `toDate` (DateTime, optional) - End date (ISO format)
- `pageNumber` (int, default: 1) - Page number
- `pageSize` (int, default: 10) - Page size

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Applications retrieved successfully",
  "data": [
    {
      "application": {
        "id": "guid",
        "serviceName": "Certificate of Competency",
        "status": "SUBMITTED"
      },
      "requirements": [],
      "documents": [],
      "invoices": [],
      "payments": []
    }
  ]
}
```

---

## 6. Billing & Payments

### 6.1 Generate Invoice

**Description**: Generate invoice for submitted application.

**URL**: `POST /seafarer/api/v1/applications/{id}/invoice`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `id` (Guid) - Application ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Invoice generated successfully",
  "data": {
    "id": "guid",
    "applicationId": "guid",
    "invoiceNumber": "INV-2024-001",
    "amount": 1000.00,
    "currency": "NGN",
    "status": "PENDING",
    "dueDate": "2024-01-15T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "lineItems": [
      {
        "description": "Certificate of Competency Fee",
        "quantity": 1,
        "unitPrice": 1000.00,
        "total": 1000.00
      }
    ]
  }
}
```

---

### 6.2 Get Invoice

**Description**: Get invoice for application.

**URL**: `GET /seafarer/api/v1/applications/{id}/invoice`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `id` (Guid) - Application ID

**Request Body**: None

**Response**: Same as 6.1

---

### 6.3 Initiate Payment

**Description**: Initiate payment for application (creates payment reference).

**URL**: `POST /seafarer/api/v1/payment/applications/{id}/payment/initiate`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `id` (Guid) - Application ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Payment initiated successfully",
  "data": {
    "paymentReference": "PAY-20241201-123456",
    "amount": 1000.00,
    "currency": "NGN",
    "paymentUrl": "https://payment-gateway.com/pay/PAY-20241201-123456"
  }
}
```

---

### 6.4 Simulate Payment

**Description**: Simulate payment for testing (development only). Currency must match invoice currency.

**URL**: `POST /seafarer/api/v1/payment/applications/{id}/payment/simulate`

**Headers**:
```
Authorization: Bearer {seafarerToken}
Content-Type: application/json
```

**Path Parameters**:
- `id` (Guid) - Application ID

**Request Body**:
```json
{
  "amount": 1000.00,
  "currency": "NGN",
  "transactionReference": "PAY-20241201-123456",
  "paymentMethod": "card",
  "notes": "Test payment",
  "payerName": "John Doe",
  "payerEmail": "john.doe@example.com",
  "payerPhone": "+2348012345678"
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Payment simulated successfully",
  "data": {
    "paymentReference": "PAY-20241201-123456",
    "status": "SUCCESS",
    "amount": 1000.00,
    "currency": "NGN"
  }
}
```

---

### 6.5 Get Payment Status

**Description**: Get payment status for application.

**URL**: `GET /seafarer/api/v1/payment/applications/{id}/payment-status`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `id` (Guid) - Application ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Payment status retrieved successfully",
  "data": {
    "paymentReference": "PAY-20241201-123456",
    "status": "SUCCESS",
    "amount": 1000.00,
    "currency": "NGN",
    "paidAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 6.6 Verify Payment

**Description**: Verify payment by reference.

**URL**: `GET /seafarer/api/v1/payment/payments/{reference}/verify`

**Headers**:
```
Authorization: Bearer {seafarerToken}
```

**Path Parameters**:
- `reference` (string) - Payment reference

**Request Body**: None

**Response**: Same as 6.5

---

### 6.7 Payment Webhook

**Description**: Payment webhook endpoint (called by payment gateway). No authentication required.

**URL**: `POST /seafarer/api/v1/payment/webhook`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "paymentReference": "PAY-20241201-123456",
  "status": "SUCCESS",
  "payload": {
    "transactionId": "TXN123456",
    "amount": 1000.00,
    "currency": "NGN"
  }
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Webhook processed successfully",
  "data": {
    "paymentReference": "PAY-20241201-123456",
    "status": "SUCCESS"
  }
}
```

---

## 7. Accreditation (Training/Agent)

### 7.1 Get Approved Institutions (Public)

**Description**: Get all approved institutions (public endpoint, no auth required).

**URL**: `GET /seafarer/api/v1/accreditation/institutions`

**Headers**: None (No authentication required)

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Institutions retrieved successfully",
  "data": [
    {
      "id": "guid",
      "accreditedInstitutionName": "Maritime Training Academy",
      "accreditedInstitutionAddress": "123 Training Street, Lagos",
      "accreditedInstitutionEmail": "info@maritimeacademy.ng",
      "accreditedInstitutionPhone": "+2348012345678",
      "institutionType": "TRAINING_INSTITUTION",
      "status": "FULL",
      "accreditedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 7.2 Get Institution by ID

**Description**: Get institution details by ID.

**URL**: `GET /seafarer/api/v1/accreditation/institutions/{id}`

**Headers**:
```
Authorization: Bearer {trainingToken}
```

**Path Parameters**:
- `id` (Guid) - Institution ID

**Request Body**: None

**Response**: Same as 7.1 (single institution object)

---

### 7.3 Create Institution Accreditation Request

**Description**: Create accreditation request for training institution or agent.

**URL**: `POST /seafarer/api/v1/accreditation/institutions`

**Headers**:
```
Authorization: Bearer {trainingToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "accreditedInstitutionName": "Maritime Training Academy",
  "accreditedInstitutionAddress": "123 Training Street, Lagos",
  "accreditedInstitutionEmail": "info@maritimeacademy.ng",
  "accreditedInstitutionPhone": "+2348012345678",
  "institutionType": "guid"
}
```

**Response**: Same as 7.1 (single institution object with status "PENDING")

---

### 7.4 Get All Accreditation Requests

**Description**: Get all accreditation requests (for officers/inspectors).

**URL**: `GET /seafarer/api/v1/accreditation/requests`

**Headers**:
```
Authorization: Bearer {officerToken}
```

**Request Body**: None

**Response**: Same as 7.1 (array of all accreditation requests)

---

### 7.5 Update Accreditation Status

**Description**: Update accreditation status (approve/reject) - Officer/Inspector only.

**URL**: `PATCH /seafarer/api/v1/accreditation/institutions/{id}/status`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Path Parameters**:
- `id` (Guid) - Institution ID

**Request Body**:
```json
{
  "status": "FULL",
  "notes": "Accreditation approved"
}
```

**Status Values**: `PENDING`, `PROVISIONAL`, `FULL`, `EXPIRED`, `REVOKED`, `SUSPENDED`

**Response**: Same as 7.1 (updated institution object)

---

### 7.6 Get STCW Standards

**Description**: Get all STCW standards.

**URL**: `GET /seafarer/api/v1/accreditation/stcw-standards`

**Headers**:
```
Authorization: Bearer {trainingToken}
```

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "STCW standards retrieved successfully",
  "data": [
    {
      "id": "guid",
      "stcwRef": "A-II/1",
      "description": "Navigation at Operational Level",
      "isActive": true
    }
  ]
}
```

---

### 7.7 Add STCW Accreditation

**Description**: Add STCW accreditation to institution.

**URL**: `POST /seafarer/api/v1/accreditation/institutions/{id}/stcw-accreditations`

**Headers**:
```
Authorization: Bearer {trainingToken}
Content-Type: application/json
```

**Path Parameters**:
- `id` (Guid) - Institution ID

**Request Body**:
```json
{
  "stcwRef": "A-II/1",
  "effectiveDate": "2024-01-01T00:00:00Z",
  "expiryDate": "2027-12-31T23:59:59Z",
  "remarks": "STCW accreditation for Navigation at Operational Level"
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "STCW accreditation added successfully",
  "data": {
    "id": "guid",
    "institutionId": "guid",
    "stcwRef": "A-II/1",
    "status": "PENDING",
    "effectiveDate": "2024-01-01T00:00:00Z",
    "expiryDate": "2027-12-31T23:59:59Z",
    "remarks": "STCW accreditation for Navigation at Operational Level"
  }
}
```

---

### 7.8 Get Institution STCW Accreditations

**Description**: Get STCW accreditations for an institution.

**URL**: `GET /seafarer/api/v1/accreditation/institutions/{id}/stcw-accreditations`

**Headers**:
```
Authorization: Bearer {trainingToken}
```

**Path Parameters**:
- `id` (Guid) - Institution ID

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "STCW accreditations retrieved successfully",
  "data": [
    {
      "id": "guid",
      "institutionId": "guid",
      "stcwRef": "A-II/1",
      "status": "APPROVED",
      "effectiveDate": "2024-01-01T00:00:00Z",
      "expiryDate": "2027-12-31T23:59:59Z"
    }
  ]
}
```

---

### 7.9 Update STCW Accreditation Status

**Description**: Update STCW accreditation status - Officer/Inspector only.

**URL**: `PATCH /seafarer/api/v1/accreditation/stcw-accreditations/{id}/status`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Path Parameters**:
- `id` (Guid) - STCW Accreditation ID

**Request Body**:
```json
{
  "status": "APPROVED",
  "notes": "STCW accreditation approved"
}
```

**Response**: Same as 7.7 (updated STCW accreditation object)

---

## 8. Inspection & Audit (Officer/Inspector)

### 8.1 Schedule Inspection

**Description**: Schedule inspection (Officer only).

**URL**: `POST /seafarer/api/v1/inspection/schedules`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "institutionId": "guid",
  "scheduledDate": "2024-12-15T10:00:00Z",
  "inspectionType": "Routine",
  "inspectorId": "guid",
  "notes": "Routine inspection of training facilities"
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Inspection scheduled successfully",
  "data": {
    "id": "guid",
    "institutionId": "guid",
    "scheduledDate": "2024-12-15T10:00:00Z",
    "inspectionType": "Routine",
    "inspectorId": "guid",
    "status": "SCHEDULED",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 8.2 Update Inspection Schedule

**Description**: Update inspection schedule (Officer/Inspector).

**URL**: `PATCH /seafarer/api/v1/inspection/schedules/{inspectionScheduleId}`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Path Parameters**:
- `inspectionScheduleId` (Guid) - Inspection Schedule ID

**Request Body**:
```json
{
  "scheduledDate": "2024-12-20T10:00:00Z",
  "inspectionType": "Routine",
  "notes": "Updated inspection date"
}
```

**Response**: Same as 8.1 (updated inspection schedule)

---

### 8.3 Get Scheduled Inspections

**Description**: Get scheduled inspections with filters.

**URL**: `GET /seafarer/api/v1/inspection/schedules`

**Headers**:
```
Authorization: Bearer {officerToken}
```

**Query Parameters**:
- `institutionId` (Guid, optional) - Filter by institution
- `status` (string, optional) - Filter by status
- `fromDate` (DateTime, optional) - Start date
- `toDate` (DateTime, optional) - End date

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Inspections retrieved successfully",
  "data": [
    {
      "id": "guid",
      "institutionId": "guid",
      "scheduledDate": "2024-12-15T10:00:00Z",
      "inspectionType": "Routine",
      "status": "SCHEDULED"
    }
  ]
}
```

---

### 8.4 Get Inspection Schedule by ID

**Description**: Get inspection schedule by ID.

**URL**: `GET /seafarer/api/v1/inspection/schedules/{inspectionScheduleId}`

**Headers**:
```
Authorization: Bearer {officerToken}
```

**Path Parameters**:
- `inspectionScheduleId` (Guid) - Inspection Schedule ID

**Request Body**: None

**Response**: Same as 8.1 (single inspection schedule)

---

### 8.5 Create Inspection Report

**Description**: Create inspection report (Inspector only).

**URL**: `POST /seafarer/api/v1/inspection/reports`

**Headers**:
```
Authorization: Bearer {inspectorToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "inspectionScheduleId": "guid",
  "institutionId": "guid",
  "reportStatus": "DRAFT",
  "findings": "All facilities meet requirements",
  "recommendations": "Continue monitoring",
  "complianceScore": 95
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Inspection report created successfully",
  "data": {
    "id": "guid",
    "inspectionScheduleId": "guid",
    "institutionId": "guid",
    "reportStatus": "DRAFT",
    "findings": "All facilities meet requirements",
    "recommendations": "Continue monitoring",
    "complianceScore": 95,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 8.6 Update Inspection Report

**Description**: Update inspection report (Inspector only - DRAFT status only).

**URL**: `PUT /seafarer/api/v1/inspection/reports/{inspectionReportId}`

**Headers**:
```
Authorization: Bearer {inspectorToken}
Content-Type: application/json
```

**Path Parameters**:
- `inspectionReportId` (Guid) - Inspection Report ID

**Request Body**: Same as 8.5

**Response**: Same as 8.5 (updated inspection report)

---

### 8.7 Submit Inspection Report

**Description**: Submit inspection report for approval (Inspector only).

**URL**: `POST /seafarer/api/v1/inspection/reports/{inspectionReportId}/submit`

**Headers**:
```
Authorization: Bearer {inspectorToken}
```

**Path Parameters**:
- `inspectionReportId` (Guid) - Inspection Report ID

**Request Body**: None

**Response**: Same as 8.5 (report with status "SUBMITTED")

---

### 8.8 Approve Inspection Report

**Description**: Approve/reject inspection report (Officer only).

**URL**: `POST /seafarer/api/v1/inspection/reports/{inspectionReportId}/approve`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Path Parameters**:
- `inspectionReportId` (Guid) - Inspection Report ID

**Request Body**:
```json
{
  "approved": true,
  "notes": "Report approved"
}
```

**Response**: Same as 8.5 (report with status "APPROVED" or "REJECTED")

---

### 8.9 Get Inspection Reports

**Description**: Get inspection reports with filters.

**URL**: `GET /seafarer/api/v1/inspection/reports`

**Headers**:
```
Authorization: Bearer {inspectorToken}
```

**Query Parameters**:
- `institutionId` (Guid, optional) - Filter by institution
- `reportStatus` (string, optional) - Filter by status

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Inspection reports retrieved successfully",
  "data": [
    {
      "id": "guid",
      "institutionId": "guid",
      "reportStatus": "APPROVED",
      "findings": "All facilities meet requirements",
      "complianceScore": 95
    }
  ]
}
```

---

### 8.10 Get Inspection Report by ID

**Description**: Get inspection report by ID.

**URL**: `GET /seafarer/api/v1/inspection/reports/{inspectionReportId}`

**Headers**:
```
Authorization: Bearer {inspectorToken}
```

**Path Parameters**:
- `inspectionReportId` (Guid) - Inspection Report ID

**Request Body**: None

**Response**: Same as 8.5 (single inspection report)

---

### 8.11 Create Deficiency Report

**Description**: Create deficiency report (Officer only).

**URL**: `POST /seafarer/api/v1/deficiency`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "institutionId": "guid",
  "deficiencyType": "FACILITY",
  "description": "Training equipment needs maintenance",
  "severity": "MEDIUM",
  "dueDate": "2024-12-31T23:59:59Z"
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Deficiency report created successfully",
  "data": {
    "id": "guid",
    "institutionId": "guid",
    "deficiencyType": "FACILITY",
    "description": "Training equipment needs maintenance",
    "severity": "MEDIUM",
    "status": "OPEN",
    "dueDate": "2024-12-31T23:59:59Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 8.12 Respond to Deficiency

**Description**: Respond to deficiency (Institution/Agent only).

**URL**: `POST /seafarer/api/v1/deficiency/{deficiencyReportId}/respond`

**Headers**:
```
Authorization: Bearer {trainingToken}
Content-Type: application/json
```

**Path Parameters**:
- `deficiencyReportId` (Guid) - Deficiency Report ID

**Request Body**:
```json
{
  "response": "We have scheduled maintenance for next week",
  "evidenceUrls": ["https://storage.../evidence.pdf"]
}
```

**Response**: Same as 8.11 (deficiency with status "RESPONDED")

---

### 8.13 Resolve Deficiency

**Description**: Resolve deficiency (Officer only).

**URL**: `POST /seafarer/api/v1/deficiency/{deficiencyReportId}/resolve`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Path Parameters**:
- `deficiencyReportId` (Guid) - Deficiency Report ID

**Request Body**:
```json
{
  "resolved": true,
  "notes": "Deficiency resolved after inspection"
}
```

**Response**: Same as 8.11 (deficiency with status "RESOLVED")

---

### 8.14 Get Deficiency Reports

**Description**: Get deficiency reports (filtered by institution and status).

**URL**: `GET /seafarer/api/v1/deficiency`

**Headers**:
```
Authorization: Bearer {officerToken}
```

**Query Parameters**:
- `institutionId` (Guid, optional) - Filter by institution
- `status` (string, optional) - Filter by status

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Deficiency reports retrieved successfully",
  "data": [
    {
      "id": "guid",
      "institutionId": "guid",
      "deficiencyType": "FACILITY",
      "description": "Training equipment needs maintenance",
      "severity": "MEDIUM",
      "status": "OPEN"
    }
  ]
}
```

---

### 8.15 Get Deficiency Report by ID

**Description**: Get deficiency report by ID.

**URL**: `GET /seafarer/api/v1/deficiency/{deficiencyReportId}`

**Headers**:
```
Authorization: Bearer {officerToken}
```

**Path Parameters**:
- `deficiencyReportId` (Guid) - Deficiency Report ID

**Request Body**: None

**Response**: Same as 8.11 (single deficiency report)

---

### 8.16 Schedule Follow-Up Audit

**Description**: Schedule follow-up audit (Officer only).

**URL**: `POST /seafarer/api/v1/audit`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "institutionId": "guid",
  "scheduledDate": "2025-01-15T10:00:00Z",
  "auditType": "FOLLOW_UP",
  "reason": "Follow-up on previous inspection findings",
  "inspectorId": "guid"
}
```

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Follow-up audit scheduled successfully",
  "data": {
    "id": "guid",
    "institutionId": "guid",
    "scheduledDate": "2025-01-15T10:00:00Z",
    "auditType": "FOLLOW_UP",
    "status": "SCHEDULED",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 8.17 Update Follow-Up Audit

**Description**: Update follow-up audit (Inspector/Officer).

**URL**: `PUT /seafarer/api/v1/audit/{auditId}`

**Headers**:
```
Authorization: Bearer {officerToken}
Content-Type: application/json
```

**Path Parameters**:
- `auditId` (Guid) - Audit ID

**Request Body**:
```json
{
  "scheduledDate": "2025-01-20T10:00:00Z",
  "reason": "Updated audit schedule"
}
```

**Response**: Same as 8.16 (updated audit)

---

### 8.18 Get Follow-Up Audits

**Description**: Get follow-up audits with filters.

**URL**: `GET /seafarer/api/v1/audit`

**Headers**:
```
Authorization: Bearer {officerToken}
```

**Query Parameters**:
- `institutionId` (Guid, optional) - Filter by institution
- `status` (string, optional) - Filter by status
- `fromDate` (DateTime, optional) - Start date
- `toDate` (DateTime, optional) - End date

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Follow-up audits retrieved successfully",
  "data": [
    {
      "id": "guid",
      "institutionId": "guid",
      "scheduledDate": "2025-01-15T10:00:00Z",
      "auditType": "FOLLOW_UP",
      "status": "SCHEDULED"
    }
  ]
}
```

---

### 8.19 Get Follow-Up Audit by ID

**Description**: Get follow-up audit by ID.

**URL**: `GET /seafarer/api/v1/audit/{auditId}`

**Headers**:
```
Authorization: Bearer {officerToken}
```

**Path Parameters**:
- `auditId` (Guid) - Audit ID

**Request Body**: None

**Response**: Same as 8.16 (single audit)

---

## 9. Statistics

### 9.1 Get Admin Statistics

**Description**: Get admin-level statistics (requires authentication).

**URL**: `GET /seafarer/api/v1/statistics/admin`

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "code": "200",
  "message": "Statistics retrieved successfully",
  "data": {
    "totalSeafarers": 100,
    "totalApplications": 500,
    "totalInstitutions": 20,
    "totalServices": 10,
    "pendingApplications": 50,
    "approvedApplications": 400,
    "rejectedApplications": 50,
    "totalRevenue": 500000.00
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "code": "400",
  "message": "Error message description",
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message",
    "details": {}
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes for Frontend Integration

1. **Base URL**: Update the base URL for production environment
2. **Authentication**: Store JWT tokens securely and include in all authenticated requests
3. **File Uploads**: Use `multipart/form-data` for document upload endpoints
4. **Date Formats**: All dates should be in ISO 8601 format (e.g., `2024-01-01T00:00:00Z`)
5. **Pagination**: Use `pageNumber` and `pageSize` query parameters for paginated endpoints
6. **Error Handling**: Always check the `success` field in responses and handle errors appropriately
7. **Content-Type**: Use `application/json` for JSON requests, `multipart/form-data` for file uploads

---

## Endpoint Summary

**Total Endpoints: 70+**

- **Onboarding**: 7 endpoints
- **Profile Management**: 8 endpoints
- **Document Upload**: 10 endpoints
- **Applications**: 10 endpoints
- **Billing & Payments**: 7 endpoints
- **Accreditation**: 9 endpoints
- **Inspection & Audit**: 19 endpoints
- **Statistics**: 2 endpoints

---

**Last Updated**: 2024-12-01  
**API Version**: v1

