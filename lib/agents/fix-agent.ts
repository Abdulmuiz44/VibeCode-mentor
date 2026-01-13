
import { GeminiClient } from '@/lib/ai/gemini';
import { ProjectDatabase } from '@/lib/db/projects';
import { GeneratedFile } from '@/lib/code-generator/types';

export interface FixResult {
    success: boolean;
    fixedFile?: {
        path: string;
        content: string;
    };
    explanation?: string;
    error?: string;
}

export class FixAgent {
    private gemini: GeminiClient;

    constructor() {
        this.gemini = new GeminiClient();
    }

    async analyzeAndFix(projectId: string, errorLog: string): Promise<FixResult> {
        try {
            // 1. Identify the failing file from the error log
            const filePath = this.extractFilePath(errorLog);

            if (!filePath) {
                return {
                    success: false,
                    error: "Could not identify the failing file from the error log."
                };
            }

            // 2. Fetch project files to find the content
            const project = await ProjectDatabase.getProject(projectId);
            if (!project || !project.generated_files) {
                return {
                    success: false,
                    error: "Project files not found."
                };
            }

            const files = project.generated_files.files as GeneratedFile[];
            const targetFile = files.find(f => {
                // Handle potential path mismatches (e.g., relative vs absolute, or ./ prefix)
                return f.path === filePath || f.path.endsWith(filePath) || filePath.endsWith(f.path);
            });

            if (!targetFile) {
                return {
                    success: false,
                    error: `File not found in project: ${filePath}`
                };
            }

            // 3. Generate fix using Gemini
            console.log(`[FixAgent] Fixing file: ${targetFile.path}`);
            const { fixedCode, explanation } = await this.gemini.fixCode(targetFile.content, errorLog);

            if (!fixedCode) {
                return {
                    success: false,
                    error: "AI failed to generate a fix."
                };
            }

            return {
                success: true,
                fixedFile: {
                    path: targetFile.path,
                    content: fixedCode
                },
                explanation
            };

        } catch (error) {
            console.error("[FixAgent] Error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error in FixAgent"
            };
        }
    }

    private extractFilePath(log: string): string | null {
        // Regex for TypeScript/ESLint errors: "path/to/file.ts(10,2): error ..."
        const tsErrorRegex = /^([^\s(]+)\(\d+,\d+\): error/m;
        const match = log.match(tsErrorRegex);

        if (match && match[1]) {
            return match[1].trim();
        }

        // Regex for Next.js build errors often formatted as:
        // ./src/app/page.tsx
        // Error: ...
        const nextJsErrorRegex = /^(?:\.\/)?([a-zA-Z0-9_\-\/]+\.[a-z]+)\n.*Error:/m;
        const match2 = log.match(nextJsErrorRegex);
        if (match2 && match2[1]) {
            return match2[1].trim();
        }

        // Fallback: look for common file extensions in the first few lines
        const extensionRegex = /([a-zA-Z0-9_\-\/]+\.(ts|tsx|js|jsx|json|css))/;
        const fallbackMatch = log.match(extensionRegex);
        if (fallbackMatch && fallbackMatch[1]) {
            return fallbackMatch[1].trim();
        }

        return null;
    }
}
