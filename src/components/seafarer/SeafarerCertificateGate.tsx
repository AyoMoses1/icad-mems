"use client";

import { useState, useEffect } from "react";
import {
  getCertificateVerified,
  setCertificateVerified,
  CertificateVerificationDialog,
} from "./CertificateVerificationDialog";

interface SeafarerCertificateGateProps {
  children: React.ReactNode;
}

/**
 * Wraps seafarer app content and shows a certificate verification dialog
 * until the user has entered and verified their certificate number.
 * Verification state is stored in sessionStorage for the current tab.
 */
export function SeafarerCertificateGate({ children }: SeafarerCertificateGateProps) {
  const [verified, setVerified] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVerified(getCertificateVerified());
  }, []);

  const handleVerified = () => {
    setCertificateVerified(true);
    setVerified(true);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      <CertificateVerificationDialog
        open={!verified}
        onVerified={handleVerified}
      />
      {verified ? children : null}
    </>
  );
}
