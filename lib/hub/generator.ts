import { saveFile } from './files';

interface GeneratedFile {
  path: string;
  content: string;
}

/**
 * The Core Engine: Converts a Blueprint into Database Files
 */
export async function generateProjectCode(
  userId: string, 
  projectId: string, 
  blueprintContent: string
): Promise<{ success: boolean; fileCount: number }> {
  
  // 1. Parse the blueprint to extract code blocks
  const files = parseBlueprintToFiles(blueprintContent);

  if (files.length === 0) {
    // Fallback: If no code blocks found, generate a README
    files.push({
      path: 'README.md',
      content: blueprintContent
    });
  }

  // 2. Save all files to the database
  let savedCount = 0;
  const errors: string[] = [];

  // We run these in parallel for speed, but limited concurrency is better for DB limits.
  // For now, Promise.all is fine for < 50 files.
  await Promise.all(files.map(async (file) => {
    try {
      await saveFile(userId, {
        projectId,
        path: file.path,
        content: file.content
      });
      savedCount++;
    } catch (err: any) {
      console.error(`Failed to save ${file.path}:`, err);
      errors.push(`${file.path}: ${err.message}`);
    }
  }));

  return {
    success: errors.length === 0,
    fileCount: savedCount
  };
}

/**
 * Parses Markdown to find code blocks with filenames
 * Expected format in blueprint:
 * 
 * ### `src/app.ts`
 * ```typescript
 * console.log("hello");
 * ```
 */
function parseBlueprintToFiles(markdown: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const lines = markdown.split('\n');
  
  let currentFile: Partial<GeneratedFile> | null = null;
  let insideCodeBlock = false;
  let codeBuffer: string[] = [];

  // Regex to find filenames in headers or comments
  // Matches: ### `path/to/file.ext` or **path/to/file.ext**
  const filenameRegex = /(?:`|\*\*)([\w-./]+\.\w+)(?:`|\*\*)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of code block
    if (line.trim().startsWith('```')) {
      if (insideCodeBlock) {
        // End of block
        if (currentFile && currentFile.path) {
          currentFile.content = codeBuffer.join('\n');
          files.push(currentFile as GeneratedFile);
          currentFile = null;
          codeBuffer = [];
        }
        insideCodeBlock = false;
      } else {
        // Start of block
        insideCodeBlock = true;
      }
      continue;
    }

    // Capture content
    if (insideCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Detect filename (only if we aren't already capturing a file)
    const match = line.match(filenameRegex);
    if (match && match[1] && !insideCodeBlock) {
      currentFile = { path: match[1] };
    }
  }

  return files;
}
