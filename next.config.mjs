/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude backend directory from webpack bundling
    config.externals.push(({ context, request }, callback) => {
      if (request && request.startsWith('./backend')) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
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