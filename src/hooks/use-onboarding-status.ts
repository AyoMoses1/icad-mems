/**
 * Hook to check user's onboarding status
 *
 * This hook calls the /seafarer/api/v1/Onboarding/my-onboarding endpoint
 * to determine the user's onboarding status and route them appropriately.
 *
 * Status Flow:
 * - DRAFT/PENDING/SUBMITTED/UNDER_REVIEW -> Pending review page
 * - REJECTED -> Rejected page with reason
 * - APPROVED -> Dashboard based on role
 * - No onboarding -> Onboarding form
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getMyOnboarding,
  type UserSeafarerOnboardingDto,
  OnboardingStatus,
  isOnboardingPendingReview,
  isOnboardingApproved,
  isOnboardingRejected,
} from "@/lib/services/onboarding-service";
import { getDashboardRoute } from "@/lib/role-routing";

export type OnboardingStatusType =
  | "loading"
  | "no_onboarding"
  | "pending_review"
  | "approved"
  | "rejected"
  | "error";

export interface OnboardingStatusResult {
  /** Current status of the onboarding check */
  status: OnboardingStatusType;
  /** The onboarding data if available */
  onboardingData: UserSeafarerOnboardingDto | null;
  /** Error message if any */
  error: string | null;
  /** Whether the hook is currently loading */
  isLoading: boolean;
  /** The user's role from onboarding data */
  role: string | null;
  /** Rejection reason if status is rejected */
  rejectionReason: string | null;
  /** Function to refresh the onboarding status */
  refresh: () => Promise<void>;
  /** Function to navigate to the appropriate page based on status */
  navigateToAppropriateRoute: () => void;
}

/**
 * Roles that should use this onboarding status check
 * Super admins and other admin roles should not use this flow
 */
const ONBOARDING_REQUIRED_ROLES = ["SEAFARER", "AGENT", "TRAINING_INSTITUTION"];

/**
 * Check if a role requires onboarding status check
 */
export function requiresOnboardingCheck(role?: string | null): boolean {
  if (!role) return false;
  return ONBOARDING_REQUIRED_ROLES.includes(role.toUpperCase());
}

/**
 * Hook to manage and check user's onboarding status
 *
 * @param autoFetch - Whether to automatically fetch status on mount (default: true)
 * @returns OnboardingStatusResult
 */
export function useOnboardingStatus(
  autoFetch: boolean = true,
): OnboardingStatusResult {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatusType>("loading");
  const [onboardingData, setOnboardingData] =
    useState<UserSeafarerOnboardingDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOnboardingStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMyOnboarding();

      if (response.success && response.data) {
        setOnboardingData(response.data);

        const onboardingStatus = response.data.status?.toUpperCase();

        // Determine the status type based on the response
        if (isOnboardingApproved(onboardingStatus)) {
          setStatus("approved");
        } else if (isOnboardingRejected(onboardingStatus)) {
          setStatus("rejected");
        } else if (isOnboardingPendingReview(onboardingStatus)) {
          setStatus("pending_review");
        } else {
          // Unknown status, treat as pending review to be safe
          setStatus("pending_review");
        }
      } else {
        // No onboarding data found - user needs to complete onboarding
        setOnboardingData(null);
        setStatus("no_onboarding");
      }
    } catch (err) {
      console.error("Error fetching onboarding status:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch onboarding status";

      // Check if it's a 404 - means no onboarding record exists
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        setOnboardingData(null);
        setStatus("no_onboarding");
      } else {
        setError(errorMessage);
        setStatus("error");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const navigateToAppropriateRoute = useCallback(() => {
    const role = onboardingData?.role?.toUpperCase();

    switch (status) {
      case "approved":
        // Navigate to the role-specific dashboard
        if (role) {
          const dashboardRoute = getDashboardRoute(role);
          router.replace(dashboardRoute);
        } else {
          router.replace("/seafarer/dashboard");
        }
        break;

      case "pending_review":
        router.replace("/onboarding/status/pending");
        break;

      case "rejected":
        router.replace("/onboarding/status/rejected");
        break;

      case "no_onboarding":
        router.replace("/onboarding");
        break;

      case "error":
        // On error, let user stay where they are or go to onboarding
        break;

      default:
        // Loading state - do nothing
        break;
    }
  }, [status, onboardingData, router]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchOnboardingStatus();
    }
  }, [autoFetch, fetchOnboardingStatus]);

  return {
    status,
    onboardingData,
    error,
    isLoading,
    role: onboardingData?.role || null,
    rejectionReason: onboardingData?.rejectionReason || null,
    refresh: fetchOnboardingStatus,
    navigateToAppropriateRoute,
  };
}

/**
 * Get the dashboard route for a role from onboarding data
 */
export function getOnboardingDashboardRoute(role?: string | null): string {
  if (!role) return "/seafarer/dashboard";

  const normalizedRole = role.toUpperCase();

  switch (normalizedRole) {
    case "SEAFARER":
      return "/seafarer/dashboard";
    case "AGENT":
      return "/agent/dashboard";
    case "TRAINING_INSTITUTION":
      return "/institution/dashboard";
    default:
      return "/seafarer/dashboard";
  }
}
