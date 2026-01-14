
import { ProjectDatabase } from '@/lib/db/projects';
import { SandboxDatabase } from '@/lib/sandbox/database';
import { SandboxManager } from '@/lib/sandbox';
import { GeneratedFile } from '@/lib/code-generator/types';
import { GeminiClient } from '@/lib/ai/gemini';

export class ModificationAgent {
  /**
   * Process a modification request
   */
  static async processRequest(
    projectId: string,
    userId: string,
    userRequest: string
  ): Promise<string> {
    const gemini = new GeminiClient();

    // 1. Get Project Files
    const project = await ProjectDatabase.getProject(projectId);
    if (!project || !project.generated_files) {
      throw new Error("Project files not found.");
    }

    const allFiles = project.generated_files.files as GeneratedFile[];
    const filePaths = allFiles.map(f => f.path);

    // 2. Identify affected files
    // const affectedFiles = await this.identifyFiles(userRequest, filePaths); // Using Gemini now
    const affectedFiles = await gemini.identifyFiles(userRequest, filePaths);

    if (affectedFiles.length === 0) {
      return "I couldn't identify which files to modify. Could you be more specific?";
    }

    // 3. Generate new code
    const updatedFiles: GeneratedFile[] = [];
    let modificationSummary = "";

    for (const path of affectedFiles) {
      const originalFile = allFiles.find(f => f.path === path);
      if (!originalFile) continue;

      const newContent = await gemini.updateCode(userRequest, originalFile.content, path);

      updatedFiles.push({
        path: path,
        content: newContent,
        language: originalFile.language
      });

      modificationSummary += `\n- Updated \`${path}\``;
    }

    if (updatedFiles.length === 0) {
      return "Failed to generate any valid code updates.";
    }

    // 4. Update Database
    // We need to merge updates into existing files
    const newFileList = allFiles.map(f => {
      const update = updatedFiles.find(u => u.path === f.path);
      return update ? { ...f, content: update.content } : f;
    });

    await ProjectDatabase.updateGeneratedFiles(projectId, newFileList);

    // 5. Update Sandbox (Live Update)
    const activeSandbox = await SandboxDatabase.getActiveForProject(projectId);
    if (activeSandbox && activeSandbox.status === 'running' && activeSandbox.sandbox_id) {
      try {
        const sandboxManager = new SandboxManager();
        await sandboxManager.writeFiles(activeSandbox.sandbox_id, updatedFiles);
        console.log(`[ModificationAgent] Live updated sandbox ${activeSandbox.sandbox_id}`);
        modificationSummary += `\n\nLive preview updated! ⚡`;
      } catch (e) {
        console.warn(`[ModificationAgent] Failed to update sandbox: ${e}`);
        modificationSummary += `\n\n(Sandbox update failed, strictly DB updated)`;
      }
    } else {
      modificationSummary += `\n\n(Note: Sandbox not running, changes saved to DB)`;
    }

    return `I've applied your changes! 🎉${modificationSummary}`;
  }
}
