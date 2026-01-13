import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_AI_API_KEY || "";

// Interface matching the Blueprint structure used in the app
export interface Blueprint {
    title: string;
    description: string;
    techStack: {
        frontend: string[];
        backend: string[];
        database: string[];
        infrastructure: string[];
    };
    architecture: {
        pattern: string;
        components: Array<{
            name: string;
            responsibility: string;
            technology: string;
        }>;
    };
    database: {
        type: string;
        tables: Array<{
            name: string;
            fields: Array<{ name: string; type: string; required: boolean }>;
        }>;
    };
    api: {
        baseUrl: string;
        endpoints: Array<{
            method: string;
            path: string;
            description: string;
            response: any;
        }>;
    };
    ui: {
        pages: Array<{ name: string; route: string; purpose: string }>;
        components: Array<{ name: string; props: Record<string, string> }>;
    };
    timeline: Array<{
        phase: string;
        duration: number;
        tasks: string[];
    }>;
    risks: Array<{
        risk: string;
        mitigation: string;
    }>;
}

export class GeminiClient {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        if (!API_KEY) {
            console.warn("GOOGLE_AI_API_KEY is not set. Gemini features will fail.");
        }
        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    }

    async generateBlueprint(prompt: string, context?: any): Promise<Blueprint> {
        const systemPrompt = `
      You are an expert Senior Software Architect. Your goal is to design a production-ready software architecture based on a user's idea ("vibe").
      
      Generate a comprehensive technical blueprint in strict JSON format.
      The architecture should be modern, scalable, and use best-in-class tools (e.g., Next.js, Supabase, Tailwind, etc. unless otherwise specified).
      
      Requirements:
      1. **Database**: Design a normalized schema (PostgreSQL preferred).
      2. **API**: Define clear RESTful endpoints.
      3. **UI**: Outline the core pages and reusable components.
      4. **Tech Stack**: Choose the precise libraries (e.g., "shadcn/ui", "Prisma", "Zod").
      
      Output MUST be a valid JSON object matching this structure:
      {
        "title": "Project Name",
        "description": "Technical summary",
        "techStack": { "frontend": [], "backend": [], "database": [], "infrastructure": [] },
        "architecture": { "pattern": "monolith|microservices", "components": [] },
        "database": { "type": "postgresql|mongodb", "tables": [] },
        "api": { "baseUrl": "/api", "endpoints": [] },
        "ui": { "pages": [], "components": [] },
        "timeline": [],
        "risks": []
      }
    `;

        const userMessage = `
      User Idea: "${prompt}"
      Additional Context: ${JSON.stringify(context || {})}
      
      Generate the PRODUCTION-READY blueprint now. Ensure JSON is valid.
    `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n" + userMessage }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.2, // Low temperature for consistent JSON
                },
            });

            const response = result.response;
            const text = response.text();

            // Parse JSON (Gemini 1.5 Pro usually returns pure JSON when asked, but safely parse)
            const blueprint = JSON.parse(text);
            return blueprint as Blueprint;

        } catch (error) {
            console.error("Gemini Generation Error:", error);
            throw new Error("Failed to generate blueprint with Gemini. Check API Key or quota.");
        }
    }

    async refineArchitecture(currentBlueprint: Blueprint, feedback: string): Promise<Blueprint> {
        // TODO: Implement refinement logic
        // For now, re-generate or merge (placeholder)
        return currentBlueprint;
    }

    async fixCode(code: string, error: string): Promise<{ fixedCode: string; explanation: string }> {
        const systemPrompt = `
        You are an expert software engineer and debugger.
        Your goal is to fix the provided code based on the specific error message.
        
        Input:
        1. Code Snippet
        2. Error Message/Log
        
        Output:
        A JSON object with:
        - fixedCode: The complete fixed code.
        - explanation: A brief explanation of what caused the error and how you fixed it.
        
        Return RAW JSON. No markdown formatting.
        `;

        const userMessage = `
        Code:
        ${code}

        Error:
        ${error}
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n" + userMessage }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                },
            });

            const text = result.response.text();
            const data = JSON.parse(text);
            return {
                fixedCode: data.fixedCode,
                explanation: data.explanation
            };
        } catch (e) {
            console.error("Gemini fixCode error:", e);
            throw new Error("Failed to fix code with Gemini");
        }
    }

    async identifyFiles(userRequest: string, filePaths: string[]): Promise<string[]> {
        const systemPrompt = `
        You are a smart AI developer.
        Identify which files need to be modified to fulfill the user's request.
        
        Input:
        1. User Request
        2. List of File Paths
        
        Output:
        A JSON array of strings (file paths).
        Example: ["app/page.tsx", "components/Header.tsx"]
        
        Return RAW JSON.
        `;

        const userMessage = `
        User Request: "${userRequest}"
        Project Files:
        ${filePaths.join('\n')}
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n" + userMessage }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                },
            });
            return JSON.parse(result.response.text());
        } catch (e) {
            console.error("Gemini identifyFiles error:", e);
            return [];
        }
    }

    async updateCode(userRequest: string, currentCode: string, filePath: string): Promise<string> {
        const systemPrompt = `
        You are an expert full-stack developer.
        Rewrite the provided code to fulfill the user's request.
        
        Context:
        - File: ${filePath}
        
        Input:
        1. User Request
        2. Current Code
        
        Output:
        The FULL updated code content.
        Do NOT wrap in markdown code blocks.
        Do NOT return a diff.
        Return ONLY the raw code.
        `;

        const userMessage = `
        User Request: "${userRequest}"
        Current Code:
        ${currentCode}
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n" + userMessage }] }],
                generationConfig: {
                    temperature: 0.2,
                },
            });
            let code = result.response.text();
            // Cleanup generic markdown if present despite prompt
            if (code.startsWith('```')) {
                code = code.replace(/^```[a-z]*\n/, '').replace(/```$/, '');
            }
            return code;
        } catch (e) {
            console.error("Gemini updateCode error:", e);
            throw new Error("Failed to update code with Gemini");
        }
    }
}
