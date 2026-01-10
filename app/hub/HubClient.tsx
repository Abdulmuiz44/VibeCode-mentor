'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Project } from '@/types/hub';
import { formatDate, formatRelativeTime } from '@/lib/hub/utils';

export default function HubClient() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'shared'>('all');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth');
            return;
        }

        if (status === 'authenticated') {
            loadProjects();
        }
    }, [status, router]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/hub/projects', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load projects');
            }

            const data = await response.json();
            setProjects(data.projects || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter((project) => {
        if (activeTab === 'owned') {
            return project.owner_id === session?.user?.id;
        }
        if (activeTab === 'shared') {
            return project.owner_id !== session?.user?.id;
        }
        return true;
    });

    return (
        <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-5xl font-bold text-black dark:text-white">
                            Project Hub
                        </h1>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            + New Blueprint
                        </Link>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Transform blueprints into shipped projects with real-time collaboration
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'all'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        All Projects ({projects.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('owned')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'owned'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        My Projects ({projects.filter((p) => p.owner_id === session?.user?.id).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('shared')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'shared'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        Shared with Me ({projects.filter((p) => p.owner_id !== session?.user?.id).length})
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 rounded-full"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-300">
                            {activeTab === 'all'
                                ? 'No projects yet'
                                : activeTab === 'owned'
                                  ? "You haven't created any projects"
                                  : 'No projects shared with you'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {activeTab === 'all'
                                ? 'Create your first project from a blueprint to get started'
                                : 'Create a new blueprint and turn it into a project'}
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Create Your First Blueprint
                        </Link>
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && filteredProjects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/hub/projects/${project.id}`}
                                className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-lg dark:hover:shadow-blue-900/20 cursor-pointer"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                                            project.status === 'active'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                : project.status === 'completed'
                                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                                        }`}
                                    >
                                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                    </span>
                                </div>

                                {/* Header */}
                                <h3 className="text-xl font-bold text-black dark:text-white mb-2 pr-24 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {project.name}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {project.description || project.vibe}
                                </p>

                                {/* Tags */}
                                {project.tags && project.tags.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {project.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {project.tags.length > 3 && (
                                            <span className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                                                +{project.tags.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Tech Stack */}
                                {project.tech_stack && project.tech_stack.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {project.tech_stack.slice(0, 3).map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Footer Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
                                    <span>👥 {project.member_count} member{project.member_count !== 1 ? 's' : ''}</span>
                                    <span>📄 {project.file_count} file{project.file_count !== 1 ? 's' : ''}</span>
                                    <span>⏰ {formatRelativeTime(project.updated_at)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
