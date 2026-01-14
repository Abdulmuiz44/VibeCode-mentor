'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatBubble from '@/components/ChatBubble';
import { SavedBlueprint } from '@/types/blueprint';
import { getBlueprintsFromCloud } from '@/lib/supabaseDB';
import { Search, Plus, Trash2, ExternalLink, Loader2, Play } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'generating' | 'completed' | 'failed';
  totalFiles: number;
  technologies: string[];
  createdAt: string;
  githubUrl: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [blueprints, setBlueprints] = useState<SavedBlueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'blueprints'>('projects');
  const [searchQuery, setSearchQuery] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{ tier: 'free' | 'pro', usage: { projects: number, limit: number } } | null>(null);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/vibecode/projects?id=${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Delete error', error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    // Wait until session status is known before checking if user is logged in
    if (status === 'loading') return;

    if (!session?.user?.id) {
      router.replace('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsRes = await fetch('/api/vibecode/projects?userId=' + session.user.id);
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        // Fetch blueprints
        const blueprintsData = await getBlueprintsFromCloud(session.user.id);


        // Fetch subscription
        const subRes = await fetch('/api/vibecode/user/subscription');
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscription(subData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Manage your generated projects and blueprints</p>
          </div>
          <div className="flex items-center gap-4">
            {subscription && (
              <div className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 ${subscription.tier === 'pro' ? 'bg-purple-900/20 border-purple-500/50 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                {subscription.tier === 'pro' ? (
                  <><span>✨ Pro Plan</span><span className="text-xs opacity-70">Unlimited</span></>
                ) : (
                  <><span>Free Plan</span><span className="text-xs opacity-70">{subscription.usage.projects} / {subscription.usage.limit} Projects</span></>
                )}
              </div>
            )}
            <Link
              href={subscription && subscription.tier !== 'pro' && subscription.usage.projects >= subscription.usage.limit ? "/profile" : "/build-full-app"}
              className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${subscription && subscription.tier !== 'pro' && subscription.usage.projects >= subscription.usage.limit
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              onClick={(e) => {
                if (subscription && subscription.tier !== 'pro' && subscription.usage.projects >= subscription.usage.limit) {
                  e.preventDefault();
                  router.push('/profile'); // Redirect to upgrade
                }
              }}
            >
              {subscription && subscription.tier !== 'pro' && subscription.usage.projects >= subscription.usage.limit ? (
                'Limit Reached'
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  New Project
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-800 pb-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-1 font-semibold transition-all border-b-2 ${activeTab === 'projects'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('blueprints')}
              className={`pb-1 font-semibold transition-all border-b-2 ${activeTab === 'blueprints'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
            >
              Blueprints ({blueprints.length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-full md:w-64"
            />
          </div>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            {filteredProjects.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {searchQuery ? 'No projects found' : 'No Projects Yet'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery ? 'Try a different search term' : 'Generate your first full-stack application'}
                </p>
                {!searchQuery && (
                  <Link
                    href="/build-full-app"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Generate Project
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1 pr-8">
                        {project.name}
                      </h3>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Delete Project"
                        disabled={deletingId === project.id}
                      >
                        {deletingId === project.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{project.description}</p>

                    {/* Status & Tech */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${project.status === 'completed'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : project.status === 'generating'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                      >
                        {project.status === 'generating' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      {project.technologies.slice(0, 3).map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-800 text-gray-500 text-xs rounded border border-gray-700">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-3">
                        {/* Preview Link (if applicable - currently we just link to project page where preview is) */}
                        {/* GitHub Link */}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="View on GitHub"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blueprints Tab */}
        {activeTab === 'blueprints' && (
          <div>
            {blueprints.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-white mb-2">No Blueprints Yet</h3>
                <p className="text-gray-400 mb-6">Create your first blueprint with VibeCode Mentor</p>
                <Link
                  href="/mentor"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create Blueprint
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprints.map(blueprint => (
                  <div
                    key={blueprint.id}
                    onClick={() => router.push('/blueprints')}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded">
                            Blueprint
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(blueprint.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                          {blueprint.vibe}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {blueprint.blueprint.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ChatBubble />
    </div>
  );
}
