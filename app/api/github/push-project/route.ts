import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ProjectDatabase } from '@/lib/db/projects';
import { GitHubTokenDatabase } from '@/lib/db/github';
import { GitHubRepository } from '@/lib/github/repository';
import { getProStatusFromCloud } from '@/lib/supabase.server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check Pro status
    const isPro = await getProStatusFromCloud(session.user.id);
    if (!isPro) {
      return NextResponse.json(
        { error: 'Upgrade to Pro to push to GitHub' },
        { status: 403 }
      );
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }

    // Get project
    const project = await ProjectDatabase.getProject(projectId);
    if (project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get GitHub token
    const gitHubToken = await GitHubTokenDatabase.getToken(session.user.id);
    if (!gitHubToken) {
      return NextResponse.json(
        { error: 'GitHub token not found', needsAuth: true },
        { status: 401 }
      );
    }

    // Create GitHub repository
    const github = new GitHubRepository(gitHubToken.access_token);
    const repoName = project.project_slug.replace(/\s+/g, '-').toLowerCase();
    const repo = await github.createRepository(
      repoName,
      project.description || '',
      false
    );

    // Use generated files directly (already in correct format)
    const files = project.generated_files?.files || [];

    // Push files to repository
    await github.pushFiles(repo.full_name.split('/')[0], repo.name, files as any);

    // Update project with GitHub URL
    await ProjectDatabase.updateProjectGithubUrl(
      projectId,
      repo.html_url,
      repo.id
    );

    return NextResponse.json({
      githubUrl: repo.html_url,
      repoName: repo.full_name,
    });
  } catch (error) {
    console.error('GitHub push error:', error);
    return NextResponse.json(
      { error: 'Failed to push to GitHub', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
