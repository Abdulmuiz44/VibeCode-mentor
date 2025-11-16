'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { saveCustomPrompt, getCustomPrompts, deleteCustomPrompt, CustomPrompt } from '@/lib/firebase';
import ChatBubble from '@/components/ChatBubble';

interface Vibe {
  vibe: string;
  count: number;
}

export default function PromptsPage() {
  const router = useRouter();
  const { user, isPro } = useAuth();
  const [topVibes, setTopVibes] = useState<Vibe[]>([]);
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTopVibes();
    if (user && isPro) {
      fetchCustomPrompts();
    }
  }, [user, isPro]);

  const fetchTopVibes = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setTopVibes(data.vibes || []);
      }
    } catch (error) {
      console.error('Failed to fetch top vibes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomPrompts = async () => {
    if (!user) return;
    try {
      const prompts = await getCustomPrompts(user.id);
      setCustomPrompts(prompts);
    } catch (error) {
      console.error('Failed to fetch custom prompts:', error);
    }
  };

  const handleVibeClick = (vibe: string) => {
    // Store selected prompt in sessionStorage and redirect to home
    sessionStorage.setItem('selectedPrompt', vibe);
    router.push('/');
  };

  const handleSaveCustomPrompt = async () => {
    if (!user || !isPro || !newPromptTitle.trim() || !newPromptText.trim()) return;

    setSaving(true);
    try {
      const prompt: CustomPrompt = {
        id: Date.now().toString(),
        title: newPromptTitle.trim(),
        prompt: newPromptText.trim(),
        timestamp: Date.now(),
      };

      const success = await saveCustomPrompt(user.id, prompt);
      if (success) {
        setCustomPrompts([prompt, ...customPrompts]);
        setNewPromptTitle('');
        setNewPromptText('');
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to save custom prompt:', error);
      alert('Failed to save custom prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!user || !confirm('Delete this custom prompt?')) return;

    try {
      const success = await deleteCustomPrompt(user.id, promptId);
      if (success) {
        setCustomPrompts(customPrompts.filter(p => p.id !== promptId));
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            📚 Prompt Library
          </h1>
          <p className="text-gray-400">
            Browse popular project ideas or save your own custom prompts
          </p>
        </div>

        {/* Pro Users: Custom Prompts Section */}
        {user && isPro && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                ⚡ Your Custom Prompts
                <span className="text-sm bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                  Pro
                </span>
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all"
              >
                + Add Custom Prompt
              </button>
            </div>

            {customPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {customPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6 hover:border-purple-500/60 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white text-lg">{prompt.title}</h3>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{prompt.prompt}</p>
                    <button
                      onClick={() => handleVibeClick(prompt.prompt)}
                      className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-medium rounded-lg transition-all"
                    >
                      Use This Prompt →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-8 text-center mb-8">
                <p className="text-gray-400 mb-4">No custom prompts yet. Create your first one!</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all"
                >
                  + Create Custom Prompt
                </button>
              </div>
            )}
          </div>
        )}

        {/* Popular Vibes Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🔥 Top 10 Popular Vibes
            <span className="text-sm bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
              Community Favorites
            </span>
          </h2>

          {topVibes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topVibes.map((vibe, index) => (
                <div
                  key={index}
                  onClick={() => handleVibeClick(vibe.vibe)}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6 hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        #{index + 1}
                      </span>
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                        {vibe.count} uses
                      </span>
                    </div>
                  </div>
                  <p className="text-white font-medium mb-3 group-hover:text-purple-400 transition-colors">
                    {vibe.vibe}
                  </p>
                  <button className="w-full px-4 py-2 bg-gray-700 hover:bg-purple-500/30 text-gray-300 hover:text-purple-400 font-medium rounded-lg transition-all">
                    Use This Vibe →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-12 text-center">
              <p className="text-gray-400 text-lg">
                No popular vibes yet. Be the first to generate blueprints!
              </p>
            </div>
          )}
        </div>

        {/* Free User Upgrade CTA */}
        {user && !isPro && (
          <div className="mt-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Want to Save Custom Prompts?
            </h3>
            <p className="text-gray-300 mb-6">
              Upgrade to Pro to save unlimited custom prompts and access them anytime
            </p>
            <button
              onClick={() => router.push('/?pro=true')}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              Upgrade to Pro - $5/month
            </button>
          </div>
        )}

        {!user && (
          <div className="mt-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Sign In to Save Custom Prompts
            </h3>
            <p className="text-gray-300 mb-6">
              Pro users can save unlimited custom prompts and access them from anywhere
            </p>
            <p className="text-sm text-gray-400">
              Click the &quot;Sign in with Google&quot; button in the header to get started
            </p>
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      <ChatBubble />

      {/* Add Custom Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Create Custom Prompt</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt Title
                </label>
                <input
                  type="text"
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                  placeholder="E.g., E-commerce with Stripe"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt Text
                </label>
                <textarea
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="Describe your project idea in detail..."
                  className="w-full h-40 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={saving}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomPrompt}
                  disabled={saving || !newPromptTitle.trim() || !newPromptText.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Prompt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
