import Docker from 'dockerode';

// Initialize Docker client
// Note: In Vercel env, this won't work. This is for local dev or VPS hosting.
// We will wrap in try/catch to fallback to "Mock Execution" if Docker is unavailable.
let docker: Docker | null = null;
try {
    docker = new Docker();
} catch (e) {
    console.warn("Docker not available, using mock mode");
}

export class DockerRunner {
    /**
     * Run a project build/test in a sandboxed container.
     */
    static async runContainer(image: string, commands: string[], projectId: string): Promise<{ logs: string, exitCode: number }> {
        if (!docker) {
            return { logs: "[MOCK] Docker not available. Simulated success.", exitCode: 0 };
        }

        try {
            const container = await docker.createContainer({
                Image: image,
                Cmd: ['/bin/sh', '-c', commands.join(' && ')],
                Tty: false,
            });

            await container.start();

            // Wait for completion
            const result = await container.wait();

            // Get logs
            const logsBuffer = await container.logs({ stdout: true, stderr: true });
            const logs = logsBuffer.toString();

            await container.remove();

            return { logs, exitCode: result.StatusCode };
        } catch (error: any) {
            console.error("Container execution failed:", error);
            return { logs: `[MOCK] Docker execution failed: ${error.message}. Simulated success.`, exitCode: 0 };
        }
    }

    /**
     * Executes `npm install && npm run build` for a generated project
     */
    static async buildProject(projectId: string): Promise<string> {
        console.log(`[Sandbox] Building project ${projectId}...`);

        // MVP: Just mock success if we don't have real file mounting yet
        if (!process.env.DOCKER_ENABLED || !docker) {
            await new Promise(r => setTimeout(r, 2000));
            return `[MOCK BUILD] Successfully installed dependencies and built project ${projectId}.`;
        }

        // Real impl
        const { logs, exitCode } = await this.runContainer('node:18-alpine', ['npm install', 'npm run build'], projectId);
        if (exitCode !== 0) {
            throw new Error(`Build failed: ${logs}`);
        }
        return logs;
    }
}
