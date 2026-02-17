'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getBlueprintsFromCloud } from '@/lib/supabaseDB';
import BlueprintOutput from '@/components/BlueprintOutput';
import ChatBubble from '@/components/ChatBubble';
import { SavedBlueprint } from '@/types/blueprint';

export default function BlueprintPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const blueprintId = params.blueprintId as string;
  const [blueprint, setBlueprint] = useState<SavedBlueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth');
      return;
    }

    if (!user?.id || !blueprintId) return;

    const loadBlueprint = async () => {
      try {
        setLoading(true);
        setError('');

        const blueprints = await getBlueprintsFromCloud(user.id);
        const found = blueprints.find(b => String(b.id) === blueprintId);

        if (!found) {
          setError('Blueprint not found');
          return;
        }

        setBlueprint(found);
      } catch (err) {
        console.error('Error loading blueprint:', err);
        setError('Failed to load blueprint');
      } finally {
        setLoading(false);
      }
    };

    loadBlueprint();
  }, [user?.id, blueprintId, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-500">Loading blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || 'Blueprint not found'}
          </h1>
          <button
            onClick={() => router.push('/build')}
            className="px-6 py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-colors"
          >
            Back to Build
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        {/* Back button */}
        <button
          onClick={() => router.push('/build')}
          className="mb-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Build
        </button>

        {/* Blueprint info header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{blueprint.vibe}</h1>
          <p className="text-gray-500">
            {new Date(blueprint.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Blueprint content */}
        <BlueprintOutput
          blueprint={blueprint.blueprint}
          projectIdea={blueprint.vibe}
          blueprintId={blueprintId}
        />
      </div>

      <ChatBubble />
    </main>
  );
}
