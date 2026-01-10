import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';

export class GitManager {
    private git: SimpleGit;
    private repoPath: string;

    constructor(projectId: string) {
        // In a real env, this would be a temp dir or specific repo path
        this.repoPath = path.join(process.cwd(), 'temp', 'repos', projectId);
        this.git = simpleGit(this.repoPath);
    }

    async initRepo() {
        if (!fs.existsSync(this.repoPath)) {
            fs.mkdirSync(this.repoPath, { recursive: true });
        }
        await this.git.init();
    }

    async commitAll(message: string) {
        await this.git.add('.');
        await this.git.commit(message);
    }

    async pushToRemote(remoteUrl: string, branch: string = 'main') {
        try {
            await this.git.addRemote('origin', remoteUrl);
        } catch (e) {
            // Remote might already exist
        }
        await this.git.push('origin', branch);
    }
}
