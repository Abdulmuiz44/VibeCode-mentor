'use client';

import React from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  estimateHours: number;
  difficulty: number;
  sprint: number;
  dependencies: number[];
}

interface Module {
  name: string;
  description: string;
  endpoints?: string[];
  components?: string[];
}

interface BlueprintStepsProps {
  scope: string[];
  stack: {
    frontend?: string;
    backend?: string;
    database?: string;
    auth?: string;
    styling?: string;
    hosting?: string;
    additional?: string[];
  };
  systemDesign?: {
    modules: Module[];
    database?: any;
  };
  folderStructure: string[];
  tasks: Task[];
  hints?: string[];
  risks?: string[];
}

export default function BlueprintSteps({
  scope,
  stack,
  systemDesign,
  folderStructure,
  tasks,
  hints = [],
  risks = [],
}: BlueprintStepsProps) {
  const [activeTab, setActiveTab] = React.useState<'scope' | 'stack' | 'design' | 'structure' | 'tasks' | 'hints'>('scope');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200">
        <button
          onClick={() => setActiveTab('scope')}
          className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'scope'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          📋 Scope
        </button>
        <button
          onClick={() => setActiveTab('stack')}
          className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'stack'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          🔧 Tech Stack
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'design'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          🏗️ System Design
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'structure'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          📁 Structure
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'tasks'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          ✅ Tasks
        </button>
        <button
          onClick={() => setActiveTab('hints')}
          className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'hints'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          💡 Hints & Risks
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'scope' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Project Scope</h3>
            <ul className="space-y-2">
              {scope.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'stack' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Technology Stack</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {stack.frontend && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Frontend</h4>
                  <p className="text-blue-700">{stack.frontend}</p>
                </div>
              )}
              {stack.backend && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Backend</h4>
                  <p className="text-green-700">{stack.backend}</p>
                </div>
              )}
              {stack.database && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Database</h4>
                  <p className="text-purple-700">{stack.database}</p>
                </div>
              )}
              {stack.auth && (
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-pink-900 mb-2">Authentication</h4>
                  <p className="text-pink-700">{stack.auth}</p>
                </div>
              )}
              {stack.styling && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">Styling</h4>
                  <p className="text-indigo-700">{stack.styling}</p>
                </div>
              )}
              {stack.hosting && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Hosting</h4>
                  <p className="text-orange-700">{stack.hosting}</p>
                </div>
              )}
            </div>
            {stack.additional && stack.additional.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Additional Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {stack.additional.map((tool, index) => (
                    <span key={index} className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-200">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'design' && systemDesign && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Design</h3>
            <div className="space-y-4">
              {systemDesign.modules.map((module, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{module.name}</h4>
                  <p className="text-gray-600 mb-3">{module.description}</p>
                  
                  {module.endpoints && module.endpoints.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">API Endpoints:</p>
                      <div className="space-y-1">
                        {module.endpoints.map((endpoint, idx) => (
                          <code key={idx} className="block text-sm bg-gray-100 px-2 py-1 rounded">
                            {endpoint}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {module.components && module.components.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Components:</p>
                      <div className="flex flex-wrap gap-2">
                        {module.components.map((component, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                            {component}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Folder Structure</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>
{folderStructure.map((item, index) => {
  const depth = (item.match(/\//g) || []).length;
  const indent = '  '.repeat(depth);
  const name = item.split('/').pop() || item;
  const isDir = item.endsWith('/');
  return (
    <div key={index}>
      {indent}{isDir ? '📁' : '📄'} {name}
    </div>
  );
})}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Development Tasks</h3>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Sprint {task.sprint}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {task.estimateHours}h
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Difficulty: {'⭐'.repeat(Math.min(task.difficulty, 10))}</span>
                    {task.dependencies.length > 0 && (
                      <span>Depends on: Task {task.dependencies.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hints' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hints & Best Practices</h3>
            {hints.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">💡 Development Hints</h4>
                <div className="space-y-2">
                  {hints.map((hint, index) => (
                    <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <p className="text-blue-900">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {risks.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">⚠️ Potential Risks</h4>
                <div className="space-y-2">
                  {risks.map((risk, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="text-yellow-900">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {hints.length === 0 && risks.length === 0 && (
              <p className="text-gray-500 text-center py-8">No hints or risks available for this blueprint.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
