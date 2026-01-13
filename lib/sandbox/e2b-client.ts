/**
 * E2B Sandbox Client
 * Cloud-based code execution using E2B (https://e2b.dev)
 * 
 * E2B provides secure, isolated sandboxes for running untrusted code.
 * Perfect for executing user-generated applications.
 */

import {
    SandboxClient,
    GeneratedFile,
    ExecutionResult,
    SandboxStatus
} from './types';

// E2B SDK types (will be installed via npm)
interface E2BSandbox {
    id: string;
    filesystem: {
        write: (path: string, content: string) => Promise<void>;
        makeDir: (path: string) => Promise<void>;
    };
    process: {
        start: (opts: { cmd: string; onStdout?: (data: string) => void; onStderr?: (data: string) => void }) => Promise<{
            wait: () => Promise<{ exitCode: number }>;
        }>;
    };
    getHost: (port: number) => string;
    close: () => Promise<void>;
}

// Track active sandboxes
const activeSandboxes = new Map<string, E2BSandbox>();

export class E2BClient implements SandboxClient {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.E2B_API_KEY || '';
        if (!this.apiKey) {
            console.warn('[E2B] No API key found. Set E2B_API_KEY environment variable.');
        }
    }

    async create(projectId: string): Promise<string> {
        console.log(`[E2B] Creating sandbox for project ${projectId}`);

        if (!this.apiKey) {
            // Return mock sandbox if no API key
            const mockId = `mock-${projectId}-${Date.now()}`;
            console.log(`[E2B] Using mock sandbox: ${mockId}`);
            return mockId;
        }

        try {
            // Dynamic import to avoid bundling issues - E2B package may not be installed
            const e2bModule = await import('@e2b/code-interpreter').catch(() => null);

            if (!e2bModule) {
                // E2B not installed, use mock mode
                const mockId = `mock-${projectId}-${Date.now()}`;
                console.log(`[E2B] Package not installed, using mock sandbox: ${mockId}`);
                return mockId;
            }

            const { Sandbox } = e2bModule;

            const sandbox = await Sandbox.create({
                apiKey: this.apiKey,
                template: 'base', // Node.js template
                timeout: 300000,  // 5 minute timeout
            });

            activeSandboxes.set(sandbox.id, sandbox as unknown as E2BSandbox);
            console.log(`[E2B] Sandbox created: ${sandbox.id}`);

            return sandbox.id;
        } catch (error) {
            console.error('[E2B] Failed to create sandbox:', error);
            throw new Error(`Failed to create E2B sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async writeFiles(sandboxId: string, files: GeneratedFile[]): Promise<void> {
        console.log(`[E2B] Writing ${files.length} files to sandbox ${sandboxId}`);

        const sandbox = activeSandboxes.get(sandboxId);

        if (!sandbox) {
            // Mock mode - just log
            console.log(`[E2B Mock] Would write ${files.length} files`);
            return;
        }

        try {
            // Create directories first
            const dirs = new Set<string>();
            for (const file of files) {
                const dir = file.path.split('/').slice(0, -1).join('/');
                if (dir && !dirs.has(dir)) {
                    dirs.add(dir);
                }
            }

            for (const dir of dirs) {
                await sandbox.filesystem.makeDir(`/home/user/project/${dir}`);
            }

            // Write files
            for (const file of files) {
                await sandbox.filesystem.write(
                    `/home/user/project/${file.path}`,
                    file.content
                );
            }

            console.log(`[E2B] Successfully wrote ${files.length} files`);
        } catch (error) {
            console.error('[E2B] Failed to write files:', error);
            throw error;
        }
    }

    async execute(sandboxId: string, command: string): Promise<ExecutionResult> {
        console.log(`[E2B] Executing: ${command}`);
        const startTime = Date.now();

        const sandbox = activeSandboxes.get(sandboxId);

        if (!sandbox) {
            // Mock mode
            console.log(`[E2B Mock] Would execute: ${command}`);
            await new Promise(r => setTimeout(r, 1000)); // Simulate delay
            return {
                success: true,
                stdout: `[Mock] Successfully ran: ${command}`,
                stderr: '',
                exitCode: 0,
                duration: Date.now() - startTime,
            };
        }

        try {
            let stdout = '';
            let stderr = '';

            const process = await sandbox.process.start({
                cmd: `cd /home/user/project && ${command}`,
                onStdout: (data) => { stdout += data; },
                onStderr: (data) => { stderr += data; },
            });

            const result = await process.wait();
            const duration = Date.now() - startTime;

            console.log(`[E2B] Command completed with exit code ${result.exitCode} in ${duration}ms`);

            return {
                success: result.exitCode === 0,
                stdout,
                stderr,
                exitCode: result.exitCode,
                duration,
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('[E2B] Execution failed:', error);

            return {
                success: false,
                stdout: '',
                stderr: error instanceof Error ? error.message : 'Unknown error',
                exitCode: 1,
                duration,
            };
        }
    }

    async getPreviewUrl(sandboxId: string): Promise<string | null> {
        const sandbox = activeSandboxes.get(sandboxId);

        if (!sandbox) {
            // Mock mode
            return `https://mock-preview-${sandboxId}.e2b.dev`;
        }

        try {
            // Get the host URL for port 3000 (Next.js default)
            const host = sandbox.getHost(3000);
            return `https://${host}`;
        } catch (error) {
            console.error('[E2B] Failed to get preview URL:', error);
            return null;
        }
    }

    async getStatus(sandboxId: string): Promise<SandboxStatus> {
        const sandbox = activeSandboxes.get(sandboxId);

        if (!sandbox) {
            return sandboxId.startsWith('mock-') ? 'ready' : 'expired';
        }

        return 'ready';
    }

    async destroy(sandboxId: string): Promise<void> {
        console.log(`[E2B] Destroying sandbox ${sandboxId}`);

        const sandbox = activeSandboxes.get(sandboxId);

        if (sandbox) {
            try {
                await sandbox.close();
                activeSandboxes.delete(sandboxId);
                console.log(`[E2B] Sandbox ${sandboxId} destroyed`);
            } catch (error) {
                console.error('[E2B] Failed to destroy sandbox:', error);
            }
        }
    }
}

// Export singleton instance
export const e2bClient = new E2BClient();
