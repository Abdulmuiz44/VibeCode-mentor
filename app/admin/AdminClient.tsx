'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminClient() {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects'>('overview');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/vibecode/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/vibecode/admin/users');
            if (res.ok) {
                setUsers(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/vibecode/admin/projects');
            if (res.ok) {
                setProjects(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    // Load data when tab changes
    useEffect(() => {
        if (activeTab === 'users' && users.length === 0) fetchUsers();
        if (activeTab === 'projects' && projects.length === 0) fetchProjects();
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-black text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight border-l-4 border-white pl-4">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <Link href="/" className="px-4 py-2 border border-white/20 rounded hover:bg-white hover:text-black transition-colors text-sm font-medium">
                            Back to App
                        </Link>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-white/20 mb-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'users' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'projects' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Projects
                    </button>
                </div>

                {/* Content Area */}
                {loading && !stats ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
                                <StatCard label="Total Projects" value={stats.totalProjects} icon="📦" />
                                <StatCard label="Active Builds" value={stats.activeBuilds} icon="⚡" />
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="overflow-x-auto rounded-lg border border-white/10">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 uppercase text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Joined</th>
                                            <th className="px-6 py-3">Last Login</th>
                                            <th className="px-6 py-3">Provider</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium">{user.email}</td>
                                                <td className="px-6 py-4 text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-gray-400">{user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded bg-white/10 text-xs border border-white/20 capitalize">{user.provider}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="overflow-x-auto rounded-lg border border-white/10">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 uppercase text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">Project Name</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Tech Stack</th>
                                            <th className="px-6 py-3">Created</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {projects.map((project) => (
                                            <tr key={project.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{project.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs border ${project.status === 'completed' ? 'bg-white text-black border-white' :
                                                            project.status === 'failed' ? 'bg-red-900/30 text-red-200 border-red-800' :
                                                                'bg-gray-800 text-gray-300 border-gray-700'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                                                    {project.technologies ? project.technologies.join(', ') : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">{new Date(project.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <Link href={`/projects/${project.id}`} className="text-white underline hover:text-gray-300">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
    return (
        <div className="bg-black border border-white/20 p-6 rounded-lg hover:border-white transition-colors group">
            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm uppercase tracking-wider">{label}</span>
                <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">{icon}</span>
            </div>
            <div className="text-4xl font-bold text-white">{value}</div>
        </div>
    );
}
