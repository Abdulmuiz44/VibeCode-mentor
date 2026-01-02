'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatBubble from '@/components/ChatBubble';
import { SavedBlueprint } from '@/types/blueprint';
import { getBlueprintsFromCloud } from '@/lib/supabaseDB';

interface Project {
  id: string;
  project_name: string;
  description: string;
  status: 'generating' | 'completed' | 'failed';
  total_files: number;
  technologies: string[];
  created_at: string;
  github_url: string | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [blueprints, setBlueprints] = useState<SavedBlueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'blueprints'>('projects');

  useEffect(() => {
    if (!session?.user?.id) {
      router.replace('/auth/signin');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsRes = await fetch('/api/projects');
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        // Fetch blueprints
        const blueprintsData = await getBlueprintsFromCloud(session.user.id);
        setBlueprints(blueprintsData);
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
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Your Dashboard
          </h1>
          <p className="text-gray-400">Manage your generated projects and blueprints</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'projects'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('blueprints')}
            className={`px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'blueprints'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Blueprints ({blueprints.length})
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
                <p className="text-gray-400 mb-6">Generate your first full-stack application</p>
                <button
                  onClick={() => router.push('/build-full-app')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  Generate Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                        {project.project_name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          project.status === 'completed'
                            ? 'bg-green-500/20 text-green-300'
                            : project.status === 'generating'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {project.status === 'completed' && '✓'}
                        {project.status === 'generating' && '⟳'}
                        {project.status === 'failed' && '✗'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {project.technologies.slice(0, 3).map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      {project.total_files} files • {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View on GitHub →
                      </a>
                    )}
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
                <button
                  onClick={() => router.push('/mentor')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  Create Blueprint
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {blueprints.map(blueprint => (
                  <div
                    key={blueprint.id}
                    onClick={() => router.push('/history')}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                          {blueprint.vibe}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-3 mb-2">
                          {blueprint.blueprint.substring(0, 200)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(blueprint.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded whitespace-nowrap ml-4">
                        Blueprint
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex gap-4 justify-center">
          <button
            onClick={() => router.push('/mentor')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            Create Blueprint
          </button>
          <button
            onClick={() => router.push('/build-full-app')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            Generate Full App
          </button>
        </div>
      </div>

      <ChatBubble />
    </div>
  );
}
