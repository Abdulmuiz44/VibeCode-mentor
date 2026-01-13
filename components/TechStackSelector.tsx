'use client';

import { useState } from 'react';

export interface TechStack {
  appType: 'web' | 'mobile' | 'cli' | 'chrome-extension' | 'api';
  framework: string;
  database: string;
  uiLibrary: string;
  hosting?: string;
  auth?: string;
}

interface TechStackSelectorProps {
  value: TechStack;
  onChange: (stack: TechStack) => void;
}

const APP_TYPES = [
  { id: 'web', label: 'Web App', icon: '🌐', description: 'Full-stack web application' },
  { id: 'mobile', label: 'Mobile App', icon: '📱', description: 'iOS & Android app' },
  { id: 'api', label: 'Backend API', icon: '⚙️', description: 'REST or GraphQL API' },
  { id: 'cli', label: 'CLI Tool', icon: '💻', description: 'Command-line interface' },
  { id: 'chrome-extension', label: 'Extension', icon: '🧩', description: 'Browser extension' },
];

const FRAMEWORKS: Record<string, { id: string; label: string; icon: string }[]> = {
  web: [
    { id: 'nextjs', label: 'Next.js 14', icon: '▲' },
    { id: 'react', label: 'React (Vite)', icon: '⚛️' },
    { id: 'vue', label: 'Vue.js', icon: '💚' },
    { id: 'angular', label: 'Angular', icon: '🅰️' },
    { id: 'sveltekit', label: 'SvelteKit', icon: '🔥' },
    { id: 'remix', label: 'Remix', icon: '💿' },
    { id: 'astro', label: 'Astro', icon: '🚀' },
  ],
  mobile: [
    { id: 'react-native', label: 'React Native (Expo)', icon: '⚛️' },
    { id: 'flutter', label: 'Flutter', icon: '🐦' },
    { id: 'ios', label: 'Swift (iOS)', icon: '🍎' },
    { id: 'android', label: 'Kotlin (Android)', icon: '🤖' },
  ],
  api: [
    { id: 'express', label: 'Node.js (Express)', icon: '🟢' },
    { id: 'nestjs', label: 'NestJS', icon: '🐱' },
    { id: 'fastapi', label: 'Python (FastAPI)', icon: '🐍' },
    { id: 'django', label: 'Django', icon: '🎸' },
    { id: 'go', label: 'Go (Gin)', icon: '🦫' },
    { id: 'rails', label: 'Ruby on Rails', icon: '💎' },
  ],
  cli: [
    { id: 'node-cli', label: 'Node.js', icon: '🟢' },
    { id: 'rust', label: 'Rust', icon: '🦀' },
    { id: 'python-cli', label: 'Python', icon: '🐍' },
    { id: 'go-cli', label: 'Go', icon: '🦫' },
  ],
  'chrome-extension': [
    { id: 'react-ext', label: 'React (Vite)', icon: '⚛️' },
    { id: 'plasmo', label: 'Plasmo', icon: '🔮' },
    { id: 'vanilla', label: 'Vanilla JS', icon: '📜' },
  ],
};

const DATABASES = [
  { id: 'supabase', label: 'Supabase', icon: '⚡', description: 'Postgres + Auth + Realtime' },
  { id: 'firebase', label: 'Firebase', icon: '🔥', description: 'NoSQL + Auth + Hosting' },
  { id: 'mongodb', label: 'MongoDB', icon: '🍃', description: 'Document database' },
  { id: 'postgresql', label: 'PostgreSQL', icon: '🐘', description: 'Relational database' },
  { id: 'mysql', label: 'MySQL (Prisma)', icon: '🐬', description: 'With Prisma ORM' },
  { id: 'planetscale', label: 'PlanetScale', icon: '🌍', description: 'Serverless MySQL' },
  { id: 'none', label: 'None', icon: '⊘', description: 'No database needed' },
];

const UI_LIBRARIES = [
  { id: 'tailwind', label: 'Tailwind CSS', icon: '🎨' },
  { id: 'shadcn', label: 'shadcn/ui', icon: '🎯' },
  { id: 'mui', label: 'Material UI', icon: '🔵' },
  { id: 'chakra', label: 'Chakra UI', icon: '⚡' },
  { id: 'none', label: 'None / Native', icon: '📝' },
];

const HOSTING_OPTIONS = [
  { id: 'vercel', label: 'Vercel', icon: '▲' },
  { id: 'railway', label: 'Railway', icon: '🚂' },
  { id: 'render', label: 'Render', icon: '🔷' },
  { id: 'aws', label: 'AWS', icon: '☁️' },
  { id: 'none', label: 'Self-hosted', icon: '🏠' },
];

const AUTH_OPTIONS = [
  { id: 'nextauth', label: 'NextAuth.js', icon: '🔐' },
  { id: 'clerk', label: 'Clerk', icon: '👤' },
  { id: 'supabase-auth', label: 'Supabase Auth', icon: '⚡' },
  { id: 'firebase-auth', label: 'Firebase Auth', icon: '🔥' },
  { id: 'custom', label: 'Custom JWT', icon: '🔑' },
  { id: 'none', label: 'None', icon: '⊘' },
];

// Smart presets for one-click stack selection
const PRESETS = [
  {
    id: 'saas',
    label: '🚀 SaaS Starter',
    description: 'Production-ready SaaS template',
    stack: {
      appType: 'web' as const,
      framework: 'nextjs',
      database: 'supabase',
      uiLibrary: 'shadcn',
      hosting: 'vercel',
      auth: 'supabase-auth',
    },
  },
  {
    id: 'mobile',
    label: '📱 Mobile App',
    description: 'Cross-platform mobile app',
    stack: {
      appType: 'mobile' as const,
      framework: 'react-native',
      database: 'firebase',
      uiLibrary: 'none',
      hosting: 'none',
      auth: 'firebase-auth',
    },
  },
  {
    id: 'api',
    label: '⚙️ API Backend',
    description: 'Scalable REST/GraphQL API',
    stack: {
      appType: 'api' as const,
      framework: 'express',
      database: 'mongodb',
      uiLibrary: 'none',
      hosting: 'railway',
      auth: 'custom',
    },
  },
  {
    id: 'extension',
    label: '🧩 Browser Extension',
    description: 'Chrome/Firefox extension',
    stack: {
      appType: 'chrome-extension' as const,
      framework: 'plasmo',
      database: 'none',
      uiLibrary: 'tailwind',
      hosting: 'none',
      auth: 'none',
    },
  },
];

export default function TechStackSelector({ value, onChange }: TechStackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateField = (field: keyof TechStack, newValue: string) => {
    // If changing app type, reset framework to first valid option
    if (field === 'appType') {
      const newFrameworks = FRAMEWORKS[newValue as keyof typeof FRAMEWORKS];
      onChange({
        ...value,
        appType: newValue as TechStack['appType'],
        framework: newFrameworks[0].id,
      });
    } else {
      onChange({ ...value, [field]: newValue });
    }
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    onChange(preset.stack);
  };

  const getStackSummary = () => {
    const framework = FRAMEWORKS[value.appType]?.find(f => f.id === value.framework);
    const database = DATABASES.find(d => d.id === value.database);
    return `${framework?.icon || ''} ${framework?.label || value.framework} + ${database?.icon || ''} ${database?.label || value.database}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2 text-white font-medium">
          <span className="p-1 bg-purple-500/20 rounded text-purple-400">⚡</span>
          <span>Tech Stack</span>
          {!isOpen && (
            <span className="text-gray-400 text-sm font-normal ml-2">
              {getStackSummary()}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-6 animate-fade-in">
          {/* Smart Presets */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-all border bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500 hover:bg-purple-500/10"
                  title={preset.description}
                >
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs text-gray-500 truncate">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs text-gray-500 mb-4">Or customize your stack:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* App Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Application Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {APP_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateField('appType', type.id)}
                      title={type.description}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all border ${value.appType === type.id
                          ? 'bg-purple-600/20 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      <span>{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Framework */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Framework
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {(FRAMEWORKS[value.appType] || []).map((fw) => (
                    <button
                      key={fw.id}
                      type="button"
                      onClick={() => updateField('framework', fw.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all border ${value.framework === fw.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      <span>{fw.icon}</span>
                      {fw.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Database */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Database
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DATABASES.map((db) => (
                    <button
                      key={db.id}
                      type="button"
                      onClick={() => updateField('database', db.id)}
                      title={db.description}
                      className={`flex items-center gap-2 text-left px-3 py-2 rounded text-sm transition-all border ${value.database === db.id
                          ? 'bg-green-600/20 border-green-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      <span>{db.icon}</span>
                      {db.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* UI Library */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  UI Library
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {UI_LIBRARIES.map((ui) => (
                    <button
                      key={ui.id}
                      type="button"
                      onClick={() => updateField('uiLibrary', ui.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all border ${value.uiLibrary === ui.id
                          ? 'bg-pink-600/20 border-pink-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      <span>{ui.icon}</span>
                      {ui.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hosting */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Hosting / Deployment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HOSTING_OPTIONS.map((host) => (
                    <button
                      key={host.id}
                      type="button"
                      onClick={() => updateField('hosting', host.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all border ${value.hosting === host.id
                          ? 'bg-orange-600/20 border-orange-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      <span>{host.icon}</span>
                      {host.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authentication */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Authentication
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AUTH_OPTIONS.map((auth) => (
                    <button
                      key={auth.id}
                      type="button"
                      onClick={() => updateField('auth', auth.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all border ${value.auth === auth.id
                          ? 'bg-cyan-600/20 border-cyan-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      <span>{auth.icon}</span>
                      {auth.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
