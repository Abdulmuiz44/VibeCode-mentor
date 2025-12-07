import Link from 'next/link';

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Blog</h1>
                <div className="grid gap-8 py-12 text-left">
                    <Link href="/blog/what-is-vibecoding" className="group block">
                        <article className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500 transition-all p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-purple-500/10 text-purple-400 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    Trends
                                </span>
                                <time className="text-gray-500 text-sm">Dec 7, 2025</time>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                What is Vibecoding? The Future of AI Software Development
                            </h2>
                            <p className="text-gray-400 mb-4 line-clamp-2">
                                Discover Vibecoding, the new coding paradigm coined by Andrej Karpathy. Learn how to focus on the &quot;vibe&quot; while AI handles the code.
                            </p>
                            <div className="flex items-center text-sm font-medium text-purple-400">
                                Read Article
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </article>
                    </Link>
                </div>
            </div>
        </div>
    );
}
