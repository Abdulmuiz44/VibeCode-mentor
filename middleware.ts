import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Redirect non-www to www
  const host = req.headers.get('host') || '';
  
  if (host === 'vibecodementor.app') {
    return NextResponse.redirect(
      `https://www.vibecodementor.app${req.nextUrl.pathname}${req.nextUrl.search}`,
      { status: 301 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
