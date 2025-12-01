import { notFound } from 'next/navigation';
import { getPublicPromptById } from '@/lib/supabase.server';
import Link from 'next/link';

export default async function PromptPage({ params }: { params: { id: string } }) {
    const prompt = await getPublicPromptById(params.id);

    if (!prompt) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/prompts"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Prompts
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Prompt Details
                    </h1>
                    <p className="text-gray-400">ID: {prompt.id}</p>
                </div>

                {/* Prompt Content */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Project Idea</h2>
                    <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                        {prompt.prompt}
                    </p>
                </div>

                {/* Metadata */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Created</span>
                            <span className="text-gray-300">
                                {new Date(prompt.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        {prompt.user_id && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Author</span>
                                <span className="text-gray-300">User</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                    <Link
                        href={`/?prompt=${encodeURIComponent(prompt.prompt)}`}
                        className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/50"
                    >
                        ✨ Generate Blueprint from this Prompt
                    </Link>
                </div>
            </div>
        </main>
    );
}
