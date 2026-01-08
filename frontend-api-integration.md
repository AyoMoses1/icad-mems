# Frontend Integration Guide (API Routes & Flows)

Base URL: `{{baseUrl}}` (e.g., `http://localhost:5000`). All responses use `{ success, message?, data }`.

## File Handling
- Uploads return `fileUrl` (e.g., `/uploads/...`). The host must serve `FileStorage.RootPath` at `FileStorage.BaseUrl`. There is no dedicated download controller; GET the returned `fileUrl` directly once static files are exposed.
- Upload rules: multipart/form-data, max 20MB, allowed `.pdf .jpg .jpeg .png`.

## Seafarer Certificate Application
- `POST /api/applications/check-eligibility`
- `POST /api/applications/draft` → save `applicationId`
- `POST /api/applications/{id}/attach`
- `POST /api/applications/{id}/generate-invoice` → `invoiceId`
- `GET /api/applications/{id}/invoice`
- Payment callback/sim: `POST /api/payments/webhook` (prod) or `/api/payments/simulate`

Supporting onboarding:
- `GET /api/onboarding/seafarer/requirements`
- `POST /api/onboarding/seafarer/profile` (or `POST /api/seafarers`)
- Contacts: `POST /api/onboarding/seafarer/{seafarerId}/contacts`
- Held documents: `POST /api/onboarding/seafarer/{seafarerId}/documents` (multipart) and `GET .../documents`
- Certificate catalogue: `GET /api/certificates` or `GET /api/documents`

## Institution Onboarding + Accreditation
Onboarding:
- Institutions CRUD: `POST /api/institutions`, `GET/PUT/DELETE /api/institutions/{id}`
- Contacts: `GET/POST /api/institutions/{institutionId}/contacts`, `PUT/DELETE /api/institutions/{institutionId}/contacts/{contactId}`
- Staff: `GET /api/institutionstaffs?institutionId=...`, `POST /api/institutionstaffs`, `PUT/DELETE /api/institutionstaffs/{id}`
- Training institute: `POST /api/traininginstitutes`, `GET/PUT/DELETE /api/traininginstitutes/{institutionId}`
- Medical institute: `POST /api/medicalinstitutes`, `GET/PUT/DELETE /api/medicalinstitutes/{institutionId}`

Accreditation flow:
- Requirements: `GET /api/accreditations/requirements`
- Status/gap check: `GET /api/accreditations/check-status`
- Apply: `POST /api/accreditations/apply` → `accreditationId`
- Upload evidence: `POST /api/accreditations/{id}/upload` (multipart)
- Finalize: `PATCH /api/accreditations/{id}/finalize`
- Invoice: `POST /api/accreditations/{id}/invoice`, `GET /api/accreditations/{id}/invoice`
- Verify payment: `POST /api/accreditations/{id}/verify-payment`
- Get detail: `GET /api/accreditations/{id}`

## Staff (Admin) Flows
- Certificate applications: `GET /api/admin/applications/pending`, `PATCH /api/admin/applications/{id}/approve`
- Accreditations: `GET /api/admin/accreditations/under-review`, `PATCH /api/admin/accreditations/audit`, `PATCH /api/admin/accreditations/{id}/activate`

## Typical UI Sequences
- Seafarer: Requirements → Eligibility → Draft → Attach → Invoice → Pay → Await approval.
- Institution: Create institution → Contacts/Staff → (Optional) Training/Medical institute → Accreditation apply → Evidence uploads → Finalize → Invoice → Payment.
- Staff: Review queues → open item → approve/audit/activate → refresh list.

## Postman Tips
- Use environment vars: `{{baseUrl}}`, `{{seafarerId}}`, `{{applicationId}}`, `{{invoiceId}}`, `{{institutionId}}`, `{{accreditationId}}`, `{{authToken}}`.
- Multipart: form-data, let Postman set boundary; keep files ≤20MB.
- Payment: use `/api/payments/simulate` in non-prod; gateway should call `/api/payments/webhook` in prod.

