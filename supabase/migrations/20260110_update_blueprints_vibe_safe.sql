-- Update all blueprints to have vibe set to truncated project_idea
-- Truncate to 500 chars to avoid index size issues
UPDATE blueprints
SET vibe = SUBSTRING(project_idea, 1, 500)
WHERE vibe IS NULL 
   OR vibe = '' 
   OR vibe = 'default'
   OR vibe = 'Generated Blueprint';

-- Verify update
SELECT id, vibe, project_idea FROM blueprints LIMIT 10;

-- Show count of blueprints with non-empty vibe
SELECT COUNT(*) as total_blueprints, 
       SUM(CASE WHEN vibe IS NOT NULL AND vibe != '' THEN 1 ELSE 0 END) as with_vibe
FROM blueprints;
