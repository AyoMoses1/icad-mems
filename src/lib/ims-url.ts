/**
 * Resolve IMS URL for SSO redirects.
 * When Seafarer runs on localhost, default to local IMS unless explicitly configured otherwise.
 */

const PRODUCTION_IMS = "https://ims.mems.ng";
const DEFAULT_LOCAL_IMS = "http://localhost:3000";
const LOCAL_IMS_PORT = "3000";
const LOCAL_SEAFARER_PORT = "3001";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * When dev servers grab the wrong port (Seafarer on 3000, IMS on 3001), redirects
 * must not send the user back to the same origin as the current app.
 */
function avoidLocalSelfRedirect(imsUrl: string): string {
  if (typeof window === "undefined") return imsUrl;

  const normalized = stripTrailingSlash(imsUrl);
  if (normalized !== window.location.origin) return imsUrl;

  try {
    const current = new URL(window.location.origin);
    if (!isLocalHostname(current.hostname)) return imsUrl;

    if (current.port === LOCAL_IMS_PORT) {
      current.port = LOCAL_SEAFARER_PORT;
    } else if (current.port === LOCAL_SEAFARER_PORT) {
      current.port = LOCAL_IMS_PORT;
    } else {
      return imsUrl;
    }
    return stripTrailingSlash(current.origin);
  } catch {
    return imsUrl;
  }
}

export function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
}

/** True when the Seafarer app is running on localhost (local dev only). */
export function isLocalFrontendDev(): boolean {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }
  return isLocalHostname(window.location.hostname);
}

function configuredImsUrl(): string {
  return (
    process.env.NEXT_PUBLIC_IMS_LOGOUT_URL?.trim() ||
    process.env.NEXT_PUBLIC_IMS_URL?.trim() ||
    ""
  );
}

/**
 * IMS base URL for redirects (sign-in, session expiry, Return to IMS).
 */
export function getImsUrl(): string {
  const localOverride = process.env.NEXT_PUBLIC_IMS_LOCAL_URL?.trim();
  if (localOverride) {
    return avoidLocalSelfRedirect(stripTrailingSlash(localOverride));
  }

  const configured = configuredImsUrl();

  if (typeof window !== "undefined") {
    const { hostname } = window.location;

    if (isLocalHostname(hostname)) {
      // Local Seafarer dev: use local IMS unless a non-production URL is explicitly set
      if (!configured || configured.includes("ims.mems.ng")) {
        return avoidLocalSelfRedirect(DEFAULT_LOCAL_IMS);
      }
      return avoidLocalSelfRedirect(stripTrailingSlash(configured));
    }
  }

  if (configured) {
    return stripTrailingSlash(configured);
  }

  return PRODUCTION_IMS;
}
