'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, getBlueprintsFromCloud, syncLocalToCloud, getProStatusFromCloud, setProStatusInCloud } from '@/lib/firebase';
import { getSavedBlueprints } from '@/utils/localStorage';
import { getProStatus, setProStatus as setLocalProStatus } from '@/utils/pro';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  const refreshProStatus = async () => {
    if (user) {
      const cloudProStatus = await getProStatusFromCloud(user.uid);
      setIsPro(cloudProStatus);
      
      // Sync with local storage
      if (cloudProStatus) {
        setLocalProStatus(user.email || '', user.uid);
      }
    } else {
      // Check local storage if not logged in
      const localStatus = getProStatus();
      setIsPro(localStatus.isPro);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // User logged in
        console.log('User logged in:', user.email);
        
        // Sync local blueprints to cloud
        const localBlueprints = getSavedBlueprints();
        if (localBlueprints.length > 0) {
          await syncLocalToCloud(user.uid, localBlueprints);
        }
        
        // Get Pro status from cloud
        const cloudProStatus = await getProStatusFromCloud(user.uid);
        setIsPro(cloudProStatus);
        
        // Sync with local storage
        if (cloudProStatus) {
          setLocalProStatus(user.email || '', user.uid);
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
      } else {
        // User logged out - check local Pro status
        const localStatus = getProStatus();
        setIsPro(localStatus.isPro);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hasShownWelcome]);

  return (
    <AuthContext.Provider value={{ user, loading, isPro, refreshProStatus }}>
      {children}
    </AuthContext.Provider>
  );
}
