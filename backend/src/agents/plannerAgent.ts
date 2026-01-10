import { aiClient, MODEL_NAME } from '../lib/ai';
import { query } from '../db';

// Force re-eval

const SYSTEM_PROMPT = `You are a Senior Solutions Architect. Your goal is to design a full-stack web application based on the user's request.
Output a JSON structure representing the "Blueprint" of the app.
The stack is fixed: Next.js 15 (Frontend), Express/Node.js (Backend), PostgreSQL (Native Node-PG), TailwindCSS.

Return ONLY valid JSON with this structure:
{
  "projectName": "Name of the app",
  "description": "Short technical summary",
  "technologies": ["React", "Express", "PostgreSQL", "Tailwind"],
  "schema": "SQL schema definitions (CREATE TABLE statements)",
  "apiEndpoints": [
    { "method": "GET", "path": "/api/users", "description": "List users" }
  ],
  "pages": [
    { "path": "/", "description": "Landing page" },
    { "path": "/dashboard", "description": "Main user dashboard" }
  ]
}

Do not include markdown formatting like \`\`\`json. Just the raw JSON object.`;

export const planProject = async (projectId: string, userPrompt: string) => {
    try {
        console.log(`[Planner] Generating plan for project ${projectId} with prompt: "${userPrompt.substring(0, 50)}..."`);

        const response = await aiClient.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No response from AI");

        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const blueprint = JSON.parse(jsonStr);

        // Save Blueprint to DB
        await query(
            'INSERT INTO blueprints (project_id, content, version) VALUES ($1, $2, $3)',
            [projectId, JSON.stringify(blueprint), 1]
        );

        // Update Project Metadata
        await query(
            'UPDATE projects SET name = $1, description = $2, technologies = $3, total_files = $4, status = $5 WHERE id = $6',
            [
                blueprint.projectName,
                blueprint.description,
                blueprint.technologies,
                blueprint.pages.length + blueprint.apiEndpoints.length + 5,
                'completed',
                projectId
            ]
        );

        return blueprint;

    } catch (error) {
        console.error("[Planner] Error:", error);
        await query('UPDATE projects SET status = $1 WHERE id = $2', ['failed', projectId]);
        throw error;
    }
};
