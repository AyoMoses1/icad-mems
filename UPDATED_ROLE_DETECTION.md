# Updated Role Detection - December 31, 2025

## 🎯 New UserInfo Format (Backend Updated)

The backend now provides clean, standardized roles in the `roles` array:

### Example UserInfo Structures

#### 1. SEAFARER User
```json
{
  "sub": "778cfe0b-0150-41c4-8ae6-15c0ddb4ae92",
  "name": "Seaf User",
  "email": "ayomoses111+seaf@gmail.com",
  "roles": ["OWNER", "SEAFARER"],  // ← Clear role!
  "is_onboarding_complete": false
}
```

#### 2. TRAINING_INSTITUTION User
```json
{
  "sub": "38ca03ae-4fd1-47d8-bd82-f911e59b915c",
  "name": "Training Seafarer",
  "email": "ayomoses111+training@gmail.com",
  "roles": ["OWNER", "TRAINING_INSTITUTION"],  // ← Clear role!
  "is_onboarding_complete": false
}
```

#### 3. AGENT User
```json
{
  "sub": "4ae00f62-8e38-411f-85ce-1277deea40a9",
  "name": "Agent User",
  "email": "ayomoses111+agent@gmail.com",
  "roles": ["AGENT", "OWNER"],  // ← Clear role!
  "is_onboarding_complete": false
}
```

## 🔍 Updated Detection Logic

### How It Works

1. **Extract roles array** from userInfo
2. **Filter out common roles** like "OWNER"
3. **Find specific role** matching: `SEAFARER`, `TRAINING_INSTITUTION`, or `AGENT`
4. **Route to appropriate form** based on detected role

### Detection Priority

```javascript
// Priority 1: Exact match
roles.find(r => r === "SEAFARER" || r === "TRAINING_INSTITUTION" || r === "AGENT")

// Priority 2: Contains match (fallback)
roles.join(" ").includes("SEAFARER")
roles.join(" ").includes("TRAINING") || includes("INSTITUTION")
roles.join(" ").includes("AGENT")

// Priority 3: Default to SEAFARER
```

### Code Implementation

```typescript
const roles = userInfo.roles || [];

// Find the specific role (ignoring OWNER, etc.)
const specificRole = roles.find(
  r => r === "SEAFARER" || 
       r === "TRAINING_INSTITUTION" || 
       r === "AGENT"
);

// Map to onboarding form
if (specificRole === "SEAFARER") {
  setUserRole("SEAFARER");
} else if (specificRole === "TRAINING_INSTITUTION") {
  setUserRole("TRAINING_INSTITUTION");
} else if (specificRole === "AGENT") {
  setUserRole("AGENT");
}
```

## ✅ Test Cases

### Test Case 1: SEAFARER
**Input:**
```json
{ "roles": ["OWNER", "SEAFARER"] }
```
**Expected Output:** SEAFARER onboarding form (7 steps)
**Console Log:**
```
UserInfo received: {...}
Roles array: ["OWNER", "SEAFARER"]
Detected specific role: SEAFARER
✓ Routing to SEAFARER onboarding
```

### Test Case 2: TRAINING_INSTITUTION
**Input:**
```json
{ "roles": ["OWNER", "TRAINING_INSTITUTION"] }
```
**Expected Output:** Training Institution onboarding form (4 steps)
**Console Log:**
```
UserInfo received: {...}
Roles array: ["OWNER", "TRAINING_INSTITUTION"]
Detected specific role: TRAINING_INSTITUTION
✓ Routing to TRAINING_INSTITUTION onboarding
```

### Test Case 3: AGENT
**Input:**
```json
{ "roles": ["AGENT", "OWNER"] }
```
**Expected Output:** Agent onboarding form (4 steps)
**Console Log:**
```
UserInfo received: {...}
Roles array: ["AGENT", "OWNER"]
Detected specific role: AGENT
✓ Routing to AGENT onboarding
```

### Test Case 4: Multiple Roles (Edge Case)
**Input:**
```json
{ "roles": ["OWNER", "SEAFARER", "ADMIN"] }
```
**Expected Output:** SEAFARER onboarding form (first match)
**Note:** Currently takes first match. Backend should ensure only one role per tenant.

### Test Case 5: No Specific Role (Fallback)
**Input:**
```json
{ "roles": ["OWNER"] }
```
**Expected Output:** SEAFARER onboarding form (default)
**Console Log:**
```
⚠️ No specific role found, defaulting to SEAFARER
```

## 🚀 How to Test

### Step 1: Clear Cache
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
Or use incognito/private window
```

### Step 2: Navigate to Onboarding
```
http://localhost:3001/onboarding
```

### Step 3: Check Console
Open browser DevTools (F12) and look for:
```
UserInfo received: {...}
Roles array: [...]
Detected specific role: SEAFARER (or TRAINING_INSTITUTION or AGENT)
✓ Routing to [ROLE] onboarding
```

### Step 4: Verify Correct Form
- **SEAFARER** → 7-step form with education, trainings, voyages
- **TRAINING_INSTITUTION** → 4-step form with institution details
- **AGENT** → 4-step form with agent details

## 🔧 Debugging

### If Wrong Form Shows
1. Check browser console for role detection logs
2. Verify userInfo.roles contains correct role
3. Check for JavaScript errors
4. Clear cache and try again

### If No Form Shows
1. Check for errors in console
2. Verify `/connect/userinfo` API call succeeds
3. Check network tab for API response
4. Verify user is logged in (JWT token valid)

### Common Issues

**Issue:** "No specific role found, defaulting to SEAFARER"
- **Cause:** roles array doesn't contain SEAFARER, TRAINING_INSTITUTION, or AGENT
- **Solution:** Check backend - ensure correct role is assigned

**Issue:** Loading forever
- **Cause:** API call to /connect/userinfo failed
- **Solution:** Check network tab, verify API is running, check token validity

**Issue:** Wrong form displayed
- **Cause:** Multiple roles in array
- **Solution:** Backend should filter to single role per tenant

## 📊 Role Mapping Reference

| Backend Role | Frontend Detection | Form Displayed | Steps |
|--------------|-------------------|----------------|-------|
| `SEAFARER` | ✅ Exact match | SeafarerOnboardingForm | 7 |
| `TRAINING_INSTITUTION` | ✅ Exact match | TrainingInstitutionOnboardingForm | 4 |
| `AGENT` | ✅ Exact match | AgentOnboardingForm | 4 |
| `OWNER` only | ⚠️ Default fallback | SeafarerOnboardingForm | 7 |
| No roles | ⚠️ Default fallback | SeafarerOnboardingForm | 7 |

## 🎯 Next Steps for Backend

### Recommended Improvement
Instead of:
```json
{ "roles": ["OWNER", "SEAFARER"] }
```

Consider:
```json
{ 
  "role": "SEAFARER",  // Single primary role
  "permissions": ["OWNER"]  // Separate permissions
}
```

This would simplify detection to:
```typescript
const role = userInfo.role; // Just one role!
```

### Current Workaround
Frontend filters roles array to find specific role, ignoring common roles like OWNER.

## ✨ Summary

**Before:** Complex workspace-based detection with role strings like "This is someone with access to a seafarer application"

**After:** Simple array lookup for `SEAFARER`, `TRAINING_INSTITUTION`, or `AGENT`

**Benefits:**
- ✅ Clean, maintainable code
- ✅ Easy to debug (clear console logs)
- ✅ Handles all three user types
- ✅ Graceful fallback to SEAFARER
- ✅ No workspace complexity needed

**Status:** ✅ **Production Ready**

---

**Updated:** December 31, 2025  
**Tested With:** Real userInfo from all three user types  
**Console Logs:** Active for debugging



