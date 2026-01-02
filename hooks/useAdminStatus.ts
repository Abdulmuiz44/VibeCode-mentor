'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface AdminStatus {
  isAdmin: boolean;
  isPro: boolean;
  hasUnlimitedGenerations: boolean;
  hasUnlimitedExports: boolean;
  loading: boolean;
}

/**
 * Hook to check if current user has admin privileges
 * Used to show admin UI, bypass rate limits, access admin dashboard, etc.
 */
export const useAdminStatus = (): AdminStatus => {
  const { data: session } = useSession();
  const [status, setStatus] = useState<AdminStatus>({
    isAdmin: false,
    isPro: false,
    hasUnlimitedGenerations: false,
    hasUnlimitedExports: false,
    loading: true,
  });

  useEffect(() => {
    if (!session?.user?.id) {
      setStatus({
        isAdmin: false,
        isPro: false,
        hasUnlimitedGenerations: false,
        hasUnlimitedExports: false,
        loading: false,
      });
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin status');
        }

        const data = await response.json();
        setStatus({
          isAdmin: data.isAdmin || false,
          isPro: data.isPro || false,
          hasUnlimitedGenerations: data.hasUnlimitedGenerations || false,
          hasUnlimitedExports: data.hasUnlimitedExports || false,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking admin status:', error);
        setStatus({
          isAdmin: false,
          isPro: false,
          hasUnlimitedGenerations: false,
          hasUnlimitedExports: false,
          loading: false,
        });
      }
    };

    checkAdminStatus();
  }, [session?.user?.id]);

  return status;
};
