'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import BlueprintOutput from '@/components/BlueprintOutput';
import ChatBubble from '@/components/ChatBubble';

export default function Home() {
  const { user } = useAuth();
  const [projectIdea, setProjectIdea] = useState('');
  const [blueprint, setBlueprint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load blueprint from history if available
  useEffect(() => {
    const loadedData = sessionStorage.getItem('loadedBlueprint');
    if (loadedData) {
      try {
        const parsed = JSON.parse(loadedData);
        setProjectIdea(parsed.vibe);
        setBlueprint(parsed.blueprint);
        sessionStorage.removeItem('loadedBlueprint');
      } catch (err) {
        console.error('Failed to load blueprint:', err);
      }
    }

    // Check for selected prompt from Prompts page
    const selectedPrompt = sessionStorage.getItem('selectedPrompt');
    if (selectedPrompt) {
      setProjectIdea(selectedPrompt);
      sessionStorage.removeItem('selectedPrompt');
      // Auto-scroll to textarea
      setTimeout(() => {
        document.getElementById('projectIdea')?.focus();
      }, 100);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectIdea.trim()) {
      setError('Please enter a project idea');
      return;
    }

    setLoading(true);
    setError('');
    setBlueprint('');

    try {
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectIdea,
          userId: user?.uid || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle rate limit error with special toast
        if (response.status === 429) {
          setError(errorData.message || 'Rate limit exceeded. Upgrade to Pro for unlimited generations!');
        } else {
          throw new Error(errorData.error || 'Failed to generate blueprint');
        }
        return;
      }

      const data = await response.json();
      setBlueprint(data.blueprint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            VibeCode Mentor
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Transform your ideas into production-ready blueprints with AI
          </p>
          
          {/* Quick Tips for Developers */}
          <div className="max-w-3xl mx-auto mt-8 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-300 mb-2 font-medium">💡 Pro Tips for Best Results:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Specify your tech stack</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Mention key features</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Include user roles if any</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="projectIdea" className="block text-sm font-medium text-gray-300 mb-2">
                Describe your project idea
              </label>
              <textarea
                id="projectIdea"
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="E.g., Build a real-time chat app with React, WebSockets, and MongoDB..."
                className="w-full h-40 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-white placeholder-gray-500 transition"
                disabled={loading}
              />
              
              {/* Quick Example Buttons */}
              {!projectIdea && !blueprint && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <p className="text-xs text-gray-500 w-full mb-1">Quick examples:</p>
                  <button
                    type="button"
                    onClick={() => setProjectIdea('Build a REST API backend with authentication, database, and deployment guide')}
                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
                  >
                    🔧 REST API
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectIdea('Create a SaaS application with user authentication, subscription billing, and admin dashboard')}
                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
                  >
                    🚀 SaaS App
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectIdea('Build a Chrome extension with React, background workers, and content scripts')}
                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
                  >
                    🧩 Chrome Extension
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectIdea('Create a CLI tool with interactive prompts, file operations, and npm publishing')}
                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
                  >
                    💻 CLI Tool
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Blueprint...
                </span>
              ) : (
                'Generate Blueprint'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Output */}
        {blueprint && <BlueprintOutput blueprint={blueprint} projectIdea={projectIdea} />}

        {/* AI Chat Assistant */}
        <ChatBubble blueprintContext={blueprint} />
      </div>
    </main>
  );
}
