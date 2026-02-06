# Veriff Identity Verification Integration

This document describes the Veriff Station identity verification flow integrated into the comprehensive onboarding process for seafarers, training institutions, and agents.

## Overview

Users must verify their identity (passport or national ID) before completing onboarding. The flow uses [Veriff Station](https://station.veriff.com/) via the Veriff JS SDK + InContext SDK (script from Veriff dashboard) for session creation and popup-based verification.

## User Flow

1. **Onboarding start** → User lands on onboarding (Seafarer, Training Institution, or Agent)
2. **Identity step** → First step is "Identity Verification" with a "Start identity verification" button
3. **Veriff popup** → Clicking the button opens the Veriff verification modal (passport/ID capture + selfie)
4. **Redirect** → After completing or canceling, user is redirected to `/onboarding/verification/status`
5. **Status page** → Shows APPROVED (proceed), DECLINED (try again), or PENDING (check back later)
6. **Proceed** → If approved, user clicks "Proceed with Onboarding" and returns to complete the form

## Configuration

Add to `.env.local` (from Veriff dashboard):

```
NEXT_PUBLIC_VERIFF_API_KEY=your-api-key-from-dashboard
NEXT_PUBLIC_VERIFF_HOST=https://stationapi.veriff.com
```

## Frontend Integration

The identity step uses the Veriff scripts from the dashboard:

- `https://cdn.veriff.me/sdk/js/1.5/veriff.min.js` – Creates session with form
- `https://cdn.veriff.me/incontext/js/v1/veriff.js` – Opens verification popup

The component pre-fills `vendorData` (userId) and `person` (firstName, lastName) so users see a single "Start identity verification" button. No backend session-creation endpoint is required.

## Backend Endpoints Required

### 1. GET /api/verification/status

**Purpose:** Fetch the verification status for a user.

**Request:**

```
GET /api/verification/status?userId={userId}
Authorization: Bearer {token}
```

**Response (success):**

```json
{
  "status": "APPROVED",
  "message": "Your identity has been verified.",
  "verificationId": "optional-uuid",
  "completedAt": "2025-02-06T12:00:00Z"
}
```

**Status values:** `PENDING` | `APPROVED` | `DECLINED` | `NOT_STARTED` | `IN_PROGRESS`

**Note:** The frontend accepts both `{ status, message }` and `{ success: true, data: { status, message } }` formats.

**Backend implementation notes:**

- The frontend creates Veriff sessions directly using the Veriff JS SDK with `vendorData: userId`
- Configure Veriff webhooks to receive verification decisions and update your database
- Map webhook `vendorData` to your userId to store verification status

## API Base URL

- **Status endpoint:** Verification API uses `NEXT_PUBLIC_SSO_BASE_URL` (e.g. `https://mems-api.icadpays.com`)
- **Veriff docs:** [devdocs.veriff.com](https://devdocs.veriff.com/)
- **InContext SDK:** [@veriff/incontext-sdk](https://www.npmjs.com/package/@veriff/incontext-sdk)

## Frontend Components

- `IdentityVerificationStep` – Reusable step component with verify button and status check
- `SeafarerOnboardingForm`, `TrainingInstitutionOnboardingForm`, `AgentOnboardingForm` – All include identity as first step
- `/onboarding/verification/status` – Status result page

## Routes

| Route                                        | Purpose                                           |
| -------------------------------------------- | ------------------------------------------------- |
| `/onboarding`                                | Main onboarding (redirects to role-specific form) |
| `/onboarding/verification/status?userId=...` | Verification result page                          |
