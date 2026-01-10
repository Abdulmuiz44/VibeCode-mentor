'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useProStatus } from '@/hooks/useProStatus';
import { useProUpgradeModal } from '@/components/ProUpgradeModal';
import GitHubConnectionModal from './GitHubConnectionModal';

interface BuildFullAppButtonProps {
  blueprint: string;
  projectIdea: string;
  blueprintId?: string;
}

export default function BuildFullAppButton({ blueprint, projectIdea, blueprintId }: BuildFullAppButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isPro } = useProStatus();
  const { openUpgradeModal } = useProUpgradeModal();
  const [isLoading, setIsLoading] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  const handleBuildFullApp = async () => {
    // 1. Check for logged in session
    if (!session?.user?.id) {
      router.push('/auth');
      return;
    }

    // 2. Check Pro status
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

    // 3. Check for GitHub connection
    try {
      const ghRes = await fetch('/api/vibecode/github/check');
      const ghData = await ghRes.json();
      if (!ghData.connected) {
        setShowGitHubModal(true);
        return;
      }
    } catch (err) {
      console.error("Failed to check GitHub status:", err);
    }

    // If already pro and connected, start build immediately
    startBuild();
  };

  const startBuild = async () => {
    if (!session?.user?.id) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the promotion API
      const response = await fetch('/api/vibecode/projects/create-from-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectIdea,
          blueprint,
          blueprintId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to convert blueprint to project');
      }

      const { projectId } = await response.json();

      // Redirect to the project chat
      router.push(`/projects/${projectId}`);
    } catch (error: any) {
      console.error('Failed to start build:', error);
      alert(error.message || 'Failed to start building. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.id) {
    return null; // Don't show button if not logged in
  }

  return (
    <div className={`mt-8 p-6 rounded-lg border ${isPro
      ? 'bg-gray-800 border-gray-700'
      : 'bg-gray-800 border-gray-700'
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
            <div className="mt-3 p-3 bg-gray-700 border border-gray-600 rounded text-gray-300 text-xs">
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
          className={`px-8 py-3 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${isPro
            ? 'bg-black hover:bg-gray-800 text-white border border-gray-700'
            : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
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
      <GitHubConnectionModal
        isOpen={showGitHubModal}
        onClose={() => {
          setShowGitHubModal(false);
          // Even if they skip, we allow them to proceed (it will just fail to push or show warning)
          startBuild();
        }}
        onConnected={() => {
          setShowGitHubModal(false);
          startBuild();
        }}
      />
    </div>
  );
}
