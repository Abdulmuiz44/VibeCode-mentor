import { createClient } from '@supabase/supabase-js';
import { Blueprint, GeneratedProject } from '@/lib/code-generator/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface GeneratedProjectRecord {
  id: string;
  user_id: string;
  project_name: string;
  project_slug: string;
  description: string;
  blueprint: Blueprint;
  generated_files: GeneratedProject;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  current_step: string | null;
  error_message: string | null;
  github_url: string | null;
  github_repo_id: number | null;
  total_files: number;
  technologies: string[];
  api_endpoints: number;
  components: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ProjectGenerationStep {
  id: string;
  project_id: string;
  step_name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  details: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export class ProjectDatabase {
  /**
   * Create a new generated project record
   */
  static async createProject(
    userId: string,
    blueprint: Blueprint,
    generatedProject: GeneratedProject
  ): Promise<GeneratedProjectRecord> {
    const { data, error } = await supabase
      .from('generated_projects')
      .insert({
        user_id: userId,
        project_name: blueprint.projectName,
        project_slug: generatedProject.name,
        description: blueprint.description,
        blueprint,
        generated_files: generatedProject,
        status: 'generating',
        total_files: generatedProject.summary.totalFiles,
        technologies: generatedProject.summary.technologies,
        api_endpoints: generatedProject.summary.apiEndpoints,
        components: generatedProject.summary.components,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get project by ID
   */
  static async getProject(projectId: string): Promise<GeneratedProjectRecord> {
    const { data, error } = await supabase
      .from('generated_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all projects for a user
   */
  static async getUserProjects(userId: string): Promise<GeneratedProjectRecord[]> {
    const { data, error } = await supabase
      .from('generated_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Update project status
   */
  static async updateProjectStatus(
    projectId: string,
    status: 'pending' | 'generating' | 'completed' | 'failed',
    currentStep?: string,
    errorMessage?: string
  ): Promise<void> {
    const update: any = { status };

    if (currentStep) update.current_step = currentStep;
    if (errorMessage) update.error_message = errorMessage;
    if (status === 'completed') update.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('generated_projects')
      .update(update)
      .eq('id', projectId);

    if (error) throw error;
  }

  /**
   * Update GitHub URL after successful push
   */
  static async updateProjectGithubUrl(
    projectId: string,
    githubUrl: string,
    repoId: number
  ): Promise<void> {
    const { error } = await supabase
      .from('generated_projects')
      .update({
        github_url: githubUrl,
        github_repo_id: repoId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) throw error;
  }

  /**
   * Delete project
   */
  static async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('generated_projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }

  /**
   * Create a generation step
   */
  static async createStep(
    projectId: string,
    stepName: string
  ): Promise<ProjectGenerationStep> {
    const { data, error } = await supabase
      .from('project_generation_steps')
      .insert({
        project_id: projectId,
        step_name: stepName,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update step status
   */
  static async updateStep(
    stepId: string,
    status: 'pending' | 'in-progress' | 'completed' | 'failed',
    details?: string
  ): Promise<void> {
    const update: any = {
      status,
      started_at: status === 'in-progress' ? new Date().toISOString() : undefined,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined,
    };

    if (details) update.details = details;

    // Remove undefined values
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const { error } = await supabase
      .from('project_generation_steps')
      .update(update)
      .eq('id', stepId);

    if (error) throw error;
  }

  /**
   * Get all steps for a project
   */
  static async getProjectSteps(projectId: string): Promise<ProjectGenerationStep[]> {
    const { data, error } = await supabase
      .from('project_generation_steps')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get generation progress for frontend
   */
  static async getGenerationProgress(projectId: string): Promise<{
    status: string;
    steps: ProjectGenerationStep[];
    progress: number;
  }> {
    const project = await this.getProject(projectId);
    const steps = await this.getProjectSteps(projectId);

    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

    return {
      status: project.status,
      steps,
      progress,
    };
  }
}

// GitHub Tokens
export interface GitHubTokenRecord {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at?: string;
  github_username: string;
  created_at: string;
  updated_at: string;
}

export class GitHubTokenDatabase {
  /**
   * Save GitHub token after OAuth
   */
  static async saveToken(
    userId: string,
    accessToken: string,
    githubUsername: string,
    expiresAt?: string,
    refreshToken?: string
  ): Promise<GitHubTokenRecord> {
    const { data, error } = await supabase
      .from('github_tokens')
      .upsert(
        {
          user_id: userId,
          access_token: accessToken,
          refresh_token: refreshToken,
          github_username: githubUsername,
          expires_at: expiresAt,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's GitHub token
   */
  static async getToken(userId: string): Promise<GitHubTokenRecord | null> {
    const { data, error } = await supabase
      .from('github_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error?.code === 'PGRST116') return null; // No rows
    if (error) throw error;
    return data;
  }

  /**
   * Check if user has GitHub token
   */
  static async hasToken(userId: string): Promise<boolean> {
    const token = await this.getToken(userId);
    return token !== null;
  }

  /**
   * Delete GitHub token
   */
  static async deleteToken(userId: string): Promise<void> {
    const { error } = await supabase
      .from('github_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
}
