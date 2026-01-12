'use client';

import { useState } from 'react';

export interface TechStack {
  appType: 'web' | 'mobile' | 'cli' | 'chrome-extension' | 'api';
  framework: string;
  database: string;
  uiLibrary: string;
}

interface TechStackSelectorProps {
  value: TechStack;
  onChange: (stack: TechStack) => void;
}

const APP_TYPES = [
  { id: 'web', label: 'Web App', icon: '🌐' },
  { id: 'mobile', label: 'Mobile App', icon: '📱' },
  { id: 'api', label: 'Backend API', icon: '⚙️' },
  { id: 'cli', label: 'CLI Tool', icon: '💻' },
  { id: 'chrome-extension', label: 'Extension', icon: '🧩' },
];

const FRAMEWORKS = {
  web: [
    { id: 'nextjs', label: 'Next.js 14' },
    { id: 'react', label: 'React (Vite)' },
    { id: 'vue', label: 'Vue.js' },
    { id: 'angular', label: 'Angular' },
  ],
  mobile: [
    { id: 'react-native', label: 'React Native (Expo)' },
    { id: 'flutter', label: 'Flutter' },
    { id: 'ios', label: 'Swift (iOS)' },
    { id: 'android', label: 'Kotlin (Android)' },
  ],
  api: [
    { id: 'express', label: 'Node.js (Express)' },
    { id: 'python', label: 'Python (FastAPI)' },
    { id: 'go', label: 'Go (Gin)' },
  ],
  cli: [
    { id: 'node-cli', label: 'Node.js' },
    { id: 'rust', label: 'Rust' },
    { id: 'python-cli', label: 'Python' },
  ],
  'chrome-extension': [
    { id: 'react-ext', label: 'React (Vite)' },
    { id: 'plasmo', label: 'Plasmo' },
    { id: 'vanilla', label: 'Vanilla JS' },
  ],
};

const DATABASES = [
  { id: 'supabase', label: 'Supabase (Postgres)' },
  { id: 'firebase', label: 'Firebase' },
  { id: 'mongodb', label: 'MongoDB' },
  { id: 'mysql', label: 'MySQL (Prisma)' },
  { id: 'none', label: 'None' },
];

const UI_LIBRARIES = [
  { id: 'tailwind', label: 'Tailwind CSS' },
  { id: 'shadcn', label: 'shadcn/ui' },
  { id: 'mui', label: 'Material UI' },
  { id: 'chakra', label: 'Chakra UI' },
  { id: 'none', label: 'None / Native' },
];

export default function TechStackSelector({ value, onChange }: TechStackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateField = (field: keyof TechStack, newValue: string) => {
    // If changing app type, reset framework to first valid option
    if (field === 'appType') {
      const newFrameworks = FRAMEWORKS[newValue as keyof typeof FRAMEWORKS];
      onChange({
        ...value,
        appType: newValue as any,
        framework: newFrameworks[0].id,
      });
    } else {
      onChange({ ...value, [field]: newValue });
    }
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
          Advanced Options: Tech Stack & Database
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
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
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
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all border ${
                    value.appType === type.id
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
            <select
              value={value.framework}
              onChange={(e) => updateField('framework', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            >
              {(FRAMEWORKS[value.appType] || []).map((fw) => (
                <option key={fw.id} value={fw.id}>
                  {fw.label}
                </option>
              ))}
            </select>
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
                  className={`text-left px-3 py-2 rounded text-sm transition-all border ${
                    value.database === db.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
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
            <select
              value={value.uiLibrary}
              onChange={(e) => updateField('uiLibrary', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            >
              {UI_LIBRARIES.map((ui) => (
                <option key={ui.id} value={ui.id}>
                  {ui.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
