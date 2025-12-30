'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatBubble from '@/components/ChatBubble';

interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  details?: string;
}

interface ProjectStatus {
  id: string;
  status: 'generating' | 'completed' | 'failed';
  steps: GenerationStep[];
  githubUrl?: string;
  error?: string;
}

const steps: GenerationStep[] = [
  { id: '1', name: 'Parsing Blueprint', status: 'pending' },
  { id: '2', name: 'Creating Project Structure', status: 'pending' },
  { id: '3', name: 'Generating Database Schema', status: 'pending' },
  { id: '4', name: 'Building API Routes', status: 'pending' },
  { id: '5', name: 'Creating React Components', status: 'pending' },
  { id: '6', name: 'Setting Up Authentication', status: 'pending' },
  { id: '7', name: 'Configuring Environment', status: 'pending' },
  { id: '8', name: 'Pushing to GitHub', status: 'pending' },
];

export default function ProjectGenerationPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>({
    id: projectId,
    status: 'generating',
    steps: steps,
  });
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Poll for status updates
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/generate-project/${projectId}/status`);
        if (response.ok) {
          const data = await response.json();
          setProjectStatus(data);

          if (data.status === 'completed' || data.status === 'failed') {
            setIsCompleted(true);
          }
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    };

    const interval = setInterval(pollStatus, 2000);

    // Initial poll
    pollStatus();

    return () => clearInterval(interval);
  }, [projectId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            🔨 Generating Your Project
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            We're building your full-stack application. Please don't close this page.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-4">
          {projectStatus.steps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step Number / Icon */}
              <div className="flex-shrink-0">
                {step.status === 'completed' && (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {step.status === 'in-progress' && (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                  </div>
                )}
                {step.status === 'failed' && (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs font-semibold text-gray-400">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 pt-0.5">
                <h3
                  className={`font-semibold ${
                    step.status === 'completed'
                      ? 'text-green-400'
                      : step.status === 'in-progress'
                        ? 'text-purple-400'
                        : step.status === 'failed'
                          ? 'text-red-400'
                          : 'text-gray-400'
                  }`}
                >
                  {step.name}
                </h3>
                {step.details && (
                  <p className="text-xs text-gray-500 mt-1">{step.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {projectStatus.status === 'failed' && projectStatus.error && (
          <div className="mt-8 bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-300 mb-2">Generation Failed</h3>
            <p className="text-red-200 text-sm mb-4">{projectStatus.error}</p>
            <button
              onClick={() => window.location.href = '/generate-project'}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success Message */}
        {projectStatus.status === 'completed' && projectStatus.githubUrl && (
          <div className="mt-8 bg-green-500/20 border border-green-500/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-green-300 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Project Generated Successfully!
            </h3>
            <p className="text-green-200 text-sm">
              Your project has been created and pushed to GitHub. You can now clone it and start developing.
            </p>

            <div className="space-y-3 pt-2">
              <a
                href={projectStatus.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all text-center"
              >
                🔗 Open GitHub Repository
              </a>

              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Clone command:</p>
                <code className="text-sm text-green-300 font-mono break-all">
                  git clone {projectStatus.githubUrl}.git
                </code>
              </div>

              <button
                onClick={() => window.location.href = '/generate-project'}
                className="w-full px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
              >
                Generate Another Project
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {!isCompleted && (
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {projectStatus.steps.filter(s => s.status === 'completed').length}/
                {projectStatus.steps.length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Steps Complete</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(
                  (projectStatus.steps.filter(s => s.status === 'completed').length /
                    projectStatus.steps.length) *
                    100
                )}
                %
              </div>
              <p className="text-xs text-gray-400 mt-1">Progress</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">~2-3m</div>
              <p className="text-xs text-gray-400 mt-1">Remaining</p>
            </div>
          </div>
        )}
      </div>

      <ChatBubble />
    </div>
  );
}
