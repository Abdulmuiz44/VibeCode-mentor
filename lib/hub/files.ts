import { createClient } from '@supabase/supabase-js';
import { ProjectFile, CreateFileParams, FileTreeItem } from '@/types/files';
import { verifyProjectAccess } from '@/lib/hub/projects';

// Initialize Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Creates or updates a file in the project
 */
export async function saveFile(userId: string, params: CreateFileParams): Promise<ProjectFile> {
  // 1. Verify access
  await verifyProjectAccess(params.projectId, userId, 'editor');

  // 2. Determine file name and folder path
  const pathParts = params.path.split('/');
  const name = pathParts.pop() || '';
  const folderPath = pathParts.join('/');
  
  // 3. Detect language if not provided
  const language = params.language || detectLanguage(name);

  // 4. Upsert file
  const { data, error } = await supabase
    .from('project_files')
    .upsert({
      project_id: params.projectId,
      path: params.path,
      name: name,
      content: params.content,
      language: language,
      size: params.content.length,
      updated_at: new Date().toISOString()
    }, { onConflict: 'project_id, path' })
    .select()
    .single();

  if (error) throw new Error(`Failed to save file: ${error.message}`);
  return data;
}

/**
 * Retrieves a single file's content
 */
export async function getFile(userId: string, projectId: string, fileId: string): Promise<ProjectFile> {
  await verifyProjectAccess(projectId, userId, 'viewer');

  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('id', fileId)
    .eq('project_id', projectId)
    .single();

  if (error) throw new Error(`File not found: ${error.message}`);
  return data;
}

/**
 * Deletes a file
 */
export async function deleteFile(userId: string, projectId: string, fileId: string): Promise<void> {
  await verifyProjectAccess(projectId, userId, 'editor');

  const { error } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileId)
    .eq('project_id', projectId);

  if (error) throw new Error(`Failed to delete file: ${error.message}`);
}

/**
 * Fetches all files and constructs a tree structure for the file explorer
 */
export async function getProjectFileTree(userId: string, projectId: string): Promise<FileTreeItem[]> {
  await verifyProjectAccess(projectId, userId, 'viewer');

  const { data: files, error } = await supabase
    .from('project_files')
    .select('id, name, path, language')
    .eq('project_id', projectId)
    .order('path');

  if (error) throw new Error(`Failed to fetch file tree: ${error.message}`);

  return buildFileTree(files || []);
}

// --- Helper Functions ---

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    py: 'python',
    html: 'html', css: 'css',
    json: 'json', md: 'markdown',
    sql: 'sql'
  };
  return map[ext || ''] || 'plaintext';
}

function buildFileTree(files: any[]): FileTreeItem[] {
  const root: FileTreeItem[] = [];
  const map: Record<string, FileTreeItem> = {};

  // 1. Create file items
  files.forEach(file => {
    const item: FileTreeItem = {
      id: file.id,
      name: file.name,
      path: file.path,
      type: 'file',
      language: file.language
    };
    
    // Simple logic: if path has slashes, it's in a folder. 
    // For a robust tree, we'd create folder nodes dynamically.
    // Here we return a flat list for simplicity or root level.
    // A production app often needs a recursive builder.
    
    // For this implementation, we will return a flat list sorted by path
    // which is often sufficient for v1 file explorers, or let the frontend build the tree.
    root.push(item);
  });

  return root;
}

/**
 * Fetches all files with content for download/export
 */
export async function getAllProjectFiles(userId: string, projectId: string): Promise<ProjectFile[]> {
  await verifyProjectAccess(projectId, userId, 'viewer');

  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw new Error(`Failed to fetch project files: ${error.message}`);
  return data || [];
}