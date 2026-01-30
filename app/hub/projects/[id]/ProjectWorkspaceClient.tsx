'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Project, ProjectMember } from '@/types/hub';
import { formatRelativeTime } from '@/lib/hub/utils';

interface ProjectWorkspaceClientProps {
    projectId: string;
}

export default function ProjectWorkspaceClient({ projectId }: ProjectWorkspaceClientProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'team' | 'activity'>('overview');

    const loadMembers = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/hub/projects/${id}/members`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMembers(data.members || []);
            }
        } catch (err) {
            console.error('Failed to load members:', err);
        }
    }, []);

    const loadProject = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`/api/hub/projects/${projectId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Project not found');
                } else if (response.status === 403) {
                    setError('Access denied');
                } else {
                    setError('Failed to load project');
                }
                return;
            }

            const data = await response.json();
            setProject(data.project);

            // Load members if project is accessible
            if (data.project) {
                loadMembers(data.project.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [projectId, loadMembers]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth');
            return;
        }

        if (status === 'authenticated') {
            loadProject();
        }
    }, [status, router, loadProject]);

    if (loading) {
        return (
            <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 rounded-full"></div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !project) {
        return (
            <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">{error}</h1>
                        <Link
                            href="/hub"
                            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Back to Projects
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const isOwner = project.owner_id === session?.user?.id;
    const isMember =
        isOwner || members.some((m) => m.user_id === session?.user?.id);

    return (
        <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <Link
                                href="/hub"
                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-3 inline-block"
                            >
                                ← Back to Projects
                            </Link>
                            <h1 className="text-4xl font-bold text-black dark:text-white">{project.name}</h1>
                        </div>
                        {isOwner && (
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                                ⚙️ Settings
                            </button>
                        )}
                    </div>

                    {/* Project Info Row */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                {project.status}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Members</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {project.member_count}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Files</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {project.file_count}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Updated</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white text-sm">
                                {formatRelativeTime(project.updated_at)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'overview'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        📋 Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'files'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        📁 Files
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'team'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        👥 Team ({members.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'activity'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        ⏱️ Activity
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                                <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                                    Project Vision
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {project.vibe}
                                </p>
                            </div>

                            {project.description && (
                                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                                    <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                                        Description
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {project.description}
                                    </p>
                                </div>
                            )}

                            {project.tech_stack && project.tech_stack.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                                    <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                                        Tech Stack
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tech_stack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
                                <h2 className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-300">
                                    🚀 Next Steps
                                </h2>
                                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                                    <li>✓ Generate code files from this blueprint</li>
                                    <li>✓ Invite team members to collaborate</li>
                                    <li>✓ Push to GitHub repository</li>
                                    <li>✓ Track progress and milestones</li>
                                    <li>✓ Share with community</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📁</div>
                            <h2 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-300">
                                No files yet
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Generate code files from templates or upload your own
                            </p>
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                                Generate Files
                            </button>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="space-y-4">
                            {members.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">👥</div>
                                    <p className="text-gray-600 dark:text-gray-400">No team members yet</p>
                                </div>
                            ) : (
                                members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {member.user?.name || 'Unknown'}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {member.user?.email}
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium">
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full capitalize">
                                                {member.role}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}

                            {isOwner && (
                                <button className="w-full mt-6 px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                    + Invite Team Member
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">⏱️</div>
                            <p className="text-gray-600 dark:text-gray-400">No activity yet</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
