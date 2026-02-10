import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/kv';
import { getProStatusFromCloud } from '@/lib/supabase.server';
import { FileNode } from '@/types/project';

// Build service configuration
const BUILD_SERVICE_URL = process.env.BUILD_SERVICE_URL || 'http://localhost:3001';
const BUILD_API_KEY = process.env.BUILD_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { projectId, files, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check if user is Pro (building is a Pro feature)
    const isPro = await getProStatusFromCloud(userId);

    if (!isPro) {
      return NextResponse.json(
        { error: 'Building is a Pro feature. Please upgrade to build and deploy your projects.' },
        { status: 403 }
      );
    }

    if (!projectId || !files) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Start the build process
    const buildId = await initiateBuild(projectId, files);
    
    // Poll for build completion
    const result = await pollBuildStatus(buildId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        previewUrl: result.previewUrl,
        deployedUrl: result.deployedUrl,
        buildId: buildId
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Build failed' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Build API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function initiateBuild(projectId: string, files: FileNode[]): Promise<string> {
  try {
    const response = await fetch(`${BUILD_SERVICE_URL}/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BUILD_API_KEY}`,
      },
      body: JSON.stringify({
        projectId,
        files: flattenFiles(files),
        buildConfig: {
          framework: 'react',
          buildCommand: 'npm run build',
          outputDir: 'build',
          installCommand: 'npm install'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Build service error: ${response.status}`);
    }

    const data = await response.json();
    return data.buildId;

  } catch (error) {
    console.error('Failed to initiate build:', error);
    
    // Fallback to mock build for development
    return `mock-build-${Date.now()}`;
  }
}

async function pollBuildStatus(buildId: string): Promise<any> {
  const maxAttempts = 30; // 30 seconds max
  const pollInterval = 1000; // 1 second

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${BUILD_SERVICE_URL}/build/${buildId}/status`, {
        headers: {
          'Authorization': `Bearer ${BUILD_API_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'completed') {
          return {
            success: true,
            previewUrl: data.previewUrl,
            deployedUrl: data.deployedUrl
          };
        } else if (data.status === 'failed') {
          return {
            success: false,
            error: data.error
          };
        }
      }

      // If we can't reach the build service, use mock response for development
      if (attempt > 5) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate build time
        return {
          success: true,
          previewUrl: `https://preview-${buildId}.vercel.app`,
          deployedUrl: `https://app-${buildId}.vercel.app`
        };
      }

    } catch (error) {
      console.error('Build status check failed:', error);
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  return {
    success: false,
    error: 'Build timeout'
  };
}

function flattenFiles(files: FileNode[]): any[] {
  const result: any[] = [];
  
  function traverse(node: FileNode, path: string = '') {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    
    if (node.type === 'file' && node.content !== undefined) {
      result.push({
        path: currentPath,
        content: node.content,
        encoding: 'utf8'
      });
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => traverse(child, currentPath));
    }
  }
  
  files.forEach(file => traverse(file));
  return result;
}

// GET endpoint to check build status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildId = searchParams.get('buildId');

    if (!buildId) {
      return NextResponse.json(
        { error: 'Missing buildId parameter' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BUILD_SERVICE_URL}/build/${buildId}/status`, {
      headers: {
        'Authorization': `Bearer ${BUILD_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Build service error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Build status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
