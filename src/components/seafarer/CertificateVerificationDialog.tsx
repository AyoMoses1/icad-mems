"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

const STORAGE_KEY = "seafarer-certificate-verified";

export function getCertificateVerified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setCertificateVerified(verified: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (verified) sessionStorage.setItem(STORAGE_KEY, "true");
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Placeholder: verify certificate with registry/cert API.
 * Replace with actual endpoint when provided.
 */
async function verifyCertificate(_certificateNumber: string): Promise<{
  success: boolean;
  message?: string;
}> {
  await new Promise((r) => setTimeout(r, 600));
  const trimmed = _certificateNumber.trim();
  if (!trimmed) return { success: false, message: "Please enter your certificate number." };
  return { success: true };
}

interface CertificateVerificationDialogProps {
  open: boolean;
  onVerified: () => void;
}

export function CertificateVerificationDialog({
  open,
  onVerified,
}: CertificateVerificationDialogProps) {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setError(null);
    setIsVerifying(true);
    try {
      const result = await verifyCertificate(certificateNumber);
      if (result.success) {
        setCertificateVerified(true);
        onVerified();
      } else {
        setError(result.message ?? "Verification failed. Please check your certificate number.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Verify your certificate</DialogTitle>
              <DialogDescription>
                Enter your certificate number to access the seafarer application. We will verify it with the registry.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="certificateNumber">Certificate number</Label>
            <Input
              id="certificateNumber"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="Enter certificate number"
              disabled={isVerifying}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={!certificateNumber.trim() || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify and continue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
