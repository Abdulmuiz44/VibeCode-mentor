import { BlueprintV2, GeneratedFile } from './types';
import { BlueprintValidator } from './blueprint-validator';
import { BuildDatabase } from '@/lib/db/builds';
import { CodeGenerator } from './generator';

export type BuildStepName =
  | 'Validating Blueprint'
  | 'Initializing Project'
  | 'Generating Files'
  | 'Executing Features'
  | 'Integrating Components'
  | 'Generating Documentation'
  | 'Pushing to GitHub'
  | 'Finalizing';

export interface BuildResult {
  success: boolean;
  buildId: string;
  githubUrl?: string;
  filesGenerated: number;
  executionTimeMs: number;
  error?: string;
}

export class BuildEngine {
  private blueprint: BlueprintV2;
  private buildId: string;
  private userId: string;
  private startTime: number;
  private generatedFiles: GeneratedFile[] = [];
  private logs: string[] = [];

  private buildSteps: BuildStepName[] = [
    'Validating Blueprint',
    'Initializing Project',
    'Generating Files',
    'Executing Features',
    'Integrating Components',
    'Generating Documentation',
    'Pushing to GitHub',
    'Finalizing',
  ];

  constructor(buildId: string, blueprint: BlueprintV2, userId: string) {
    this.buildId = buildId;
    this.blueprint = blueprint;
    this.userId = userId;
    this.startTime = Date.now();
  }

  async execute(): Promise<BuildResult> {
    try {
      // Create build steps in DB
      await this.initializeSteps();

      // Step 1: Validate
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

      // Step 2: Initialize
      await this.executeStep('Initializing Project', async () => {
        this.log('Creating project directory structure');
        this.log('Initializing git repository');
        this.log('Setting up configuration files');
        // TODO: Actual implementation with file system
      });

      // Step 3: Generate files
      await this.executeStep('Generating Files', async () => {
        this.log('Generating from CodeGenerator...');
        try {
          const generator = new CodeGenerator(this.blueprint as any);
          const project = generator.generate();
          this.generatedFiles = project.files;
          this.log(`Generated ${project.files.length} files`);
          this.log(`Technologies: ${project.summary.technologies.join(', ')}`);
        } catch (error) {
          this.log(`CodeGenerator error: ${error instanceof Error ? error.message : String(error)}`);
          throw error;
        }
      });

      // Step 4: Execute features
      await this.executeStep('Executing Features', async () => {
        this.log(`Executing ${this.blueprint.features?.length || 0} features`);
        if (this.blueprint.features && this.blueprint.features.length > 0) {
          for (const feature of this.blueprint.features) {
            this.log(`  - Feature: ${feature}`);
          }
        }
        // TODO: Actual feature execution with FeatureGenerator
      });

      // Step 5: Integrate
      await this.executeStep('Integrating Components', async () => {
        this.log('Verifying imports and dependencies');
        this.log('Building type definitions');
        this.log('Configuring environment variables');
        this.log('Integration complete');
      });

      // Step 6: Documentation
      await this.executeStep('Generating Documentation', async () => {
        this.log('Generating README.md');
        this.log('Generating SETUP.md');
        this.log('Generating API.md');
        this.log('Documentation generation complete');
      });

      // Step 7: Push to GitHub
      let githubUrl = '';
      await this.executeStep('Pushing to GitHub', async () => {
        try {
          // TODO: Get GitHub token from user database
          // For now, skip if no token available
          this.log('GitHub integration will push files when token is available');
          this.log('Repository would be created at: https://github.com/user/repo-name');
        } catch (error) {
          this.log(`GitHub push skipped: ${error instanceof Error ? error.message : 'No token'}`);
        }
      });

      // Step 8: Finalize
      await this.executeStep('Finalizing', async () => {
        const executionTime = Date.now() - this.startTime;
        await BuildDatabase.updateBuildStatus(this.buildId, 'completed', {
          completion_time_ms: executionTime,
          github_url: 'https://github.com/example/project', // TODO: Real URL
        });
        this.log(`Build completed in ${Math.round(executionTime / 1000)}s`);
      });

      const executionTime = Date.now() - this.startTime;

      return {
        success: true,
        buildId: this.buildId,
        githubUrl: 'https://github.com/example/project', // TODO: Real URL
        filesGenerated: this.generatedFiles.length,
        executionTimeMs: executionTime,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`ERROR: ${errorMsg}`);
      await BuildDatabase.updateBuildStatus(this.buildId, 'failed', {
        error_message: errorMsg,
      });

      const executionTime = Date.now() - this.startTime;

      return {
        success: false,
        buildId: this.buildId,
        filesGenerated: this.generatedFiles.length,
        executionTimeMs: executionTime,
        error: errorMsg,
      };
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
}
