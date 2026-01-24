# Environment Variables Reference

This document lists all environment variables used throughout the application.

## Required Environment Variables

### API Configuration

#### `NEXT_PUBLIC_API_BASE_URL`
- **Description**: Main API base URL for all API endpoints (except OAuth/SSO endpoints)
- **Usage**: Used in `src/lib/api-client.ts` for all API calls
- **Example**: `https://staging-api.icadpay.com`
- **Fallback**: Falls back to `NEXT_PUBLIC_API_LOGIN_BASE_URL` if not set
- **Files Used In**:
  - `src/lib/api-client.ts` (primary)
  - `src/app/(dashboard)/profile-documents/page.tsx`
  - `src/app/(dashboard)/admin/applications/review/page.tsx`
  - `src/lib/services/payment-service.ts`

#### `NEXT_PUBLIC_SSO_BASE_URL`
- **Description**: SSO/OAuth base URL for authentication endpoints (`/connect/*`)
- **Usage**: Used for all OAuth token endpoints and SSO-related API calls
- **Example**: `https://staging-api.icadpay.com`
- **Fallback**: Falls back to `NEXT_PUBLIC_OAUTH_BASE_URL` if not set
- **Files Used In**:
  - `src/lib/api-client.ts` (primary - for `/connect/*` endpoints)

#### `NEXT_PUBLIC_OAUTH_BASE_URL`
- **Description**: Alternative/fallback OAuth base URL (legacy support)
- **Usage**: Used as fallback when `NEXT_PUBLIC_SSO_BASE_URL` is not set
- **Example**: `https://staging-api.icadpay.com`
- **Files Used In**:
  - `src/lib/api-client.ts` (fallback only)

#### `NEXT_PUBLIC_API_LOGIN_BASE_URL`
- **Description**: Legacy API login base URL (deprecated, kept for backward compatibility)
- **Usage**: Used as fallback when `NEXT_PUBLIC_API_BASE_URL` is not set
- **Note**: Considered deprecated, prefer `NEXT_PUBLIC_API_BASE_URL`
- **Files Used In**:
  - `src/lib/api-client.ts` (fallback only)

### OAuth/Authentication Configuration

#### `NEXT_PUBLIC_CLIENT_ID`
- **Description**: OAuth client ID for authentication
- **Usage**: Used for OAuth token requests
- **Example**: `mems-wastemanagement-api`
- **Files Used In**:
  - `src/lib/api-client.ts` (token refresh)
  - `src/app/(auth)/auth/signin/page.tsx` (sign in)

#### `NEXT_PUBLIC_CLIENT_SECRET`
- **Description**: OAuth client secret for authentication
- **Usage**: Used for OAuth token requests
- **Example**: `service-worker`
- **Files Used In**:
  - `src/lib/api-client.ts` (token refresh)
  - `src/app/(auth)/auth/signin/page.tsx` (sign in)

#### `NEXT_PUBLIC_GRANT_TYPE`
- **Description**: OAuth grant type
- **Usage**: Used for OAuth token requests
- **Default**: `"password"` (if not set)
- **Example**: `password`
- **Files Used In**:
  - `src/app/(auth)/auth/signin/page.tsx`

### External System Integration

#### `NEXT_PUBLIC_IMS_URL`
- **Description**: Integrated Management System (IMS) URL for navigation/redirects
- **Usage**: Used for redirecting users back to IMS from unauthorized screens
- **Example**: `https://ims.example.com`
- **Files Used In**:
  - `src/components/shared/unauthorized-screen.tsx`
  - `src/components/dashboard/sidebar.tsx`

## Built-in Environment Variables

### `NODE_ENV`
- **Description**: Node.js environment (automatically set by Next.js)
- **Values**: `"development"` | `"production"` | `"test"`
- **Usage**: Used for conditional logging and development-only features
- **Files Used In**:
  - `src/lib/api-client.ts` (development logging)

## Environment Variable Usage Summary

### By File

#### `src/lib/api-client.ts`
- `NEXT_PUBLIC_SSO_BASE_URL`
- `NEXT_PUBLIC_OAUTH_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_API_LOGIN_BASE_URL`
- `NEXT_PUBLIC_CLIENT_ID`
- `NEXT_PUBLIC_CLIENT_SECRET`
- `NODE_ENV`

#### `src/app/(auth)/auth/signin/page.tsx`
- `NEXT_PUBLIC_CLIENT_ID`
- `NEXT_PUBLIC_CLIENT_SECRET`
- `NEXT_PUBLIC_GRANT_TYPE`

#### `src/components/shared/unauthorized-screen.tsx`
- `NEXT_PUBLIC_IMS_URL`

#### `src/components/dashboard/sidebar.tsx`
- `NEXT_PUBLIC_IMS_URL`

#### `src/app/(dashboard)/profile-documents/page.tsx`
- `NEXT_PUBLIC_API_BASE_URL`

#### `src/app/(dashboard)/admin/applications/review/page.tsx`
- `NEXT_PUBLIC_API_BASE_URL`

#### `src/lib/services/payment-service.ts`
- `NEXT_PUBLIC_API_BASE_URL`

## Recommended .env.local Configuration

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://staging-api.icadpay.com
NEXT_PUBLIC_SSO_BASE_URL=https://staging-api.icadpay.com

# OAuth Configuration
NEXT_PUBLIC_CLIENT_ID=mems-wastemanagement-api
NEXT_PUBLIC_CLIENT_SECRET=service-worker
NEXT_PUBLIC_GRANT_TYPE=password

# External Systems
NEXT_PUBLIC_IMS_URL=https://ims.example.com
```

## Notes

1. **NEXT_PUBLIC_ Prefix**: All custom environment variables use the `NEXT_PUBLIC_` prefix, which makes them available to the browser/client-side code in Next.js.

2. **Fallback Behavior**: 
   - `NEXT_PUBLIC_API_BASE_URL` falls back to `NEXT_PUBLIC_API_LOGIN_BASE_URL`
   - `NEXT_PUBLIC_SSO_BASE_URL` falls back to `NEXT_PUBLIC_OAUTH_BASE_URL`

3. **Deprecated Variables**:
   - `NEXT_PUBLIC_API_LOGIN_BASE_URL` - Use `NEXT_PUBLIC_API_BASE_URL` instead
   - `NEXT_PUBLIC_OAUTH_BASE_URL` - Use `NEXT_PUBLIC_SSO_BASE_URL` instead

4. **Endpoint Routing**:
   - All `/connect/*` endpoints automatically use `NEXT_PUBLIC_SSO_BASE_URL`
   - All other endpoints use `NEXT_PUBLIC_API_BASE_URL`

5. **Development vs Production**: 
   - `NODE_ENV` is automatically set by Next.js
   - Development logging is controlled by `NODE_ENV === "development"`
