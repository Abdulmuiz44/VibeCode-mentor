-- Verify all blueprints have proper vibe
SELECT COUNT(*) as total_blueprints, 
       SUM(CASE WHEN vibe IS NOT NULL AND vibe != '' AND vibe != 'default' THEN 1 ELSE 0 END) as with_proper_vibe
FROM blueprints;

-- Show first 5 blueprints with their vibe
SELECT id, vibe, created_at FROM blueprints ORDER BY created_at DESC LIMIT 5;
