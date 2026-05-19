/**
 * Resolve IMS URL for SSO redirects.
 * When Seafarer runs on localhost, default to local IMS unless explicitly configured otherwise.
 */

const PRODUCTION_IMS = "https://ims.mems.ng";
const DEFAULT_LOCAL_IMS = "http://localhost:3000";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  );
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
    return stripTrailingSlash(localOverride);
  }

  const configured = configuredImsUrl();

  if (typeof window !== "undefined") {
    const { hostname } = window.location;

    if (isLocalHostname(hostname)) {
      // Local Seafarer dev: use local IMS unless a non-production URL is explicitly set
      if (!configured || configured.includes("ims.mems.ng")) {
        return DEFAULT_LOCAL_IMS;
      }
      return stripTrailingSlash(configured);
    }
  }

  if (configured) {
    return stripTrailingSlash(configured);
  }

  return PRODUCTION_IMS;
}
