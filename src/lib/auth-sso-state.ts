/**
 * Tracks in-progress SSO handoff from IMS (?token= in URL) so 401 handlers
 * do not redirect to IMS before initializeUser finishes.
 */

let ssoHandoffInProgress = false;

export function markSsoHandoffInProgress(): void {
  ssoHandoffInProgress = true;
}

export function clearSsoHandoffInProgress(): void {
  ssoHandoffInProgress = false;
}

export function isSsoHandoffInProgress(): boolean {
  return ssoHandoffInProgress;
}
