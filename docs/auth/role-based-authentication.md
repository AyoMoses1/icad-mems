# Role-Based Authentication & Sidebar

## Overview

The seafarer frontend now uses role-based authentication where:
1. **IMS handles login** - Users log in through IMS (port 3000)
2. **Token passed via URL** - When clicking seafarer card, IMS redirects to seafarer app (port 3001) with token in URL
3. **User info fetched from IMS** - Seafarer app calls `/connect/userinfo` to get user details including role
4. **Role-based sidebar** - Sidebar items are shown based on user role (no toggle/switch)

## Roles

| Role | ID | Description |
|------|-----|-------------|
| `SEAFARER` | 1 | Seafarer users |
| `TRAINING_INSTITUTION` | 2 | Training institution users |
| `AGENT` | 3 | Agent users |
| `ACCREDITATION_OFFICER` | 4 | Accreditation officers |
| `INSPECTOR` | 5 | Inspectors |
| `FINANCE` | 6 | Finance users |
| `ADMIN` | 7 | Administrators (see everything) |

## Flow

### 1. Login in IMS
- User logs in at `http://localhost:3000`
- IMS handles authentication via `/connect/token`

### 2. Redirect to Seafarer App
- User clicks "Seafarer" card in IMS
- IMS redirects to: `http://localhost:3001?token={jwt_token}`

### 3. Token Handling
- Seafarer app receives token in URL query parameter
- Token is stored in auth store
- Token is removed from URL after processing

### 4. Fetch User Info
- App calls `GET /connect/userinfo` (uses SSO base URL)
- Extracts role from `userInfo.roles` or `userInfo.role`
- Stores role in `localStorage` as `userRole`

### 5. Role-Based Sidebar
- Sidebar reads role from `localStorage`
- Shows menu items based on role mapping
- No toggle/switch - sidebar is determined by role

## Sidebar Menu Mapping

### SEAFAER (1)
- Dashboard
- Training
- Profile & Documents
- My Applications
- Apply for Certificate

### TRAINING_INSTITUTION (2) / AGENT (3)
- Dashboard
- Institution Management
  - My Institution
  - Cohorts
- Training Institute
  - Courses
- Medical Institute
  - My Medical Institute
- Accreditation
  - Apply for Accreditation
  - My Accreditations

### ACCREDITATION_OFFICER (4)
- Dashboard
- Accreditations
  - Review Accreditations
  - All Accreditations
- Institutions

### INSPECTOR (5)
- Dashboard
- Inspections
  - Schedule Inspection
  - Inspection Reports
  - Deficiency Reports
- Institutions

### FINANCE (6)
- Dashboard
- Financial
  - Invoice Management
  - Payments
- Applications
  - All Applications

### ADMIN (7)
- Dashboard
- Seafarer Management
  - Add Seafarer
  - Seafarer Registry
- Institutions
  - All Institutions
- Applications Review
  - Pending Applications
  - All Applications
- Accreditations
  - Accreditations Dashboard
  - Review Accreditations
- Financial
  - Invoice Management
  - Payments
- System Management
  - Certificates
  - Documents
  - Ranks
  - Onboarding Requirements

## Implementation Details

### Layout Component (`src/app/(dashboard)/layout.tsx`)
- Checks for token in URL query parameter
- Fetches user info from IMS `/connect/userinfo` endpoint
- Extracts role and stores in localStorage
- Sets up session with user data

### Sidebar Component (`src/components/dashboard/sidebar.tsx`)
- Reads role from localStorage
- Maps role to menu items using `getMenuItemsByRole()`
- No user type toggle - role determines menu

### Header Component (`src/components/dashboard/header.tsx`)
- Removed user type switcher
- Shows role badge instead
- Displays current role label

## Environment Variables

```env
# SSO Base URL for OAuth endpoints
NEXT_PUBLIC_SSO_BASE_URL=https://staging-api.icadpay.com

# Main API Base URL for seafarer endpoints
NEXT_PUBLIC_API_BASE_URL=https://your-seafarer-api-url.com
```

## Port Configuration

- **IMS**: `http://localhost:3000`
- **Seafarer Frontend**: `http://localhost:3001`

## Token Flow

```
IMS (3000) → User clicks Seafarer card
  ↓
Redirect: http://localhost:3001?token={jwt_token}
  ↓
Seafarer App (3001) → Extract token from URL
  ↓
Call: GET https://staging-api.icadpay.com/connect/userinfo
  ↓
Extract role from response
  ↓
Store role in localStorage
  ↓
Show role-based sidebar
```

## Notes

- Role is stored in `localStorage` as `userRole`
- Sidebar automatically updates when role changes
- No manual switching - role is determined by IMS
- Admin role sees all menu items
- Other roles see only their relevant items





