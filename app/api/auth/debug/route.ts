import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Only allow this in development or with admin access
    const isConfigured = {
        NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET || !!process.env.AUTH_SECRET,
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID || !!process.env.GOOGLE_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET || !!process.env.GOOGLE_SECRET,
        GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID || !!process.env.GITHUB_ID,
        GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET || !!process.env.GITHUB_SECRET,
    };

    const allConfigured = Object.values(isConfigured).every(Boolean);

    return NextResponse.json({
        ok: allConfigured,
        configured: isConfigured,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
        message: allConfigured
            ? 'All OAuth providers are configured'
            : 'Some OAuth providers are missing configuration. Check Vercel environment variables.',
    });
}
