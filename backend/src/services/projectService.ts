import { query } from '../db';
import * as plannerAgent from '../agents/plannerAgent';

export const createProject = async (name: string, description: string, userId: string) => {
    const result = await query(
        'INSERT INTO projects (name, description, user_id, technologies) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, userId, []]
    );
    return mapProject(result.rows[0]);
};

export const getProjects = async (userId: string) => {
    const result = await query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows.map(mapProject);
};

export const getProjectById = async (id: string) => {
    const projectRes = await query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectRes.rows.length === 0) return null;

    const project = mapProject(projectRes.rows[0]);

    // Fetch related data
    const blueprintsRes = await query('SELECT * FROM blueprints WHERE project_id = $1', [id]);
    const messagesRes = await query('SELECT * FROM messages WHERE project_id = $1 ORDER BY created_at ASC', [id]);

    return {
        ...project,
        blueprints: blueprintsRes.rows,
        messages: messagesRes.rows.map(m => ({ ...m, createdAt: m.created_at })), // simple map
    };
};

export const addMessage = async (projectId: string, role: string, content: string) => {
    const messageRes = await query(
        'INSERT INTO messages (project_id, role, content) VALUES ($1, $2, $3) RETURNING *',
        [projectId, role, content]
    );
    const message = messageRes.rows[0];

    // Trigger Agent
    if (role === 'user') {
        try {
            if (content.toLowerCase().includes('generate code') || content.toLowerCase().includes('build the app')) {
                await query('INSERT INTO messages (project_id, role, content) VALUES ($1, $2, $3)', [projectId, 'assistant', "Starting code generation..."]);

                // Dynamic import to avoid circular dependency issues if any
                const generatorService = await import('./generatorService');
                const files = await generatorService.generateProjectCode(projectId);

                await query('INSERT INTO messages (project_id, role, content) VALUES ($1, $2, $3)',
                    [projectId, 'assistant', `**Code Generation Complete!** 🚀\n\nGenerated ${files.length} files:\n` + files.map((f: { path: string }) => `- \`${f.path}\``).join('\n')]
                );
            } else {
                const blueprint = await plannerAgent.planProject(projectId, content);
                await query('INSERT INTO messages (project_id, role, content) VALUES ($1, $2, $3)',
                    [projectId, 'assistant', `I've created a plan for **${blueprint.projectName}**!\n\n${blueprint.description}\n\n**Tech Stack:** ${blueprint.technologies.join(', ')}\n\nCheck the sidebar for details.`]
                );
            }
        } catch (error) {
            console.error("Agent failed:", error);
            await query('INSERT INTO messages (project_id, role, content) VALUES ($1, $2, $3)',
                [projectId, 'assistant', "I'm sorry, I had trouble processing your request."]
            );
        }
    }

    return message;
};

// Helper to map snake_case DB fields to camelCase domain objects
const mapProject = (row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    totalFiles: row.total_files,
    technologies: row.technologies || [],
    createdAt: row.created_at,
    userId: row.user_id,
    githubUrl: row.github_url
});
