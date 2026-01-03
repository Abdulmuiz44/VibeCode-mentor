'use client';

import { useEffect, useState } from 'react';

interface BuildStep {
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: string;
}

interface BuildProgressProps {
  buildId: string;
  onComplete?: (githubUrl: string) => void;
  onError?: (error: string) => void;
}

export function BuildProgress({ buildId, onComplete, onError }: BuildProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('building');
  const [steps, setSteps] = useState<BuildStep[]>([]);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/build-project/${buildId}/status`);
        const data = await res.json();

        setStatus(data.status);
        setProgress(data.progress);
        setSteps(data.steps || []);
        setCurrentStep(data.currentStep);
        
        if (data.githubUrl) {
          setGithubUrl(data.githubUrl);
        }

        if (data.status === 'completed') {
          clearInterval(interval);
          if (data.githubUrl && onComplete) {
            onComplete(data.githubUrl);
          }
        } else if (data.status === 'failed') {
          clearInterval(interval);
          if (data.error && onError) {
            onError(data.error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch build status:', error);
        if (onError) {
          onError('Failed to fetch build status');
        }
      }
    };

    const interval = setInterval(pollStatus, 1000);
    pollStatus(); // Immediate call

    return () => clearInterval(interval);
  }, [buildId, onComplete, onError]);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress percentage */}
      <div className="text-sm text-gray-600">{progress}% Complete</div>

      {/* Current step */}
      {currentStep && (
        <div className="text-sm font-medium text-gray-900">
          {currentStep}
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            {step.status === 'completed' && (
              <span className="text-green-600 text-lg">✓</span>
            )}
            {step.status === 'in-progress' && (
              <span className="text-blue-600 text-lg animate-spin">⟳</span>
            )}
            {step.status === 'failed' && (
              <span className="text-red-600 text-lg">✗</span>
            )}
            {step.status === 'pending' && (
              <span className="text-gray-400 text-lg">○</span>
            )}
            
            <span className="text-sm">{step.name}</span>
            
            {step.error && (
              <span className="text-xs text-red-600 ml-auto">{step.error}</span>
            )}
          </div>
        ))}
      </div>

      {/* GitHub link */}
      {githubUrl && (
        <div className="mt-4 pt-4 border-t">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-2"
          >
            View on GitHub →
          </a>
        </div>
      )}

      {/* Status messages */}
      {status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          ✓ Build completed successfully!
        </div>
      )}
      {status === 'failed' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          ✗ Build failed. Check logs above for details.
        </div>
      )}
    </div>
  );
}
