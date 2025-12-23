'use client';

import Link from 'next/link';
import { blogPosts } from '@/lib/blogPosts';
import { notFound } from 'next/navigation';
import ChatBubble from '@/components/ChatBubble';

export default function BlogArticle({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Generate SEO-optimized article content based on slug
  const generateArticleContent = (slug: string) => {
    const contentMap: Record<string, JSX.Element> = {
      'what-is-vibecoding': (
        <>
          <h2 className="text-3xl font-bold mt-8 mb-4 text-white">What is Vibecoding?</h2>
          <p>
            Vibecoding is a revolutionary paradigm in software development that shifts the focus from traditional coding to creative direction and conceptual guidance. 
            Coined by Andrej Karpathy, this methodology embraces AI as a collaborative partner in the development process.
          </p>
          
          <h2 className="text-3xl font-bold mt-8 mb-4 text-white">The Core Concept</h2>
          <p>
            In traditional development, you write code and manage syntax. In vibecoding, you focus on the "vibe" - the vision, direction, and high-level requirements. 
            AI handles the implementation details, code generation, and optimization.
          </p>

          <h2 className="text-3xl font-bold mt-8 mb-4 text-white">How Vibecoding Works</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Describe your vision and requirements</li>
            <li>AI analyzes and generates comprehensive blueprints</li>
            <li>Review and refine with AI guidance</li>
            <li>Export and implement with confidence</li>
          </ul>

          <h2 className="text-3xl font-bold mt-8 mb-4 text-white">Key Benefits</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dramatically faster development cycles</li>
            <li>Reduced syntax and implementation errors</li>
            <li>Professional-grade architectural blueprints</li>
            <li>AI-powered code suggestions and optimizations</li>
            <li>Focus on creative problem-solving</li>
          </ul>

          <h2 className="text-3xl font-bold mt-8 mb-4 text-white">Getting Started with Vibecoding</h2>
          <p>
            Vibecoding is accessible to developers of all levels. Whether you're a seasoned engineer or a beginner, VibeCode Mentor provides the tools 
            and guidance needed to harness this powerful methodology.
          </p>
        </>
      ),
      'vibecoding-vs-traditional-coding': (
        <>
          <h2 className="text-3xl font-bold mt-8 mb-4 text-white">Traditional Coding Approach</h2>
          <p>
            In traditional development, developers spend significant time on:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Manual code writing and syntax management</li>
            <li>Debugging and troubleshooting</li>
            <li>Architecture design and planning</li>
            <li>Code optimization and refactoring</li>
          </ul>

          <h2 className="text-3xl font-bold mt-8 mb-4 text-white">Vibecoding Approach</h2>
          <p>
            Vibecoding revolutionizes this process by:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI handles code generation and syntax</li>
            <li>Focus on creative direction and vision</li>
            <li>Automated blueprint generation</li>
            <li>AI-assisted optimization and best practices</li>
          </ul>

          <h2 className="text-3xl font-bold mt-8 mb-4 text-white">Comparison Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse mt-4">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3">Aspect</th>
                  <th className="text-left py-2 px-3">Traditional</th>
                  <th className="text-left py-2 px-3">Vibecoding</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">Speed</td>
                  <td className="py-2 px-3">Slower</td>
                  <td className="py-2 px-3">Faster</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">Focus</td>
                  <td className="py-2 px-3">Implementation</td>
                  <td className="py-2 px-3">Vision</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">Automation</td>
                  <td className="py-2 px-3">Limited</td>
                  <td className="py-2 px-3">Extensive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    };

    return contentMap[slug] || (
      <>
        <p>
          {post?.excerpt}
        </p>
        <p className="mt-6">
          This is a comprehensive guide covering best practices, implementation strategies, and real-world examples. 
          VibeCode Mentor provides AI-powered assistance throughout the process.
        </p>
      </>
    );
  };

  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white pt-24 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link href="/blog" className="text-purple-400 hover:text-purple-300 transition-colors mb-8 inline-flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-500/10 text-purple-400 text-sm font-bold px-3 py-1 rounded-full uppercase">
              {post.category}
            </span>
            <time className="text-gray-500">{new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</time>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{post.readTime} read</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-300">
            {post.excerpt}
          </p>

          {/* Keywords */}
          <div className="mt-6 flex flex-wrap gap-2">
            {post.keywords.map(keyword => (
              <span key={keyword} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                #{keyword}
              </span>
            ))}
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-invert max-w-none mb-12 prose-headings:mt-8 prose-headings:mb-4">
          <div className="space-y-6 text-gray-300 leading-relaxed">
            {generateArticleContent(post.slug)}
          </div>
        </article>

        {/* Author Bio */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-12">
          <h3 className="text-lg font-semibold text-white mb-2">About VibeCode Mentor</h3>
          <p className="text-gray-400">
            VibeCode Mentor is the leading platform for AI-assisted software development. 
            Our comprehensive guides and tools help developers harness the power of vibecoding to build faster, smarter, and more effectively.
          </p>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map(related => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="group">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500 transition-all">
                    <p className="text-xs text-purple-400 uppercase mb-2">{related.category}</p>
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2">{related.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Master Vibecoding?</h3>
          <p className="text-gray-300 mb-6">Start using VibeCode Mentor to generate AI-powered project blueprints and accelerate your development.</p>
          <Link
            href="/build"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Start Building Free →
          </Link>
        </div>
      </div>

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}
