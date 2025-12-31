/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Fix for Next.js 14.2.x Babel 7.2 compatibility issue
  experimental: {
    disableOptimizedFontLoading: true,
  },
};

export default nextConfig;

// TODO: Re-enable Sentry after resolving Next.js 14.2.5 compatibility issues
// import { withSentryConfig } from '@sentry/nextjs';
// export default withSentryConfig(nextConfig, { ... });