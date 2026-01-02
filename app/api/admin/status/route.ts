import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabase.server';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/status
 * Returns current user's admin and pro status
 * Checks email directly for admin access
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        {
          isAdmin: false,
          isPro: false,
          hasUnlimitedGenerations: false,
          hasUnlimitedExports: false,
        },
        { status: 200 }
      );
    }

    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized');
      return NextResponse.json(
        {
          isAdmin: false,
          isPro: false,
          hasUnlimitedGenerations: false,
          hasUnlimitedExports: false,
        },
        { status: 200 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Get user data from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('is_admin, is_pro, has_unlimited_generations, has_unlimited_exports, email')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user from database:', error);
      // Fallback: check if email matches ADMIN_EMAIL env variable
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && userEmail?.toLowerCase() === adminEmail.toLowerCase()) {
        return NextResponse.json(
          {
            isAdmin: true,
            isPro: true,
            hasUnlimitedGenerations: true,
            hasUnlimitedExports: true,
            email: userEmail,
            message: 'Admin detected from environment variable',
          },
          { status: 200 }
        );
      }
      
      // Not admin, might still be pro
      return NextResponse.json(
        {
          isAdmin: false,
          isPro: false,
          hasUnlimitedGenerations: false,
          hasUnlimitedExports: false,
        },
        { status: 200 }
      );
    }

    // User found in database
    if (user) {
      const isAdmin = user.is_admin === true;
      const isPro = user.is_pro === true;

      return NextResponse.json(
        {
          isAdmin,
          isPro: isPro || isAdmin, // Admins are always pro
          hasUnlimitedGenerations: user.has_unlimited_generations === true || isAdmin,
          hasUnlimitedExports: user.has_unlimited_exports === true || isAdmin,
          email: user.email,
        },
        { status: 200 }
      );
    }

    // User not in database, check if this is the admin email
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && userEmail?.toLowerCase() === adminEmail.toLowerCase()) {
      return NextResponse.json(
        {
          isAdmin: true,
          isPro: true,
          hasUnlimitedGenerations: true,
          hasUnlimitedExports: true,
          email: userEmail,
          message: 'Admin detected - user not yet in database',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        isAdmin: false,
        isPro: false,
        hasUnlimitedGenerations: false,
        hasUnlimitedExports: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/status:', error);
    return NextResponse.json(
      {
        isAdmin: false,
        isPro: false,
        hasUnlimitedGenerations: false,
        hasUnlimitedExports: false,
        error: 'Failed to fetch admin status',
      },
      { status: 200 } // Return 200 with false status to avoid blocking the UI
    );
  }
}
