import { createClient } from '@supabase/supabase-js';
import { BlueprintGenerator } from './blueprint-generator';
import { CodeScaffolder } from './code-scaffolder';
import { DockerExecutor } from './docker-executor';
import { TestRunner } from './test-runner';
import { Deployer } from './deployer';
import { GuardrailsEngine } from '../guardrails/guardrails-engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface ProjectRequest {
  userId: string;
  projectName: string;
  
  // Three options (in priority order):
  blueprintId?: string;                    // Use existing saved blueprint
  blueprint?: any;                         // Use provided blueprint object
  prompt?: string;                         // Generate new blueprint from prompt
  
  requirements?: {
    techStack?: string[];
    features?: string[];
    deadline?: number;
  };
}

export interface AgentResult {
  projectId: string;
  status: 'success' | 'failure';
  deployedUrl?: string;
  githubUrl?: string;
  errorMessage?: string;
}

/**
 * Main orchestrator for autonomous project building
 * Coordinates all phases: planning → building → testing → deploying
 */
export class AgentOrchestrator {
  private blueprintGenerator: BlueprintGenerator;
  private codeScaffolder: CodeScaffolder;
  private dockerExecutor: DockerExecutor;
  private testRunner: TestRunner;
  private deployer: Deployer;
  private guardrails: GuardrailsEngine;

  constructor() {
    this.blueprintGenerator = new BlueprintGenerator();
    this.codeScaffolder = new CodeScaffolder();
    this.dockerExecutor = new DockerExecutor();
    this.testRunner = new TestRunner();
    this.deployer = new Deployer();
    this.guardrails = new GuardrailsEngine();
  }

  /**
   * Main entry point: Start building a project
   */
  async buildProject(request: ProjectRequest): Promise<AgentResult> {
    const projectId = await this.createProject(request);

    try {
      // Phase 1: Generate Blueprint (CONDITIONAL)
      let blueprint: any;
      
      if (request.blueprintId) {
        // Option 1: Use existing saved blueprint
        console.log(`Loading existing blueprint: ${request.blueprintId}`);
        blueprint = await this.loadBlueprint(request.blueprintId);
        await this.updateProject(projectId, { 
          blueprint, 
          current_phase: 'scaffolding',
          progress_percentage: 10  // Phase 1 skipped, jump to 10%
        });
        
      } else if (request.blueprint) {
        // Option 2: Use provided blueprint object
        console.log('Using provided blueprint');
        blueprint = request.blueprint;
        await this.updateProject(projectId, { 
          blueprint, 
          current_phase: 'scaffolding',
          progress_percentage: 10
        });
        
      } else if (request.prompt) {
        // Option 3: Generate new blueprint from prompt
        console.log(`Generating blueprint from prompt`);
        await this.executePhase(projectId, 'blueprint_generation', async () => {
          blueprint = await this.blueprintGenerator.generate(request.prompt, request.requirements);
          await this.updateProject(projectId, { blueprint, current_phase: 'scaffolding' });
          return { blueprint };
        });
        
      } else {
        throw new Error('Must provide blueprintId, blueprint, or prompt');
      }

      // Phase 2: Scaffold Code
      await this.executePhase(projectId, 'scaffolding', async () => {
        const project = await this.getProject(projectId);
        const codebase = await this.codeScaffolder.scaffold(project.blueprint, project.project_name);
        
        // Check guardrails before proceeding
        await this.guardrails.validateCodebase(projectId, codebase);
        
        await this.updateProject(projectId, { codebase, current_phase: 'building' });
        return { codebase };
      });

      // Phase 3: Build
      await this.executePhase(projectId, 'build', async () => {
        const project = await this.getProject(projectId);
        const { logs, success, containerId } = await this.dockerExecutor.build(
          projectId,
          project.codebase
        );

        if (!success) {
          throw new Error(`Build failed: ${logs}`);
        }

        await this.updateProject(projectId, {
          build_logs: logs,
          docker_container_id: containerId,
          current_phase: 'testing',
          progress_percentage: 60
        });

        return { logs, containerSuccess: success };
      });

      // Phase 4: Test
      await this.executePhase(projectId, 'test', async () => {
        const project = await this.getProject(projectId);
        const testResults = await this.testRunner.run(project.docker_container_id);

        await this.updateProject(projectId, {
          test_results: testResults,
          current_phase: 'deploying',
          progress_percentage: 75
        });

        return { testResults };
      });

      // Phase 5: Deploy
      await this.executePhase(projectId, 'deploy', async () => {
        const project = await this.getProject(projectId);
        const { githubUrl, deployedUrl } = await this.deployer.deploy(projectId, project.codebase);

        await this.updateProject(projectId, {
          github_repo_url: githubUrl,
          deployed_url: deployedUrl,
          status: 'deployed',
          current_phase: 'completed',
          progress_percentage: 100,
          deployment_date: new Date().toISOString()
        });

        return { githubUrl, deployedUrl };
      });

      return {
        projectId,
        status: 'success',
        deployedUrl: (await this.getProject(projectId)).deployed_url,
        githubUrl: (await this.getProject(projectId)).github_repo_url
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateProject(projectId, {
        status: 'failed',
        error_message: errorMessage,
        error_phase: (await this.getProject(projectId)).current_phase
      });

      return {
        projectId,
        status: 'failure',
        errorMessage
      };
    }
  }

  /**
   * Execute a single phase with error handling and audit logging
   */
  private async executePhase(
    projectId: string,
    stepName: string,
    executor: () => Promise<any>
  ): Promise<void> {
    const stepId = await this.createExecutionStep(projectId, stepName);

    try {
      const startTime = Date.now();
      
      const output = await executor();
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      await this.updateExecutionStep(stepId, {
        status: 'completed',
        output,
        duration_seconds: duration,
        completed_at: new Date().toISOString()
      });

      await this.auditLog(projectId, stepName, 'success', { duration });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateExecutionStep(stepId, {
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString()
      });

      await this.auditLog(projectId, stepName, 'failure', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Load existing blueprint from database
   */
  private async loadBlueprint(blueprintId: string): Promise<any> {
    const { data, error } = await supabase
      .from('blueprints')
      .select('blueprint, vibe')
      .eq('id', blueprintId)
      .single();

    if (error) throw new Error(`Blueprint not found: ${blueprintId}`);
    console.log(`Loaded blueprint: ${data.vibe}`);
    return data.blueprint;
  }

  // Helper methods
  private async createProject(request: ProjectRequest): Promise<string> {
    const { data, error } = await supabase
      .from('agentic_projects')
      .insert({
        user_id: request.userId,
        project_name: request.projectName,
        description: request.prompt,
        status: 'planning',
        current_phase: 'blueprint_generation',
        progress_percentage: 0
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async getProject(projectId: string) {
    const { data, error } = await supabase
      .from('agentic_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  }

  private async updateProject(projectId: string, updates: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('agentic_projects')
      .update(updates)
      .eq('id', projectId);

    if (error) throw error;
  }

  private async createExecutionStep(projectId: string, stepName: string): Promise<string> {
    const { data, error } = await supabase
      .from('agent_execution_steps')
      .insert({
        project_id: projectId,
        step_name: stepName,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async updateExecutionStep(stepId: string, updates: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('agent_execution_steps')
      .update(updates)
      .eq('id', stepId);

    if (error) throw error;
  }

  private async auditLog(
    projectId: string,
    action: string,
    result: 'success' | 'failure',
    details: Record<string, any>
  ): Promise<void> {
    const project = await this.getProject(projectId);
    
    await supabase.from('agent_audit_log').insert({
      project_id: projectId,
      user_id: project.user_id,
      action,
      action_type: 'command_execution',
      result,
      details
    });
  }
}
