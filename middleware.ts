import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // No redirects needed - / now shows landing page content
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true to allow the middleware function to execute
        return true;
      },
    },
  }
);

export const config = {
  matcher: [],
};
