import { supabaseAdmin } from '@/lib/supabase.server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

export interface AdminUser {
  user_id: string;
  email: string;
  name?: string | null;
  is_admin: boolean;
  is_pro: boolean;
  has_unlimited_generations: boolean;
  has_unlimited_exports: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Initialize admin user on first sign-in
 * Call this in your signIn callback (authOptions.ts)
 */
export const initializeAdminUser = async (userEmail: string, userId: string, userName?: string | null): Promise<AdminUser | null> => {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return null;
  }

  // Only process if this email matches ADMIN_EMAIL
  if (!ADMIN_EMAIL || userEmail !== ADMIN_EMAIL) {
    return null;
  }

  try {
    const now = new Date().toISOString();

    // Check if user already has admin privileges
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is expected for new users
      console.error('Error fetching admin user:', fetchError);
      return null;
    }

    if (existingUser && existingUser.is_admin) {
      // Already an admin, return existing data
      return {
        user_id: existingUser.user_id,
        email: existingUser.email,
        name: existingUser.name,
        is_admin: true,
        is_pro: existingUser.is_pro,
        has_unlimited_generations: existingUser.has_unlimited_generations,
        has_unlimited_exports: existingUser.has_unlimited_exports,
        created_at: existingUser.created_at,
        updated_at: existingUser.updated_at,
      };
    }

    // Upsert as admin with full privileges
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          user_id: userId,
          email: userEmail,
          name: userName || userEmail.split('@')[0],
          is_admin: true,
          is_pro: true, // Admin gets Pro automatically
          has_unlimited_generations: true,
          has_unlimited_exports: true,
          created_at: existingUser?.created_at || now,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error initializing admin user:', error);
      return null;
    }

    console.log(`✅ Admin user initialized: ${userEmail}`);

    return {
      user_id: data.user_id,
      email: data.email,
      name: data.name,
      is_admin: data.is_admin,
      is_pro: data.is_pro,
      has_unlimited_generations: data.has_unlimited_generations,
      has_unlimited_exports: data.has_unlimited_exports,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error in initializeAdminUser:', error);
    return null;
  }
};

/**
 * Check if a user is an admin
 */
export const isAdminUser = async (userId: string): Promise<boolean> => {
  if (!supabaseAdmin) return false;

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data?.is_admin;
  } catch (error) {
    console.error('Error in isAdminUser:', error);
    return false;
  }
};

/**
 * Get admin user details
 */
export const getAdminUser = async (userId: string): Promise<AdminUser | null> => {
  if (!supabaseAdmin) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching admin user:', error);
      return null;
    }

    if (!data?.is_admin) {
      return null; // Not an admin
    }

    return {
      user_id: data.user_id,
      email: data.email,
      name: data.name,
      is_admin: data.is_admin,
      is_pro: data.is_pro,
      has_unlimited_generations: data.has_unlimited_generations,
      has_unlimited_exports: data.has_unlimited_exports,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error in getAdminUser:', error);
    return null;
  }
};

/**
 * Grant admin privileges to any user (super-admin only)
 */
export const grantAdminPrivileges = async (
  adminUserId: string,
  targetUserId: string
): Promise<AdminUser | null> => {
  if (!supabaseAdmin) return null;

  // Verify the requester is actually an admin
  const isAdmin = await isAdminUser(adminUserId);
  if (!isAdmin) {
    console.error('Unauthorized: User is not an admin');
    return null;
  }

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        is_admin: true,
        is_pro: true,
        has_unlimited_generations: true,
        has_unlimited_exports: true,
        updated_at: now,
      })
      .eq('user_id', targetUserId)
      .select()
      .single();

    if (error) {
      console.error('Error granting admin privileges:', error);
      return null;
    }

    console.log(`✅ Admin privileges granted to user: ${targetUserId}`);

    return {
      user_id: data.user_id,
      email: data.email,
      name: data.name,
      is_admin: data.is_admin,
      is_pro: data.is_pro,
      has_unlimited_generations: data.has_unlimited_generations,
      has_unlimited_exports: data.has_unlimited_exports,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error in grantAdminPrivileges:', error);
    return null;
  }
};

/**
 * Remove admin privileges from a user
 */
export const removeAdminPrivileges = async (
  adminUserId: string,
  targetUserId: string
): Promise<boolean> => {
  if (!supabaseAdmin) return false;

  // Verify the requester is an admin
  const isAdmin = await isAdminUser(adminUserId);
  if (!isAdmin) {
    console.error('Unauthorized: User is not an admin');
    return false;
  }

  // Prevent removing own admin privileges
  if (adminUserId === targetUserId) {
    console.error('Cannot remove admin privileges from yourself');
    return false;
  }

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        is_admin: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId);

    if (error) {
      console.error('Error removing admin privileges:', error);
      return false;
    }

    console.log(`✅ Admin privileges removed from user: ${targetUserId}`);
    return true;
  } catch (error) {
    console.error('Error in removeAdminPrivileges:', error);
    return false;
  }
};

/**
 * List all admin users
 */
export const listAdminUsers = async (): Promise<AdminUser[]> => {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }

    return data.map(user => ({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
      is_pro: user.is_pro,
      has_unlimited_generations: user.has_unlimited_generations,
      has_unlimited_exports: user.has_unlimited_exports,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  } catch (error) {
    console.error('Error in listAdminUsers:', error);
    return [];
  }
};
