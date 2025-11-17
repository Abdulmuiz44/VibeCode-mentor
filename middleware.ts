import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // For now, allow all routes (we'll implement protection in components)
        // This middleware is ready for future route-level protection
        return true;
      },
    },
  }
);

// Note: Route protection is currently handled at the component level
// If you want to protect specific routes, update the config matcher below
export const config = {
  matcher: [],
  // Example: To protect routes, uncomment and customize:
  // matcher: ['/history', '/prompts', '/api/mentor', '/api/chat'],
};
