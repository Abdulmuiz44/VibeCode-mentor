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
