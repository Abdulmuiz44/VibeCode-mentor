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
  serverExternalPackages: ['dockerode', 'simple-git'],
  transpilePackages: [
    'react-markdown',
    'remark-gfm',
    'micromark',
    'micromark-util-symbol',
    'micromark-core-commonmark',
    'vfile',
    'vfile-message',
    'unified',
    'remark-parse',
    'remark-rehype',
    'rehype-stringify',
    'mdast-util-from-markdown',
    'mdast-util-to-string',
    'micromark-util-character',
    'micromark-factory-space',
    'devlop'
  ],
};

export default nextConfig;

// TODO: Re-enable Sentry after resolving Next.js 14.2.5 compatibility issues
// import { withSentryConfig } from '@sentry/nextjs';
// export default withSentryConfig(nextConfig, { ... });