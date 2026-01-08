# Staff Role Handling - Onboarding Bypass

## Overview

Staff and admin users (ADMIN, OWNER, ACCREDITATION_OFFICER, INSPECTOR, FINANCE) do NOT require onboarding. The onboarding page now properly detects these roles and redirects them to the dashboard.

---

## Changes Made

### Updated: `/src/app/(dashboard)/onboarding/page.tsx`

#### Added Staff Role Detection

```typescript
// Staff roles that don't require onboarding
const staffRoles = ["ADMIN", "OWNER", "ACCREDITATION_OFFICER", "INSPECTOR", "FINANCE"];
const hasStaffRole = roles.some((r) => staffRoles.includes(r));

if (hasStaffRole) {
  console.log("✓ User has staff/admin role - no onboarding required");
  console.log("Staff roles detected:", roles.filter((r) => staffRoles.includes(r)));
  // Redirect staff users to dashboard - they get access automatically
  router.push("/");
  return;
}
```

#### Added System Role Type

```typescript
type SystemRole =
  | "SEAFARER"
  | "TRAINING_INSTITUTION"
  | "AGENT"
  | "ADMIN"
  | "OWNER"
  | "ACCREDITATION_OFFICER"
  | "INSPECTOR"
  | "FINANCE";
```

---

## Role Handling Logic

### 1. Staff Roles (No Onboarding Required)
Users with any of these roles are automatically redirected to the dashboard:
- ✅ **ADMIN** - System administrators
- ✅ **OWNER** - System owners
- ✅ **ACCREDITATION_OFFICER** - Staff handling accreditations
- ✅ **INSPECTOR** - Inspection staff
- ✅ **FINANCE** - Finance department staff

**Behavior:** Immediate redirect to dashboard root (`/`)

### 2. Onboarding-Required Roles
Users with these roles are shown the appropriate onboarding form:
- 📋 **SEAFARER** → `SeafarerOnboardingForm`
- 📋 **TRAINING_INSTITUTION** → `TrainingInstitutionOnboardingForm`
- 📋 **AGENT** → `AgentOnboardingForm`

### 3. Unknown Roles
Users without any recognized role see an error message:
```
Your account role ([ROLES]) does not require onboarding. 
If you believe this is an error, please contact support.
```

---

## Example User Scenarios

### Scenario 1: Admin User (Your Case)
```json
{
  "name": "Admin Internal",
  "email": "ayomoses111+admin@gmail.com",
  "roles": ["ADMIN", "OWNER"]
}
```

**Expected Behavior:**
1. ✅ User visits `/onboarding`
2. ✅ System detects "ADMIN" role
3. ✅ Console logs: "User has staff/admin role - no onboarding required"
4. ✅ Redirects to `/` (dashboard)
5. ✅ User sees admin dashboard with management features

### Scenario 2: Seafarer User
```json
{
  "name": "John Seafarer",
  "email": "john@example.com",
  "roles": ["SEAFARER"]
}
```

**Expected Behavior:**
1. ✅ User visits `/onboarding`
2. ✅ System detects "SEAFARER" role
3. ✅ Shows `SeafarerOnboardingForm` (7-step form)
4. ✅ User completes onboarding
5. ✅ Redirected to dashboard after submission

### Scenario 3: Training Institution User
```json
{
  "name": "MAN Representative",
  "email": "training@man.edu.ng",
  "roles": ["TRAINING_INSTITUTION"]
}
```

**Expected Behavior:**
1. ✅ User visits `/onboarding`
2. ✅ System detects "TRAINING_INSTITUTION" role
3. ✅ Shows `TrainingInstitutionOnboardingForm` (4-step form)
4. ✅ User completes onboarding
5. ✅ Redirected to dashboard after submission

### Scenario 4: Inspector User
```json
{
  "name": "Inspector Smith",
  "email": "inspector@nimasa.gov.ng",
  "roles": ["INSPECTOR"]
}
```

**Expected Behavior:**
1. ✅ User visits `/onboarding`
2. ✅ System detects "INSPECTOR" role (staff role)
3. ✅ Redirects to `/` (dashboard)
4. ✅ User sees inspection-related features

---

## Console Logging

The system logs detailed information for debugging:

### Staff Role Detection:
```
✓ User has staff/admin role - no onboarding required
Staff roles detected: ["ADMIN", "OWNER"]
```

### Onboarding Role Detection:
```
Detected specific role: SEAFARER
✓ Routing to SEAFARER onboarding
```

### Unknown Role:
```
❌ No recognized onboarding role found. User roles: ["UNKNOWN_ROLE"]
```

---

## API Reference

### UserInfo Endpoint
**GET** `/connect/userinfo`

**Response Example (Admin):**
```json
{
  "sub": "ea1fa678-0edb-48c0-b940-0d29f2c876e5",
  "name": "Admin Internal",
  "email": "ayomoses111+admin@gmail.com",
  "roles": ["ADMIN", "OWNER"],
  "is_onboarding_complete": false
}
```

**Response Example (Seafarer):**
```json
{
  "sub": "12345678-1234-1234-1234-123456789012",
  "name": "John Seafarer",
  "email": "john@example.com",
  "roles": ["SEAFARER"],
  "is_onboarding_complete": false
}
```

---

## Testing Checklist

### Admin/Staff Users:
- [ ] Admin role redirects to dashboard
- [ ] Owner role redirects to dashboard
- [ ] Accreditation Officer redirects to dashboard
- [ ] Inspector redirects to dashboard
- [ ] Finance role redirects to dashboard
- [ ] Console logs show staff role detection
- [ ] No onboarding form is displayed

### Onboarding Users:
- [ ] Seafarer sees seafarer form
- [ ] Training Institution sees institution form
- [ ] Agent sees agent form
- [ ] Console logs show correct role detection

### Error Handling:
- [ ] Unknown roles show error message
- [ ] Error message includes role names
- [ ] Support contact information is shown

---

## Related Documentation

- **ONBOARDING_PAYLOADS_REFERENCE.md** - Line 19:
  > "Staff roles (ACCREDITATION_OFFICER, INSPECTOR, FINANCE, ADMIN) do NOT require onboarding. They get access automatically based on their IAM role assignment."

- **MASTER_DATA_INTEGRATION_SUMMARY.md** - Master data endpoints and form integration

- **COMPREHENSIVE_ONBOARDING_IMPLEMENTATION.md** - Original onboarding implementation

---

## Summary

✅ **Admin users (ADMIN, OWNER) are now properly redirected to the dashboard**
✅ **Staff users (ACCREDITATION_OFFICER, INSPECTOR, FINANCE) bypass onboarding**
✅ **Onboarding users (SEAFARER, TRAINING_INSTITUTION, AGENT) see appropriate forms**
✅ **Clear console logging for debugging**
✅ **Error handling for unknown roles**

The system now correctly handles all user types according to the API specification! 🎉



