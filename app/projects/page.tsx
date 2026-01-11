'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const githubConnected = searchParams.get('github_connected');
  const error = searchParams.get('error');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth?returnTo=/projects');
      return;
    }

    // If GitHub was just connected, redirect to hub
    if (githubConnected === 'true') {
      router.replace('/hub');
      return;
    }

    // If there's an error, show it but redirect to hub after a delay
    if (error) {
      setTimeout(() => {
        router.replace('/hub');
      }, 3000);
      return;
    }

    // Default: redirect to hub
    router.replace('/hub');
  }, [status, githubConnected, error, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg">
            <p className="text-red-400">Error: {decodeURIComponent(error)}</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to projects...</p>
          </div>
        )}
        {githubConnected === 'true' && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600/50 rounded-lg">
            <p className="text-green-400">GitHub connected successfully!</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to projects...</p>
          </div>
        )}
        {!error && githubConnected !== 'true' && (
          <p className="text-gray-400">Loading...</p>
        )}
      </div>
    </div>
  );
}
