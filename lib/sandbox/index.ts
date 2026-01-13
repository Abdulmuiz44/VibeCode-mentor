/**
 * Sandbox Manager
 * Unified interface for managing code execution sandboxes.
 * Abstracts over multiple providers (E2B, StackBlitz, Docker).
 */

import {
    SandboxClient,
    SandboxProvider,
    SandboxConfig,
    GeneratedFile,
    ExecutionResult,
    SandboxStatus,
    BuildResult,
    BuildProgress
} from './types';
import { E2BClient } from './e2b-client';

// Default configuration
const DEFAULT_CONFIG: SandboxConfig = {
    provider: 'e2b',
    timeout: 300000, // 5 minutes
    memory: 512,     // 512MB
};

export class SandboxManager {
    private client: SandboxClient;
    private provider: SandboxProvider;
    private config: SandboxConfig;

    constructor(config: Partial<SandboxConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.provider = this.config.provider;
        this.client = this.getClient(this.provider);
    }

    private getClient(provider: SandboxProvider): SandboxClient {
        switch (provider) {
            case 'e2b':
                return new E2BClient();
            case 'stackblitz':
                // TODO: Implement StackBlitz client as fallback
                console.warn('[SandboxManager] StackBlitz not implemented, using E2B');
                return new E2BClient();
            case 'docker':
                // TODO: Implement Docker client for local dev
                console.warn('[SandboxManager] Docker not implemented, using E2B');
                return new E2BClient();
            default:
                return new E2BClient();
        }
    }

    /**
     * Build a project from generated files
     * This is the main entry point for the build system
     */
    async buildProject(
        projectId: string,
        files: GeneratedFile[],
        onProgress?: (progress: BuildProgress) => void
    ): Promise<BuildResult> {
        const logs: string[] = [];
        const startTime = Date.now();

        const log = (message: string) => {
            logs.push(`[${new Date().toISOString()}] ${message}`);
            console.log(message);
        };

        const updateProgress = (step: string, status: BuildProgress['status'], message?: string) => {
            if (onProgress) {
                onProgress({ step, status, message });
            }
        };

        let sandboxId = '';

        try {
            // Step 1: Create sandbox
            updateProgress('Creating sandbox', 'running');
            log(`Creating ${this.provider} sandbox for project ${projectId}`);

            sandboxId = await this.client.create(projectId);
            log(`Sandbox created: ${sandboxId}`);
            updateProgress('Creating sandbox', 'completed');

            // Step 2: Write files
            updateProgress('Writing files', 'running');
            log(`Writing ${files.length} files to sandbox`);

            await this.client.writeFiles(sandboxId, files);
            log('Files written successfully');
            updateProgress('Writing files', 'completed');

            // Step 3: Install dependencies
            updateProgress('Installing dependencies', 'running');
            log('Running npm install...');

            const installResult = await this.client.execute(sandboxId, 'npm install');
            if (!installResult.success) {
                throw new Error(`npm install failed: ${installResult.stderr}`);
            }
            log(`Dependencies installed in ${installResult.duration}ms`);
            updateProgress('Installing dependencies', 'completed');

            // Step 4: Build project
            updateProgress('Building project', 'running');
            log('Running npm run build...');

            const buildResult = await this.client.execute(sandboxId, 'npm run build');
            if (!buildResult.success) {
                throw new Error(`Build failed: ${buildResult.stderr}`);
            }
            log(`Build completed in ${buildResult.duration}ms`);
            updateProgress('Building project', 'completed');

            // Step 5: Start dev server for preview
            updateProgress('Starting preview', 'running');
            log('Starting development server...');

            // Start dev server in background (don't wait for it)
            this.client.execute(sandboxId, 'npm run dev &');

            // Wait a moment for server to start
            await new Promise(r => setTimeout(r, 3000));

            const previewUrl = await this.client.getPreviewUrl(sandboxId);
            log(`Preview available at: ${previewUrl}`);
            updateProgress('Starting preview', 'completed');

            const totalDuration = Date.now() - startTime;
            log(`Build completed successfully in ${totalDuration}ms`);

            return {
                success: true,
                sandboxId,
                previewUrl,
                logs,
                filesWritten: files.length,
                totalDuration,
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            log(`Build failed: ${errorMessage}`);
            updateProgress('Build failed', 'failed', errorMessage);

            const totalDuration = Date.now() - startTime;

            return {
                success: false,
                sandboxId,
                previewUrl: null,
                logs,
                filesWritten: files.length,
                totalDuration,
                error: errorMessage,
            };
        }
    }

    /**
   * Create a new sandbox instance
   */
    async create(projectId: string): Promise<string> {
        return this.client.create(projectId);
    }

    /**
     * Write files to an existing sandbox
     */
    async writeFiles(sandboxId: string, files: GeneratedFile[]): Promise<void> {
        return this.client.writeFiles(sandboxId, files);
    }

    /**
     * Execute a command in an existing sandbox
     */
    async execute(sandboxId: string, command: string): Promise<ExecutionResult> {
        return this.client.execute(sandboxId, command);
    }

    /**
     * Get the preview URL for a sandbox
     */
    async getPreviewUrl(sandboxId: string): Promise<string | null> {
        return this.client.getPreviewUrl(sandboxId);
    }

    /**
     * Get sandbox status
     */
    async getStatus(sandboxId: string): Promise<SandboxStatus> {
        return this.client.getStatus(sandboxId);
    }

    /**
     * Destroy a sandbox to free resources
     */
    async destroy(sandboxId: string): Promise<void> {
        return this.client.destroy(sandboxId);
    }

    /**
     * Get the current provider being used
     */
    getProvider(): SandboxProvider {
        return this.provider;
    }
}

// Export default instance
export const sandboxManager = new SandboxManager();
