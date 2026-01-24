# SSO Authentication Setup

## Overview

The seafarer frontend now uses the same SSO authentication system as IMS. All OAuth endpoints (`/connect/*`) use the SSO base URL (`https://staging-api.icadpay.com`), while all other API endpoints use the main API base URL.

## Environment Variables

Add these to your `.env.local` file:

```env
# SSO Base URL for OAuth endpoints (/connect/token, /connect/userinfo, /connect/logout)
NEXT_PUBLIC_SSO_BASE_URL=https://staging-api.icadpay.com

# Main API Base URL for all other endpoints
NEXT_PUBLIC_API_BASE_URL=https://your-main-api-url.com

# OAuth Credentials
NEXT_PUBLIC_CLIENT_ID=your_client_id
NEXT_PUBLIC_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GRANT_TYPE=password
```

## OAuth Endpoints

All OAuth endpoints automatically use the SSO base URL:

1. **Login/Token**: `POST /connect/token`
   - Used for initial login and token refresh
   - Automatically uses `NEXT_PUBLIC_SSO_BASE_URL`

2. **User Info**: `GET /connect/userinfo`
   - Gets current user information
   - Automatically uses `NEXT_PUBLIC_SSO_BASE_URL`

3. **Logout**: `POST /connect/logout`
   - Logs out the current session
   - Automatically uses `NEXT_PUBLIC_SSO_BASE_URL`

## Implementation Details

### Automatic Base URL Selection

The API client automatically determines which base URL to use:

- **OAuth endpoints** (`/connect/*`): Use `NEXT_PUBLIC_SSO_BASE_URL`
- **All other endpoints**: Use `NEXT_PUBLIC_API_BASE_URL`

### Token Refresh

The system automatically refreshes expired tokens:

- Tokens are checked for expiration before each API call
- If expired, the refresh token is used to get a new access token
- If refresh fails, user is automatically logged out and redirected to login

### Functions

- `apiPostForm()` - For OAuth token endpoints (uses SSO base URL)
- `apiGetAuth()` - For authenticated GET requests (uses SSO base URL for `/connect/*`)
- `apiPostAuth()` - For authenticated POST requests (uses SSO base URL for `/connect/*`)
- `refreshAccessToken()` - Exported function to manually refresh token
- `getValidToken()` - Exported function to get valid token (refreshes if needed)

## Usage Example

```typescript
import { apiPostForm, apiGetAuth, apiPostAuth } from "@/lib/api-client";

// Login (automatically uses SSO base URL)
const tokenResponse = await apiPostForm("/connect/token", {
  grant_type: "password",
  username: "user@example.com",
  password: "password",
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
  client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET!,
});

// Get user info (automatically uses SSO base URL)
const userInfo = await apiGetAuth("/connect/userinfo");

// Logout (automatically uses SSO base URL)
await apiPostAuth("/connect/logout", {});
```

## Migration from Old System

If you were using `NEXT_PUBLIC_API_LOGIN_BASE_URL`, you should:

1. Replace it with `NEXT_PUBLIC_SSO_BASE_URL` for OAuth endpoints
2. Keep `NEXT_PUBLIC_API_BASE_URL` for all other API endpoints
3. Restart your dev server after updating `.env.local`

## Troubleshooting

### 404 Errors on `/connect/token`

- Ensure `NEXT_PUBLIC_SSO_BASE_URL` is set correctly
- Verify the URL doesn't have a trailing slash
- Check that the endpoint path is exactly `/connect/token` (no prefix needed)

### Token Refresh Not Working

- Ensure `refreshToken` is stored in the auth store
- Check that `NEXT_PUBLIC_CLIENT_ID` and `NEXT_PUBLIC_CLIENT_SECRET` are set
- Verify `NEXT_PUBLIC_SSO_BASE_URL` is correct

### Mixed Base URLs

- OAuth endpoints will always use SSO base URL
- Other endpoints will use the main API base URL
- This is automatic - no manual configuration needed per endpoint





