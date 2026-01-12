'use client';

import Link from 'next/link';
import { useState } from 'react';
import { blogPosts } from '@/lib/blogPosts';

const categoryColors: Record<string, string> = {
  'Trends': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Guide': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Tutorial': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Product': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Technical': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Case Studies': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Learning': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Career': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Ethics': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Community': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  const filteredPosts = blogPosts.filter(post => {
    const categoryMatch = selectedCategory === 'all' || post.category === selectedCategory;
    const searchMatch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    VibeCode <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Blog</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                    Master vibecoding, AI-assisted development, and cutting-edge software architecture.
                </p>
            </div>
        </section>

        <section className="px-4 pb-20 max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-12 max-w-2xl mx-auto">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 pl-14 bg-gray-900/50 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all group-hover:border-gray-700"
                    />
                    <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Category Filter */}
            <div className="mb-12 flex flex-wrap gap-3 justify-center">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                            selectedCategory === category
                                ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
                        }`}
                    >
                        {category === 'all' ? 'All' : category}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                        <article className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all p-8 h-full flex flex-col hover:shadow-2xl hover:shadow-purple-900/10 relative">
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${categoryColors[post.category] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                    {post.category}
                                </span>
                                <time className="text-gray-500 text-sm font-medium">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all line-clamp-2">
                                {post.title}
                            </h2>
                            
                            <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-grow">
                                {post.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-gray-800 group-hover:border-gray-700/50 transition-colors">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{post.readTime}</span>
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                    <svg className="w-4 h-4 transform group-hover:-rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {/* No Results */}
            {filteredPosts.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
                    <p className="text-gray-400 mb-8">Try adjusting your search or category filter.</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                        }}
                        className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </section>
    </main>
  );
}