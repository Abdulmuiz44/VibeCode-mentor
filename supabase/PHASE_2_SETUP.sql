-- ============================================================================
-- PHASE 2 POST-DEPLOYMENT SETUP AND VERIFICATION
-- Run these queries in Supabase SQL Editor to verify and complete setup
-- ============================================================================

-- ============================================================================
-- 1. VERIFY ALL TABLES CREATED
-- ============================================================================

-- Should return 6 rows (build_errors, user_quotas, rate_limit_events, build_checksums, build_metrics, deployment_logs)
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('build_errors', 'user_quotas', 'rate_limit_events', 'build_checksums', 'build_metrics', 'deployment_logs')
ORDER BY tablename;

-- ============================================================================
-- 2. VERIFY ALL FUNCTIONS CREATED
-- ============================================================================

-- Should return 5 rows
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_user_quota', 'record_rate_limit_event', 'check_duplicate_build', 'cleanup_old_rate_limit_events', 'calculate_build_metrics')
ORDER BY routine_name;

-- ============================================================================
-- 3. VERIFY ALL VIEWS CREATED
-- ============================================================================

-- Should return 3 rows
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('recent_build_failures', 'user_quota_status', 'build_system_health')
ORDER BY viewname;

-- ============================================================================
-- 4. VERIFY ALL INDEXES CREATED
-- ============================================================================

-- Should return multiple indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND (indexname LIKE 'idx_build_errors%' 
  OR indexname LIKE 'idx_user_quotas%' 
  OR indexname LIKE 'idx_rate_limit%' 
  OR indexname LIKE 'idx_build_checksums%' 
  OR indexname LIKE 'idx_build_metrics%' 
  OR indexname LIKE 'idx_deployment_logs%')
ORDER BY indexname;

-- ============================================================================
-- 5. SEED INITIAL USER QUOTAS FOR EXISTING USERS
-- Run this once after deployment
-- ============================================================================

INSERT INTO user_quotas (user_id, monthly_builds_limit, monthly_builds_used)
SELECT id, 10, 0 
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_quotas)
ON CONFLICT DO NOTHING;

-- Verify quotas were created
SELECT COUNT(*) as total_quotas FROM user_quotas;

-- ============================================================================
-- 6. CHECK TABLE ROW COUNTS
-- ============================================================================

-- View current state of all Phase 2 tables
SELECT 
  'build_errors' as table_name,
  COUNT(*) as row_count
FROM build_errors
UNION ALL
SELECT 'user_quotas', COUNT(*) FROM user_quotas
UNION ALL
SELECT 'rate_limit_events', COUNT(*) FROM rate_limit_events
UNION ALL
SELECT 'build_checksums', COUNT(*) FROM build_checksums
UNION ALL
SELECT 'build_metrics', COUNT(*) FROM build_metrics
UNION ALL
SELECT 'deployment_logs', COUNT(*) FROM deployment_logs
ORDER BY table_name;

-- ============================================================================
-- 7. CHECK RLS POLICIES
-- ============================================================================

-- Should show all RLS policies created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('build_errors', 'user_quotas', 'rate_limit_events', 'build_checksums', 'build_metrics', 'deployment_logs')
ORDER BY tablename, policyname;

-- ============================================================================
-- 8. TEST check_user_quota FUNCTION
-- ============================================================================

-- Replace 'user-uuid-here' with an actual user ID from auth.users
-- SELECT * FROM check_user_quota('user-uuid-here'::uuid);

-- ============================================================================
-- 9. TEST calculate_build_metrics FUNCTION
-- ============================================================================

-- Returns current hour metrics
SELECT * FROM calculate_build_metrics();

-- ============================================================================
-- 10. CHECK CONSTRAINTS
-- ============================================================================

-- View all constraints on Phase 2 tables
SELECT 
  tablename,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND tablename IN ('build_errors', 'user_quotas', 'rate_limit_events', 'build_checksums', 'build_metrics', 'deployment_logs')
ORDER BY tablename, constraint_name;

-- ============================================================================
-- 11. CHECK TRIGGERS
-- ============================================================================

-- View all triggers created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- 12. OPTIONAL: RESET ALL DATA (FOR TESTING ONLY)
-- ============================================================================

-- WARNING: This will delete all Phase 2 data. Only run if you want to reset.
-- Uncomment to run:

-- DELETE FROM build_errors;
-- DELETE FROM rate_limit_events;
-- DELETE FROM build_checksums;
-- DELETE FROM build_metrics;
-- DELETE FROM deployment_logs;
-- DELETE FROM user_quotas;

-- ============================================================================
-- 13. VERIFY RLS IS ENABLED ON ALL TABLES
-- ============================================================================

SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('build_errors', 'user_quotas', 'rate_limit_events', 'build_checksums', 'build_metrics', 'deployment_logs')
ORDER BY tablename;

-- Should show 't' (true) for rowsecurity column on all Phase 2 tables

-- ============================================================================
-- 14. TEST VIEWS WITH SAMPLE DATA
-- ============================================================================

-- These views should return empty results initially (no failed builds, no quotas used, no metrics)
-- They'll populate as builds are executed and errors occur

-- Check recent failures (should be empty initially)
SELECT * FROM recent_build_failures LIMIT 5;

-- Check quota status
SELECT * FROM user_quota_status LIMIT 5;

-- Check system health
SELECT * FROM build_system_health LIMIT 5;

-- ============================================================================
-- 15. CLEANUP SCRIPT (OPTIONAL)
-- ============================================================================

-- Run this monthly to clean old rate limit events
-- SELECT cleanup_old_rate_limit_events();

-- ============================================================================
-- SUMMARY OF WHAT WAS CREATED
-- ============================================================================

-- Tables (6):
--   - build_errors
--   - user_quotas
--   - rate_limit_events
--   - build_checksums
--   - build_metrics
--   - deployment_logs

-- Functions (5):
--   - check_user_quota()
--   - record_rate_limit_event()
--   - check_duplicate_build()
--   - cleanup_old_rate_limit_events()
--   - calculate_build_metrics()

-- Views (3):
--   - recent_build_failures
--   - user_quota_status
--   - build_system_health

-- Indexes (10+):
--   - Multiple indexes for performance on all tables

-- Triggers (4):
--   - Auto-update timestamps on build_executions, user_quotas, deployment_logs
--   - Update build on error insertion

-- Policies (6+):
--   - RLS policies on all new tables for data isolation

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If a table doesn't exist:
-- - Re-run the migration file: 20260103_build_system_phase2.sql
-- - Check for error messages in Supabase logs

-- If RLS policies aren't working:
-- - Verify ROW LEVEL SECURITY is enabled on the table
-- - Check that policies are using auth.uid() correctly

-- If quotas aren't resetting:
-- - The reset happens in the check_user_quota() function
-- - Manual reset: UPDATE user_quotas SET monthly_builds_used = 0, reset_at = NOW() + INTERVAL '1 month'

-- ============================================================================
-- NEXT STEPS AFTER VERIFICATION
-- ============================================================================

-- 1. Verify all queries above return expected results
-- 2. Confirm all 6 tables exist
-- 3. Confirm all 5 functions exist
-- 4. Confirm all 3 views exist
-- 5. User quotas are seeded for existing users
-- 6. Deploy API code (lib/build-error-handler.ts, app/api/builds/execute/route.ts)
-- 7. Test API endpoints in staging
-- 8. Monitor error rates and quotas in production
-- 9. Set up monitoring alerts in Grafana

-- ============================================================================
-- USEFUL QUERIES FOR DAILY MONITORING
-- ============================================================================

-- View recent build errors
-- SELECT * FROM recent_build_failures ORDER BY created_at DESC LIMIT 20;

-- View user quota status
-- SELECT * FROM user_quota_status WHERE quota_status != 'ACTIVE';

-- View system health
-- SELECT * FROM build_system_health ORDER BY hour DESC LIMIT 24;

-- View rate limit violations for a specific user
-- SELECT user_id, endpoint, COUNT(*) as requests 
-- FROM rate_limit_events 
-- WHERE timestamp > NOW() - INTERVAL '1 hour' 
-- GROUP BY user_id, endpoint 
-- HAVING COUNT(*) > 30;

-- View error distribution by type
-- SELECT error_type, COUNT(*) as count 
-- FROM build_errors 
-- WHERE created_at > NOW() - INTERVAL '24 hours' 
-- GROUP BY error_type 
-- ORDER BY count DESC;
