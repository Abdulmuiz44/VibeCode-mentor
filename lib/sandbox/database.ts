/**
 * Sandbox Database Operations
 * CRUD operations for sandbox tracking in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { Sandbox, SandboxStatus, SandboxProvider } from './types';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface SandboxRecord {
    id: string;
    project_id: string;
    provider: SandboxProvider;
    sandbox_id: string | null;
    preview_url: string | null;
    status: SandboxStatus;
    logs: string[];
    error_message: string | null;
    created_at: string;
    expires_at: string;
    updated_at: string;
}

export interface BuildLogRecord {
    id: string;
    project_id: string;
    sandbox_id: string | null;
    step: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
}

export class SandboxDatabase {
    /**
     * Create a new sandbox record
     */
    static async create(
        projectId: string,
        provider: SandboxProvider = 'e2b'
    ): Promise<SandboxRecord> {
        const { data, error } = await supabase
            .from('sandboxes')
            .insert({
                project_id: projectId,
                provider,
                status: 'creating',
            })
            .select()
            .single();

        if (error) {
            console.error('[SandboxDB] Create error:', error);
            throw new Error(`Failed to create sandbox record: ${error.message}`);
        }

        return data;
    }

    /**
     * Update sandbox with provider's sandbox ID
     */
    static async updateSandboxId(
        id: string,
        sandboxId: string,
        previewUrl?: string
    ): Promise<void> {
        const { error } = await supabase
            .from('sandboxes')
            .update({
                sandbox_id: sandboxId,
                preview_url: previewUrl || null,
                status: 'ready',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            console.error('[SandboxDB] Update sandbox ID error:', error);
            throw error;
        }
    }

    /**
     * Update sandbox status
     */
    static async updateStatus(
        id: string,
        status: SandboxStatus,
        errorMessage?: string
    ): Promise<void> {
        const { error } = await supabase
            .from('sandboxes')
            .update({
                status,
                error_message: errorMessage || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            console.error('[SandboxDB] Update status error:', error);
            throw error;
        }
    }

    /**
     * Update preview URL
     */
    static async updatePreviewUrl(id: string, previewUrl: string): Promise<void> {
        const { error } = await supabase
            .from('sandboxes')
            .update({
                preview_url: previewUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            console.error('[SandboxDB] Update preview URL error:', error);
            throw error;
        }
    }

    /**
     * Get sandbox by ID
     */
    static async getById(id: string): Promise<SandboxRecord | null> {
        const { data, error } = await supabase
            .from('sandboxes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('[SandboxDB] Get by ID error:', error);
            throw error;
        }

        return data;
    }

    /**
     * Get active sandbox for a project
     */
    static async getActiveForProject(projectId: string): Promise<SandboxRecord | null> {
        const { data, error } = await supabase
            .from('sandboxes')
            .select('*')
            .eq('project_id', projectId)
            .in('status', ['creating', 'ready', 'running'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('[SandboxDB] Get active error:', error);
            return null;
        }

        return data;
    }

    /**
     * Get all sandboxes for a project
     */
    static async getByProjectId(projectId: string): Promise<SandboxRecord[]> {
        const { data, error } = await supabase
            .from('sandboxes')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[SandboxDB] Get by project error:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Append log entry
     */
    static async appendLog(
        sandboxId: string,
        log: string
    ): Promise<void> {
        // Get current logs
        const { data } = await supabase
            .from('sandboxes')
            .select('logs')
            .eq('id', sandboxId)
            .single();

        const currentLogs = (data?.logs || []) as string[];
        currentLogs.push(log);

        const { error } = await supabase
            .from('sandboxes')
            .update({
                logs: currentLogs,
                updated_at: new Date().toISOString(),
            })
            .eq('id', sandboxId);

        if (error) {
            console.error('[SandboxDB] Append log error:', error);
        }
    }

    /**
     * Mark sandbox as expired
     */
    static async expire(id: string): Promise<void> {
        await this.updateStatus(id, 'expired');
    }

    /**
     * Delete a sandbox record
     */
    static async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('sandboxes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[SandboxDB] Delete error:', error);
            throw error;
        }
    }

    /**
     * Clean up expired sandboxes (run periodically)
     */
    static async cleanupExpired(): Promise<number> {
        const { data, error } = await supabase
            .from('sandboxes')
            .update({ status: 'expired' })
            .lt('expires_at', new Date().toISOString())
            .neq('status', 'expired')
            .select();

        if (error) {
            console.error('[SandboxDB] Cleanup error:', error);
            return 0;
        }

        return data?.length || 0;
    }
}

export class BuildLogDatabase {
    /**
     * Add a log entry
     */
    static async log(
        projectId: string,
        step: string,
        message: string,
        level: 'info' | 'warn' | 'error' | 'debug' = 'info',
        sandboxId?: string,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        const { error } = await supabase
            .from('build_logs')
            .insert({
                project_id: projectId,
                sandbox_id: sandboxId || null,
                step,
                level,
                message,
                metadata: metadata || null,
            });

        if (error) {
            console.error('[BuildLogDB] Log error:', error);
        }
    }

    /**
     * Get logs for a project
     */
    static async getByProjectId(
        projectId: string,
        limit: number = 100
    ): Promise<BuildLogRecord[]> {
        const { data, error } = await supabase
            .from('build_logs')
            .select('*')
            .eq('project_id', projectId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[BuildLogDB] Get by project error:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Get logs for a sandbox
     */
    static async getBySandboxId(
        sandboxId: string,
        limit: number = 100
    ): Promise<BuildLogRecord[]> {
        const { data, error } = await supabase
            .from('build_logs')
            .select('*')
            .eq('sandbox_id', sandboxId)
            .order('timestamp', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('[BuildLogDB] Get by sandbox error:', error);
            return [];
        }

        return data || [];
    }
}
