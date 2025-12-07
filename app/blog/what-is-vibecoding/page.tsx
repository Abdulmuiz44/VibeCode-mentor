import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'What is Vibecoding? The Future of AI Software Development | VibeCode Mentor',
    description: 'Discover Vibecoding, the new coding paradigm coined by Andrej Karpathy. Learn how to focus on the "vibe" while AI handles the code, and how VibeCode Mentor helps you master it.',
    keywords: ['Vibecoding', 'Andrej Karpathy', 'AI coding', 'software development', 'VibeCode Mentor', 'AI programming'],
};

export default function BlogPost() {
    return (
        <article className="min-h-screen bg-black text-white pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="inline-block px-4 py-1 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold">
                        The Future of Code
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        What is Vibecoding?
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-gray-400 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                            <span>VibeCode Team</span>
                        </div>
                        <span>•</span>
                        <time>December 7, 2025</time>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 border border-gray-800 shadow-2xl shadow-purple-900/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                        <span className="text-8xl">✨</span>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="lead text-xl text-gray-300 mb-8">
                        Software development is undergoing a seismic shift. We are moving away from the era of writing syntax character-by-character and entering the era of <strong>Vibecoding</strong>. But what exactly is it, and why is everyone from Andrej Karpathy to indie hackers talking about it?
                    </p>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">The Definition of Vibecoding</h2>
                    <p className="text-gray-300 mb-6">
                        <strong>Vibecoding</strong> is a development paradigm where the human developer focuses entirely on the high-level creative direction—the &quot;vibe,&quot; the flow, the user experience—while delegating the actual implementation details (the code) to Artificial Intelligence.
                    </p>
                    <p className="text-gray-300 mb-6">
                        Coined in early 2025 during the explosion of advanced coding LLMs, it represents the final abstraction layer. Just as we moved from assembly to C, and from C to Python, we are now moving from Python to Natural Language Prompts.
                    </p>

                    <blockquote className="border-l-4 border-purple-500 pl-6 my-8 italic text-xl text-gray-400 bg-gray-900/50 p-6 rounded-r-lg">
                        &quot;I just want to see the thing exist. I don&apos;t care how the loops are written. That&apos;s Vibecoding.&quot;
                    </blockquote>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">How It Works</h2>
                    <div className="grid md:grid-cols-2 gap-8 my-8">
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                            <h3 className="text-xl font-bold text-blue-400 mb-2">Traditional Coding</h3>
                            <ul className="list-disc list-inside text-gray-400 space-y-2">
                                <li>Write syntax line by line</li>
                                <li>Debug syntax errors</li>
                                <li>Search StackOverflow</li>
                                <li>Manually manage state & types</li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-xl border border-purple-500/30">
                            <h3 className="text-xl font-bold text-purple-400 mb-2">Vibecoding</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-2">
                                <li>Describe the desired outcome</li>
                                <li>Review generated implementation</li>
                                <li>Iterate on the &quot;vibe&quot; (design/UX)</li>
                                <li>Ship 10x faster</li>
                            </ul>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">The Role of Blueprints</h2>
                    <p className="text-gray-300 mb-6">
                        While AI is powerful, it can hallucinate or create unscalable spaghetti code if left unchecked. This is where <strong>VibeCode Mentor</strong> comes in.
                    </p>
                    <p className="text-gray-300 mb-6">
                        Successful Vibecoding requires a robust plan. You can&apos;t just tell an AI &quot;make a Facebook clone&quot; and expect production quality. You need a <strong>Blueprint</strong>:
                    </p>
                    <ul className="list-decimal list-inside text-gray-300 space-y-4 mb-8 bg-gray-900/30 p-8 rounded-xl border border-gray-800">
                        <li className="pl-2"><span className="text-white font-semibold">Architecture:</span> Defining the database schema and component relationship.</li>
                        <li className="pl-2"><span className="text-white font-semibold">Tech Stack:</span> Choosing the right tools (Next.js, Supabase, etc.) for the job.</li>
                        <li className="pl-2"><span className="text-white font-semibold">Implementation Steps:</span> Breaking the build process into small, verifiable chunks.</li>
                    </ul>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">Start Vibecoding Today</h2>
                    <p className="text-gray-300 mb-8">
                        You don&apos;t need to be a senior engineer to build your dream app anymore. You just need the right vibe and the right tools.
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-16 p-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl border border-blue-500/30 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to catch the vibe?</h3>
                    <p className="text-gray-300 mb-6">Generate your first professional project blueprint with VibeCode Mentor and start building.</p>
                    <Link
                        href="/auth?returnTo=/"
                        className="inline-block px-8 py-4 bg-white text-purple-900 font-bold rounded-lg hover:scale-105 transition-transform shadow-lg"
                    >
                        Start Building Free
                    </Link>
                </div>
            </div>
        </article>
    );
}
