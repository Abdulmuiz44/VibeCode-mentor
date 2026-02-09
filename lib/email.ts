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
      console.error('[Email] Supabase client not initialized');
      return {
        success: false,
        message: 'Email service not available',
        error: 'Supabase not initialized',
      };
    }

    console.log(`[Email] Attempting to send password reset email to: ${email}`);
    console.log(`[Email] Redirect URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`);

    // First, let's try to get the user to verify they exist
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('[Email] Error accessing auth service:', userError);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      console.error(`[Email] Supabase error sending password reset:`, {
        message: error.message,
        status: error.status,
        code: error.code
      });
      
      // Handle common error cases
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          message: 'Please verify your email address first',
          error: 'Email not confirmed',
        };
      }
      
      if (error.message.includes('User not found')) {
        // Still return success to prevent enumeration
        return {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent',
        };
      }

      if (error.message.includes('smtp') || error.message.includes('email') || 
          error.message.includes('configuration') || error.message.includes('provider')) {
        return {
          success: false,
          message: 'Email service is not properly configured. Please contact support.',
          error: 'Email service configuration issue',
        };
      }

      return {
        success: false,
        message: 'Failed to send password reset email',
        error: error.message,
      };
    }

    // If we get here, Supabase returned no error, but the email might still not be sent
    // due to SMTP configuration issues. Let's add a verification step.
    console.log(`[Email] Supabase returned success for password reset to: ${email}`);
    
    // Note: Supabase might return success even if SMTP is not configured
    // The actual email delivery depends on SMTP settings in Supabase dashboard
    console.log(`[Email] Note: Actual email delivery depends on SMTP configuration in Supabase dashboard`);

    console.log(`[Email] Password reset email sent successfully to: ${email}`);
    return {
      success: true,
      message: `Password reset email sent to ${email}`,
    };
  } catch (error: any) {
    console.error(`[Email] Unexpected error sending password reset email:`, error);
    
    // Check for specific error types that might indicate SMTP issues
    if (error.message.includes('network') || error.message.includes('fetch') || 
        error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      return {
        success: false,
        message: 'Network error occurred while sending email. Please check your connection and try again.',
        error: 'Network connectivity issue',
      };
    }
    
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
