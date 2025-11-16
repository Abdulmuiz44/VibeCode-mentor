'use client';

import { signIn } from 'next-auth/react';

/**
 * Client-side helper to check authentication before executing an action
 * If not authenticated, redirects to sign-in page
 * @param session - The NextAuth session object
 * @param onAuthedAction - Function to execute if authenticated
 * @param callbackUrl - Optional URL to return to after sign-in
 */
export function requireAuth(
  session: any,
  onAuthedAction: () => void,
  callbackUrl?: string
) {
  if (!session) {
    // Redirect to sign-in page
    signIn('google', { 
      callbackUrl: callbackUrl || window.location.pathname 
    });
    return;
  }
  
  // User is authenticated, execute the action
  onAuthedAction();
}
