
import { supabase } from '@/lib/supabase';

export interface Deployment {
    id: string;
    project_id: string;
    provider: 'vercel' | 'github';
    url: string;
    status: 'success' | 'failed' | 'pending';
    deployed_at: string;
}

export class DeploymentDatabase {
    static async createDeployment(deployment: Omit<Deployment, 'id' | 'deployed_at'>): Promise<Deployment | null> {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('deployments')
            .insert([
                {
                    project_id: deployment.project_id,
                    provider: deployment.provider,
                    url: deployment.url,
                    status: deployment.status,
                    deployed_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating deployment:', error);
            return null;
        }

        return data;
    }

    static async getDeploymentsByProject(projectId: string): Promise<Deployment[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('deployments')
            .select('*')
            .eq('project_id', projectId)
            .order('deployed_at', { ascending: false });

        if (error) {
            console.error('Error fetching deployments:', error);
            return [];
        }

        return data;
    }
}
