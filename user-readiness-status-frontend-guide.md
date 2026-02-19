# Frontend guide: User Readiness Status endpoint

This guide explains how to call and use the **User Readiness Status** API from the frontend. Use it to determine whether the current user has completed their required step (onboarding for seafarers, or permit submission for training institutions / seafarer employers) and to show the right UI (e.g. dashboard vs onboarding/permit prompts).

---

## 1. Overview

- **Purpose:** One endpoint tells you if the current user is “ready” and how:
  - **Seafarers** complete **onboarding** → response includes `source: "onboarding"`, `role: "Seafarer"`, onboarding status, and whether they have fully onboarded.
  - **Training institutions / Seafarer employers** submit a **permit** (no onboarding) → response includes `source: "permit"`, `role: "training_institute"` or `"seafarer_employer"`, and whether the permit has been submitted and if it is expired.
- **Logic:** The API checks the database for an onboarding record first, then for a permit record. It returns the **first one found**. It does **not** use IAM role to decide; it only reads from the DB.
- **When nothing exists:** The API returns **400** with an error body telling the user to complete onboarding as a seafarer or submit their permit as a training institution or seafarer employer.

---

## 2. Endpoint

| Item | Value |
|------|--------|
| **Method** | `GET` |
| **Path** | `/seafarer/api/v1/UserReadiness/status` |
| **Full URL** | `{API_BASE}/seafarer/api/v1/UserReadiness/status` |
| **Auth** | Required. Send the same Bearer token used for other seafarer endpoints. |
| **Request body** | None |

---

## 3. Response shape

All responses use the standard `ApiResponse<T>` wrapper.

### 3.1 Success (HTTP 200)

- **When:** User has at least one onboarding record **or** one permit record (onboarding is checked first).
- **Body:** `ApiResponse<UserReadinessStatusDto>`

```json
{
  "success": true,
  "code": "SFSE0000",
  "message": "Successful.",
  "data": {
    "source": "onboarding",
    "role": "Seafarer",
    "hasOnboarded": true,
    "onboardingStatus": 2,
    "userSeafarerOnboardingId": "guid",
    "hasSubmittedPermit": null,
    "isPermitExpired": null,
    "permitValidTo": null,
    "permitValidFrom": null,
    "companyPermitId": null
  }
}
```

**Or when the user has a permit (no onboarding):**

```json
{
  "success": true,
  "code": "SFSE0000",
  "message": "Successful.",
  "data": {
    "source": "permit",
    "role": "training_institute",
    "hasSubmittedPermit": true,
    "isPermitExpired": false,
    "permitValidTo": "2026-12-31T23:59:59Z",
    "permitValidFrom": "2025-01-01T00:00:00Z",
    "companyPermitId": "guid",
    "hasOnboarded": null,
    "onboardingStatus": null,
    "userSeafarerOnboardingId": null
  }
}
```

### 3.2 Error – no onboarding and no permit (HTTP 400)

- **When:** User has neither an onboarding record nor a permit record.
- **Body:** Same `ApiResponse` shape with `success: false` and `error` set.

```json
{
  "success": false,
  "code": "UNSUCCESSFUL",
  "message": "Unsuccessful.",
  "data": null,
  "error": {
    "code": "READINESS_NOT_FOUND",
    "message": "No onboarding or permit record found. Please complete onboarding as a seafarer or submit your permit as a training institution or seafarer employer."
  }
}
```

Use `error.code` and `error.message` to show a clear prompt (e.g. “Complete onboarding” or “Submit your permit”).

### 3.3 Other errors (e.g. 400 Unauthorized / invalid user)

- **UNAUTHORIZED:** User is not authenticated.
- **INVALID_USER_ID:** User ID could not be read from the token.

Handle these like other authenticated API errors (e.g. redirect to login).

---

## 4. Data contract (TypeScript)

Use these types to type your client and UI logic.

```typescript
// Onboarding status enum (matches backend)
export enum OnboardingStatus {
  DRAFT = 0,
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
  SUSPENDED = 4,
}

export interface UserReadinessStatusDto {
  source: 'onboarding' | 'permit';
  role: string | null; // "Seafarer" | "training_institute" | "seafarer_employer" | "training_institute_or_seafarer_employer"
  // Onboarding (populated when source === 'onboarding')
  hasOnboarded?: boolean | null;
  onboardingStatus?: OnboardingStatus | null;
  userSeafarerOnboardingId?: string | null;
  // Permit (populated when source === 'permit')
  hasSubmittedPermit?: boolean | null;
  isPermitExpired?: boolean | null;
  permitValidTo?: string | null;   // ISO date
  permitValidFrom?: string | null; // ISO date
  companyPermitId?: string | null;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  message?: string;
  code?: string;
  error?: ApiError;
}
```

---

## 5. When to call and how to use the response

### 5.1 When to call

- **After login / on app load** (e.g. layout or dashboard): Call once to decide whether to show the main app, an onboarding flow, or a “submit permit” flow.
- **After completing onboarding or submitting a permit:** Call again to refresh status and switch the user into the “ready” experience.

### 5.2 Branching on `source` and `role`

| `data.source` | `data.role` | Meaning | Suggested UI |
|---------------|-------------|---------|--------------|
| `"onboarding"` | `"Seafarer"` | User is in the seafarer onboarding flow | Use `hasOnboarded` and `onboardingStatus` to show progress, “Submit onboarding”, or “Pending approval”, or full dashboard if `hasOnboarded === true`. |
| `"permit"` | `"training_institute"` or `"seafarer_employer"` | User has submitted a permit | Use `hasSubmittedPermit` (will be true) and `isPermitExpired`. If expired, show “Renew permit” or similar; otherwise show normal app. |
| `"permit"` | `"training_institute_or_seafarer_employer"` | Permit user but role not distinguished from IAM | Same as above; treat as permit-based user. |

### 5.3 Seafarer: using onboarding status

- **DRAFT (0):** Show “Continue onboarding” / “Submit onboarding”.
- **PENDING (1):** Show “Onboarding pending approval”.
- **APPROVED (2):** If `hasOnboarded === true` → user is fully ready; show dashboard. If `hasOnboarded === false` → approved but not yet marked complete (e.g. complete any remaining steps if your product has them).
- **REJECTED (3):** Show “Onboarding rejected” and any next steps (e.g. re-apply).
- **SUSPENDED (4):** Show “Access suspended” and support contact.

### 5.4 Permit: using expiry

- **`isPermitExpired === true`:** Show a banner or block and prompt to renew/submit a new permit.
- **`isPermitExpired === false`:** User is ready; optional: show `permitValidTo` as “Valid until …”.

---

## 6. Example: fetch and branch (React / TypeScript)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const getAuthToken = () => /* your auth token */;

export async function getUserReadinessStatus(): Promise<ApiResponse<UserReadinessStatusDto>> {
  const res = await fetch(`${API_BASE}/seafarer/api/v1/UserReadiness/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  const json = await res.json();

  if (!res.ok) {
    return {
      success: false,
      data: null,
      error: json.error ?? { code: 'UNKNOWN', message: json.message || 'Request failed' },
    };
  }
  return json;
}

// Usage in a hook or component
function useReadiness() {
  const [status, setStatus] = useState<UserReadinessStatusDto | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserReadinessStatus()
      .then((res) => {
        if (res.success && res.data) {
          setStatus(res.data);
          setError(null);
        } else {
          setStatus(null);
          setError(res.error ?? { code: 'UNKNOWN', message: 'No data' });
        }
      })
      .catch((e) => setError({ code: 'NETWORK', message: e.message }))
      .finally(() => setLoading(false));
  }, []);

  return { status, error, loading };
}

// Example: route or render based on status
// if (error?.code === 'READINESS_NOT_FOUND') → show "Onboard as seafarer or submit permit"
// if (status?.source === 'onboarding') → show onboarding flow / status
// if (status?.source === 'permit') → show permit expiry warning if isPermitExpired, else app
```

---

## 7. Summary

| Scenario | HTTP | Response | Frontend action |
|----------|------|----------|-----------------|
| User has onboarding record | 200 | `source: "onboarding"`, `role: "Seafarer"`, `hasOnboarded`, `onboardingStatus` | Show seafarer onboarding progress or dashboard based on status. |
| User has permit, no onboarding | 200 | `source: "permit"`, `role: "training_institute" \| "seafarer_employer"`, `hasSubmittedPermit`, `isPermitExpired` | Show app; if `isPermitExpired`, show renew/submit permit prompt. |
| User has neither | 400 | `error.code: "READINESS_NOT_FOUND"` | Show message: complete onboarding as seafarer or submit permit as training_institute/seafarer_employer. |

Use the **User Readiness Status** endpoint as the single source of truth to decide whether the user should see onboarding, permit submission, or the main application, and to display the correct status and expiry information.
