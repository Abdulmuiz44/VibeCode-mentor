/**
 * Project Service - Core business logic for projects
 */

import { createClient } from '@supabase/supabase-js';
import {
    Project,
    ProjectCreateInput,
    ProjectUpdateInput,
    ProjectMember,
    ProjectActivity,
    ActivityAction,
} from '@/types/hub';
import { generateSlug } from '@/lib/hub/utils';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Create a new project
 */
export async function createProject(
    userId: string,
    input: ProjectCreateInput
): Promise<Project> {
    const slug = generateSlug(input.name);

    const { data, error } = await supabase
        .from('projects')
        .insert([
            {
                owner_id: userId,
                name: input.name,
                description: input.description || null,
                vibe: input.vibe,
                tech_stack: input.tech_stack || [],
                slug,
                tags: input.tags || [],
                visibility: input.visibility || 'private',
                status: 'draft',
            },
        ])
        .select()
        .single();

    if (error) throw error;

    // Add owner as project member
    await supabase.from('project_members').insert([
        {
            project_id: data.id,
            user_id: userId,
            role: 'owner',
        },
    ]);

    // Log activity
    await logProjectActivity(data.id, userId, 'created', 'project', data.id, {
        name: input.name,
    });

    return data;
}

/**
 * Get a project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(
    userId: string,
    filters?: {
        status?: string;
        visibility?: string;
        limit?: number;
        offset?: number;
    }
): Promise<Project[]> {
    let query = supabase
        .from('projects')
        .select('*')
        .or(
            `owner_id.eq.${userId},id.in.(${supabase
                .from('project_members')
                .select('project_id')
                .eq('user_id', userId)
            })`
        );

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
}

/**
 * Update a project
 */
export async function updateProject(
    projectId: string,
    userId: string,
    input: ProjectUpdateInput
): Promise<Project> {
    // Verify ownership/permissions
    await verifyProjectAccess(projectId, userId, 'editor');

    const updateData: any = {};

    if (input.name !== undefined) {
        updateData.name = input.name;
        updateData.slug = generateSlug(input.name);
    }
    if (input.description !== undefined) updateData.description = input.description;
    if (input.vibe !== undefined) updateData.vibe = input.vibe;
    if (input.tech_stack !== undefined) updateData.tech_stack = input.tech_stack;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.visibility !== undefined) updateData.visibility = input.visibility;
    if (input.tags !== undefined) updateData.tags = input.tags;

    const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();

    if (error) throw error;

    // Log activity
    await logProjectActivity(projectId, userId, 'updated', 'project', projectId, {
        changes: updateData,
    });

    return data;
}

/**
 * Delete a project
 */
export async function deleteProject(
    projectId: string,
    userId: string
): Promise<void> {
    // Verify ownership
    const project = await getProject(projectId);
    if (!project || project.owner_id !== userId) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) throw error;

    // Log activity (via function or separate call)
    await logProjectActivity(projectId, userId, 'deleted', 'project', projectId);
}

/**
 * Get project members
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const { data, error } = await supabase
        .from('project_members')
        .select(
            `
            *,
            user:auth.users(id, email, user_metadata->'name', user_metadata->'image')
            ` as any
        )
        .eq('project_id', projectId);

    if (error) throw error;
    return (data as unknown as ProjectMember[]) || [];
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
    projectId: string,
    userId: string,
    invitedById: string,
    role: 'editor' | 'viewer' | 'commenter' = 'viewer'
): Promise<ProjectMember> {
    // Verify inviter is owner/editor
    await verifyProjectAccess(projectId, invitedById, 'editor');

    const { data, error } = await supabase
        .from('project_members')
        .insert([
            {
                project_id: projectId,
                user_id: userId,
                role,
                invited_by: invitedById,
                invited_at: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (error) throw error;

    // Update member count
    const memberCount = await supabase
        .from('project_members')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId);

    await supabase
        .from('projects')
        .update({ member_count: memberCount.count })
        .eq('id', projectId);

    // Log activity
    await logProjectActivity(projectId, invitedById, 'member_invited', 'member', userId, {
        role,
    });

    return data;
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(
    projectId: string,
    memberId: string,
    requestorId: string
): Promise<void> {
    // Verify requestor is owner
    const project = await getProject(projectId);
    if (!project || project.owner_id !== requestorId) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId)
        .eq('project_id', projectId);

    if (error) throw error;

    // Log activity
    const member = await supabase
        .from('project_members')
        .select('user_id')
        .eq('id', memberId)
        .single();

    await logProjectActivity(
        projectId,
        requestorId,
        'member_left',
        'member',
        member.data?.user_id
    );
}

/**
 * Change member role
 */
export async function changeProjectMemberRole(
    projectId: string,
    memberId: string,
    newRole: string,
    requestorId: string
): Promise<ProjectMember> {
    // Verify requestor is owner
    await verifyProjectAccess(projectId, requestorId, 'owner');

    const { data, error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .eq('project_id', projectId)
        .select()
        .single();

    if (error) throw error;

    // Log activity
    await logProjectActivity(projectId, requestorId, 'member_role_changed', 'member', memberId, {
        new_role: newRole,
    });

    return data;
}

/**
 * Get project activity
 */
export async function getProjectActivity(
    projectId: string,
    limit: number = 50,
    offset: number = 0
): Promise<ProjectActivity[]> {
    const { data, error } = await supabase
        .from('project_activity')
        .select(
            `
            *,
            user:auth.users(id, user_metadata->'name', user_metadata->'image')
            ` as any
        )
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data as unknown as ProjectActivity[]) || [];
}

/**
 * Log project activity
 */
export async function logProjectActivity(
    projectId: string,
    userId: string | null,
    action: ActivityAction,
    entityType?: string,
    entityId?: string,
    details?: Record<string, any>
): Promise<void> {
    const { error } = await supabase.from('project_activity').insert([
        {
            project_id: projectId,
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details: details || {},
        },
    ]);

    if (error) {
        console.error('Failed to log activity:', error);
    }

    // Update last_activity_at
    await supabase
        .from('projects')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', projectId);
}

/**
 * Verify user has access to a project
 */
export async function verifyProjectAccess(
    projectId: string,
    userId: string,
    minRole: 'viewer' | 'commenter' | 'editor' | 'owner' = 'viewer'
): Promise<boolean> {
    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');

    // Owner always has access
    if (project.owner_id === userId) return true;

    // Check membership
    const { data: member, error } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

    if (error || !member) {
        throw new Error('Unauthorized');
    }

    const roleHierarchy = { viewer: 0, commenter: 1, editor: 2, owner: 3 };
    const minRoleLevel = roleHierarchy[minRole as keyof typeof roleHierarchy];
    const userRoleLevel = roleHierarchy[member.role as keyof typeof roleHierarchy];

    if (userRoleLevel < minRoleLevel) {
        throw new Error('Insufficient permissions');
    }

    return true;
}

/**
 * Update project member count
 */
export async function updateProjectMemberCount(projectId: string): Promise<number> {
    const { count } = await supabase
        .from('project_members')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId);

    if (count !== null) {
        await supabase
            .from('projects')
            .update({ member_count: count })
            .eq('id', projectId);
    }

    return count || 0;
}

/**
 * Update project file count
 */
export async function updateProjectFileCount(projectId: string): Promise<number> {
    const { count } = await supabase
        .from('project_files')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId);

    if (count !== null) {
        await supabase
            .from('projects')
            .update({ file_count: count })
            .eq('id', projectId);
    }

    return count || 0;
}
