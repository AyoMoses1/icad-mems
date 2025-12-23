# NIMASA Seafarer Portal Frontend Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Base Configuration](#api-base-configuration)
4. [Payment Integration](#payment-integration)
5. [Invoice Management](#invoice-management)
6. [API Integration Patterns](#api-integration-patterns)
7. [Error Handling](#error-handling)
8. [Security Best Practices](#security-best-practices)
9. [API Endpoints Reference](#api-endpoints-reference)

---

## Overview

This guide provides comprehensive instructions for integrating the NIMASA Seafarer Portal API into your frontend application. The API provides endpoints for payment processing, invoice management, and various seafarer portal services.

### API Information

- **Base URL**: `https://pay-service.icadpays.com`
- **API Version**: `1.0`
- **Documentation**: `https://pay-service.icadpays.com/swagger/index.html`
- **Support**: `support@nimasa.gov.ng`

### Key Features

- Payment processing and verification
- Invoice generation and management
- Document management
- Organization and accreditation management
- Service applications
- And more...

---

## Authentication

### Token Requirements

All API endpoints require JWT Bearer token authentication. Tokens are obtained from the **IAM authentication server** at `/connect/token` endpoint.

**Important Notes:**

- The token must be issued by the IAM service
- Token must include the `api` audience
- Tokens should be included in the `Authorization` header

### Token Format

```javascript
Authorization: Bearer {your-access-token}
```

**Note:** For detailed authentication flow, token management, and refresh logic, refer to the IAM Frontend Integration Guide (similar to `ims/FRONTEND_INTEGRATION_GUIDE.md`), as authentication is handled by the IAM service, not this payment service.

### Token Storage

```javascript
// Store token securely (use sessionStorage for better security)
sessionStorage.setItem("access_token", token);

// Retrieve token
const token = sessionStorage.getItem("access_token");
```

---

## API Base Configuration

### Base API Setup

```javascript
const API_BASE_URL = "https://pay-service.icadpays.com";

// Get valid token (implement token refresh logic as needed)
async function getValidToken() {
  const token = sessionStorage.getItem("access_token");
  const expiresAt = sessionStorage.getItem("token_expires_at");

  // Check if token is expired and refresh if needed
  if (expiresAt && Date.now() >= parseInt(expiresAt)) {
    // Implement token refresh logic
    return await refreshToken();
  }

  return token;
}

// Base API request function
async function apiRequest(endpoint, options = {}) {
  const token = await getValidToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Handle token expiration
  if (response.status === 401) {
    // Try to refresh token
    const newToken = await refreshToken();
    if (newToken) {
      // Retry request with new token
      return apiRequest(endpoint, options);
    }
    // Refresh failed - redirect to login
    window.location.href = "/login";
    return;
  }

  return response;
}

// Handle API response
async function handleApiResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const data = await response.json();
  return data;
}
```

### API Versioning

The API supports versioning via:

- URL path: `/api/v1/...` (recommended)
- Query string: `?version=1.0`
- Header: `X-Version: 1.0`

**Example:**

```javascript
// Using URL path versioning (recommended)
const response = await apiRequest("/api/v1/Payments");
```

---

## Payment Integration

### Get Payments List

**Endpoint:** `GET /api/v1/Payments`

**Query Parameters:**

- `pageNumber` (integer, default: 1) - Page number
- `pageSize` (integer, default: 20, max: 100) - Items per page
- `userId` (integer, optional) - Filter by user ID
- `invoiceId` (integer, optional) - Filter by invoice ID
- `status` (string, optional) - Filter by payment status
- `searchTerm` (string, optional) - Search term

**Frontend Implementation:**

```javascript
async function getPayments(filters = {}) {
  const {
    pageNumber = 1,
    pageSize = 20,
    userId,
    invoiceId,
    status,
    searchTerm,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (userId) params.append("userId", userId.toString());
  if (invoiceId) params.append("invoiceId", invoiceId.toString());
  if (status) params.append("status", status);
  if (searchTerm) params.append("searchTerm", searchTerm);

  const response = await apiRequest(`/api/v1/Payments?${params.toString()}`);
  return await handleApiResponse(response);
}

// Example usage
const payments = await getPayments({
  pageNumber: 1,
  pageSize: 20,
  status: "Completed",
});
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "paymentReference": "PAY-2024-001",
        "amount": 5000.0,
        "currency": "NGN",
        "status": "Completed",
        "paymentMethod": "Card",
        "invoiceId": 123,
        "userId": 456,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "totalCount": 100,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### Get Payment by ID

**Endpoint:** `GET /api/v1/Payments/{paymentId}`

**Frontend Implementation:**

```javascript
async function getPaymentById(paymentId) {
  const response = await apiRequest(`/api/v1/Payments/${paymentId}`);
  return await handleApiResponse(response);
}

// Example usage
const payment = await getPaymentById(123);
```

### Initiate Payment for Invoice

**Endpoint:** `POST /api/v1/Payments/invoices/{invoiceId}/pay`

**Request Body:**

```typescript
{
  paymentMethod: string; // e.g., "Card", "Bank Transfer", "Cash"
  // Additional payment method-specific fields may be required
}
```

**Frontend Implementation:**

```javascript
async function initiatePayment(invoiceId, paymentData) {
  const response = await apiRequest(
    `/api/v1/Payments/invoices/${invoiceId}/pay`,
    {
      method: "POST",
      body: JSON.stringify(paymentData),
    }
  );
  return await handleApiResponse(response);
}

// Example usage
const payment = await initiatePayment(123, {
  paymentMethod: "Card",
});

// The response will contain payment details including paymentReference
console.log("Payment Reference:", payment.data.paymentReference);
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "id": 789,
    "paymentReference": "PAY-2024-789",
    "amount": 5000.0,
    "currency": "NGN",
    "status": "Pending",
    "paymentMethod": "Card",
    "invoiceId": 123,
    "userId": 456,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Verify Payment Status

**Endpoint:** `GET /api/v1/Payments/verify/{paymentReference}`

**Frontend Implementation:**

```javascript
async function verifyPayment(paymentReference) {
  const response = await apiRequest(
    `/api/v1/Payments/verify/${paymentReference}`
  );
  return await handleApiResponse(response);
}

// Example usage
const paymentStatus = await verifyPayment("PAY-2024-789");
console.log("Payment Status:", paymentStatus.data.status);
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "id": 789,
    "paymentReference": "PAY-2024-789",
    "amount": 5000.0,
    "currency": "NGN",
    "status": "Completed",
    "paymentMethod": "Card",
    "invoiceId": 123,
    "userId": 456,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

### Record Manual Payment (Officer/Admin Only)

**Endpoint:** `POST /api/v1/Payments`

**Request Body:**

```typescript
{
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  // Additional fields as required
}
```

**Frontend Implementation:**

```javascript
async function recordManualPayment(paymentData) {
  const response = await apiRequest("/api/v1/Payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
  return await handleApiResponse(response);
}

// Example usage (Officer/Admin only)
const payment = await recordManualPayment({
  invoiceId: 123,
  amount: 5000.0,
  paymentMethod: "Cash",
  paymentReference: "CASH-2024-001",
  notes: "Payment received at counter",
});
```

---

## Invoice Management

### Get Invoices List

**Endpoint:** `GET /api/v1/Invoices`

**Query Parameters:**

- `pageNumber` (integer, default: 1) - Page number
- `pageSize` (integer, default: 20, max: 100) - Items per page
- `userId` (integer, optional) - Filter by user ID
- `applicationId` (integer, optional) - Filter by application ID
- `statusId` (integer, optional) - Filter by invoice status
- `searchTerm` (string, optional) - Search term

**Frontend Implementation:**

```javascript
async function getInvoices(filters = {}) {
  const {
    pageNumber = 1,
    pageSize = 20,
    userId,
    applicationId,
    statusId,
    searchTerm,
  } = filters;

  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (userId) params.append("userId", userId.toString());
  if (applicationId) params.append("applicationId", applicationId.toString());
  if (statusId) params.append("statusId", statusId.toString());
  if (searchTerm) params.append("searchTerm", searchTerm);

  const response = await apiRequest(`/api/v1/Invoices?${params.toString()}`);
  return await handleApiResponse(response);
}

// Example usage
const invoices = await getInvoices({
  pageNumber: 1,
  pageSize: 20,
  statusId: 1, // e.g., Pending status
});
```

### Get Invoice by ID

**Endpoint:** `GET /api/v1/Invoices/{invoiceId}`

**Frontend Implementation:**

```javascript
async function getInvoiceById(invoiceId) {
  const response = await apiRequest(`/api/v1/Invoices/${invoiceId}`);
  return await handleApiResponse(response);
}

// Example usage
const invoice = await getInvoiceById(123);
```

### Get Invoice for Application

**Endpoint:** `GET /api/v1/Invoices/applications/{appId}/invoice`

**Frontend Implementation:**

```javascript
async function getInvoiceForApplication(applicationId) {
  const response = await apiRequest(
    `/api/v1/Invoices/applications/${applicationId}/invoice`
  );
  return await handleApiResponse(response);
}

// Example usage
const invoice = await getInvoiceForApplication(456);
```

### Create Invoice (Officer/Admin Only)

**Endpoint:** `POST /api/v1/Invoices`

**Request Body:**

```typescript
{
  applicationId: number;
  amount: number;
  currency?: string;  // Default: "NGN"
  description?: string;
  dueDate?: string;  // ISO 8601 date string
  // Additional fields as required
}
```

**Frontend Implementation:**

```javascript
async function createInvoice(invoiceData) {
  const response = await apiRequest("/api/v1/Invoices", {
    method: "POST",
    body: JSON.stringify(invoiceData),
  });
  return await handleApiResponse(response);
}

// Example usage (Officer/Admin only)
const invoice = await createInvoice({
  applicationId: 456,
  amount: 5000.0,
  currency: "NGN",
  description: "Application processing fee",
  dueDate: "2024-02-15T00:00:00Z",
});
```

### Update Invoice (Officer/Admin Only)

**Endpoint:** `PATCH /api/v1/Invoices/{invoiceId}`

**Frontend Implementation:**

```javascript
async function updateInvoice(invoiceId, updates) {
  const response = await apiRequest(`/api/v1/Invoices/${invoiceId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return await handleApiResponse(response);
}

// Example usage (Officer/Admin only)
const updatedInvoice = await updateInvoice(123, {
  amount: 6000.0,
  description: "Updated invoice description",
});
```

### Delete Invoice (Officer/Admin Only)

**Endpoint:** `DELETE /api/v1/Invoices/{invoiceId}`

**Frontend Implementation:**

```javascript
async function deleteInvoice(invoiceId) {
  const response = await apiRequest(`/api/v1/Invoices/${invoiceId}`, {
    method: "DELETE",
  });
  return await handleApiResponse(response);
}

// Example usage (Officer/Admin only)
await deleteInvoice(123);
```

---

## API Integration Patterns

### Complete Payment Flow Example

```javascript
// Step 1: Get invoice for application
async function completePaymentFlow(applicationId, paymentMethod) {
  try {
    // Get the invoice
    const invoiceResponse = await getInvoiceForApplication(applicationId);
    const invoice = invoiceResponse.data;

    if (!invoice) {
      throw new Error("No invoice found for this application");
    }

    // Step 2: Initiate payment
    const paymentResponse = await initiatePayment(invoice.id, {
      paymentMethod: paymentMethod,
    });
    const payment = paymentResponse.data;
    const paymentReference = payment.paymentReference;

    // Step 3: Poll for payment status (or handle via webhook/callback)
    const checkPaymentStatus = async () => {
      const statusResponse = await verifyPayment(paymentReference);
      return statusResponse.data.status;
    };

    // Poll every 3 seconds until payment is completed or failed
    const pollInterval = setInterval(async () => {
      const status = await checkPaymentStatus();

      if (status === "Completed") {
        clearInterval(pollInterval);
        console.log("Payment completed successfully!");
        // Redirect to success page or update UI
      } else if (status === "Failed" || status === "Cancelled") {
        clearInterval(pollInterval);
        console.log("Payment failed or was cancelled");
        // Show error message to user
      }
      // If still pending, continue polling
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(
      () => {
        clearInterval(pollInterval);
      },
      5 * 60 * 1000
    );

    return payment;
  } catch (error) {
    console.error("Payment flow error:", error);
    throw error;
  }
}

// Example usage
completePaymentFlow(456, "Card")
  .then((payment) => {
    console.log("Payment initiated:", payment);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### React Hook Example

```javascript
import { useState, useEffect } from "react";

function usePayments(filters = {}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  });

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        setError(null);
        const response = await getPayments({
          ...filters,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
        });

        setPayments(response.data.items);
        setPagination({
          ...pagination,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [filters, pagination.pageNumber, pagination.pageSize]);

  const goToPage = (pageNumber) => {
    setPagination({ ...pagination, pageNumber });
  };

  return {
    payments,
    loading,
    error,
    pagination,
    goToPage,
  };
}

// Usage in component
function PaymentsList() {
  const { payments, loading, error, pagination, goToPage } = usePayments({
    status: "Completed",
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Payments</h2>
      {payments.map((payment) => (
        <div key={payment.id}>
          <p>Reference: {payment.paymentReference}</p>
          <p>
            Amount: {payment.amount} {payment.currency}
          </p>
          <p>Status: {payment.status}</p>
        </div>
      ))}
      <div>
        <button
          onClick={() => goToPage(pagination.pageNumber - 1)}
          disabled={pagination.pageNumber === 1}
        >
          Previous
        </button>
        <span>
          Page {pagination.pageNumber} of {pagination.totalPages}
        </span>
        <button
          onClick={() => goToPage(pagination.pageNumber + 1)}
          disabled={pagination.pageNumber >= pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created (resource successfully created)
- `400` - Bad Request (validation error or invalid input)
- `401` - Unauthorized (token expired/invalid)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

### Error Handling Implementation

```javascript
class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function handleApiResponse(response) {
  if (response.ok) {
    return await response.json();
  }

  const errorData = await response.json().catch(() => ({}));

  switch (response.status) {
    case 401:
      // Token expired - try refresh
      const newToken = await refreshToken();
      if (newToken) {
        throw new ApiError("Token refreshed, retry request", 401);
      }
      // Refresh failed - redirect to login
      window.location.href = "/login";
      throw new ApiError("Unauthorized", 401);

    case 403:
      throw new ApiError(
        errorData.message || "Access denied",
        403,
        errorData.errors || []
      );

    case 404:
      throw new ApiError(errorData.message || "Resource not found", 404);

    case 400:
      throw new ApiError(
        errorData.message || "Validation error",
        400,
        errorData.errors || []
      );

    default:
      throw new ApiError(
        errorData.message || "An error occurred",
        response.status,
        errorData.errors || []
      );
  }
}

// Usage with try-catch
try {
  const payment = await initiatePayment(123, { paymentMethod: "Card" });
  console.log("Payment successful:", payment);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 400 && error.errors.length > 0) {
      // Handle validation errors
      error.errors.forEach((err) => {
        console.error(`Field ${err.field}: ${err.message}`);
      });
    } else {
      console.error("API Error:", error.message);
    }
  } else {
    console.error("Unexpected error:", error);
  }
}
```

---

## Security Best Practices

### 1. Token Management

**DO:**

- Store tokens in `sessionStorage` (cleared on tab close) for better security
- Implement token expiration checks before API calls
- Always use HTTPS for API requests
- Refresh tokens automatically when expired

**DON'T:**

- Store tokens in `localStorage` if not necessary (less secure)
- Log tokens to console
- Include tokens in URLs or error messages
- Store tokens in global variables

### 2. API Requests

**DO:**

- Always send tokens in `Authorization` header
- Validate user input before sending requests
- Handle errors gracefully without exposing sensitive information
- Use environment variables for API base URLs

**DON'T:**

- Send tokens in query parameters
- Expose API keys or tokens in client-side code
- Ignore error responses
- Make unnecessary API calls

### 3. Payment Processing

**DO:**

- Verify payment status after initiation
- Implement proper loading states during payment processing
- Handle payment failures gracefully
- Store payment references for tracking

**DON'T:**

- Auto-retry failed payments without user confirmation
- Expose payment gateway credentials
- Store sensitive payment data unnecessarily
- Skip payment verification

### 4. Error Handling

**DO:**

- Display user-friendly error messages
- Log errors for debugging (without sensitive data)
- Handle network failures gracefully
- Implement retry logic for transient failures

**DON'T:**

- Expose internal error details to users
- Log sensitive information
- Ignore error responses
- Crash on API failures

---

## API Endpoints Reference

### Payments

| Method | Endpoint                                     | Description                           | Auth Required |
| ------ | -------------------------------------------- | ------------------------------------- | ------------- |
| GET    | `/api/v1/Payments`                           | Get paginated list of payments        | Yes           |
| GET    | `/api/v1/Payments/{paymentId}`               | Get payment by ID                     | Yes           |
| POST   | `/api/v1/Payments`                           | Record manual payment (Officer/Admin) | Yes           |
| POST   | `/api/v1/Payments/invoices/{invoiceId}/pay`  | Initiate payment for invoice          | Yes           |
| GET    | `/api/v1/Payments/verify/{paymentReference}` | Verify payment status                 | Yes           |
| POST   | `/api/v1/Payments/webhook`                   | Payment webhook (system-to-system)    | API Key       |

### Invoices

| Method | Endpoint                                        | Description                    | Auth Required |
| ------ | ----------------------------------------------- | ------------------------------ | ------------- |
| GET    | `/api/v1/Invoices`                              | Get paginated list of invoices | Yes           |
| GET    | `/api/v1/Invoices/{invoiceId}`                  | Get invoice by ID              | Yes           |
| GET    | `/api/v1/Invoices/applications/{appId}/invoice` | Get invoice for application    | Yes           |
| POST   | `/api/v1/Invoices`                              | Create invoice (Officer/Admin) | Yes           |
| PATCH  | `/api/v1/Invoices/{invoiceId}`                  | Update invoice (Officer/Admin) | Yes           |
| DELETE | `/api/v1/Invoices/{invoiceId}`                  | Delete invoice (Officer/Admin) | Yes           |

### Additional Endpoints

The API includes many more endpoints for:

- Accreditations
- Applications
- Documents
- Organizations
- Courses and Enrollments
- And more...

**Full API Documentation:** Visit `https://pay-service.icadpays.com/swagger/index.html` for complete endpoint documentation.

---

## Troubleshooting

### Payment Not Completing

**Symptom:** Payment status remains "Pending" after initiation

**Possible Causes:**

- Payment gateway timeout
- Network issues
- Invalid payment method

**Solution:**

- Verify payment status using `/api/v1/Payments/verify/{paymentReference}`
- Check payment gateway logs
- Implement proper timeout and error handling
- Consider using webhooks for real-time updates

### 401 Unauthorized Errors

**Symptom:** All API calls return 401

**Solution:**

```javascript
// Check token expiration
const expiresAt = sessionStorage.getItem("token_expires_at");
if (expiresAt && Date.now() >= parseInt(expiresAt)) {
  // Refresh token
  await refreshToken();
}
```

### Invoice Not Found

**Symptom:** 404 when fetching invoice for application

**Possible Causes:**

- Invoice not yet generated for the application
- Invalid application ID
- User doesn't have access to the invoice

**Solution:**

- Check if invoice exists before fetching
- Verify user permissions
- Ensure application ID is correct

### CORS Issues

**Symptom:** CORS errors in browser console

**Solution:**

- Ensure API server allows requests from your frontend domain
- Check if preflight requests are handled correctly
- Contact backend team if CORS configuration needs adjustment

---

## Rate Limiting

API requests are rate-limited to ensure fair usage. Contact support (`support@nimasa.gov.ng`) if you need higher rate limits.

**Best Practices:**

- Implement request debouncing for search/filter operations
- Cache responses when appropriate
- Batch operations when possible
- Handle rate limit errors gracefully (HTTP 429)

---

## Support

For API support or questions:

- **Email**: support@nimasa.gov.ng
- **Documentation**: https://pay-service.icadpays.com/swagger/index.html
- **Terms of Service**: https://www.nimasa.gov.ng/terms

---

**Last Updated:** December 2024
**Version:** 1.0
**API Version:** 1.0

