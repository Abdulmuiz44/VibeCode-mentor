'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlueprintOutput from '@/components/BlueprintOutput';
import ChatBubble from '@/components/ChatBubble';
import { useProUpgradeModal } from '@/components/ProUpgradeModal';
import TechStackSelector, { TechStack } from '@/components/TechStackSelector';

export default function HomeClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { openUpgradeModal } = useProUpgradeModal();
  const searchParams = useSearchParams();
  const user = session?.user;
  const [projectIdea, setProjectIdea] = useState('');
  const [blueprint, setBlueprint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [techStack, setTechStack] = useState<TechStack>({
    appType: 'web',
    framework: 'nextjs',
    database: 'supabase',
    uiLibrary: 'tailwind',
    hosting: 'vercel',
    auth: 'nextauth',
  });
  const [activeMode, setActiveMode] = useState<'scratch' | 'templates'>('scratch');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        const base64 = result.split(',')[1];
        setImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth');
      return;
    }

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

    const selectedPrompt = sessionStorage.getItem('selectedPrompt');
    if (selectedPrompt) {
      setProjectIdea(selectedPrompt);
      sessionStorage.removeItem('selectedPrompt');
      setTimeout(() => {
        document.getElementById('projectIdea')?.focus();
      }, 100);
    }
  }, [router, status]);

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
          userId: user?.id || null,
          techStack,
          imageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          setError(errorData.message || 'Rate limit exceeded. Upgrade to Pro for unlimited generations!');
          openUpgradeModal({ source: 'limit_reached' });
        } else {
          throw new Error(errorData.error || 'Failed to generate blueprint');
        }
        return;
      }

      const data = await response.json();
      setBlueprint(data.blueprint);

      if (data.blueprintId) {
        router.push(`/build/${data.blueprintId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            VibeCode Mentor
          </h1>
          <p className="text-gray-400 text-lg mb-6 font-light">
            Transform your ideas into production-ready blueprints with AI
          </p>
          <div className="max-w-3xl mx-auto mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-white mb-2 font-medium">💡 Pro Tips for Best Results:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-400">
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

        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => setActiveMode('scratch')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${activeMode === 'scratch'
              ? 'bg-white text-black'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
          >
            Start from Scratch
          </button>
          <button
            onClick={() => setActiveMode('templates')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${activeMode === 'templates'
              ? 'bg-white text-black'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
          >
            Browse Templates
          </button>
        </div>

        {activeMode === 'scratch' ? (
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <TechStackSelector value={techStack} onChange={setTechStack} />

              <div>
                <label htmlFor="projectIdea" className="block text-sm font-medium text-gray-400 mb-2">
                  Describe your project idea
                </label>
                <textarea
                  id="projectIdea"
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  placeholder="E.g., Build a real-time chat app with React, WebSockets, and MongoDB..."
                  className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-white focus:border-white outline-none resize-none text-white placeholder-gray-600 transition"
                  disabled={loading}
                />
                {!projectIdea && !blueprint && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <p className="text-xs text-gray-600 w-full mb-1">Quick examples:</p>
                    <button
                      type="button"
                      onClick={() => setProjectIdea('Build a REST API backend with authentication, database, and deployment guide')}
                      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-md transition-colors border border-white/10"
                    >
                      🔧 REST API
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectIdea('Create a SaaS application with user authentication, subscription billing, and admin dashboard')}
                      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-md transition-colors border border-white/10"
                    >
                      🚀 SaaS App
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectIdea('Build a Chrome extension with React, background workers, and content scripts')}
                      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-md transition-colors border border-white/10"
                    >
                      🧩 Chrome Extension
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectIdea('Create a CLI tool with interactive prompts, file operations, and npm publishing')}
                      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-md transition-colors border border-white/10"
                    >
                      💻 CLI Tool
                    </button>
                  </div>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Reference Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="relative cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all text-sm text-gray-400 group-hover:text-white">
                      <span>📸 {selectedImage ? 'Change Image' : 'Upload Screenshot'}</span>
                    </div>
                  </label>
                  {selectedImage && (
                    <div className="relative group">
                      <Image
                        src={selectedImage}
                        alt="Reference"
                        width={40}
                        height={40}
                        className="object-cover rounded border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => { setSelectedImage(null); setImageBase64(null); }}
                        className="absolute -top-2 -right-2 bg-white text-black rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[10px] hover:bg-gray-200"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <span className="text-xs text-gray-600">
                    Upload a UI design or screenshot to guide the style.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Blueprint...
                  </span>
                ) : (
                  'Generate Blueprint'
                )}
              </button>
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                  {error}
                </div>
              )}
            </form>

            {blueprint && <BlueprintOutput blueprint={blueprint} projectIdea={projectIdea} />}

            {!blueprint && (
              <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-lg text-center">
                <h2 className="text-3xl font-bold text-white mb-3">Ready to Bring Your Idea to Life?</h2>
                <p className="text-gray-400 mb-6">Start by generating a blueprint above, then upgrade to Pro to build a full production-ready application with GitHub integration.</p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg transition-all cursor-pointer hover:bg-gray-200">
                  <span>⚡ Generate Blueprint First</span>
                </div>
              </div>
            )}
            <ChatBubble blueprintContext={blueprint} />
          </div>
        ) : (
          <div className="mb-8">
            <TemplateGallery />
          </div>
        )}
      </div>
    </main>
  );
}

function TemplateGallery() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/vibecode/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClone = async (templateId: string, templateName: string) => {
    if (!confirm(`Create a new project from ${templateName}?`)) return;

    try {
      const res = await fetch('/api/vibecode/projects/clone', {
        method: 'POST',
        body: JSON.stringify({ templateId, name: `${templateName} (Clone)` }),
      });
      if (res.ok) {
        const project = await res.json();
        router.push(`/projects/${project.id}`);
      } else {
        alert('Failed to clone template');
      }
    } catch (e) {
      console.error(e);
      alert('Error cloning template');
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading templates...</div>;

  if (templates.length === 0) return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center text-gray-500">
      No templates available yet. Check back soon!
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map(t => (
        <div key={t.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">{t.name}</h3>
          <p className="text-gray-400 text-sm mb-4 flex-1">{t.description}</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {t.technologies?.slice(0, 3).map((tech: string) => (
              <span key={tech} className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded border border-white/10">{tech}</span>
            ))}
          </div>
          <button
            onClick={() => handleClone(t.id, t.name)}
            className="w-full py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
          >
            Use Template
          </button>
        </div>
      ))}
    </div>
  );
}
