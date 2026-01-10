-- Update all blueprints to have vibe set to project_idea if vibe is null or empty or 'default'
UPDATE blueprints
SET vibe = project_idea
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
