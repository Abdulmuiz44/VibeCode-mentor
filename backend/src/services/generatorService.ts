import * as generatorAgent from '../agents/generatorAgent';
import * as fileSystemManager from './fileSystemManager';
import { query } from '../db';

export const generateProjectCode = async (projectId: string) => {
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
    const project = projectRes.rows[0];

    // Get latest blueprint
    const blueprintRes = await query('SELECT * FROM blueprints WHERE project_id = $1 ORDER BY version DESC LIMIT 1', [projectId]);

    if (!project || blueprintRes.rows.length === 0) {
        throw new Error("Project or Blueprint not found");
    }

    const blueprint = JSON.parse(blueprintRes.rows[0].content);
    const files = [];

    // 1. Generate Pages
    for (const page of blueprint.pages) {
        const code = await generatorAgent.generatePageCode(page);
        const filePath = `app${page.path === '/' ? '/page' : page.path}/page.tsx`;

        fileSystemManager.writeFile(projectId, filePath, code);

        files.push({
            path: filePath,
            content: code
        });
    }

    // 2. Generate API Routes
    for (const api of blueprint.apiEndpoints) {
        const code = await generatorAgent.generateApiCode(api);
        const filePath = `backend/src/routes${api.path.replace('/api', '')}.ts`;

        fileSystemManager.writeFile(projectId, filePath, code);

        files.push({
            path: filePath,
            content: code
        });
    }

    // Write package.json and tsconfig.json for the sandbox
    // For now, we reuse standard templates or copy them.
    // Ideally, Generator Agent should create these too.

    return files;
};
