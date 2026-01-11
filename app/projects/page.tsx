'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ChatBubble from '@/components/ChatBubble';

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

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const githubConnected = searchParams.get('github_connected');
  const error = searchParams.get('error');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth?returnTo=/projects');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchProjects();
    }
  }, [status, session, router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/vibecode/projects?userId=${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Success/Error Messages */}
        {githubConnected === 'true' && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600/50 rounded-lg">
            <p className="text-green-400">GitHub connected successfully!</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg">
            <p className="text-red-400">Error: {decodeURIComponent(error)}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-gray-400">Manage and collaborate on your projects</p>
          </div>
          <Link
            href="/projects/new"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            + New Project
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading projects...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto text-gray-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-6">Create your first project to get started</p>
            <Link
              href="/projects/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              Create Project
            </Link>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'completed'
                      ? 'bg-green-900/30 text-green-400'
                      : project.status === 'generating'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {project.totalFiles} files
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ChatBubble />
    </main>
  );
}
