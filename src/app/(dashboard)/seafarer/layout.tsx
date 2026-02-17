"use client";

/**
 * Seafarer section layout. Certificate verification is only used for
 * training institution and agent (seafarer employer) during onboarding,
 * not for seafarers. Seafarer dashboard and routes render without a gate.
 */
export default function SeafarerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
