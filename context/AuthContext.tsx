'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getBlueprintsFromCloud, syncLocalToCloud, getProStatusFromCloud } from '@/lib/firebase';
import { getSavedBlueprints } from '@/utils/localStorage';
import { getProStatus, setProStatus as setLocalProStatus } from '@/utils/pro';

interface User {
  id: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  refreshProStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPro: false,
  refreshProStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  const loading = status === 'loading';

  const refreshProStatus = async () => {
    if (user) {
      const cloudProStatus = await getProStatusFromCloud(user.id);
      setIsPro(cloudProStatus);
      
      // Sync with local storage
      if (cloudProStatus) {
        setLocalProStatus(user.email || '', user.id);
      }
    } else {
      // Check local storage if not logged in
      const localStatus = getProStatus();
      setIsPro(localStatus.isPro);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const nextAuthUser: User = {
        id: session.user.id,
        email: session.user.email || null,
        name: session.user.name || null,
        image: session.user.image || null,
      };
      setUser(nextAuthUser);

      // Sync local blueprints to cloud
      const syncData = async () => {
        const localBlueprints = getSavedBlueprints();
        if (localBlueprints.length > 0) {
          await syncLocalToCloud(nextAuthUser.id, localBlueprints);
        }
        
        // Get Pro status from cloud
        const cloudProStatus = await getProStatusFromCloud(nextAuthUser.id);
        setIsPro(cloudProStatus);
        
        // Sync with local storage
        if (cloudProStatus) {
          setLocalProStatus(nextAuthUser.email || '', nextAuthUser.id);
        }
        
        // Check if this is first login (cloud Pro status exists but local doesn't)
        const localProStatus = getProStatus();
        if (cloudProStatus && !localProStatus.isPro && !hasShownWelcome) {
          // Show welcome message
          setTimeout(() => {
            alert('Welcome back! Your Pro subscription is active and your saves are synced.');
          }, 500);
          setHasShownWelcome(true);
        } else if (!hasShownWelcome && localBlueprints.length > 0) {
          // First time login with local saves
          setTimeout(() => {
            alert('Welcome! Your saves are now safe in the cloud.');
          }, 500);
          setHasShownWelcome(true);
        }
      };

      syncData();
    } else if (status === 'unauthenticated') {
      setUser(null);
      // Check local Pro status
      const localStatus = getProStatus();
      setIsPro(localStatus.isPro);
    }
  }, [session, status, hasShownWelcome]);

  return (
    <AuthContext.Provider value={{ user, loading, isPro, refreshProStatus }}>
      {children}
    </AuthContext.Provider>
  );
}
