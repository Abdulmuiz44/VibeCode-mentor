import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import {
  isAdminUser,
  grantAdminPrivileges,
  removeAdminPrivileges,
  listAdminUsers,
} from '@/lib/admin/adminManager';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/manage
 * Admin-only endpoint to grant/remove admin privileges
 *
 * Body:
 * - action: 'grant' | 'remove' | 'list'
 * - targetUserId: string (for grant/remove actions)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Not authenticated' },
        { status: 401 }
      );
    }

    // Verify user is an admin
    const isAdmin = await isAdminUser(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Not an admin user' },
        { status: 403 }
      );
    }

    const { action, targetUserId } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'grant': {
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'Missing required field: targetUserId' },
            { status: 400 }
          );
        }

        const result = await grantAdminPrivileges(session.user.id, targetUserId);
        if (!result) {
          return NextResponse.json(
            { error: 'Failed to grant admin privileges' },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            message: `Admin privileges granted to user ${targetUserId}`,
            user: result,
          },
          { status: 200 }
        );
      }

      case 'remove': {
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'Missing required field: targetUserId' },
            { status: 400 }
          );
        }

        const success = await removeAdminPrivileges(
          session.user.id,
          targetUserId
        );
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to remove admin privileges' },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            message: `Admin privileges removed from user ${targetUserId}`,
          },
          { status: 200 }
        );
      }

      case 'list': {
        const admins = await listAdminUsers();
        return NextResponse.json(
          {
            success: true,
            adminUsers: admins,
            count: admins.length,
          },
          { status: 200 }
        );
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/admin/manage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/manage?action=list
 * Get list of all admin users
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Not authenticated' },
        { status: 401 }
      );
    }

    // Verify user is an admin
    const isAdmin = await isAdminUser(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Not an admin user' },
        { status: 403 }
      );
    }

    const admins = await listAdminUsers();
    return NextResponse.json(
      {
        success: true,
        adminUsers: admins,
        count: admins.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/manage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
