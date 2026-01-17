'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Loader2, ArrowRight, Github, AlertCircle, Play, FileCode, Database, Server } from 'lucide-react';
import { User } from 'next-auth';

interface Step {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  icon: any;
}

interface BuildFullAppClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null;
  };
}

const GENERATION_STEPS: Step[] = [
  { id: 1, title: 'Parsing Blueprint', description: 'Analyzing project requirements and tech stack...', status: 'pending', icon: FileCode },
  { id: 2, title: 'Project Structure', description: 'Creating folders, config files, and environment setup...', status: 'pending', icon: Server },
  { id: 3, title: 'Database Schema', description: 'Generating SQL migrations and schema definitions...', status: 'pending', icon: Database },
  { id: 4, title: 'API Routes', description: 'Building backend endpoints and business logic...', status: 'pending', icon: Server },
  { id: 5, title: 'UI Components', description: 'Generating React components and pages...', status: 'pending', icon: FileCode },
  { id: 6, title: 'Authentication', description: 'Setting up NextAuth and security policies...', status: 'pending', icon: CheckCircle2 },
  { id: 7, title: 'Final Polish', description: 'Formatting code and checking consistency...', status: 'pending', icon: Loader2 },
  { id: 8, title: 'GitHub Push', description: 'Creating repository and pushing code...', status: 'pending', icon: Github },
];

export default function BuildFullAppClient({ user }: BuildFullAppClientProps) {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>(GENERATION_STEPS);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [blueprintData, setBlueprintData] = useState<any>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Load blueprint from session storage
    const stored = sessionStorage.getItem('blueprintToBuild');
    if (!stored) {
      router.push('/dashboard');
      return;
    }
    
    try {
      const parsed = JSON.parse(stored);
      setBlueprintData(parsed);
    } catch (e) {
      console.error("Failed to parse blueprint", e);
      setError("Invalid blueprint data");
    }
  }, [router]);

  const startGeneration = async () => {
    if (initialized.current || !blueprintData) return;
    initialized.current = true;
    
    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

    try {
      // 1. Initiate Generation
      updateStepStatus(1, 'loading');
      
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: sanitizeProjectName(blueprintData.projectIdea),
          description: blueprintData.projectIdea,
          blueprint: blueprintData.blueprint,
          features: ['auth', 'database', 'ui'], // Default features
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to start generation');
      }

      const data = await response.json();
      setProjectId(data.projectId);
      
      // Start polling for progress
      pollProgress(data.projectId);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      // Mark current loading step as error
      setSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error' } : s));
    }
  };

  const sanitizeProjectName = (idea: string) => {
    // Extract first 3 words or use generic name
    const words = idea.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    return words || 'vibecode-project';
  };

  const pollProgress = async (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate-project/${id}/status`);
        if (!res.ok) return;

        const statusData = await res.json();
        
        // Map backend steps to frontend UI steps
        // Note: Backend steps might differ slightly, we map by index or progress
        // This is a simplified mapping for simulation if backend sends raw steps
        
        // Simulating step progress based on backend "steps" array
        if (statusData.steps) {
           statusData.steps.forEach((backendStep: any, index: number) => {
               if (index < steps.length) {
                   if (backendStep.status === 'completed') {
                       updateStepStatus(index + 1, 'completed');
                   } else if (backendStep.status === 'in_progress') {
                       updateStepStatus(index + 1, 'loading');
                   }
               }
           });
        }
        
        if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
            setCompleted(true);
            setGithubUrl(statusData.githubUrl);
        } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            setError(statusData.error || 'Generation failed');
        }

      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2000);
  };

  const updateStepStatus = (id: number, status: Step['status']) => {
    setSteps(prev => prev.map(step => {
      if (step.id === id) return { ...step, status };
      // If we are moving to step X, make sure X-1 is completed
      if (status === 'loading' && step.id === id - 1) return { ...step, status: 'completed' };
      return step;
    }));
  };

  if (!blueprintData) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Building Your Application
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          VibeCode is turning your blueprint into production-ready code.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-8">
          
          {/* Project Info */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Project Idea</h3>
            <p className="text-blue-800 dark:text-blue-200 mt-1">{blueprintData.projectIdea}</p>
          </div>

          {/* Start Button (only if not started) */}
          {!initialized.current && !error && (
            <div className="text-center py-8">
              <button
                onClick={startGeneration}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Building Now
              </button>
            </div>
          )}

          {/* Steps List */}
          {(initialized.current || error) && (
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex items-center">
                  {/* Vertical Line */}
                  {index !== steps.length - 1 && (
                    <div className={`absolute left-6 top-10 w-0.5 h-10 ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    step.status === 'completed' ? 'bg-green-100 border-green-500 text-green-600' :
                    step.status === 'loading' ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse' :
                    step.status === 'error' ? 'bg-red-100 border-red-500 text-red-600' :
                    'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                     step.status === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> :
                     step.status === 'error' ? <AlertCircle className="w-6 h-6" /> :
                     <step.icon className="w-5 h-5" />}
                  </div>

                  {/* Content */}
                  <div className="ml-4 min-w-0 flex-1">
                    <h3 className={`text-lg font-medium ${
                      step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      step.status === 'loading' ? 'text-blue-600 dark:text-blue-400' :
                      step.status === 'error' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                  </div>

                  {/* Status Text (Optional) */}
                  <div className="ml-4 flex-shrink-0">
                    {step.status === 'loading' && <span className="text-sm text-blue-500 font-medium">In Progress...</span>}
                    {step.status === 'error' && <span className="text-sm text-red-500 font-medium">Failed</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Generation Failed</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
                <button 
                    onClick={() => { setError(null); initialized.current = false; }}
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                >
                    Try Again
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {completed && (
            <div className="mt-10 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">App Generated Successfully!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your full-stack application code has been generated and pushed to GitHub.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {githubUrl ? (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <Github className="mr-2 h-5 w-5" />
                      View on GitHub
                    </a>
                ) : (
                    <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed">
                        <Github className="mr-2 h-5 w-5" />
                        GitHub Link Unavailable
                    </button>
                )}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
