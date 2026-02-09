import { createClient } from '@supabase/supabase-js';

const AI_API_KEY = process.env.MISTRAL_API_KEY;

export interface TaskGraph {
    nodes: TaskNode[];
    edges: TaskEdge[];
}

export interface TaskNode {
    id: string;
    type: 'scaffold' | 'file_create' | 'file_modify' | 'command' | 'review';
    label: string;
    description: string;
    metadata?: any;
}

export interface TaskEdge {
    from: string;
    to: string;
}

export class PlannerAgent {
    /**
     * Generates a structured Task Graph from a user prompt using AI.
     */
    static async generatePlan(prompt: string, context?: any): Promise<TaskGraph> {
        if (!AI_API_KEY) {
            throw new Error('AI_API_KEY is not configured');
        }

        const systemPrompt = `You are VibeCode Architect, an advanced software project planner.
Your goal is to break down a user's request into a directed graph of actionable tasks.

Output MUST be a valid JSON object matching this TypeScript interface:
{
  "nodes": [
    {
      "id": "string",
      "type": "scaffold" | "file_create" | "file_modify" | "command" | "review",
      "label": "string",
      "description": "string"
    }
  ],
  "edges": [
    { "from": "node_id", "to": "node_id" }
  ]
}

- 'scaffold': Initial project setup (tech stack choice).
- 'file_create': creating a new file.
- 'file_modify': editing an existing file.
- 'command': running a shell command (npm install, migrations).
- 'review': asking user for confirmation (critical steps).

Keep the plan granular but high-level enough for an execution agent to understand.
Do not output markdown code blocks. Output ONLY raw JSON.`;

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_KEY}`,
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                model: 'mistral-large-latest',
                temperature: 0.2, // Low temperature for deterministic JSON
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            throw new Error(`Mistral API Error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        let content = data.choices[0]?.message?.content || '{}';

        // Cleanup potential markdown formatting if model misbehaves
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(content) as TaskGraph;
        } catch (e) {
            console.error("Failed to parse Plan JSON", content);
            throw new Error("Failed to parse Planner output");
        }
    }
}
