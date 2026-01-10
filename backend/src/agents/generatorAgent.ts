import { aiClient, MODEL_NAME } from '../lib/ai';

export interface GeneratedFile {
    path: string;
    content: string;
}

const SYSTEM_PROMPT_FRONTEND = `You are a Senior Frontend Engineer specialized in Next.js 15, TailwindCSS, and Lucide React.
Your task is to generate the code for a specific page based on the Blueprint.
Output ONLY the code for the file. No markdown blocks.`;

const SYSTEM_PROMPT_BACKEND = `You are a Senior Backend Engineer specialized in Node.js, Express, and PostgreSQL.
Output ONLY the code for the file. No markdown blocks.`;

export const generatePageCode = async (pageContext: any): Promise<string> => {
    const response = await aiClient.chat.completions.create({
        model: MODEL_NAME,
        messages: [
            { role: "system", content: SYSTEM_PROMPT_FRONTEND },
            { role: "user", content: `Generate a Next.js 15 page component for "${pageContext.path}". Description: ${pageContext.description}. Use 'use client' if needed.` }
        ],
    });
    return response.choices[0].message.content?.replace(/```(tsx|typescript|javascript)/g, '').replace(/```/g, '').trim() || "";
};

export const generateApiCode = async (apiContext: any): Promise<string> => {
    const response = await aiClient.chat.completions.create({
        model: MODEL_NAME,
        messages: [
            { role: "system", content: SYSTEM_PROMPT_BACKEND },
            { role: "user", content: `Generate an Express route for ${apiContext.method} ${apiContext.path}. Description: ${apiContext.description}.` }
        ],
    });
    return response.choices[0].message.content?.replace(/```(typescript|javascript)/g, '').replace(/```/g, '').trim() || "";
};
