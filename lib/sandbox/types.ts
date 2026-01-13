/**
 * Sandbox Types
 * Types and interfaces for the cloud sandbox execution system
 */

export interface GeneratedFile {
    path: string;
    content: string;
}

export interface ExecutionResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    duration: number;
}

export interface SandboxConfig {
    provider: SandboxProvider;
    timeout?: number; // Max execution time in ms
    memory?: number;  // Memory limit in MB
}

export type SandboxProvider = 'e2b' | 'stackblitz' | 'docker';

export type SandboxStatus =
    | 'creating'
    | 'ready'
    | 'running'
    | 'stopped'
    | 'error'
    | 'expired';

export interface Sandbox {
    id: string;
    projectId: string;
    provider: SandboxProvider;
    sandboxId: string;        // Provider's internal ID
    previewUrl: string | null;
    status: SandboxStatus;
    createdAt: Date;
    expiresAt: Date;
}

export interface SandboxClient {
    /**
     * Create a new sandbox instance
     */
    create(projectId: string): Promise<string>;

    /**
     * Write files to the sandbox
     */
    writeFiles(sandboxId: string, files: GeneratedFile[]): Promise<void>;

    /**
     * Execute a command in the sandbox
     */
    execute(sandboxId: string, command: string): Promise<ExecutionResult>;

    /**
     * Get the preview URL for the running app
     */
    getPreviewUrl(sandboxId: string): Promise<string | null>;

    /**
     * Get current status of the sandbox
     */
    getStatus(sandboxId: string): Promise<SandboxStatus>;

    /**
     * Stop and clean up the sandbox
     */
    destroy(sandboxId: string): Promise<void>;
}

export interface BuildProgress {
    step: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    message?: string;
    duration?: number;
}

export interface BuildResult {
    success: boolean;
    sandboxId: string;
    previewUrl: string | null;
    logs: string[];
    filesWritten: number;
    totalDuration: number;
    error?: string;
}
