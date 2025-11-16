import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { getProStatusFromCloud } from '@/lib/firebase';
import { generateScaffoldZip } from '@/lib/scaffold';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprint, repoName, isPrivate = false, githubToken, userId } = body;

    if (!blueprint || !repoName || !githubToken) {
      return NextResponse.json(
        { error: 'Blueprint, repository name, and GitHub token are required' },
        { status: 400 }
      );
    }

    // Check if user is Pro
    const isPro = userId ? await getProStatusFromCloud(userId) : false;

    if (!isPro) {
      return NextResponse.json(
        { error: 'Pro subscription required', message: 'GitHub auto-creation is a Pro feature. Upgrade to access!' },
        { status: 403 }
      );
    }

    // Initialize Octokit with user's token
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated();

    // Create repository
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: blueprint.summary,
      private: isPrivate,
      auto_init: true,
    });

    // Wait a moment for the repo to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate scaffold files
    const projectName = blueprint.title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Create files in the repository
    const filesToCreate = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: projectName,
          version: '0.1.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
            lint: 'next lint',
          },
        }, null, 2),
      },
      {
        path: 'README.md',
        content: `# ${blueprint.title}\n\n${blueprint.summary}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nGenerated with ❤️ by VibeCode Mentor`,
      },
      {
        path: '.gitignore',
        content: 'node_modules/\n.next/\n.env*.local',
      },
    ];

    // Create files
    for (const file of filesToCreate) {
      try {
        await octokit.repos.createOrUpdateFileContents({
          owner: user.login,
          repo: repoName,
          path: file.path,
          message: `Add ${file.path}`,
          content: Buffer.from(file.content).toString('base64'),
        });
      } catch (fileError) {
        console.error(`Error creating ${file.path}:`, fileError);
      }
    }

    return NextResponse.json({
      success: true,
      repoUrl: repo.html_url,
      repoName: repo.full_name,
      message: 'Repository created successfully!',
    });
  } catch (error: any) {
    console.error('Error creating GitHub repository:', error);
    
    let errorMessage = 'Failed to create GitHub repository';
    if (error.status === 401) {
      errorMessage = 'Invalid GitHub token. Please check your token and try again.';
    } else if (error.status === 422) {
      errorMessage = 'Repository name already exists or is invalid.';
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: error.status || 500 }
    );
  }
}
