/**
 * VibeCode Mentor Hub - TypeScript Types
 * Defines all types for the collaborative development platform
 */

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type ProjectStatus = 'draft' | 'active' | 'archived' | 'completed';
export type ProjectVisibility = 'private' | 'team' | 'public';
export type ProjectRole = 'owner' | 'editor' | 'viewer' | 'commenter';

export interface Project {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    vibe: string;
    tech_stack: string[];
    status: ProjectStatus;
    blueprint_id: string | null;
    created_at: string;
    updated_at: string;
    last_activity_at: string;
    is_public: boolean;
    visibility: ProjectVisibility;
    member_count: number;
    file_count: number;
    slug: string | null;
    tags: string[];
    featured: boolean;
    featured_at: string | null;
}

export interface ProjectCreateInput {
    name: string;
    description?: string;
    vibe: string;
    tech_stack?: string[];
    blueprint_id?: string;
    visibility?: ProjectVisibility;
    tags?: string[];
}

export interface ProjectUpdateInput {
    name?: string;
    description?: string;
    vibe?: string;
    tech_stack?: string[];
    status?: ProjectStatus;
    visibility?: ProjectVisibility;
    tags?: string[];
}

// ============================================================================
// PROJECT MEMBER TYPES
// ============================================================================

export interface ProjectMember {
    id: string;
    project_id: string;
    user_id: string;
    role: ProjectRole;
    joined_at: string;
    invited_at: string | null;
    invited_by: string | null;
    last_active_at: string;
    user?: {
        id: string;
        email: string;
        name: string | null;
        image: string | null;
    };
}

export interface ProjectMemberInvite {
    project_id: string;
    email: string;
    role: ProjectRole;
}

// ============================================================================
// PROJECT FILE TYPES
// ============================================================================

export type FileType = 'directory' | 'file' | 'template';
export type LanguageType =
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'java'
    | 'go'
    | 'rust'
    | 'csharp'
    | 'php'
    | 'ruby'
    | 'sql'
    | 'json'
    | 'yaml'
    | 'html'
    | 'css'
    | 'scss'
    | 'markdown'
    | 'dockerfile'
    | 'shell'
    | 'other';

export interface ProjectFile {
    id: string;
    project_id: string;
    name: string;
    path: string;
    content: string | null;
    language: LanguageType | null;
    size: number;
    file_type: FileType;
    is_template: boolean;
    version: number;
    parent_file_id: string | null;
    created_by: string | null;
    last_modified_by: string | null;
    created_at: string;
    updated_at: string;
    github_sha: string | null;
    github_pushed_at: string | null;
}

export interface ProjectFileCreateInput {
    name: string;
    path: string;
    content?: string;
    language?: LanguageType;
    file_type?: FileType;
    is_template?: boolean;
    parent_file_id?: string;
}

export interface ProjectFileUpdateInput {
    name?: string;
    content?: string;
    language?: LanguageType;
    is_template?: boolean;
}

// ============================================================================
// SNIPPET TYPES
// ============================================================================

export type SnippetCategory =
    | 'auth'
    | 'database'
    | 'api'
    | 'ui'
    | 'hooks'
    | 'utilities'
    | 'middleware'
    | 'validation'
    | 'testing'
    | 'deployment'
    | 'other';

export type FrameworkType =
    | 'react'
    | 'vue'
    | 'svelte'
    | 'angular'
    | 'next'
    | 'nuxt'
    | 'node'
    | 'express'
    | 'fastapi'
    | 'django'
    | 'rails'
    | 'other';

export interface Snippet {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    code: string;
    language: LanguageType;
    category: SnippetCategory | null;
    tags: string[];
    is_public: boolean;
    visibility: ProjectVisibility;
    likes: number;
    uses: number;
    view_count: number;
    version: string;
    framework: FrameworkType | null;
    dependencies: string[];
    created_at: string;
    updated_at: string;
    slug: string | null;
    featured: boolean;
    owner?: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

export interface SnippetCreateInput {
    name: string;
    description?: string;
    code: string;
    language: LanguageType;
    category?: SnippetCategory;
    tags?: string[];
    visibility?: ProjectVisibility;
    framework?: FrameworkType;
    dependencies?: string[];
}

export interface SnippetUpdateInput {
    name?: string;
    description?: string;
    code?: string;
    category?: SnippetCategory;
    tags?: string[];
    visibility?: ProjectVisibility;
}

// ============================================================================
// PROJECT ACTIVITY TYPES
// ============================================================================

export type ActivityAction =
    | 'created'
    | 'updated'
    | 'deleted'
    | 'file_added'
    | 'file_updated'
    | 'file_deleted'
    | 'member_joined'
    | 'member_left'
    | 'member_invited'
    | 'member_role_changed'
    | 'published'
    | 'archived'
    | 'github_pushed'
    | 'comment_added'
    | 'comment_resolved';

export type ActivityEntityType = 'project' | 'file' | 'member' | 'comment' | 'activity';

export interface ProjectActivity {
    id: string;
    project_id: string;
    user_id: string | null;
    action: ActivityAction;
    entity_type: ActivityEntityType | null;
    entity_id: string | null;
    details: Record<string, any> | null;
    description: string | null;
    created_at: string;
    ip_address: string | null;
    user_agent: string | null;
    user?: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

// ============================================================================
// PROJECT TEMPLATE TYPES
// ============================================================================

export type TemplateCategory =
    | 'rest-api'
    | 'saas'
    | 'cli'
    | 'chrome-extension'
    | 'mobile'
    | 'web'
    | 'fullstack'
    | 'other';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ProjectFileStructure {
    name: string;
    type: FileType;
    children?: ProjectFileStructure[];
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    structure: ProjectFileStructure[];
    files: Record<string, string>;  // path -> template content
    category: TemplateCategory | null;
    icon: string | null;
    difficulty: DifficultyLevel;
    tags: string[];
    featured: boolean;
    tech_stack: string[];
    dependencies: Record<string, string> | null;
    used_count: number;
    rating: number;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// COLLABORATION TYPES
// ============================================================================

export interface ProjectCollaboration {
    id: string;
    project_id: string;
    user_id: string;
    is_active: boolean;
    last_seen_at: string;
    focused_file_id: string | null;
    cursor_position: number | null;
    connected_at: string;
    user?: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

export interface CollaborationPresence {
    project_id: string;
    user_id: string;
    is_active: boolean;
    focused_file_id: string | null;
    cursor_position: number | null;
}

// ============================================================================
// GITHUB INTEGRATION TYPES
// ============================================================================

export interface GitHubIntegration {
    id: string;
    user_id: string;
    project_id: string | null;
    github_user_id: string;
    github_username: string;
    repo_owner: string | null;
    repo_name: string | null;
    repo_url: string | null;
    is_connected: boolean;
    last_synced_at: string | null;
    connected_at: string;
    updated_at: string;
}

export interface GitHubRepo {
    owner: string;
    name: string;
    url: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
}

// ============================================================================
// CODE GENERATION TYPES
// ============================================================================

export interface CodeGenerationRequest {
    project_id: string;
    template_id?: string;
    custom_prompt?: string;
    variables?: Record<string, string>;
}

export interface CodeGenerationResponse {
    files: ProjectFile[];
    structure: ProjectFileStructure[];
    summary: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface ProjectAnalytics {
    project_id: string;
    total_files: number;
    total_lines_of_code: number;
    languages_used: Record<LanguageType, number>;
    contributors: number;
    commits: number;
    creation_date: string;
    last_updated: string;
    activity_trend: Array<{
        date: string;
        activity_count: number;
    }>;
}

export interface UserAnalytics {
    user_id: string;
    projects_created: number;
    projects_contributed: number;
    snippets_created: number;
    total_followers: number;
    total_following: number;
    achievements: string[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
    | 'project_invitation'
    | 'member_joined'
    | 'file_updated'
    | 'comment_mention'
    | 'project_shared'
    | 'snippet_liked';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    entity_id: string | null;
    entity_type: string | null;
    read: boolean;
    created_at: string;
    action_url?: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface ProjectWorkspaceState {
    project: Project | null;
    files: ProjectFile[];
    selectedFile: ProjectFile | null;
    members: ProjectMember[];
    activity: ProjectActivity[];
    collaboration: ProjectCollaboration[];
    isLoading: boolean;
    error: string | null;
}

export interface HubContextType {
    user: any;
    projects: Project[];
    snippets: Snippet[];
    isLoading: boolean;
    createProject: (input: ProjectCreateInput) => Promise<Project>;
    updateProject: (id: string, input: ProjectUpdateInput) => Promise<Project>;
    deleteProject: (id: string) => Promise<void>;
    createSnippet: (input: SnippetCreateInput) => Promise<Snippet>;
}
