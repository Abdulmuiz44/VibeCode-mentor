import { Octokit } from '@octokit/rest';
import { GeneratedFile } from '@/lib/code-generator/types';

export class GitHubRepository {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  /**
   * Create a new repository on GitHub
   */
  async createRepository(
    repoName: string,
    description: string,
    isPrivate: boolean = false
  ): Promise<{
    id: number;
    name: string;
    full_name: string;
    html_url: string;
  }> {
    const { data } = await this.octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      private: isPrivate,
      auto_init: false,
      gitignore_template: 'Node',
    });

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      html_url: data.html_url,
    };
  }

  /**
   * Push generated files to repository
   */
  async pushFiles(
    owner: string,
    repo: string,
    files: GeneratedFile[],
    commitMessage: string = 'Initial commit: Generated with VibeCode Mentor'
  ): Promise<void> {
    // Get the default branch (usually main)
    const { data: repoData } = await this.octokit.repos.get({
      owner,
      repo,
    });

    const defaultBranch = repoData.default_branch;

    // Get the latest commit SHA from the default branch
    let baseSha: string;
    try {
      const { data: refData } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`,
      });
      baseSha = refData.object.sha;
    } catch {
      // Repository is empty, create initial commit
      baseSha = await this.createInitialCommit(owner, repo, files, commitMessage);
      return;
    }

    // Get the tree for the commit
    const { data: baseTree } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: baseSha,
    });

    // Create new tree with all files
    const treeItems = files.map(file => ({
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: file.content,
    }));

    const { data: newTree } = await this.octokit.git.createTree({
      owner,
      repo,
      tree: treeItems,
      base_tree: baseTree.sha,
    });

    // Create commit
    const { data: commit } = await this.octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [baseSha],
    });

    // Update ref
    await this.octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: commit.sha,
    });
  }

  /**
   * Create initial commit for empty repository
   */
  private async createInitialCommit(
    owner: string,
    repo: string,
    files: GeneratedFile[],
    commitMessage: string
  ): Promise<string> {
    const treeItems = files.map(file => ({
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: file.content,
    }));

    // Create tree
    const { data: tree } = await this.octokit.git.createTree({
      owner,
      repo,
      tree: treeItems,
    });

    // Create commit (without parent)
    const { data: commit } = await this.octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: tree.sha,
    });

    // Create ref
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/main`,
      sha: commit.sha,
    });

    return commit.sha;
  }

  /**
   * Create a Pull Request
   */
  async createPullRequest(
    owner: string,
    repo: string,
    head: string,
    base: string,
    title: string,
    body: string
  ): Promise<{ html_url: string; number: number }> {
    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      head,
      base,
      title,
      body,
    });

    return {
      html_url: data.html_url,
      number: data.number,
    };
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if ('content' in data && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      console.warn(`File not found: ${path}`);
      return null;
    }
  }

  /**
   * Commit specific files to a branch (for PRs)
   */
  async commitFilesToBranch(
    owner: string,
    repo: string,
    branch: string,
    files: GeneratedFile[],
    message: string
  ): Promise<void> {
    // 1. Get the latest commit SHA of the branch
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const latestCommitSha = refData.object.sha;

    // 2. Get the tree base
    const { data: commitData } = await this.octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // 3. Create a new tree with the updated files
    const treeItems = files.map(file => ({
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: file.content,
    }));

    const { data: newTree } = await this.octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeItems,
    });

    // 4. Create a new commit
    const { data: newCommit } = await this.octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    // 5. Update the branch reference
    await this.octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });
  }

  /**
   * Add GitHub Pages configuration
   */
  async addGitHubPages(owner: string, repo: string): Promise<void> {
    await this.octokit.repos.update({
      owner,
      repo,
      homepage: `https://${owner}.github.io/${repo}`,
    });
  }

  /**
   * Create README with setup instructions
   */
  async addReadme(
    owner: string,
    repo: string,
    content: string
  ): Promise<void> {
    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Add README',
      content: Buffer.from(content).toString('base64'),
    });
  }

  /**
   * Create branch
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    baseBranch: string = 'main'
  ): Promise<void> {
    // Get the SHA of the base branch
    const { data: ref } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });

    // Create new branch
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });
  }

  /**
   * Add repository secret (for GitHub Actions)
   */
  async addSecret(
    owner: string,
    repo: string,
    secretName: string,
    secretValue: string
  ): Promise<void> {
    // Get public key for encryption
    const { data: pubKey } = await this.octokit.rest.actions.getRepoPublicKey({
      owner,
      repo,
    });

    // Encrypt secret
    const encrypted = await this.encryptSecret(secretValue, pubKey.key);

    // Create secret
    await this.octokit.rest.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: secretName,
      encrypted_value: encrypted,
      key_id: pubKey.key_id,
    });
  }

  /**
   * Encrypt value for GitHub Actions secrets
   */
  private async encryptSecret(
    secretValue: string,
    publicKey: string
  ): Promise<string> {
    // This requires libsodium - using a simple implementation
    // In production, use: npm install tweetsodium
    
    // For now, return base64 encoded (not secure for production)
    // TODO: Implement proper encryption with tweetsodium
    return Buffer.from(secretValue).toString('base64');
  }

  /**
   * Enable branch protection
   */
  async protectBranch(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<void> {
    await this.octokit.rest.repos.updateBranchProtection({
      owner,
      repo,
      branch,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
        required_approving_review_count: 0,
      },
      enforce_admins: false,
      required_status_checks: null,
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false,
    } as any);
  }
}

/**
 * Push generated project to GitHub (full workflow)
 */
export async function pushProjectToGithub(
  accessToken: string,
  projectName: string,
  description: string,
  files: GeneratedFile[]
): Promise<{
  repoId: number;
  repoName: string;
  repoUrl: string;
  cloneUrl: string;
}> {
  const github = new GitHubRepository(accessToken);

  try {
    // 1. Create repository
    const repo = await github.createRepository(projectName, description, false);

    // 2. Push files
    await github.pushFiles(repo.full_name.split('/')[0], repo.name, files);

    // 3. Create development branch
    try {
      await github.createBranch(
        repo.full_name.split('/')[0],
        repo.name,
        'develop',
        'main'
      );
    } catch (err) {
      console.warn('Failed to create develop branch:', err);
    }

    return {
      repoId: repo.id,
      repoName: repo.name,
      repoUrl: repo.html_url,
      cloneUrl: `${repo.html_url}.git`,
    };
  } catch (error) {
    console.error('Failed to push project to GitHub:', error);
    throw new Error(
      `GitHub push failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
