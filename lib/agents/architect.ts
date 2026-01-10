import { Blueprint } from '@/lib/code-generator/types';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export class ArchitectAgent {
    static async generateBlueprint(projectName: string, description: string): Promise<Blueprint> {
        if (!MISTRAL_API_KEY) {
            throw new Error('MISTRAL_API_KEY is not configured');
        }

        const systemPrompt = `You are VibeCode Architect, an expert software architect.
Your goal is to design a detailed technical blueprint for a Next.js 15 + Supabase application.

Input: Project Name and Description.
Output: A JSON object matching the Blueprint interface.

Interface:
interface Blueprint {
  projectName: string;
  description: string;
  features: string[];
  databaseSchema: string; // Markdown list of tables and fields
  apiEndpoints: string; // Markdown list of endpoints
  uiComponents: string; // Markdown list of key components
  deploymentRequirements: string;
}

Example databaseSchema:
- users (id, email, name)
- posts (id, user_id, title, content)

Example apiEndpoints:
- GET /api/posts: List all posts
- POST /api/posts: Create new post

Provide a comprehensive, production-ready design. Output ONLY raw JSON.`;

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Project: ${projectName}\nDescription: ${description}` }
                ],
                model: 'mistral-large-latest',
                temperature: 0.2,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            throw new Error(`Architect API Error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0]?.message?.content || '{}';
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(content) as Blueprint;
        } catch (e) {
            console.error("Failed to parse Blueprint JSON", content);
            throw new Error("Failed to parse Architect output");
        }
    }
}
