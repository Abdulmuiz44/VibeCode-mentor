import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY || process.env.OPENROUTER_API_KEY;
const baseURL = process.env.MISTRAL_API_KEY ? 'https://api.mistral.ai/v1' : 'https://openrouter.ai/api/v1';

if (!apiKey) {
    console.warn("Warning: No AI API Key found (MISTRAL_API_KEY or OPENROUTER_API_KEY). Agents will fail.");
}

export const aiClient = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
});

export const MODEL_NAME = process.env.AI_MODEL || 'mistral-medium';
