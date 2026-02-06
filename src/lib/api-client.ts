/**
 * API Client for making requests to the backend API
 */

// Get SSO/OAuth base URL for authentication endpoints
// All /connect/* endpoints should use this base URL
function getSsoBaseUrl(): string {
  const ssoUrl =
    process.env.NEXT_PUBLIC_SSO_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_OAUTH_BASE_URL?.trim() ||
    "";

  if (typeof window !== "undefined" && !ssoUrl) {
    console.error(
      "❌ CRITICAL: SSO Base URL is not set!",
      "\n  Checked variables:",
      "\n  - NEXT_PUBLIC_SSO_BASE_URL:",
      process.env.NEXT_PUBLIC_SSO_BASE_URL,
      "\n  - NEXT_PUBLIC_OAUTH_BASE_URL:",
      process.env.NEXT_PUBLIC_OAUTH_BASE_URL,
      "\n  Please add NEXT_PUBLIC_SSO_BASE_URL to your .env.local file",
      "\n  Example: NEXT_PUBLIC_SSO_BASE_URL=https://staging-api.icadpay.com"
    );
  }

  return ssoUrl;
}

// Get API base URL - access at runtime to ensure env vars are loaded
// Uses NEXT_PUBLIC_API_BASE_URL for all API calls (login and main API)
export function getApiBaseUrl(): string {
  // In Next.js, NEXT_PUBLIC_ variables are embedded at build time
  // They should be available in both server and client contexts
  // Check both variable names for backward compatibility
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_LOGIN_BASE_URL?.trim() ||
    "";

  // Log in development to help debug
  if (typeof window !== "undefined") {
    if (!baseUrl) {
      console.error(
        "❌ CRITICAL: NEXT_PUBLIC_API_BASE_URL is not set!",
        "\n  Checked variables:",
        "\n  - NEXT_PUBLIC_API_BASE_URL:",
        process.env.NEXT_PUBLIC_API_BASE_URL,
        "\n  - NEXT_PUBLIC_API_LOGIN_BASE_URL:",
        process.env.NEXT_PUBLIC_API_LOGIN_BASE_URL,
        "\n  This will cause API calls to fail or go to localhost.",
        "\n  Please:",
        "\n  1. Add NEXT_PUBLIC_API_BASE_URL to your .env.local file",
        "\n  2. Restart your Next.js dev server (npm run dev)",
        "\n  3. Clear .next cache if needed (rm -rf .next)"
      );
    }
    // else if (process.env.NODE_ENV === "development") {
    //   console.log("✅ API Base URL loaded:", baseUrl);
    // }
  }

  return baseUrl;
}

// Determine which base URL to use based on endpoint
// OAuth/SSO endpoints (/connect/*) and menu (/api/menu) use SSO base URL
// All other endpoints use the main API base URL
function getBaseUrlForEndpoint(endpoint: string): string {
  // Strip query string for path checks (menu is often /api/menu?workspaceId=...)
  const pathname = endpoint.split("?")[0];

  // OAuth/SSO endpoints use SSO base URL
  if (pathname.startsWith("/connect/")) {
    const ssoUrl = getSsoBaseUrl();
    if (!ssoUrl) {
      throw new Error(
        "NEXT_PUBLIC_SSO_BASE_URL is not configured. " +
          "Please add it to your .env.local file. " +
          "Example: NEXT_PUBLIC_SSO_BASE_URL=https://staging-api.icadpay.com"
      );
    }
    return ssoUrl;
  }

  // Menu endpoint is served from SSO base URL (IMS/auth service), not main API
  if (
    pathname === "/api/menu" ||
    (pathname.startsWith("/api/workspaces/") && pathname.endsWith("/menu"))
  ) {
    const ssoUrl = getSsoBaseUrl();
    if (!ssoUrl) {
      throw new Error(
        "NEXT_PUBLIC_SSO_BASE_URL is not configured for menu. " +
          "Please add it to your .env.local file."
      );
    }
    return ssoUrl;
  }

  // Domain roles for workspace (IMS/SSO backend) - used for onboarding role selection
  if (
    pathname.startsWith("/api/workspaces/") &&
    pathname.endsWith("/roles/domain")
  ) {
    const ssoUrl = getSsoBaseUrl();
    if (!ssoUrl) {
      throw new Error(
        "NEXT_PUBLIC_SSO_BASE_URL is not configured for domain roles. " +
          "Please add it to your .env.local file."
      );
    }
    return ssoUrl;
  }

  // Use main API base URL for all other endpoints
  return getApiBaseUrl();
}

/** Shape of error in API response JSON */
export interface ApiErrorPayload {
  message: string;
  code: string;
}

/** Throwable API error with code and optional statusCode for handleApiError */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ApiResponse<T> {
  apiVersion?: string;
  success: boolean;
  code?: string;
  message?: string;
  requestId?: string;
  data?: T;
  error?: ApiErrorPayload;
}

/**
 * Gets the current access token from auth store or localStorage fallback
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    // First, try to get from zustand store
    const { useAuthStore } = require("@/store");
    const storeToken = useAuthStore.getState().token;

    if (storeToken) {
      return storeToken;
    }

    // Fallback: Try to get directly from localStorage (for cases where store hasn't rehydrated yet)
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const localToken = parsed?.state?.token;
        if (localToken) {
          // Sync the token back to the store if it exists in localStorage but not in store
          const currentState = useAuthStore.getState();
          if (!currentState.token && parsed?.state) {
            // Rehydrate the store from localStorage
            useAuthStore.setState({
              token: parsed.state.token,
              refreshToken: parsed.state.refreshToken,
              expiresAt: parsed.state.expiresAt,
              user: parsed.state.user,
              isAuthenticated: parsed.state.isAuthenticated,
              isLoading: false,
            });
          }
          return localToken;
        }
      } catch (parseError) {
        // Ignore parse errors
      }
    }

    // Log warning if token is missing (only in development)
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ No authentication token found. Please ensure you are logged in."
      );
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting auth token:", error);
    }
    return null;
  }
}

/**
 * Gets refresh token from auth store
 */
function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const { useAuthStore } = require("@/store");
    return useAuthStore.getState().refreshToken;
  } catch {
    return null;
  }
}

/**
 * Checks if token is expired based on expiration time
 */
function isTokenExpired(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const { useAuthStore } = require("@/store");
    const { expiresAt } = useAuthStore.getState();

    if (!expiresAt) return true;

    return new Date(expiresAt) <= new Date();
  } catch {
    return true;
  }
}

/**
 * Refreshes the access token using refresh token
 * Uses SSO base URL for /connect/token endpoint
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    console.warn("No refresh token available");
    return null;
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("OAuth credentials not configured");
      return null;
    }

    // Call refresh token endpoint (uses SSO base URL automatically)
    const tokenResponse = await apiPostForm<{
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    }>("/connect/token", {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    // Update token in auth store
    const { useAuthStore } = require("@/store");
    const expiresIn = tokenResponse.expires_in || 86400; // Default 24 hours
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().setSession({
        user: currentUser,
        token: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token || refreshToken,
        expiresAt,
      });
    }

    return tokenResponse.access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    // Refresh failed - clear session and redirect to IMS
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("@/store");
      useAuthStore.getState().logout();
      window.location.href = "https://icad-ims.netlify.app/";
    }
    return null;
  }
}

/**
 * Gets a valid token, refreshing if necessary
 */
async function getValidToken(): Promise<string | null> {
  if (isTokenExpired()) {
    return await refreshAccessToken();
  }

  return getAuthToken();
}

// Export refresh token functions for use in components
export { refreshAccessToken, getValidToken, isTokenExpired };

/**
 * Makes an API request to the backend
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const API_BASE_URL = getApiBaseUrl();

  // console.log({ API_BASE_URL });

  if (!API_BASE_URL) {
    const errorMsg = `NEXT_PUBLIC_API_LOGIN_BASE_URL is not configured. Current value: "${process.env.NEXT_PUBLIC_API_LOGIN_BASE_URL}". Please check your .env file and restart the dev server.`;
    console.error("❌ API Client Error:", errorMsg);
    throw new Error(errorMsg);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Debug logging in development
  // if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  //   console.log("🌐 API Request:", {
  //     method: options.method || "GET",
  //     url,
  //     endpoint,
  //     baseUrl: API_BASE_URL,
  //   });
  // }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add authorization token if available
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: ApiResponse<T>;

    if (isJson) {
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : ({} as ApiResponse<T>);
      } catch (jsonError) {
        // If JSON parsing fails, create a default error response
        data = {
          success: false,
          message: `Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : "Unknown error"}`,
        } as ApiResponse<T>;
      }
    } else {
      // If response is not JSON, create a default error response
      const text = await response.text();
      data = {
        success: false,
        message:
          text ||
          `Server returned non-JSON response (${response.status} ${response.statusText})`,
      } as ApiResponse<T>;
    }

    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(
        data.error?.message ||
          data.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }

    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred");
  }
}
export async function apiClientMain<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Menu and SSO endpoints use SSO base URL; all others use API base URL
  const API_BASE_URL = getBaseUrlForEndpoint(endpoint);

  // console.log({ API_BASE_URL });

  if (!API_BASE_URL) {
    const errorMsg = `Base URL is not configured for this endpoint. Please check NEXT_PUBLIC_SSO_BASE_URL and NEXT_PUBLIC_API_BASE_URL in your .env.local file and restart the dev server.`;
    console.error("❌ API Client Error:", errorMsg);
    throw new Error(errorMsg);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Debug logging in development
  // if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  //   console.log("🌐 API Request:", {
  //     method: options.method || "GET",
  //     url,
  //     endpoint,
  //     baseUrl: API_BASE_URL,
  //   });
  // }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add authorization token if available
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: ApiResponse<T>;

    if (isJson) {
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : ({} as ApiResponse<T>);
      } catch (jsonError) {
        // If JSON parsing fails, create a default error response
        data = {
          success: false,
          message: `Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : "Unknown error"}`,
        } as ApiResponse<T>;
      }
    } else {
      // If response is not JSON, create a default error response
      const text = await response.text();
      data = {
        success: false,
        message:
          text ||
          `Server returned non-JSON response (${response.status} ${response.statusText})`,
      } as ApiResponse<T>;
    }

    // Handle non-2xx responses — throw ApiError so handleApiError can map codes
    if (!response.ok) {
      const code = data.error?.code ?? "UNKNOWN_ERROR";
      const message =
        data.error?.message ||
        data.message ||
        `Request failed with status ${response.status}`;
      throw new ApiError(code, message, response.status);
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }

    // Re-throw ApiError as-is for handleApiError
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred");
  }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { method: "GET" });
}

export async function apiGetMain<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiClientMain<T>(endpoint, { method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}
export async function apiPostMain<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClientMain<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPutMain<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClientMain<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatchMain<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClientMain<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { method: "DELETE" });
}

export async function apiDeleteMain<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiClientMain<T>(endpoint, { method: "DELETE" });
}

/**
 * POST request with form-urlencoded body (for OAuth token endpoints)
 *
 * Uses SSO base URL (NEXT_PUBLIC_SSO_BASE_URL) for all /connect/* endpoints
 * Example: https://staging-api.icadpay.com/connect/token
 */
export async function apiPostForm<T>(
  endpoint: string,
  formData: Record<string, string>
): Promise<T> {
  // Ensure endpoint starts with / if it doesn't already
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const API_BASE_URL = getBaseUrlForEndpoint(normalizedEndpoint);
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  // Debug logging in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("🔐 OAuth Request:", {
      baseUrl: API_BASE_URL,
      endpoint: normalizedEndpoint,
      fullUrl: url,
    });
  }

  // Convert object to URLSearchParams for form-urlencoded
  const params = new URLSearchParams();
  Object.entries(formData).forEach(([key, value]) => {
    params.append(key, value);
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Request failed",
      }));
      throw new Error(
        errorData.error_description || errorData.error || "Request failed"
      );
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }

    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred");
  }
}
export async function apiPostFormMain<T>(
  endpoint: string,
  formData: Record<string, string>
): Promise<T> {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured. Please check your .env.local file and restart the dev server."
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Convert object to URLSearchParams for form-urlencoded
  const params = new URLSearchParams();
  Object.entries(formData).forEach(([key, value]) => {
    params.append(key, value);
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Request failed",
      }));
      throw new Error(
        errorData.error_description || errorData.error || "Request failed"
      );
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }

    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred");
  }
}

/**
 * POST request with multipart/form-data (for file uploads)
 */
export async function apiPostMultipart<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_LOGIN_BASE_URL is not configured. Please check your .env file and restart the dev server."
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type header - browser will set it with boundary

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function apiPostMultipartMain<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const API_BASE_URL = getApiBaseUrl();

  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured. Please check your .env.local file and restart the dev server."
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type header - browser will set it with boundary

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

/**
 * GET request helper with authentication (returns raw data, not wrapped in ApiResponse)
 *
 * Uses SSO base URL (NEXT_PUBLIC_SSO_BASE_URL) for /connect/* endpoints
 * Uses main API base URL for all other endpoints
 */
export async function apiGetAuth<T>(endpoint: string): Promise<T> {
  // Ensure endpoint starts with / if it doesn't already
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const API_BASE_URL = getBaseUrlForEndpoint(normalizedEndpoint);
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Request failed",
      }));
      throw new Error(
        errorData.error_description || errorData.error || "Request failed"
      );
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

/**
 * POST request helper with authentication (returns raw data, not wrapped in ApiResponse)
 *
 * Uses SSO base URL (NEXT_PUBLIC_SSO_BASE_URL) for /connect/* endpoints
 * Uses main API base URL for all other endpoints
 */
export async function apiPostAuth<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  // Ensure endpoint starts with / if it doesn't already
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const API_BASE_URL = getBaseUrlForEndpoint(normalizedEndpoint);
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Request failed",
      }));
      throw new Error(
        errorData.error_description || errorData.error || "Request failed"
      );
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your connection.");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}
