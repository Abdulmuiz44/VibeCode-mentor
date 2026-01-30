export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
  updated_at: string;
}

export interface CreateFileParams {
  projectId: string;
  path: string;
  content: string;
  language?: string;
}

export interface FileTreeItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileTreeItem[];
}
