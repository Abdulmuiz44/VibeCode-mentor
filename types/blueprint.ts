export interface SavedBlueprint {
  id: number;
  vibe: string;
  blueprint: string;
  timestamp: number;
}

export interface CollaborationComment {
  id: number;
  blueprintId: number;
  author: string;
  content: string;
  timestamp: number;
}

export interface CustomPrompt {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  timestamp: number;
}
