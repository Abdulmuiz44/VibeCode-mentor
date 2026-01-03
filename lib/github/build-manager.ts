import { Octokit } from '@octokit/rest';
import { GeneratedFile } from '@/lib/code-generator/types';

export interface RepositoryCreateResult {
  id: number;
  url: string;
  name: string;
  owner: string;
}

export interface CommitPlan {
  type: 'chore' | 'feat' | 'fix' | 'docs';
  scope?: string;
  message: string;
  files: GeneratedFile[];
}

export class GitHubBuildManager {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  async createRepository(
    repoName: string,
    description: string
  ): Promise<RepositoryCreateResult> {
    try {
      const { data } = await this.octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description,
        private: false,
        auto_init: true,
      });

      return {
        id: data.id,
        url: data.html_url,
        name: data.name,
        owner: data.owner?.login || '',
      };
    } catch (error) {
      console.error('Failed to create repository:', error);
      throw error;
    }
  }

  async pushFiles(
    owner: string,
    repo: string,
    files: GeneratedFile[],
    commitMessage: string
  ): Promise<string> {
    try {
      // Get current main branch
      const { data: mainRef } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: 'heads/main',
      });

      // Create tree from files
      const treeItems = await Promise.all(
        files.map(async (file) => ({
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          content: file.content,
        }))
      );

      // Create blob for each file and get SHA
      const blobs = await Promise.all(
        files.map((file) =>
          this.octokit.git.createBlob({
            owner,
            repo,
            content: file.content,
            encoding: 'utf-8',
          })
        )
      );

      // Create tree
      const { data: tree } = await this.octokit.git.createTree({
        owner,
        repo,
        tree: files.map((file, idx) => ({
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blobs[idx].data.sha,
        })),
        base_tree: mainRef.object.sha,
      });

      // Create commit
      const { data: commit } = await this.octokit.git.createCommit({
        owner,
        repo,
        message: commitMessage,
        tree: tree.sha,
        parents: [mainRef.object.sha],
      });

      // Update ref
      await this.octokit.git.updateRef({
        owner,
        repo,
        ref: 'heads/main',
        sha: commit.sha,
      });

      return commit.sha;
    } catch (error) {
      console.error('Failed to push files:', error);
      throw error;
    }
  }

  async createSemanticCommits(
    owner: string,
    repo: string,
    commitPlan: CommitPlan[]
  ): Promise<string[]> {
    const commitShas: string[] = [];

    for (const plan of commitPlan) {
      const message = plan.scope
        ? `${plan.type}(${plan.scope}): ${plan.message}`
        : `${plan.type}: ${plan.message}`;

      const sha = await this.pushFiles(owner, repo, plan.files, message);
      commitShas.push(sha);
    }

    return commitShas;
  }

  async createRelease(
    owner: string,
    repo: string,
    tagName: string,
    releaseName: string,
    body: string
  ): Promise<{ id: number; url: string }> {
    try {
      const { data } = await this.octokit.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name: releaseName,
        body,
      });

      return {
        id: data.id,
        url: data.html_url,
      };
    } catch (error) {
      console.error('Failed to create release:', error);
      throw error;
    }
  }

  async getUser(): Promise<{ login: string; id: number }> {
    try {
      const { data } = await this.octokit.users.getAuthenticated();
      return {
        login: data.login,
        id: data.id,
      };
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  }

  generateCommitPlan(files: GeneratedFile[]): CommitPlan[] {
    const plan: CommitPlan[] = [];

    // Group files by type
    const configFiles = files.filter((f) => this.isConfigFile(f.path));
    const migrationFiles = files.filter((f) => f.path.includes('migrations'));
    const authFiles = files.filter((f) => f.path.includes('auth'));
    const apiFiles = files.filter((f) => f.path.includes('api'));
    const componentFiles = files.filter((f) => f.path.includes('components'));
    const docFiles = files.filter((f) => f.path.endsWith('.md'));

    if (configFiles.length > 0) {
      plan.push({
        type: 'chore',
        message: 'initialize project structure',
        files: configFiles,
      });
    }

    if (migrationFiles.length > 0) {
      plan.push({
        type: 'feat',
        scope: 'database',
        message: 'setup schema and migrations',
        files: migrationFiles,
      });
    }

    if (authFiles.length > 0) {
      plan.push({
        type: 'feat',
        scope: 'auth',
        message: 'implement authentication',
        files: authFiles,
      });
    }

    if (apiFiles.length > 0) {
      plan.push({
        type: 'feat',
        scope: 'api',
        message: 'implement API routes',
        files: apiFiles,
      });
    }

    if (componentFiles.length > 0) {
      plan.push({
        type: 'feat',
        scope: 'components',
        message: 'add UI components',
        files: componentFiles,
      });
    }

    if (docFiles.length > 0) {
      plan.push({
        type: 'docs',
        message: 'add setup and deployment guides',
        files: docFiles,
      });
    }

    return plan;
  }

  private isConfigFile(path: string): boolean {
    const configPatterns = [
      'package.json',
      'tsconfig.json',
      'eslint',
      'prettier',
      '.gitignore',
      'next.config',
      'tailwind',
      'postcss',
      'vercel.json',
    ];

    return configPatterns.some((pattern) => path.includes(pattern));
  }
}
