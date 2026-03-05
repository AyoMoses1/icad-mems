"use client";

import { useEffect } from "react";

/**
 * MEMS Seafarer uses SSO from IMS – there is no local login page.
 * This route redirects to IMS so users sign in there and are sent back with a token.
 */
const IMS_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_IMS_URL?.trim()
    ? process.env.NEXT_PUBLIC_IMS_URL.trim()
    : "https://ims.mems.ng";

export default function SignInPage() {
  useEffect(() => {
    window.location.href = IMS_URL;
  }, []);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-4">
      <p className="text-muted-foreground text-sm">
        Redirecting to sign in...
      </p>
      <a
        href={IMS_URL}
        className="text-primary text-sm underline hover:no-underline"
      >
        Click here if you are not redirected
      </a>
    </div>
  );
}
