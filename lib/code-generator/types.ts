export interface Blueprint {
  projectName: string;
  description: string;
  features: string[];
  databaseSchema: string;
  apiEndpoints: string;
  uiComponents: string;
  deploymentRequirements: string;
}

export interface BlueprintV2 extends Blueprint {
  id?: string;
  version?: number;
  isLocked?: boolean;
  lockedAt?: string;
  lockedForBuildId?: string;
  tags?: {
    framework?: string; // 'nextjs' | 'react'
    database?: string; // 'postgres' | 'mongodb'
    auth?: string; // 'supabase' | 'auth0'
    ui?: string; // 'tailwind' | 'shadcn'
    payments?: string; // 'stripe' | 'lemonsqueezy'
    deployment?: string; // 'vercel' | 'netlify'
  };
  buildConfig?: {
    linting: 'eslint' | 'eslint-strict';
    formatting: 'prettier';
    typeChecking: 'strict' | 'standard';
    testing: 'jest' | 'vitest' | 'none';
  };
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: 'typescript' | 'tsx' | 'json' | 'yaml' | 'sql' | 'markdown' | 'text';
}

export interface GeneratedProject {
  name: string;
  files: GeneratedFile[];
  summary: {
    totalFiles: number;
    technologies: string[];
    apiEndpoints: number;
    components: number;
  };
}

export interface DatabaseEntity {
  name: string;
  fields: DatabaseField[];
  relationships: DatabaseRelationship[];
}

export interface DatabaseField {
  name: string;
  type: string;
  required: boolean;
  isPrimary?: boolean;
}

export interface DatabaseRelationship {
  type: 'one-to-many' | 'many-to-many' | 'one-to-one';
  target: string;
  description?: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requiresAuth?: boolean;
}
