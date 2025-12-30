'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatBubble from '@/components/ChatBubble';
import { useProUpgradeModal } from '@/components/ProUpgradeModal';

interface BlueprintForm {
  projectName: string;
  description: string;
  features: string[];
  databaseSchema: string;
  apiEndpoints: string;
  uiComponents: string;
  deploymentRequirements: string;
}

const featureOptions = [
  { id: 'auth', label: 'Authentication', icon: '🔐' },
  { id: 'payments', label: 'Payment Processing', icon: '💳' },
  { id: 'realtime', label: 'Real-time Updates', icon: '⚡' },
  { id: 'fileupload', label: 'File Uploads', icon: '📁' },
  { id: 'email', label: 'Email Notifications', icon: '📧' },
  { id: 'search', label: 'Advanced Search', icon: '🔍' },
  { id: 'analytics', label: 'Analytics & Reporting', icon: '📊' },
  { id: 'ratelimit', label: 'Rate Limiting', icon: '⏱️' },
  { id: 'cache', label: 'Caching Layer', icon: '⚙️' },
  { id: 'cdn', label: 'CDN Integration', icon: '🌍' },
];

export default function GenerateProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { openUpgradeModal } = useProUpgradeModal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<BlueprintForm>({
    projectName: '',
    description: '',
    features: [],
    databaseSchema: '',
    apiEndpoints: '',
    uiComponents: '',
    deploymentRequirements: '',
  });

  const handleFeatureToggle = (featureId: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.projectName.trim()) {
      setError('Project name is required');
      return;
    }
    if (!form.description.trim()) {
      setError('Project description is required');
      return;
    }
    if (form.features.length === 0) {
      setError('Select at least one feature');
      return;
    }
    if (!form.databaseSchema.trim()) {
      setError('Database schema is required');
      return;
    }

    if (!session?.user?.id) {
      openUpgradeModal({ source: 'Generate Project' });
      return;
    }

    setIsLoading(true);

    try {
      // Call API to generate project
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate project');
      }

      const { projectId } = await response.json();

      // Redirect to generation progress page
      router.push(`/generate-project/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            🚀 Generate Full Project
          </h1>
          <p className="text-gray-400 text-base md:text-lg px-4">
            Describe your project idea. We'll generate production-ready code and push it to GitHub.
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Project Name & Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span>📝</span> Project Basics
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="projectName"
                value={form.projectName}
                onChange={handleInputChange}
                placeholder="e.g., TaskFlow, Analytics Dashboard, Social Platform"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be your repo name on GitHub
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Project Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Describe what your project does. Be specific about the problem it solves and target users."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                More detail = better generated code
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span>✨</span> Features Required *
            </h2>
            <p className="text-gray-400 text-sm">Select all features your project needs</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featureOptions.map(feature => (
                <label
                  key={feature.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    form.features.includes(feature.id)
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.features.includes(feature.id)}
                    onChange={() => handleFeatureToggle(feature.id)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-lg">{feature.icon}</span>
                  <span className="font-medium">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Database Schema */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span>🗄️</span> Database Schema *
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tables & Relationships
              </label>
              <textarea
                name="databaseSchema"
                value={form.databaseSchema}
                onChange={handleInputChange}
                placeholder={`Example:
Users (id, email, name, created_at)
  ├─ has many Projects
  └─ has many Subscriptions

Projects (id, user_id, title, description, created_at)
  ├─ has many Tasks
  └─ has many Collaborators

Tasks (id, project_id, title, status, due_date)
  └─ has many Comments`}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                List your main entities, fields, and relationships
              </p>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span>🔌</span> API Endpoints
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Required Endpoints
              </label>
              <textarea
                name="apiEndpoints"
                value={form.apiEndpoints}
                onChange={handleInputChange}
                placeholder={`Example:
GET /api/projects - List user's projects
POST /api/projects - Create new project
GET /api/projects/:id - Get project details
PUT /api/projects/:id - Update project
DELETE /api/projects/:id - Delete project

GET /api/projects/:id/tasks - List project tasks
POST /api/projects/:id/tasks - Create task
PATCH /api/tasks/:id - Update task status`}
                rows={5}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                List REST endpoints with methods and descriptions (optional)
              </p>
            </div>
          </div>

          {/* UI Components */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span>🎨</span> UI Components & Pages
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Main Pages & Components
              </label>
              <textarea
                name="uiComponents"
                value={form.uiComponents}
                onChange={handleInputChange}
                placeholder={`Example:
Pages:
- Dashboard (overview, stats)
- Projects (list, create, edit)
- Project Details (tabs: overview, tasks, team)
- Tasks (kanban board)
- Settings (profile, notifications, billing)

Components:
- Navigation Header
- Sidebar with menu
- Project Card
- Task List / Kanban
- User Avatar with dropdown
- Modal for creating items`}
                rows={5}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the key pages and UI components (optional)
              </p>
            </div>
          </div>

          {/* Deployment & Additional Requirements */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span>🚢</span> Deployment & Special Requirements
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Additional Details
              </label>
              <textarea
                name="deploymentRequirements"
                value={form.deploymentRequirements}
                onChange={handleInputChange}
                placeholder={`Example:
- Deploy on Vercel
- Use Stripe for payments
- Send emails via Resend
- Need environment variables for API keys
- Support dark mode
- Mobile-responsive design
- Rate limiting on API routes
- Webhook support for external services`}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deployment target, special requirements, integrations (optional)
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Tech Stack (Fixed for v1)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Next.js 14', icon: '⚛️' },
                    { name: 'TypeScript', icon: '📘' },
                    { name: 'Tailwind CSS', icon: '🎨' },
                    { name: 'Supabase', icon: '🔵' },
                  ].map(tech => (
                    <div
                      key={tech.name}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{tech.icon}</div>
                      <div className="text-xs font-medium text-gray-300">{tech.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 md:py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLoading ? 'animate-pulse' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating your project...
                  </span>
                ) : (
                  '🚀 Generate & Push to GitHub'
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                ⏱️ Generation takes 2-5 minutes. We'll handle the GitHub setup automatically.
              </p>
            </div>
          </div>
        </form>

        {/* Info Cards */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-white mb-1">Production Ready</h3>
            <p className="text-sm text-gray-400">
              Full-stack code with best practices, error handling, and type safety
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6">
            <div className="text-2xl mb-2">🔧</div>
            <h3 className="font-semibold text-white mb-1">Fully Customizable</h3>
            <p className="text-sm text-gray-400">
              Generated code is yours to modify. Make it your own instantly.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-6">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-white mb-1">Documented</h3>
            <p className="text-sm text-gray-400">
              Includes setup guide, API docs, and deployment instructions
            </p>
          </div>
        </div>
      </div>

      <ChatBubble />
    </div>
  );
}
