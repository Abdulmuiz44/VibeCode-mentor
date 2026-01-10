import fs from 'fs';
import path from 'path';

const SANDBOX_ROOT = path.resolve(__dirname, '../../sandbox');

export const createProjectDirectory = (projectId: string) => {
    const projectPath = path.join(SANDBOX_ROOT, projectId);
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    return projectPath;
};

export const writeFile = (projectId: string, filePath: string, content: string) => {
    const projectPath = createProjectDirectory(projectId);
    const fullPath = path.join(projectPath, filePath);
    const dirName = path.dirname(fullPath);

    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    fs.writeFileSync(fullPath, content);
    console.log(`[Sandbox] Wrote file: ${fullPath}`);
    return fullPath;
};

// Initialize sandbox root
if (!fs.existsSync(SANDBOX_ROOT)) {
    fs.mkdirSync(SANDBOX_ROOT, { recursive: true });
}
