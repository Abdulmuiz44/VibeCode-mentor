'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getProStatus } from '@/utils/pro';
import { templates, Template } from '@/lib/templates';
import ChatBubble from '@/components/ChatBubble';
import { useProUpgradeModal } from '@/components/ProUpgradeModal';

const categories = [
  { id: 'all', name: 'All Templates', icon: '🎯' },
  { id: 'web', name: 'Web Apps', icon: '🌐' },
  { id: 'mobile', name: 'Mobile Apps', icon: '📱' },
  { id: 'saas', name: 'SaaS', icon: '🚀' },
  { id: 'devtools', name: 'Dev Tools', icon: '🔧' },
  { id: 'ecommerce', name: 'E-Commerce', icon: '🛒' },
  { id: 'ai', name: 'AI/ML', icon: '🤖' },
  { id: 'other', name: 'Other', icon: '📦' },
];

const complexityColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/50',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export default function TemplatesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const { openUpgradeModal } = useProUpgradeModal();
  const [isPro, setIsPro] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProStatus = async () => {
      if (user?.id) {
        // Check Pro status from Supabase for logged-in users
        try {
          const { getProStatusFromCloud } = await import('@/lib/supabaseDB');
          const cloudProStatus = await getProStatusFromCloud(user.id);
          setIsPro(cloudProStatus);
        } catch (error) {
          console.error('Error fetching Pro status:', error);
          // Fallback to local storage
          const proStatus = getProStatus();
          setIsPro(proStatus.isPro);
        }
      } else {
        // Use local storage for non-logged-in users
        const proStatus = getProStatus();
        setIsPro(proStatus.isPro);
      }
    };

    fetchProStatus();
  }, [user]);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: Template) => {
    if (template.isPro && !isPro) {
      // Show upgrade modal for Pro templates
      openUpgradeModal({ source: `Template: ${template.name}` });
      return;
    }

    // Store template prompt in sessionStorage and redirect to home
    sessionStorage.setItem('selectedPrompt', template.prompt);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            📋 Blueprint Templates
          </h1>
          <p className="text-gray-400 text-base md:text-lg px-4">
            Jump-start your project with pre-built templates for common use cases
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 md:mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, description, or tech stack..."
              className="w-full px-4 md:px-6 py-3 md:py-4 pl-12 md:pl-14 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 md:mb-12 overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 md:gap-3 min-w-max md:justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                <span className="mr-2">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl md:text-4xl">{template.icon}</div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${complexityColors[template.complexity]}`}>
                          {template.complexity}
                        </span>
                        {template.isPro && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/50">
                            ⚡ Pro
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm md:text-base mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4">
                  {template.tags.slice(0, 4).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 4 && (
                    <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full">
                      +{template.tags.length - 4}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="text-xs md:text-sm text-gray-500">
                    ⏱️ {template.estimatedTime}
                  </div>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm md:text-base font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {template.isPro && !isPro ? 'Upgrade' : 'Use Template'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-20">
            <div className="mb-6">
              <svg className="w-20 h-20 md:w-24 md:h-24 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-300 mb-2">No templates found</h2>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pro CTA */}
        {!isPro && (
          <div className="mt-12 md:mt-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 md:p-8 text-center">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              Unlock All Premium Templates
            </h3>
            <p className="text-gray-300 mb-6 text-sm md:text-base px-4">
              Get access to {templates.filter(t => t.isPro).length} advanced templates plus unlimited generations and chat
            </p>
            <button
              onClick={() => openUpgradeModal({ source: 'Templates Page' })}
              className="px-6 md:px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 text-sm md:text-base"
            >
              Upgrade to Pro - $5/month
            </button>
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      <ChatBubble />
    </div>
  );
}
