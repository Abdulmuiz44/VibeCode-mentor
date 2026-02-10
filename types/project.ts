export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  path: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  blueprintId: string;
  files: FileNode[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'building' | 'ready' | 'deployed';
  techStack: string[];
  previewUrl?: string;
  deployedUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'file' | 'build';
  metadata?: {
    fileId?: string;
    fileName?: string;
    code?: string;
    language?: string;
  };
}

export interface BuildProgress {
  stage: string;
  progress: number;
  message: string;
}

export interface AIResponse {
  type: 'code' | 'file' | 'message' | 'build';
  content: string;
  fileName?: string;
  filePath?: string;
  language?: string;
  action?: string;
}
