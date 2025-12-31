// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Sentry initialization disabled to fix Next.js 14.2.5 build issues
// Re-enable after resolving compatibility issues

export const onRouterTransitionStart = () => {};