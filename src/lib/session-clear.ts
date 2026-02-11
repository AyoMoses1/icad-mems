/**
 * Central session and cache clear for logout.
 * Clears all user-specific persisted state so the next user never sees
 * the previous user's role, menu, or workspace.
 * Call this on logout and on 401 so no stale data remains.
 */

import { safeLocalStorage } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useUIStore } from "@/store/ui-store";

const USER_ROLE_KEY = "userRole";
const AUTH_STORAGE_KEY = "auth-storage";
const WORKSPACE_STORAGE_KEY = "workspace-storage";
const UI_STORAGE_KEY = "ui-store";

/**
 * Clears all session-related caches and persisted state (except auth store
 * itself, which is cleared by useAuthStore.getState().logout()).
 * Call logout() first, then this, or have logout() call this for storage only.
 */
export function clearSessionCaches(): void {
  if (typeof window === "undefined") return;

  // Role used by sidebar, header, layout, permissions - must clear or next user sees old menu
  safeLocalStorage.removeItem(USER_ROLE_KEY);

  // Workspace store persists currentWorkspaceId; clear in-memory and persisted
  const workspace = useWorkspaceStore.getState();
  workspace.clearWorkspaceData();
  safeLocalStorage.removeItem(WORKSPACE_STORAGE_KEY);

  // UI store persists userType, viewMode, theme, sidebarCollapsed - reset to safe defaults
  const ui = useUIStore.getState();
  ui.setUserType("seafarer");
  ui.setViewMode("user");
  safeLocalStorage.removeItem(UI_STORAGE_KEY);
}

/**
 * Removes only the auth key from localStorage (e.g. after logout in auth store).
 * Prefer using clearSessionCaches() on logout so all caches are cleared.
 */
export function clearAuthStorage(): void {
  safeLocalStorage.removeItem(AUTH_STORAGE_KEY);
}
