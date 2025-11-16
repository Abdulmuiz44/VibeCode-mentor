import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.startsWith('/templates') ||
    pathname.startsWith('/prompts') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Protected routes - redirect to signin if not authenticated
  const protectedPaths = [
    '/blueprint',
    '/app',
    '/dev',
    '/pro',
    '/history'
  ];

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath && !token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
