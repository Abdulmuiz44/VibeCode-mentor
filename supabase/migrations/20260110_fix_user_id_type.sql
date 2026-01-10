-- Migration to fix UUID syntax error by changing user_id and owner_id to TEXT
-- Handles RLS policy dependencies by dropping and recreating them

-- 1. Drop dependent policies first
DO $$ 
BEGIN 
    -- Projects table policies
    DROP POLICY IF EXISTS "users_can_view_own_projects" ON projects;
    DROP POLICY IF EXISTS "users_can_create_projects" ON projects;
    DROP POLICY IF EXISTS "users_can_update_own_projects" ON projects;
    DROP POLICY IF EXISTS "users_can_delete_own_projects" ON projects;

    -- Project Members table policies
    DROP POLICY IF EXISTS "users_can_view_project_members" ON project_members;
EXCEPTION 
    WHEN others THEN NULL; 
END $$;

-- 2. Drop foreign key constraints
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'projects_owner_id_fkey') THEN
        ALTER TABLE projects DROP CONSTRAINT projects_owner_id_fkey;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'projects_user_id_fkey') THEN
        ALTER TABLE projects DROP CONSTRAINT projects_user_id_fkey;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'project_members_user_id_fkey') THEN
        ALTER TABLE project_members DROP CONSTRAINT project_members_user_id_fkey;
    END IF;
EXCEPTION 
    WHEN others THEN NULL; 
END $$;

-- 3. Change column types to TEXT
ALTER TABLE projects ALTER COLUMN owner_id TYPE TEXT;
ALTER TABLE projects ALTER COLUMN user_id TYPE TEXT;

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_members') THEN
        ALTER TABLE project_members ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- 4. Recreate policies with explicit type casting for auth.uid()
-- Projects
CREATE POLICY "users_can_view_own_projects"
    ON projects FOR SELECT
    USING (owner_id = auth.uid()::text OR is_public = true OR id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()::text
    ));

CREATE POLICY "users_can_create_projects"
    ON projects FOR INSERT
    WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "users_can_update_own_projects"
    ON projects FOR UPDATE
    USING (owner_id = auth.uid()::text);

CREATE POLICY "users_can_delete_own_projects"
    ON projects FOR DELETE
    USING (owner_id = auth.uid()::text);

-- Project Members
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_members') THEN
        CREATE POLICY "users_can_view_project_members"
            ON project_members FOR SELECT
            USING (user_id = auth.uid()::text OR project_id IN (
                SELECT id FROM projects WHERE owner_id = auth.uid()::text OR is_public = true
            ));
    END IF;
END $$;

-- Note: Formal foreign keys to auth.users(id) are removed to support non-UUID OAuth IDs.
