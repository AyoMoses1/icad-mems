/**
 * Resolve auth token during SSO handoff before Zustand has rehydrated.
 */

export function getTokenFromUrl(searchParams?: URLSearchParams | null): string | null {
  if (typeof window === "undefined") return null;

  const fromParams = searchParams?.get("token")?.trim();
  if (fromParams) return fromParams;

  try {
    return new URLSearchParams(window.location.search).get("token")?.trim() || null;
  } catch {
    return null;
  }
}

export function getTokenFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.token?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Token from SSO callback URL, auth store, or persisted session — used to avoid
 * redirecting to IMS while login is still in progress on localhost.
 */
export function getRefreshTokenFromUrl(
  searchParams?: URLSearchParams | null
): string | null {
  if (typeof window === "undefined") return null;

  const fromParams =
    searchParams?.get("refreshToken")?.trim() ||
    searchParams?.get("refresh_token")?.trim();
  if (fromParams) return fromParams;

  try {
    return (
      new URLSearchParams(window.location.search)
        .get("refreshToken")
        ?.trim() ||
      new URLSearchParams(window.location.search)
        .get("refresh_token")
        ?.trim() ||
      null
    );
  } catch {
    return null;
  }
}

export function getTokenFromUrlOrStorage(
  searchParams?: URLSearchParams | null
): string | null {
  return getTokenFromUrl(searchParams) || getTokenFromLocalStorage();
}
