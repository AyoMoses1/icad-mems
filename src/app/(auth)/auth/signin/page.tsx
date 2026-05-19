"use client";

import { useEffect } from "react";
import { getImsUrl } from "@/lib/ims-url";

/**
 * MEMS Seafarer uses SSO from IMS – there is no local login page.
 * This route redirects to IMS so users sign in there and are sent back with a token.
 */
export default function SignInPage() {
  const imsUrl = getImsUrl();

  useEffect(() => {
    window.location.href = imsUrl;
  }, [imsUrl]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-4">
      <p className="text-muted-foreground text-sm">
        Redirecting to sign in...
      </p>
      <a
        href={imsUrl}
        className="text-primary text-sm underline hover:no-underline"
      >
        Click here if you are not redirected
      </a>
    </div>
  );
}
