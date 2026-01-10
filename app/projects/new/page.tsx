'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewProjectPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Please enter a project name');
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            const res = await fetch('/api/vibecode/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || `A Next.js application called ${name}`,
                    userId: session?.user?.id
                })
            });

            if (res.ok) {
                const project = await res.json();
                router.push(`/projects/${project.id}`);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create project');
            }
        } catch (err) {
            console.error('Create project error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    if (!session?.user?.id) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Please sign in to create a project</p>
                    <button
                        onClick={() => router.push('/auth')}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
                <p className="text-gray-400 mb-8">Start building your next application with VibeCode Mentor</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Awesome App"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A brief description of what you want to build..."
                            rows={4}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500 resize-none"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !name.trim()}
                            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
