'use client';

import Link from 'next/link';
import { blogPosts } from '@/lib/blogPosts';
import { articleContent } from '@/lib/articleContent';
import { notFound } from 'next/navigation';
import ChatBubble from '@/components/ChatBubble';

export default function BlogArticle({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Get the full article content or fallback to excerpt
  const getArticleContent = (slug: string) => {
    if (articleContent[slug]) {
      return articleContent[slug];
    }
    
    // Fallback content for articles not yet in articleContent
    return (
      <>
        <p className="mb-4">
          {post?.excerpt}
        </p>
        <p className="mt-6 text-gray-400">
          This is a comprehensive guide covering best practices, implementation strategies, and real-world examples. 
          VibeCode Mentor provides AI-powered assistance throughout the process. For more related content, explore our comprehensive blog library.
        </p>
        <div className="mt-8 p-6 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <h3 className="text-xl font-bold text-purple-300 mb-2">Coming Soon</h3>
          <p className="text-gray-400">
            This article is being expanded with comprehensive, SEO-optimized content. Check back soon for the complete guide.
          </p>
        </div>
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
            {getArticleContent(post.slug)}
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

        {/* VibeCode Mentor CTA Section */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-8 text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">🚀 Ready to Build Faster with Vibecoding?</h3>
          <p className="text-gray-300 mb-6">
            {post.category === 'Trends' && 'Stay ahead of the curve and implement these trends with AI-assisted development.'}
            {post.category === 'Guide' && 'Master these concepts with AI guidance and automated blueprint generation.'}
            {post.category === 'Tutorial' && 'Follow these patterns faster with VibeCode Mentor&apos;s intelligent code generation.'}
            {post.category === 'Technical' && 'Implement complex technical solutions with AI-powered architectural guidance.'}
            {post.category === 'Learning' && 'Accelerate your learning by applying these concepts immediately in real projects.'}
            {post.category === 'Career' && 'Land your dream job faster by building impressive projects with VibeCode Mentor.'}
            {post.category === 'Case Studies' && 'Learn from real-world examples and build similar solutions with AI assistance.'}
            {post.category === 'Product' && 'Explore how VibeCode Mentor features can accelerate your development workflow.'}
            {post.category === 'Community' && 'Join the vibecoding community and connect with like-minded developers.'}
            {post.category === 'Ethics' && 'Build responsibly with ethical AI-assisted development practices.'}
            {!['Trends', 'Guide', 'Tutorial', 'Technical', 'Learning', 'Career', 'Case Studies', 'Product', 'Community', 'Ethics'].includes(post.category) && 'Implement these strategies with VibeCode Mentor - the AI blueprint generator.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/build"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              Start Building Free →
            </Link>
            <Link
              href="/templates"
              className="inline-block px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 transition-all"
            >
              Browse Templates
            </Link>
          </div>
        </div>

        {/* Why VibeCode Mentor Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="text-lg font-semibold text-white mb-2">10x Faster Development</h4>
            <p className="text-gray-400 text-sm">
              Generate complete project blueprints with AI in minutes, not weeks. Implement the patterns you just learned instantly.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="text-lg font-semibold text-white mb-2">Production-Ready Blueprints</h4>
            <p className="text-gray-400 text-sm">
              Get comprehensive technical specs, architecture diagrams, and implementation guides. No guesswork needed.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="text-lg font-semibold text-white mb-2">AI-Powered Mentorship</h4>
            <p className="text-gray-400 text-sm">
              Chat with an AI expert who knows the concepts you just read about. Get answers to your implementation questions.
            </p>
          </div>
        </div>

        {/* VibeCode Features Section */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">What VibeCode Mentor Includes</h3>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>Generate blueprints for any project idea in seconds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>AI chat assistant for implementation guidance</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>10+ pre-built templates to jumpstart projects</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>Export as PDF, Markdown, or GitHub integration</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>Cloud sync across all your devices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">✓</span>
              <span>Free tier with 10 blueprints/month</span>
            </li>
          </ul>
          <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-purple-300 text-sm">
              💡 <strong>Pro Tip:</strong> Use the techniques from this article combined with VibeCode Mentor to build at startup speed. 
              Hundreds of developers are already using it to launch products 3x faster.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}
