'use client';

import Link from 'next/link';
import { useState } from 'react';
import { blogPosts } from '@/lib/blogPosts';
import type { Metadata } from 'next';

const categoryColors: Record<string, string> = {
  'Trends': 'bg-blue-500/10 text-blue-400',
  'Guide': 'bg-purple-500/10 text-purple-400',
  'Tutorial': 'bg-pink-500/10 text-pink-400',
  'Product': 'bg-green-500/10 text-green-400',
  'Technical': 'bg-orange-500/10 text-orange-400',
  'Case Studies': 'bg-red-500/10 text-red-400',
  'Learning': 'bg-cyan-500/10 text-cyan-400',
  'Career': 'bg-indigo-500/10 text-indigo-400',
  'Ethics': 'bg-yellow-500/10 text-yellow-400',
  'Community': 'bg-violet-500/10 text-violet-400',
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white pt-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            VibeCode Blog
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Master vibecoding, AI-assisted development, and cutting-edge software architecture. {blogPosts.length} in-depth articles to level up your skills.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 pl-12 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? 'All Articles' : category}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPosts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
              <article className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500 transition-all p-6 h-full flex flex-col hover:shadow-lg hover:shadow-purple-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${categoryColors[post.category] || 'bg-gray-700/50 text-gray-400'}`}>
                    {post.category}
                  </span>
                  <time className="text-gray-500 text-sm">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-400 mb-4 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                  <div className="flex items-center text-sm font-medium text-purple-400 group-hover:translate-x-1 transition-transform">
                    Read
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No articles found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* SEO Meta Info */}
        <div className="mt-12 p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">About Our Blog</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            VibeCode Blog is your comprehensive resource for vibecoding, AI-assisted software development, and modern web development practices. 
            Our {blogPosts.length} expertly-written articles cover everything from getting started with vibecoding to advanced architectural patterns. 
            Each article is optimized for search engines and designed to help developers, founders, and teams build faster and smarter.
          </p>
        </div>
      </div>
    </div>
  );
}
