import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface BuildExecution {
  id: string;
  blueprint_id: string;
  blueprint_version: number;
  user_id: string;
  status: 'pending' | 'validating' | 'building' | 'pushing' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  github_url?: string;
  github_repo_id?: number;
  total_files_generated: number;
  execution_time_ms?: number;
  error_message?: string;
  logs: string[];
}

export interface BuildStep {
  id: string;
  build_id: string;
  step_name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  output: string[];
  error?: string;
}

export class BuildDatabase {
  static async createBuild(
    blueprintId: string,
    blueprintVersion: number,
    userId: string
  ): Promise<BuildExecution> {
    const { data, error } = await supabase
      .from('build_executions')
      .insert({
        blueprint_id: blueprintId,
        blueprint_version: blueprintVersion,
        user_id: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getBuild(buildId: string, userId: string): Promise<BuildExecution> {
    const { data, error } = await supabase
      .from('build_executions')
      .select('*')
      .eq('id', buildId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateBuildStatus(
    buildId: string,
    status: BuildExecution['status'],
    updates?: { error_message?: string; github_url?: string; completion_time_ms?: number }
  ): Promise<void> {
    const update: any = { status, updated_at: new Date().toISOString() };

    if (updates?.error_message) update.error_message = updates.error_message;
    if (updates?.github_url) update.github_url = updates.github_url;
    if (updates?.completion_time_ms) update.execution_time_ms = updates.completion_time_ms;
    if (status === 'completed' || status === 'failed') {
      update.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('build_executions')
      .update(update)
      .eq('id', buildId);

    if (error) throw error;
  }

  static async createStep(
    buildId: string,
    stepName: string,
    orderIndex: number
  ): Promise<BuildStep> {
    const { data, error } = await supabase
      .from('build_steps')
      .insert({
        build_id: buildId,
        step_name: stepName,
        order_index: orderIndex,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateStep(
    stepId: string,
    status: BuildStep['status'],
    output?: string[],
    error?: string
  ): Promise<void> {
    const update: any = { status };

    if (status === 'in-progress') update.started_at = new Date().toISOString();
    if (status === 'completed' || status === 'failed') {
      update.completed_at = new Date().toISOString();
    }
    if (output) update.output = output;
    if (error) update.error = error;

    const { error: err } = await supabase
      .from('build_steps')
      .update(update)
      .eq('id', stepId);

    if (err) throw err;
  }

  static async getBuildSteps(buildId: string): Promise<BuildStep[]> {
    const { data, error } = await supabase
      .from('build_steps')
      .select('*')
      .eq('build_id', buildId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getBuildProgress(buildId: string): Promise<{
    status: string;
    progress: number;
    steps: BuildStep[];
  }> {
    const build = await this.getBuild(buildId, ''); // Will fail, use different method
    const steps = await this.getBuildSteps(buildId);

    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

    return {
      status: build.status,
      progress,
      steps,
    };
  }
}
