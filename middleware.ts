import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Redirect all users from root path to /landing
    const isRootPath = req.nextUrl.pathname === '/';

    if (isRootPath) {
      return NextResponse.redirect(new URL('/landing', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true to allow the middleware function to execute
        // We handle the specific redirect logic inside the middleware function
        return true;
      },
    },
  }
);

export const config = {
  // Run middleware on the root path to handle the redirect
  matcher: ['/'],
};
