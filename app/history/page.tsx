'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedBlueprints, deleteSavedBlueprint, exportBlueprintJSON } from '@/utils/localStorage';
import { SavedBlueprint } from '@/types/blueprint';
import { getProStatus, FREE_SAVE_LIMIT } from '@/utils/pro';
import { exportToGitHubGist } from '@/utils/github';
import { useSession } from 'next-auth/react';
import { getBlueprintsFromCloud, deleteBlueprintFromCloud, saveBlueprintToCloud } from '@/lib/firebase';
import ChatBubble from '@/components/ChatBubble';

export default function HistoryPage() {
  const [saves, setSaves] = useState<SavedBlueprint[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<SavedBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'syncing'>('local');
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    loadBlueprints();
    // Get Pro status from local storage for now
    const proStatus = getProStatus();
    setIsPro(proStatus.isPro);
  }, [user]);

  const loadBlueprints = async () => {
    setSyncing(true);
    setSyncStatus('syncing');
    
    try {
      if (user) {
        // Load from cloud
        const cloudBlueprints = await getBlueprintsFromCloud(user.id);
        setSaves(cloudBlueprints.sort((a, b) => b.timestamp - a.timestamp));
        setSyncStatus('synced');
      } else {
        // Load from local storage
        const localSaves = getSavedBlueprints();
        setSaves(localSaves.sort((a, b) => b.timestamp - a.timestamp));
        setSyncStatus('local');
      }
    } catch (error) {
      console.error('Error loading blueprints:', error);
      // Fallback to local
      const localSaves = getSavedBlueprints();
      setSaves(localSaves.sort((a, b) => b.timestamp - a.timestamp));
      setSyncStatus('local');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpgradeToPro = async () => {
    const email = prompt('Enter your email for Pro subscription:');
    if (!email) return;

    setCheckoutLoading(true);
    try {
      // Store email for after payment
      localStorage.setItem('checkout-email', email);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: email.split('@')[0] }),
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        // Redirect to Flutterwave checkout
        window.location.href = data.checkoutUrl;
      } else {
        showToastMessage('Failed to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showToastMessage('Error starting checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLoad = (save: SavedBlueprint) => {
    // Store in sessionStorage to prefill on home page
    sessionStorage.setItem('loadedBlueprint', JSON.stringify(save));
    router.push('/');
  };

  const handleExport = (save: SavedBlueprint) => {
    if (isPro) {
      setSelectedBlueprint(save);
      setShowGitHubModal(true);
    } else {
      exportBlueprintJSON(save);
      showToastMessage('Upgrade to Pro for GitHub export!');
    }
  };

  const handleGitHubExport = async () => {
    if (!githubToken || !selectedBlueprint) return;

    setLoading(true);
    try {
      const gistUrl = await exportToGitHubGist(selectedBlueprint, githubToken);
      showToastMessage('Exported to GitHub Gist!');
      setShowGitHubModal(false);
      setGithubToken('');
      
      // Open gist in new tab
      window.open(gistUrl, '_blank');
    } catch (error) {
      console.error('GitHub export error:', error);
      showToastMessage('Failed to export to GitHub. Check your token.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this blueprint?')) {
      // Delete from cloud if logged in
      if (user) {
        await deleteBlueprintFromCloud(user.id, id);
      }
      // Delete from local
      deleteSavedBlueprint(id);
      setSaves(saves.filter(s => s.id !== id));
      showToastMessage('Blueprint deleted');
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Saved Blueprints
          </h1>
          <div className="flex items-center justify-center gap-3">
            <p className="text-gray-400 text-lg">
              Your blueprint history • {saves.length} saved {!isPro && `(${FREE_SAVE_LIMIT} max on free)`}
            </p>
            {syncStatus === 'synced' && user && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-600/50 rounded text-xs text-green-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Synced
              </span>
            )}
            {syncStatus === 'local' && !user && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 border border-gray-600/50 rounded text-xs text-gray-400">
                Local only
              </span>
            )}
          </div>
          
          {/* Pro Upgrade Button */}
          {!isPro && (
            <div className="mt-6">
              <button
                onClick={handleUpgradeToPro}
                disabled={checkoutLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
              >
                {checkoutLoading ? 'Loading...' : '✨ Upgrade to Pro - $5/month'}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Unlock unlimited saves + GitHub export
              </p>
            </div>
          )}

          {/* Pro Active Badge */}
          {isPro && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-full">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-purple-300 font-semibold">Pro Active</span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {saves.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">No saves yet</h2>
            <p className="text-gray-500 mb-6">Generate a blueprint to get started!</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Generate Blueprint
            </button>
          </div>
        )}

        {/* Blueprints Grid */}
        {saves.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saves.map((save) => (
              <div
                key={save.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
              >
                {/* Vibe Title */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {save.vibe}
                </h3>

                {/* Timestamp */}
                <p className="text-sm text-gray-500 mb-4">
                  {formatDate(save.timestamp)}
                </p>

                {/* Preview */}
                <div className="bg-black border border-gray-800 rounded p-3 mb-4 max-h-32 overflow-hidden">
                  <p className="text-xs text-gray-400 font-mono line-clamp-4">
                    {save.blueprint.substring(0, 200)}...
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoad(save)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleExport(save)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    title={isPro ? "Export to GitHub" : "Export JSON"}
                  >
                    {isPro ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(save.id)}
                    className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GitHub Token Modal */}
        {showGitHubModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Export to GitHub Gist</h3>
              <p className="text-gray-400 text-sm mb-4">
                Enter your GitHub Personal Access Token with &apos;gist&apos; scope.
                <a 
                  href="https://github.com/settings/tokens/new?scopes=gist&description=VibeCode%20Mentor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 ml-1"
                >
                  Create one here →
                </a>
              </p>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleGitHubExport}
                  disabled={!githubToken || loading}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Exporting...' : 'Export to Gist'}
                </button>
                <button
                  onClick={() => {
                    setShowGitHubModal(false);
                    setGithubToken('');
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      <ChatBubble />
    </main>
  );
}
