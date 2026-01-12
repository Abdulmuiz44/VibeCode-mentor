'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatBubble from '@/components/ChatBubble';

interface BuildState {
  step: number;
  stepName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  details: string;
}

const GENERATION_STEPS = [
  'Parsing Blueprint',
  'Creating Project Structure',
  'Generating Database Schema',
  'Building API Routes',
  'Creating React Components',
  'Setting Up Authentication',
  'Configuring Environment',
  'Pushing to GitHub',
];

export default function BuildFullAppClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [blueprintData, setBlueprintData] = useState<{
    projectIdea: string;
    blueprint: string;
  } | null>(null);
  const [steps, setSteps] = useState<BuildState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [projectId, setProjectId] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  const startGenerationFlow = useCallback(async (data: typeof blueprintData, userId: string) => {
    if (!data) return;

    let currentStepIndex = 0;

    try {
      // Step 1: Parse blueprint
      currentStepIndex = 0;
      updateStep(currentStepIndex, 'in-progress', 'Analyzing your blueprint...');
      await new Promise(r => setTimeout(r, 500));
      updateStep(currentStepIndex, 'completed');

      // Step 2: Create project record via API
      currentStepIndex = 1;
      updateStep(currentStepIndex, 'in-progress', 'Setting up project structure...');
      
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: data.projectIdea.split('\n')[0].substring(0, 50) || 'Generated Project',
          description: data.projectIdea,
          blueprint: data.blueprint,
          blueprintId: (data as any).blueprintId,
          userId,
          features: ['auth', 'realtime'],
          databaseSchema: 'Users',
          apiEndpoints: 'GET /api',
          uiComponents: 'Dashboard',
          deploymentRequirements: 'Vercel',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate project');
      }
      
      const result = await response.json();
      
      if (!result.projectId) {
        throw new Error('No project ID returned from server');
      }
      
      setProjectId(result.projectId);
      updateStep(currentStepIndex, 'completed');

      // Helper function to execute a step
      const executeNextStep = async (index: number, details: string) => {
        updateStep(index, 'in-progress', details);
        const res = await fetch('/api/vibecode/agent/execute-next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: result.projectId }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed at step: ${GENERATION_STEPS[index]}`);
        }
        updateStep(index, 'completed');
      };

      // Step 3: Database schema
      currentStepIndex = 2;
      await executeNextStep(currentStepIndex, 'Generating database migrations...');

      // Step 4: API routes
      currentStepIndex = 3;
      await executeNextStep(currentStepIndex, 'Building API routes...');

      // Step 5: React components
      currentStepIndex = 4;
      await executeNextStep(currentStepIndex, 'Creating React components...');

      // Step 6: Authentication
      currentStepIndex = 5;
      await executeNextStep(currentStepIndex, 'Setting up authentication...');

      // Step 7: Environment config
      currentStepIndex = 6;
      await executeNextStep(currentStepIndex, 'Configuring environment...');

      // Step 8: GitHub push - requires authentication
      currentStepIndex = 7;
      updateStep(currentStepIndex, 'in-progress', 'Pushing to GitHub...');
      
      // Check if user has GitHub token
      const tokenResponse = await fetch(`/api/github/token-status`);
      let hasGitHubToken = false;
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        hasGitHubToken = tokenData.hasToken;
      }
      
      if (!hasGitHubToken) {
        // Redirect to GitHub OAuth
        const githubAuthUrl = `/api/auth/github/authorize?projectId=${result.projectId}`;
        window.location.href = githubAuthUrl;
        return;
      }

      // Attempt GitHub push
      const pushResponse = await fetch(`/api/github/push-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: result.projectId }),
      });

      if (pushResponse.ok) {
        const pushData = await pushResponse.json();
        setGithubUrl(pushData.githubUrl);
        updateStep(currentStepIndex, 'completed', 'Repository created & code pushed');
      } else {
        updateStep(currentStepIndex, 'completed', 'GitHub push optional - project generated');
      }

      setIsComplete(true);
      // Redirect to project dashboard
      setTimeout(() => {
        router.push(`/projects/${result.projectId}`);
      }, 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMsg);
      updateStep(currentStepIndex, 'failed', errorMsg);
    }
  }, [router]);

  useEffect(() => {
    if (!session?.user?.id) {
      router.replace('/auth?returnTo=/build-full-app');
      return;
    }

    // Load blueprint from session storage
    const stored = sessionStorage.getItem('blueprintToBuild');
    if (!stored) {
      router.replace('/build');
      return;
    }

    try {
      const data = JSON.parse(stored);
      setBlueprintData(data);
      sessionStorage.removeItem('blueprintToBuild');

      // Initialize steps
      const initialSteps = GENERATION_STEPS.map(name => ({
        step: GENERATION_STEPS.indexOf(name),
        stepName: name,
        status: 'pending' as const,
        details: '',
      }));
      setSteps(initialSteps);

      // Start generation
      startGenerationFlow(data, session.user.id);
    } catch (err) {
      setError('Failed to load blueprint data');
    }
  }, [session, router, startGenerationFlow]);

  const updateStep = (stepIndex: number, status: BuildState['status'], details?: string) => {
    setSteps(prev => {
      const updated = [...prev];
      updated[stepIndex] = {
        ...updated[stepIndex],
        status,
        details: details || updated[stepIndex].details,
      };
      return updated;
    });
  };


  const progress = steps.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((progress / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            🏗️ Building Your App
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            VibeCode Mentor is generating your production-ready application
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-red-300 mb-2">Generation Failed</h3>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Generation Progress</h2>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 md:p-8 space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              {/* Step Icon */}
              <div className="flex-shrink-0 pt-1">
                {step.status === 'completed' && (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  step.status === 'completed'
                    ? 'text-green-400'
                    : step.status === 'in-progress'
                      ? 'text-purple-400'
                      : step.status === 'failed'
                        ? 'text-red-400'
                        : 'text-gray-400'
                }`}>
                  {step.stepName}
                </h3>
                {step.details && (
                  <p className="text-xs text-gray-500 mt-1">{step.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion */}
        {isComplete && (
          <div className="mt-8 bg-green-500/20 border border-green-500/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-green-300 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              App Generated Successfully!
            </h3>

            <p className="text-green-200 text-sm">
              Your production-ready application has been created with all the code, database migrations, and configurations.
            </p>

            {githubUrl && (
              <div className="space-y-3 pt-2 border-t border-green-500/30">
                <p className="text-green-200 font-medium">📦 GitHub Repository Created</p>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all text-center"
                >
                  🔗 Open GitHub Repository
                </a>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Clone command:</p>
                  <code className="text-sm text-green-300 font-mono break-all">
                    git clone {githubUrl}.git
                  </code>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-4 border-t border-green-500/30">
              <p className="text-green-200 font-medium">📚 Next Steps:</p>
              <ol className="text-sm text-green-200 space-y-1 ml-4 list-decimal">
                <li>Clone the repository to your local machine</li>
                <li>Install dependencies: <code className="bg-gray-800 px-2 py-1 rounded text-xs">npm install</code></li>
                <li>Create <code className="bg-gray-800 px-2 py-1 rounded text-xs">.env.local</code> from .env.example</li>
                <li>Set up your Supabase database and update credentials</li>
                <li>Run development server: <code className="bg-gray-800 px-2 py-1 rounded text-xs">npm run dev</code></li>
                <li>Deploy to Vercel or your preferred platform</li>
              </ol>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.push('/build')}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
              >
                Generate Another
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!isComplete && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-white mb-1">Code Generation</h3>
              <p className="text-xs text-gray-400">
                Generating TypeScript, React, and API routes following best practices
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl mb-2">🗄️</div>
              <h3 className="font-semibold text-white mb-1">Database Setup</h3>
              <p className="text-xs text-gray-400">
                Creating SQL migrations with RLS policies for Supabase
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-white mb-1">GitHub Integration</h3>
              <p className="text-xs text-gray-400">
                Automatically pushing all code to your GitHub repository
              </p>
            </div>
          </div>
        )}
      </div>

      <ChatBubble />
    </div>
  );
}
