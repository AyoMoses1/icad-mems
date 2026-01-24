# Quick Test Guide - Seafarer App

## Fixing "OAuth credentials are not configured" Error

**To fix the error:**

1. **Create `.env.local` file** in the seafarer directory:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your credentials** to `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://staging-api.icadpay.com
   NEXT_PUBLIC_CLIENT_ID=mems-wastemanagement-api
   NEXT_PUBLIC_CLIENT_SECRET=service-worker
   NEXT_PUBLIC_GRANT_TYPE=password
   ```

3. **Stop your dev server** (Ctrl+C or Cmd+C)

4. **Restart it:**
   ```bash
   npm run dev
   ```

**Important:** Next.js only reads environment variables when the server starts. You must restart after creating/changing `.env.local`.

## Pages You Can Test (No Authentication Required)

These pages don't require login and can be tested immediately:

### Authentication Pages
- **Sign In**: `http://localhost:3000/auth/signin`
- **Sign Up**: `http://localhost:3000/auth/signup`
- **Forgot Password**: `http://localhost:3000/auth/forgot-password`
- **Reset Password**: `http://localhost:3000/auth/reset-password`
- **Verify Email**: `http://localhost:3000/auth/verify-email`

### Seafarer Pages (After Login)
Once you log in, you can test:
- **Seafarer Management**: `http://localhost:3000/seafarer`
- **Seafarer Applications**: `http://localhost:3000/seafarer/applications`
- **Review Applications**: `http://localhost:3000/seafarer/review-applications`
- **Add Seafarer**: `http://localhost:3000/seafarer/add`
- **Accredited MTIs**: `http://localhost:3000/seafarer/accredited-mtis`
- **Seafarer Profile**: `http://localhost:3000/seafarer/profile/[id]` (replace [id] with actual ID)

## Test Login Credentials

You'll need to get test user credentials from your backend team. The login requires:
- **Email/Username**: Your test user email
- **Password**: Your test user password

## Quick Test Checklist

1. ✅ Create `.env.local` with credentials
2. ✅ Restart dev server: `npm run dev`
3. ✅ Navigate to: `http://localhost:3000/auth/signin`
4. ✅ Enter test user credentials
5. ✅ Click "Sign In"
