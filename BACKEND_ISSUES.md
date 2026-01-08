# 🔧 Backend API Issues - MEMS Seafarer Portal

**Date:** January 2, 2026  
**Reported By:** Frontend Team  
**Priority:** High (Demo Blocker)

---

## Summary

The following issues were encountered during frontend integration testing. These need to be resolved for the demo and production deployment.

---

## Issue #1: Get Members by Workspace - Filtering Issue

**Endpoint:** `GET /api/workspace-members` (or similar)

**Problem:**  
The endpoint needs to filter members based on **tenant AND workspace** only. Currently, it may be returning members across all workspaces.

**Expected Behavior:**  
Only return members that belong to the specified `tenantId` AND `workspaceId`.

**Current Response:**
```json
{
    "workspaceMemberId": "f89dd6af-aa41-4876-ae31-78b1f9ac315a",
    "tenantId": "f5c9e9d1-57b7-408c-82a9-faa2457c338c",
    "tenantName": "quedaunnoufreule-7142@yopmail.com",
    "workspaceId": "432b0876-c0d8-4a56-b9b4-9f8142c7889c",
    "workspaceName": "Sea Farer",
    "userId": "59e3ffe4-ea51-4e98-b3ce-23f79a07172f",
    "userName": "quedaunnoufreule-7142@yopmail.com",
    "userEmail": "quedaunnoufreule-7142@yopmail.com",
    "userFullName": "Romola Aliyah Nasiru",
    "type": "Member",
    "status": true,
    "workspaceRoles": ["OWNER"]
}
```

---

## Issue #2: User Role Should Be Tenant-Specific

**Endpoint:** `GET /api/workspace-members`

**Problem:**  
The `workspaceRoles` array returns ALL roles the user has. It should only return the role(s) for **that specific tenant**.

**Current Response:**
```json
"workspaceRoles": ["OWNER"]
```

**Expected Behavior:**  
Return only the role the user has within the context of the current tenant/workspace being queried.

---

## Issue #3: Workspace Roles Missing Permissions

**Endpoint:** `GET /api/workspace-roles` (or similar)

**Problem:**  
The workspace roles endpoint does not include the **permissions** attached to each role. We need this to display checkboxes for permissions per resource per role in the UI.

**Current Response:**
```json
{
    "workspaceRoleId": "ada5a14a-1a9d-483a-b553-efc1d0ef69ff",
    "workspaceId": "432b0876-c0d8-4a56-b9b4-9f8142c7889c",
    "userWorkspaceId": "54208ef3-31ce-4791-8bff-87983ab247bd",
    "roleName": "TRAINING_INSTITUTION",
    "roleCode": null,
    "roleDescription": "TRAINING_INSTITUTION",
    "isSystemRole": false
}
```

**Expected Response:**
```json
{
    "workspaceRoleId": "ada5a14a-1a9d-483a-b553-efc1d0ef69ff",
    "workspaceId": "432b0876-c0d8-4a56-b9b4-9f8142c7889c",
    "userWorkspaceId": "54208ef3-31ce-4791-8bff-87983ab247bd",
    "roleName": "TRAINING_INSTITUTION",
    "roleCode": null,
    "roleDescription": "TRAINING_INSTITUTION",
    "isSystemRole": false,
    "permissions": [
        {
            "resourceId": "...",
            "resourceName": "Applications",
            "canCreate": true,
            "canRead": true,
            "canUpdate": false,
            "canDelete": false
        },
        // ... more permissions
    ]
}
```

---

## Issue #4: UserInfo Endpoint Returns Array of Roles

**Endpoint:** `GET /api/userinfo` (or `/api/v1/account/me`)

**Problem:**  
The `roles` field returns an array of ALL roles the user has across all tenants. It should only return the role for **the current tenant context**.

**Current Response:**
```json
{
    "sub": "2b1cb239-7633-4362-b9eb-18e7c85433aa",
    "name": "Ayo Moses",
    "email": "ayomoses111@gmail.com",
    "email_verified": false,
    "given_name": "Ayo",
    "family_name": "Moses",
    "middle_name": "Daniels",
    "phone_number": "+2348163647778",
    "phone_number_verified": false,
    "date_of_birth": "1996-11-09",
    "country": "Nigeria",
    "status": "PendingVerification",
    "created_at": "2025-12-30T09:29:28Z",
    "updated_at": "2025-12-30T09:29:28Z",
    "last_login": "2026-01-02T17:24:29Z",
    "is_onboarding_complete": false,
    "address": {
        "line1": "No.5 Lokosu Street, Off Aduloju Express",
        "line2": "",
        "city": "Ibadan",
        "state": "Oyo",
        "postalCode": "200213",
        "country": "Nigeria"
    },
    "roles": ["OWNER"]
}
```

**Expected Behavior:**  
- Accept `tenantId` as a query parameter or header
- Return only the role for that specific tenant
- OR return `role: "OWNER"` (single value) instead of `roles: ["OWNER"]` (array)

---

## Issue #5: Onboarding Complete Flag Not Updating

**Endpoint:** `GET /api/userinfo`

**Problem:**  
After a seafarer successfully completes onboarding, the `is_onboarding_complete` flag still returns `false`.

**Current Response (after onboarding):**
```json
{
    "is_onboarding_complete": false
}
```

**Expected Response:**
```json
{
    "is_onboarding_complete": true
}
```

**Steps to Reproduce:**
1. Complete seafarer onboarding via `POST /seafarer/api/v1/Onboarding/comprehensive`
2. Get onboarding status - shows APPROVED
3. Call userinfo endpoint
4. `is_onboarding_complete` is still `false`

---

## Issue #6: Service Checklist Returns Empty

**Endpoint:** `GET /seafarer/api/v1/Applications/services/{serviceId}/checklist`

**Example URL:**  
`https://pay-service.icadpays.com/seafarer/api/v1/applications/services/dda6ed8a-c310-4ddf-89df-30c751a48e09/checklist`

**Problem:**  
The checklist endpoint returns empty or no requirements for services that should have requirements.

**Expected Behavior:**  
Return the list of requirements/checklist items for the service so the frontend can display them during the application process.

**Expected Response:**
```json
{
    "success": true,
    "data": [
        {
            "requirementListId": "...",
            "requirementName": "Valid Passport Copy",
            "metricDescription": "File/Document",
            "requiredValue": "Required",
            "isMandatory": true
        },
        {
            "requirementListId": "...",
            "requirementName": "Sea Service Record",
            "metricDescription": "Text",
            "requiredValue": "Required",
            "isMandatory": true
        }
    ]
}
```

---

## Issue #7: Initiate Payment Returns 400 Error

**Endpoint:** `POST /seafarer/api/v1/Payment/applications/{applicationId}/payment/initiate`

**Example URL:**  
`https://pay-service.icadpays.com/seafarer/api/v1/Payment/applications/a6ec1020-1660-45a0-9bfe-321199aaf6de/payment/initiate`

**Problem:**  
The endpoint returns HTTP 400 Bad Request when trying to initiate payment for an application.

**Request Method:** POST

**Expected Behavior:**  
Should return payment gateway URL and payment reference:
```json
{
    "success": true,
    "data": {
        "paymentReference": "PAY-2025-001234",
        "amount": 50000.00,
        "currency": "NGN",
        "paymentUrl": "https://payment-gateway.com/pay?ref=...",
        "expiresAt": "2026-01-02T18:00:00Z",
        "status": "PENDING"
    }
}
```

**Possible Causes:**
- Application not in correct status (should be SUBMITTED with invoice generated)
- Invoice not generated for the application
- Missing required fields

---

## Issue #8: Missing Endpoint - Get All Payments for Seafarer

**Required Endpoint:** `GET /seafarer/api/v1/Payment/my-payments`

**Problem:**  
There is no endpoint for a seafarer to retrieve their list of all payments/payment history.

**Expected Response:**
```json
{
    "success": true,
    "data": [
        {
            "paymentId": "...",
            "paymentReference": "PAY-2025-001234",
            "applicationId": "...",
            "invoiceId": "...",
            "invoiceNumber": "INV-2025-001234",
            "amount": 50000.00,
            "currency": "NGN",
            "status": "SUCCESS",
            "paymentMethod": "CARD",
            "paidAt": "2026-01-02T15:45:00Z",
            "transactionId": "TXN-GATEWAY-12345"
        }
    ]
}
```

---

## Issue #9: Training Institution Onboarding Fails

**Endpoint:** `POST /seafarer/api/v1/Onboarding/comprehensive`

**Problem:**  
Onboarding as a Training Institution fails with error:

```json
{
    "apiVersion": "v1",
    "success": false,
    "code": "400",
    "message": "Unsuccessful.",
    "requestId": null,
    "data": null,
    "error": {
        "message": "An error occurred during comprehensive onboarding. All changes have been rolled back.",
        "code": "ONBOARDING_FAILED"
    }
}
```

**Payload Submitted:**
```
SaveAsDraft: false
Notes: srrr
AccreditedInstitutionId: 3c6e8f1a-4d7b-5e9c-2a4f-7d9b1e3c5a8f
RoleSpecificIdentifier: AGENT-205-210
Department: IT Department
JobTitle: Crew Manager
ContactDetails.Phone: +2348113647778
ContactDetails.Email: ayomoses111+training@gmail.com
ContactDetails.Address: No.5 Lokosu Street, Off Aduloju Express
ContactDetails.EmergencyContactPerson: Ayo Moses
ContactDetails.Relationship: Spouse
ContactDetails.EmergencyContactNumber: +2348163647778
ContactDetails.EmergencyContactAddress: No.5 Lokosu Street, Off Aduloju Express
InstitutionDocuments[0].DocumentTypesId: 3232da32-aff5-4bea-8f8e-3d2297600ace
InstitutionDocuments[0].DocumentNumber: 1232rrr
InstitutionDocuments[0].IssueDate: 2026-01-22
InstitutionDocuments[0].IssuingAuthority: wear
InstitutionDocuments[0].File: (binary)
InstitutionDocuments[0].ExpiryDate: 2026-01-28
```

**Expected Behavior:**  
Should create the onboarding record successfully and return status PENDING.

**Possible Causes:**
- Missing required fields for Training Institution role
- Invalid AccreditedInstitutionId
- Document validation failing
- Database constraint violation

---

## Issue #10: Agent Onboarding Fails

**Endpoint:** `POST /seafarer/api/v1/Onboarding/comprehensive`

**Problem:**  
Same error as Issue #9 when onboarding as an Agent:

```json
{
    "apiVersion": "v1",
    "success": false,
    "code": "400",
    "message": "Unsuccessful.",
    "requestId": null,
    "data": null,
    "error": {
        "message": "An error occurred during comprehensive onboarding. All changes have been rolled back.",
        "code": "ONBOARDING_FAILED"
    }
}
```

**Expected Behavior:**  
Should create the Agent onboarding record successfully.

**Suggested Fix:**  
Please provide more detailed error messages in the response so we can identify which specific field or validation is failing.

---

## Priority Matrix

| Issue # | Description | Priority | Impact |
|---------|-------------|----------|--------|
| 5 | Onboarding complete flag not updating | 🔴 Critical | Blocks user flow |
| 7 | Payment initiation 400 error | 🔴 Critical | Blocks payments |
| 9 | Training Institution onboarding fails | 🔴 Critical | Blocks onboarding |
| 10 | Agent onboarding fails | 🔴 Critical | Blocks onboarding |
| 6 | Service checklist empty | 🟠 High | Affects applications |
| 8 | Missing payments list endpoint | 🟠 High | Missing feature |
| 1 | Members filtering | 🟡 Medium | Data accuracy |
| 2 | Role tenant-specific | 🟡 Medium | Data accuracy |
| 3 | Permissions in roles | 🟡 Medium | Missing feature |
| 4 | UserInfo roles array | 🟡 Medium | Data accuracy |

---

## Contact

For questions or clarifications, please contact the frontend team.

**Frontend Developer:** [Your Name]  
**Date:** January 2, 2026



