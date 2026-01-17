'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function NextAuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={60} // Refetch session every 60 seconds
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      {children}
    </SessionProvider>
  );
}
