
-- Add is_template column to projects table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_template') THEN 
        ALTER TABLE public.projects ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_is_template ON public.projects(is_template);

-- Comments
COMMENT ON COLUMN public.projects.is_template IS 'Flag to indicate if this project is a public template';
