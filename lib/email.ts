/**
 * Email Service Handler
 * Manages email operations via Supabase Auth
 */

import { supabase } from '@/lib/supabase';

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Send verification email
 * Used when user manually requests a new verification link
 */
export async function resendVerificationEmail(email: string): Promise<EmailVerificationResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        message: 'Email service not available',
        error: 'Supabase not initialized',
      };
    }

    console.log(`[Email] Resending verification email to: ${email}`);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      console.error(`[Email] Failed to resend verification: ${error.message}`);
      return {
        success: false,
        message: 'Failed to send verification email',
        error: error.message,
      };
    }

    console.log(`[Email] Verification email sent successfully to: ${email}`);
    return {
      success: true,
      message: `Verification email sent to ${email}`,
    };
  } catch (error: any) {
    console.error(`[Email] Error sending verification email:`, error);
    return {
      success: false,
      message: 'Error sending verification email',
      error: error.message,
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<EmailVerificationResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        message: 'Email service not available',
        error: 'Supabase not initialized',
      };
    }

    console.log(`[Email] Sending password reset email to: ${email}`);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      console.error(`[Email] Failed to send password reset: ${error.message}`);
      return {
        success: false,
        message: 'Failed to send password reset email',
        error: error.message,
      };
    }

    console.log(`[Email] Password reset email sent successfully to: ${email}`);
    return {
      success: true,
      message: `Password reset email sent to ${email}`,
    };
  } catch (error: any) {
    console.error(`[Email] Error sending password reset email:`, error);
    return {
      success: false,
      message: 'Error sending password reset email',
      error: error.message,
    };
  }
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    if (!supabase) return false;

    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !user) {
      return false;
    }

    return user.email_confirmed_at !== null;
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
}

/**
 * Mark email as verified (admin only)
 */
export async function markEmailAsVerified(userId: string): Promise<EmailVerificationResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        message: 'Service not available',
        error: 'Supabase not initialized',
      };
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      return {
        success: false,
        message: 'Failed to verify email',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error verifying email',
      error: error.message,
    };
  }
}

/**
 * Send magic link (passwordless login)
 */
export async function sendMagicLink(email: string): Promise<EmailVerificationResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        message: 'Email service not available',
        error: 'Supabase not initialized',
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        message: 'Failed to send magic link',
        error: error.message,
      };
    }

    return {
      success: true,
      message: `Magic link sent to ${email}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error sending magic link',
      error: error.message,
    };
  }
}

/**
 * Verify OTP token (from email link)
 */
export async function verifyEmailOtp(
  email: string,
  token: string,
  type: any = 'email'
): Promise<EmailVerificationResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        message: 'Service not available',
        error: 'Supabase not initialized',
      };
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      return {
        success: false,
        message: 'Invalid or expired token',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error verifying token',
      error: error.message,
    };
  }
}
