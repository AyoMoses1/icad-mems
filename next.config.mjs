/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress hydration warnings in development for dynamic content
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  async redirects() {
    return [
      {
        source: "/onboarding/verification/status",
        destination: "/onboarding/status/pending",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
