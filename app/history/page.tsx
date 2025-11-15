'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedBlueprints, deleteSavedBlueprint, exportBlueprintJSON } from '@/utils/localStorage';
import { SavedBlueprint } from '@/types/blueprint';

export default function HistoryPage() {
  const [saves, setSaves] = useState<SavedBlueprint[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadedSaves = getSavedBlueprints();
    setSaves(loadedSaves.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const handleLoad = (save: SavedBlueprint) => {
    // Store in sessionStorage to prefill on home page
    sessionStorage.setItem('loadedBlueprint', JSON.stringify(save));
    router.push('/');
  };

  const handleExport = (save: SavedBlueprint) => {
    exportBlueprintJSON(save);
    showToastMessage('Want GitHub export? Pro coming soon.');
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this blueprint?')) {
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
          <p className="text-gray-400 text-lg">
            Your blueprint history • {saves.length} saved
          </p>
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
                    title="Export JSON"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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
      </div>
    </main>
  );
}
