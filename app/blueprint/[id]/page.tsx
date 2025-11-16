'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import BlueprintHeader from '@/components/feature/BlueprintHeader';
import BlueprintSteps from '@/components/feature/BlueprintSteps';
import UiGeneratorPreview from '@/components/feature/UiGeneratorPreview';

interface Blueprint {
  id?: string;
  title: string;
  summary: string;
  scope: string[];
  stack: any;
  systemDesign?: any;
  folderStructure: string[];
  tasks: any[];
  hints?: string[];
  risks?: string[];
  estimatedTotalHours?: number;
  difficulty?: number;
  monthlyHostingCost?: number;
}

interface UIData {
  screens: any[];
  componentDefs: any[];
  colorPalette?: any;
}

export default function BlueprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [uiData, setUiData] = useState<UIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingUI, setGeneratingUI] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = auth?.onAuthStateChanged((currentUser: any) => {
      setUser(currentUser);
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const fetchBlueprint = async () => {
      if (!params.id || !user) return;

      try {
        setLoading(true);
        // For now, we'll use a demo blueprint
        // In production, fetch from Firestore using the API
        const demoBlueprint: Blueprint = {
          id: params.id as string,
          title: 'Demo Project Blueprint',
          summary: 'A sample project to demonstrate the blueprint viewer',
          scope: [
            'User authentication and authorization',
            'Dashboard with analytics',
            'CRUD operations for main entities',
            'Admin panel',
            'API integration',
          ],
          stack: {
            frontend: 'Next.js 14 with TypeScript',
            backend: 'Next.js API Routes',
            database: 'Firestore',
            auth: 'Firebase Auth',
            styling: 'Tailwind CSS',
            hosting: 'Vercel',
            additional: ['React Hook Form', 'Zod', 'React Query'],
          },
          systemDesign: {
            modules: [
              {
                name: 'Authentication',
                description: 'User registration, login, and password management',
                endpoints: ['POST /api/auth/login', 'POST /api/auth/register', 'POST /api/auth/logout'],
                components: ['LoginForm', 'RegisterForm', 'AuthButton'],
              },
              {
                name: 'Dashboard',
                description: 'Main user dashboard with statistics and recent activity',
                endpoints: ['GET /api/dashboard/stats', 'GET /api/dashboard/activity'],
                components: ['DashboardHeader', 'StatsCards', 'ActivityFeed'],
              },
            ],
          },
          folderStructure: [
            'app/',
            'app/api/',
            'app/api/auth/',
            'app/dashboard/',
            'components/',
            'components/auth/',
            'components/dashboard/',
            'lib/',
            'lib/firebase.ts',
            'types/',
            'package.json',
            'tsconfig.json',
          ],
          tasks: [
            {
              id: 1,
              title: 'Project Setup',
              description: 'Initialize Next.js project with TypeScript and Tailwind CSS',
              estimateHours: 2,
              difficulty: 1,
              sprint: 1,
              dependencies: [],
            },
            {
              id: 2,
              title: 'Authentication System',
              description: 'Implement Firebase Auth with login and registration',
              estimateHours: 8,
              difficulty: 5,
              sprint: 1,
              dependencies: [1],
            },
            {
              id: 3,
              title: 'Dashboard UI',
              description: 'Create dashboard layout and statistics cards',
              estimateHours: 12,
              difficulty: 6,
              sprint: 2,
              dependencies: [1, 2],
            },
          ],
          hints: [
            'Use server components for better performance',
            'Implement pagination for large datasets',
            'Add proper error handling and loading states',
          ],
          risks: [
            'Real-time features may require additional WebSocket setup',
            'Consider rate limiting for API endpoints',
          ],
          estimatedTotalHours: 40,
          difficulty: 6,
          monthlyHostingCost: 15,
        };

        setBlueprint(demoBlueprint);
      } catch (err) {
        console.error('Error fetching blueprint:', err);
        setError('Failed to load blueprint');
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprint();
  }, [params.id, user]);

  const handleGenerateUI = async () => {
    if (!blueprint || !user) return;

    setGeneratingUI(true);
    try {
      const response = await fetch('/api/ai/ui-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: blueprint.title + ': ' + blueprint.summary,
          userId: user.uid,
          platform: 'web',
          style: 'modern',
          screenCount: 5,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUiData(data.uiData);
      } else {
        alert(data.message || 'Failed to generate UI');
      }
    } catch (err) {
      console.error('Error generating UI:', err);
      alert('Failed to generate UI');
    } finally {
      setGeneratingUI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Blueprint not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BlueprintHeader
          title={blueprint.title}
          summary={blueprint.summary}
          onSave={() => alert('Save functionality coming soon!')}
          onExport={() => alert('Export functionality coming soon!')}
          onGenerateUI={handleGenerateUI}
        />

        {generatingUI && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <p className="text-gray-700">Generating UI components... This may take a moment.</p>
            </div>
          </div>
        )}

        {uiData && (
          <div className="mb-6">
            <UiGeneratorPreview
              screens={uiData.screens}
              componentDefs={uiData.componentDefs}
              colorPalette={uiData.colorPalette}
            />
          </div>
        )}

        <BlueprintSteps
          scope={blueprint.scope}
          stack={blueprint.stack}
          systemDesign={blueprint.systemDesign}
          folderStructure={blueprint.folderStructure}
          tasks={blueprint.tasks}
          hints={blueprint.hints}
          risks={blueprint.risks}
        />

        {blueprint.estimatedTotalHours && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Project Estimates</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Estimated Hours</p>
                <p className="text-3xl font-bold text-purple-900">{blueprint.estimatedTotalHours}h</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Difficulty Level</p>
                <p className="text-3xl font-bold text-blue-900">{blueprint.difficulty}/10</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Monthly Hosting</p>
                <p className="text-3xl font-bold text-green-900">${blueprint.monthlyHostingCost}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
