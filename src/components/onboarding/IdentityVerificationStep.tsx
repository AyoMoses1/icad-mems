"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getUserReadinessStatus,
  UserReadinessOnboardingStatus,
} from "@/lib/services/user-readiness-service";
import { finalizeVerificationAndGoToPending } from "@/lib/verification-completion";
import { createVeriffFrame, MESSAGES } from "@veriff/incontext-sdk";

declare global {
  interface Window {
    Veriff?: (opts: {
      host: string;
      apiKey: string;
      parentId: string;
      onSession: (
        err: Error | null,
        response: { verification?: { url?: string } }
      ) => void;
    }) => {
      setParams: (params: {
        person?: { givenName: string; lastName: string };
        vendorData: string;
      }) => void;
      mount: (opts?: {
        formLabel?: { vendorData?: string };
        submitBtnText?: string;
      }) => void;
    };
    veriffSDK?: { createVeriffFrame: (opts: { url: string }) => unknown };
  }
}

interface IdentityVerificationStepProps {
  userId: string;
  /** Optional: pre-fill name fields and hide them */
  firstName?: string;
  lastName?: string;
  onVerified?: () => void;
  /** Called when verification status is checked - verified: true if identity step is complete */
  onVerificationStatusChange?: (verified: boolean) => void;
}

function isOnboardingDraftStatus(
  status: UserReadinessOnboardingStatus | number | string | null | undefined
): boolean {
  if (status == null) return true;
  if (status === UserReadinessOnboardingStatus.DRAFT || status === 0) return true;
  if (typeof status === "string" && status.toUpperCase() === "DRAFT") return true;
  return false;
}

const VERIFF_JS_SDK = "https://cdn.veriff.me/sdk/js/1.5/veriff.min.js";
const VERIFF_INCONTEXT_SDK = "https://cdn.veriff.me/incontext/js/v1/veriff.js";

/**
 * Identity verification step using Veriff Station (from Veriff dashboard)
 * Uses Veriff JS SDK + InContext SDK for session creation and popup
 */
export function IdentityVerificationStep({
  userId,
  firstName,
  lastName,
  onVerified,
  onVerificationStatusChange,
}: IdentityVerificationStepProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isCompletingVerification, setIsCompletingVerification] =
    useState(false);
  const [scriptsReady, setScriptsReady] = useState(false);
  const veriffInitializedRef = useRef(false);

  // Check if user is already verified on mount
  useEffect(() => {
    if (!userId) {
      setIsCheckingStatus(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await getUserReadinessStatus();
        const readiness = response.success ? response.data : null;
        const identityStepComplete =
          readiness?.source === "onboarding" &&
          !isOnboardingDraftStatus(readiness.onboardingStatus);

        if (identityStepComplete) {
          setIsVerified(true);
          onVerificationStatusChange?.(true);
        } else {
          setIsVerified(false);
          onVerificationStatusChange?.(false);
        }
      } catch {
        setIsVerified(false);
        onVerificationStatusChange?.(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [userId, onVerificationStatusChange]);

  // Poll for scripts - onLoad can race when both scripts load
  useEffect(() => {
    if (isVerified !== false || !userId) return;
    const check = () => {
      if (window.Veriff && window.veriffSDK && !scriptsReady) {
        setScriptsReady(true);
      }
    };
    check();
    const id = setInterval(check, 300);
    return () => clearInterval(id);
  }, [isVerified, userId, scriptsReady]);

  // Initialize Veriff when scripts are loaded and user needs to verify
  useEffect(() => {
    if (
      !scriptsReady ||
      !userId ||
      isVerified !== false ||
      veriffInitializedRef.current ||
      typeof window === "undefined"
    ) {
      return;
    }

    const Veriff = window.Veriff;
    const apiKey = process.env.NEXT_PUBLIC_VERIFF_API_KEY;
    const host =
      process.env.NEXT_PUBLIC_VERIFF_HOST || "https://stationapi.veriff.com";

    if (!Veriff || !apiKey) {
      return;
    }

    veriffInitializedRef.current = true;

    try {
      const veriff = Veriff({
        host,
        apiKey,
        parentId: "veriff-root",
        onSession: (
          err: Error | null,
          response: { verification?: { url?: string } }
        ) => {
          if (err) {
            console.error("Veriff session error:", err);
            veriffInitializedRef.current = false;
            return;
          }
          const url = response?.verification?.url;
          if (!url) {
            console.error("No verification URL in response");
            veriffInitializedRef.current = false;
            return;
          }
          // Use InContext SDK for popup with redirect on finish/cancel
          const veriffFrame = createVeriffFrame({
            url,
            onEvent: (msg: string) => {
              if (msg === MESSAGES.FINISHED || msg === MESSAGES.CANCELED) {
                veriffFrame?.close?.();
                veriffInitializedRef.current = false;
                if (isCompletingVerification) return;
                setIsCompletingVerification(true);
                if (onVerified) {
                  void (async () => {
                    try {
                      await getUserReadinessStatus();
                    } catch {
                      /* ignore */
                    }
                    onVerified();
                  })();
                } else {
                  void finalizeVerificationAndGoToPending();
                }
              }
            },
          });
        },
      });

      // Pre-fill vendorData (userId) and name if supported - Station SDK may not have setParams
      if (typeof veriff.setParams === "function") {
        veriff.setParams({
          person: {
            givenName: firstName?.trim() || " ",
            lastName: lastName?.trim() || " ",
          },
          vendorData: userId,
        });
      }

      veriff.mount({
        formLabel: { vendorData: "User ID" },
        submitBtnText: "Start identity verification",
      });
    } catch (err) {
      console.error("Veriff init error:", err);
      veriffInitializedRef.current = false;
    }

    return () => {
      veriffInitializedRef.current = false;
    };
  }, [
    scriptsReady,
    userId,
    firstName,
    lastName,
    isVerified,
    isCompletingVerification,
    onVerified,
  ]);

  if (isCheckingStatus || isCompletingVerification) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            {isCompletingVerification
              ? "Completing verification..."
              : "Checking verification status..."}
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isVerified) {
    return (
      <Card className="border-green-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-green-700 dark:text-green-400">
                Identity Verified
              </CardTitle>
              <CardDescription>
                Your identity has been successfully verified. You can proceed
                with the next steps.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {onVerified && (
          <CardContent>
            <Button onClick={onVerified}>
              Continue to next step
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>
              Verify your identity using your international passport or national
              ID. This is required to complete your onboarding.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-muted bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p>
                You will be asked to capture your ID document and a selfie. Make
                sure you have a valid passport or national ID and a well-lit
                environment.
              </p>
            </div>
          </div>
        </div>

        {/* Veriff SDK scripts - from Veriff dashboard */}
        <Script
          src={VERIFF_JS_SDK}
          strategy="afterInteractive"
          onLoad={() => {
            if (window.Veriff && window.veriffSDK) setScriptsReady(true);
          }}
        />
        <Script
          src={VERIFF_INCONTEXT_SDK}
          strategy="afterInteractive"
          onLoad={() => {
            if (window.Veriff && window.veriffSDK) setScriptsReady(true);
          }}
        />

        {/* Veriff form mounts here - shows "Start identity verification" button */}
        <div id="veriff-root" className="min-h-[80px]" />
      </CardContent>
    </Card>
  );
}
