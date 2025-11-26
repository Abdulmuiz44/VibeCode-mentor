import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Check if user is visiting the root path and is NOT authenticated
    // req.nextauth.token is populated if the user is authenticated
    const isRootPath = req.nextUrl.pathname === '/';
    const isAuthenticated = !!req.nextauth.token;

    if (isRootPath && !isAuthenticated) {
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
