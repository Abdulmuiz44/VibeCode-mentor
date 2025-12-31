'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useProStatus } from '@/hooks/useProStatus';
import { useProUpgradeModal } from '@/components/ProUpgradeModal';

interface BuildFullAppButtonProps {
  blueprint: string;
  projectIdea: string;
}

export default function BuildFullAppButton({ blueprint, projectIdea }: BuildFullAppButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isPro } = useProStatus();
  const { openUpgradeModal } = useProUpgradeModal();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuildFullApp = async () => {
    // If not pro, show upgrade modal
    if (!isPro) {
      // Store blueprint for after upgrade
      sessionStorage.setItem(
        'blueprintToBuild',
        JSON.stringify({
          projectIdea,
          blueprint,
          timestamp: Date.now(),
        })
      );
      
      openUpgradeModal({
        source: 'build_full_app',
      });
      
      // User will need to click button again after upgrading
      // Pro status will update and startBuild will execute
      return;
    }

    // If already pro, start build immediately
    startBuild();
  };

  const startBuild = async () => {
    if (!session?.user?.id) {
      return;
    }

    setIsLoading(true);

    try {
      // Store blueprint in sessionStorage for the build page
      sessionStorage.setItem(
        'blueprintToBuild',
        JSON.stringify({
          projectIdea,
          blueprint,
          timestamp: Date.now(),
        })
      );

      // Redirect to the build generation page
      router.push('/build-full-app');
    } catch (error) {
      console.error('Failed to start build:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.id) {
    return null; // Don't show button if not logged in
  }

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🚀</span> Ready to Build?
          </h3>
          <p className="text-gray-300 text-sm mt-1">
            Let VibeCode Mentor build the complete production-ready app from this blueprint
          </p>
          {!isPro && (
            <p className="text-purple-300 text-xs mt-2">
              ⭐ Pro feature - Upgrade to unlock full app generation with GitHub integration
            </p>
          )}
        </div>
        <button
          onClick={handleBuildFullApp}
          disabled={isLoading}
          className={`px-8 py-3 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            isPro
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting...
            </>
          ) : (
            <>
              <span>Build Full App</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
