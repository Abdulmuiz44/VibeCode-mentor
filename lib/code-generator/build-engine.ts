import { BlueprintV2, GeneratedFile } from './types';
import { BlueprintValidator } from './blueprint-validator';
import { BuildDatabase } from '@/lib/db/builds';
import { CodeGenerator } from './generator';
import { SandboxManager } from '@/lib/sandbox';
import { SandboxDatabase, BuildLogDatabase } from '@/lib/sandbox/database';
import { BuildProgress } from '@/lib/sandbox/types';

export type BuildStepName =
  | 'Validating Blueprint'
  | 'Initializing Sandbox'
  | 'Generating Files'
  | 'Writing to Sandbox'
  | 'Installing Dependencies'
  | 'Building Project'
  | 'Starting Preview'
  | 'Pushing to GitHub'
  | 'Finalizing';

export interface BuildResult {
  success: boolean;
  buildId: string;
  sandboxId?: string;
  previewUrl?: string;
  githubUrl?: string;
  filesGenerated: number;
  executionTimeMs: number;
  error?: string;
}

export class BuildEngine {
  private blueprint: BlueprintV2;
  private buildId: string;
  private userId: string;
  private projectId: string;
  private startTime: number;
  private generatedFiles: GeneratedFile[] = [];
  private logs: string[] = [];
  private sandboxManager: SandboxManager;
  private sandboxId: string = '';
  private dbSandboxId: string = '';

  private buildSteps: BuildStepName[] = [
    'Validating Blueprint',
    'Initializing Sandbox',
    'Generating Files',
    'Writing to Sandbox',
    'Installing Dependencies',
    'Building Project',
    'Starting Preview',
    'Pushing to GitHub',
    'Finalizing',
  ];

  constructor(buildId: string, blueprint: BlueprintV2, userId: string, projectId: string) {
    this.buildId = buildId;
    this.blueprint = blueprint;
    this.userId = userId;
    this.projectId = projectId;
    this.startTime = Date.now();
    this.sandboxManager = new SandboxManager();
  }

  async execute(): Promise<BuildResult> {
    let previewUrl: string | null = null;
    let githubUrl: string | null = null;

    try {
      // Create build steps in DB
      await this.initializeSteps();

      // Step 1: Validate Blueprint
      await this.executeStep('Validating Blueprint', async () => {
        const validation = BlueprintValidator.validate(this.blueprint);
        if (!validation.isValid) {
          const errorMsg = validation.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join('; ');
          throw new Error(`Blueprint validation failed: ${errorMsg}`);
        }
        this.log(`Blueprint validation passed. Stack: ${BlueprintValidator.getStackSummary(this.blueprint)}`);
      });

      // Step 2: Initialize Sandbox
      await this.executeStep('Initializing Sandbox', async () => {
        this.log('Creating cloud sandbox environment...');

        // Create DB record first
        const dbSandbox = await SandboxDatabase.create(this.projectId, 'e2b');
        this.dbSandboxId = dbSandbox.id;

        // Create actual sandbox
        this.sandboxId = await this.sandboxManager.create(this.projectId);

        // Update DB with sandbox ID
        await SandboxDatabase.updateSandboxId(this.dbSandboxId, this.sandboxId);

        this.log(`Sandbox created: ${this.sandboxId}`);
        await BuildLogDatabase.log(this.projectId, 'Sandbox Created', `ID: ${this.sandboxId}`, 'info', this.dbSandboxId);
      });

      // Step 3: Generate Files
      await this.executeStep('Generating Files', async () => {
        this.log('Generating code from blueprint...');
        try {
          const generator = new CodeGenerator(this.blueprint as any);
          const project = generator.generate();
          this.generatedFiles = project.files;
          this.log(`Generated ${project.files.length} files`);
          this.log(`Technologies: ${project.summary.technologies.join(', ')}`);
          await BuildLogDatabase.log(this.projectId, 'Code Generation', `Generated ${project.files.length} files`, 'info', this.dbSandboxId);
        } catch (error) {
          this.log(`CodeGenerator error: ${error instanceof Error ? error.message : String(error)}`);
          throw error;
        }
      });

      // Step 4: Write Files to Sandbox
      await this.executeStep('Writing to Sandbox', async () => {
        this.log(`Writing ${this.generatedFiles.length} files to sandbox...`);
        await this.sandboxManager.writeFiles(this.sandboxId, this.generatedFiles);
        this.log('Files written successfully');
        await BuildLogDatabase.log(this.projectId, 'Files Written', `Wrote ${this.generatedFiles.length} files`, 'info', this.dbSandboxId);
      });

      // Step 5: Install Dependencies
      await this.executeStep('Installing Dependencies', async () => {
        this.log('Running npm install...');
        const result = await this.sandboxManager.execute(this.sandboxId, 'npm install');

        if (!result.success) {
          await BuildLogDatabase.log(this.projectId, 'npm install', result.stderr, 'error', this.dbSandboxId);
          throw new Error(`npm install failed: ${result.stderr}`);
        }

        this.log(`Dependencies installed in ${result.duration}ms`);
        await BuildLogDatabase.log(this.projectId, 'npm install', `Completed in ${result.duration}ms`, 'info', this.dbSandboxId);
      });

      // Step 6: Build Project
      await this.executeStep('Building Project', async () => {
        this.log('Running npm run build...');
        const result = await this.sandboxManager.execute(this.sandboxId, 'npm run build');

        if (!result.success) {
          await BuildLogDatabase.log(this.projectId, 'Build', result.stderr, 'error', this.dbSandboxId);
          throw new Error(`Build failed: ${result.stderr}`);
        }

        this.log(`Build completed in ${result.duration}ms`);
        await BuildLogDatabase.log(this.projectId, 'Build', `Completed in ${result.duration}ms`, 'info', this.dbSandboxId);
      });

      // Step 7: Start Preview Server
      await this.executeStep('Starting Preview', async () => {
        this.log('Starting development server...');

        // Start dev server in background
        await this.sandboxManager.execute(this.sandboxId, 'npm run dev &');

        // Wait for server to start
        await new Promise(r => setTimeout(r, 3000));

        previewUrl = await this.sandboxManager.getPreviewUrl(this.sandboxId);

        if (previewUrl) {
          await SandboxDatabase.updatePreviewUrl(this.dbSandboxId, previewUrl);
          await SandboxDatabase.updateStatus(this.dbSandboxId, 'running');
          this.log(`Preview available at: ${previewUrl}`);
        } else {
          this.log('Preview URL not available yet');
        }

        await BuildLogDatabase.log(this.projectId, 'Preview', `URL: ${previewUrl || 'pending'}`, 'info', this.dbSandboxId);
      });

      // Step 8: Push to GitHub (if token available)
      await this.executeStep('Pushing to GitHub', async () => {
        try {
          const { GitHubTokenDatabase } = await import('@/lib/db/github');
          const { pushProjectToGithub } = await import('@/lib/github/repository');

          const token = await GitHubTokenDatabase.getToken(this.userId);

          if (token) {
            this.log('Pushing to GitHub...');
            const projectName = (this.blueprint as any).name || (this.blueprint as any).title || 'vibecode-project';
            const description = (this.blueprint as any).description || 'Generated by VibeCode Mentor';

            const repo = await pushProjectToGithub(
              token.access_token,
              projectName,
              description,
              this.generatedFiles
            );

            githubUrl = repo.repoUrl;
            this.log(`Pushed to GitHub: ${githubUrl}`);
            await BuildLogDatabase.log(this.projectId, 'GitHub', `Repository: ${githubUrl}`, 'info', this.dbSandboxId);
          } else {
            this.log('No GitHub token available - skipping push');
          }
        } catch (error) {
          this.log(`GitHub push skipped: ${error instanceof Error ? error.message : 'Error'}`);
          // Don't throw - GitHub is optional
        }
      });

      // Step 9: Finalize
      await this.executeStep('Finalizing', async () => {
        const executionTime = Date.now() - this.startTime;

        await BuildDatabase.updateBuildStatus(this.buildId, 'completed', {
          completion_time_ms: executionTime,
          github_url: githubUrl || undefined,
          preview_url: previewUrl || undefined,
        });

        this.log(`Build completed in ${Math.round(executionTime / 1000)}s`);
        await BuildLogDatabase.log(this.projectId, 'Complete', `Total time: ${executionTime}ms`, 'info', this.dbSandboxId);
      });

      const executionTime = Date.now() - this.startTime;

      return {
        success: true,
        buildId: this.buildId,
        sandboxId: this.dbSandboxId,
        previewUrl: previewUrl || undefined,
        githubUrl: githubUrl || undefined,
        filesGenerated: this.generatedFiles.length,
        executionTimeMs: executionTime,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`ERROR: ${errorMsg}`);

      // Update DB statuses
      await BuildDatabase.updateBuildStatus(this.buildId, 'failed', {
        error_message: errorMsg,
      });

      if (this.dbSandboxId) {
        await SandboxDatabase.updateStatus(this.dbSandboxId, 'error', errorMsg);
        await BuildLogDatabase.log(this.projectId, 'Error', errorMsg, 'error', this.dbSandboxId);
      }

      const executionTime = Date.now() - this.startTime;

      return {
        success: false,
        buildId: this.buildId,
        sandboxId: this.dbSandboxId || undefined,
        filesGenerated: this.generatedFiles.length,
        executionTimeMs: executionTime,
        error: errorMsg,
      };
    }
  }

  /**
   * Create a new sandbox and write files (used for partial rebuilds)
   */
  private async create(projectId: string): Promise<string> {
    return this.sandboxManager.create(projectId);
  }

  /**
   * Write files to sandbox
   */
  private async writeFiles(sandboxId: string, files: GeneratedFile[]): Promise<void> {
    // Method for SandboxManager compatibility
    const sandbox = this.sandboxManager;
    // Use the client's writeFiles via execute commands
    for (const file of files) {
      // This is handled in the main execute() flow
    }
  }

  private async initializeSteps(): Promise<void> {
    for (let i = 0; i < this.buildSteps.length; i++) {
      await BuildDatabase.createStep(this.buildId, this.buildSteps[i], i);
    }
  }

  private async executeStep(stepName: BuildStepName, stepFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    this.log(`\n[${stepName}]`);

    try {
      await BuildDatabase.updateBuildStatus(this.buildId, 'building');
      await stepFn();
      const duration = Date.now() - startTime;
      this.log(`✓ Completed in ${Math.round(duration / 1000)}s`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`✗ Failed: ${errorMsg}`);
      throw error;
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ${message}`;
    this.logs.push(fullMessage);
    console.log(fullMessage);
  }

  getLogs(): string[] {
    return this.logs;
  }

  getSandboxId(): string {
    return this.dbSandboxId;
  }

  getGeneratedFiles(): GeneratedFile[] {
    return this.generatedFiles;
  }
}
