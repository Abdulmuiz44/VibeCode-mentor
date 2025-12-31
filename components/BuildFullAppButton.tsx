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
    <div className={`mt-8 p-6 rounded-lg border ${
      isPro
        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50'
        : 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50'
    }`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{isPro ? '🚀' : '⭐'}</span> {isPro ? 'Start Building Your App' : 'Upgrade to Build Full Apps'}
          </h3>
          <p className="text-gray-300 text-sm mt-2">
            {isPro 
              ? 'Generate a complete production-ready application with auto-generated code, database schema, and GitHub integration'
              : 'Unlock full app generation with production-ready code, database migrations, and GitHub integration'
            }
          </p>
          {!isPro && (
            <div className="mt-3 p-3 bg-orange-900/30 border border-orange-700/50 rounded text-orange-300 text-xs">
              <p className="font-semibold mb-1">Pro features included:</p>
              <ul className="space-y-1">
                <li>✓ Full app code generation</li>
                <li>✓ Database schema & migrations</li>
                <li>✓ Automatic GitHub repository creation</li>
                <li>✓ Production-ready deployment setup</li>
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={handleBuildFullApp}
          disabled={isLoading}
          className={`px-8 py-3 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            isPro
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isPro ? 'Starting...' : 'Upgrading...'}
            </>
          ) : (
            <>
              <span>{isPro ? 'Build Full App' : 'Upgrade to Pro'}</span>
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
