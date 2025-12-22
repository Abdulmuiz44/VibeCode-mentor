'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuthRedirect() {
  const { data: session } = useSession();
  const router = useRouter();

  const redirect = useCallback((targetPath: string) => {
    if (session?.user) {
      // User is authenticated, redirect directly
      router.push(targetPath);
    } else {
      // User is not authenticated, redirect to login with returnTo
      router.push(`/auth?returnTo=${encodeURIComponent(targetPath)}`);
    }
  }, [session?.user, router]);

  return redirect;
}

// Helper function to redirect to /build
export function useRedirectToBuild() {
  const redirect = useAuthRedirect();
  return useCallback(() => redirect('/build'), [redirect]);
}
