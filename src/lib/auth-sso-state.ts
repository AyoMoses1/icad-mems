/**
 * Tracks in-progress SSO handoff from IMS (?token= in URL) so 401 handlers
 * and auth guards do not redirect to IMS before initializeUser finishes.
 *
 * Uses sessionStorage so React Strict Mode remounts (dev-only) do not reset state.
 */

const SSO_HANDOFF_KEY = "mems-sso-handoff-active";
const SSO_INIT_STARTED_KEY = "mems-sso-init-started";

let ssoHandoffInProgress = false;

function readSessionFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      sessionStorage.setItem(key, "1");
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore (private mode, etc.)
  }
}

export function markSsoHandoffInProgress(): void {
  ssoHandoffInProgress = true;
  writeSessionFlag(SSO_HANDOFF_KEY, true);
}

export function clearSsoHandoffInProgress(): void {
  ssoHandoffInProgress = false;
  writeSessionFlag(SSO_HANDOFF_KEY, false);
}

export function isSsoHandoffInProgress(): boolean {
  return ssoHandoffInProgress || readSessionFlag(SSO_HANDOFF_KEY);
}

/** Set when URL contains SSO tokens — survives Strict Mode remount after URL is cleaned. */
export function markSsoInitStarted(): void {
  writeSessionFlag(SSO_INIT_STARTED_KEY, true);
  markSsoHandoffInProgress();
}

export function wasSsoInitStarted(): boolean {
  return readSessionFlag(SSO_INIT_STARTED_KEY);
}

export function clearSsoInitStarted(): void {
  writeSessionFlag(SSO_INIT_STARTED_KEY, false);
  clearSsoHandoffInProgress();
}
