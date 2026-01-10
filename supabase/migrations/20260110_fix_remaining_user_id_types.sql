-- Migration to fix UUID syntax errors in remaining tables by changing user_id to TEXT
-- Handles RLS policy dependencies by dropping and recreating them

-- 1. Drop ALL dependent policies across target tables using dynamic SQL
DO $$ 
DECLARE
    pol RECORD;
BEGIN 
    FOR pol IN (
        SELECT policyname, tablename, schemaname
        FROM pg_policies 
        WHERE tablename IN (
            'github_tokens', 
            'github_integrations', 
            'user_subscriptions', 
            'build_executions', 
            'build_steps',
            'user_quotas', 
            'rate_limit_events', 
            'build_checksums',
            'build_errors',
            'deployment_logs',
            'project_files',
            'project_activity',
            'project_collaborations',
            'snippets'
        )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
EXCEPTION 
    WHEN others THEN NULL; 
END $$;

-- 2. Drop dependent views
DROP VIEW IF EXISTS recent_build_failures CASCADE;
DROP VIEW IF EXISTS user_quota_status CASCADE;
DROP VIEW IF EXISTS build_system_health CASCADE;

-- 3. Drop foreign key constraints
DO $$ 
BEGIN 
    ALTER TABLE github_tokens DROP CONSTRAINT IF EXISTS github_tokens_user_id_fkey;
    ALTER TABLE github_integrations DROP CONSTRAINT IF EXISTS github_integrations_user_id_fkey;
    ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;
    ALTER TABLE build_executions DROP CONSTRAINT IF EXISTS build_executions_user_id_fkey;
    ALTER TABLE user_quotas DROP CONSTRAINT IF EXISTS user_quotas_user_id_fkey;
    ALTER TABLE rate_limit_events DROP CONSTRAINT IF EXISTS rate_limit_events_user_id_fkey;
    ALTER TABLE build_checksums DROP CONSTRAINT IF EXISTS build_checksums_user_id_fkey;
    -- Hub schema constraints
    ALTER TABLE project_files DROP CONSTRAINT IF EXISTS project_files_created_by_fkey;
    ALTER TABLE project_files DROP CONSTRAINT IF EXISTS project_files_last_modified_by_fkey;
    ALTER TABLE project_activity DROP CONSTRAINT IF EXISTS project_activity_user_id_fkey;
    ALTER TABLE project_collaborations DROP CONSTRAINT IF EXISTS project_collaborations_user_id_fkey;
    ALTER TABLE snippets DROP CONSTRAINT IF EXISTS snippets_owner_id_fkey;
EXCEPTION 
    WHEN others THEN NULL; 
END $$;

-- 4. Change column types to TEXT
ALTER TABLE github_tokens ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE github_integrations ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_subscriptions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE build_executions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_quotas ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE rate_limit_events ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE build_checksums ALTER COLUMN user_id TYPE TEXT;

-- Hub schema columns
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'created_by') THEN
        ALTER TABLE project_files ALTER COLUMN created_by TYPE TEXT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'last_modified_by') THEN
        ALTER TABLE project_files ALTER COLUMN last_modified_by TYPE TEXT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_activity' AND column_name = 'user_id') THEN
        ALTER TABLE project_activity ALTER COLUMN user_id TYPE TEXT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_collaborations' AND column_name = 'user_id') THEN
        ALTER TABLE project_collaborations ALTER COLUMN user_id TYPE TEXT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'snippets' AND column_name = 'owner_id') THEN
        ALTER TABLE snippets ALTER COLUMN owner_id TYPE TEXT;
    END IF;
END $$;

-- 4. Recreate policies with explicit type casting for auth.uid()
-- github_tokens
CREATE POLICY "Users can view own GitHub token"
  ON github_tokens FOR SELECT
  USING (user_id = auth.uid()::text);

-- user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (user_id = auth.uid()::text);

-- build_executions
CREATE POLICY "Users can view own builds"
  ON build_executions FOR SELECT
  USING (user_id = auth.uid()::text);

-- user_quotas
CREATE POLICY "Users can view own quotas"
  ON user_quotas FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own quotas"
  ON user_quotas FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- rate_limit_events
CREATE POLICY "Users can view own rate limit events"
  ON rate_limit_events FOR SELECT
  USING (user_id = auth.uid()::text);

-- build_checksums
CREATE POLICY "Users can view own checksums"
  ON build_checksums FOR SELECT
  USING (user_id = auth.uid()::text);

-- build_errors
CREATE POLICY "Users can view own build errors"
  ON build_errors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM build_executions
      WHERE build_executions.id = build_errors.build_id
      AND build_executions.user_id = auth.uid()::text
    )
  );

-- deployment_logs
CREATE POLICY "Users can view own deployment logs"
  ON deployment_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM build_executions
      WHERE build_executions.id = deployment_logs.build_id
      AND build_executions.user_id = auth.uid()::text
    )
  );

-- Hub Schema Recreations
CREATE POLICY "Users can view own build steps"
  ON build_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM build_executions
      WHERE build_executions.id = build_steps.build_id
      AND build_executions.user_id = auth.uid()::text
    )
  );

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_activity') THEN
        CREATE POLICY "Users can view project activity"
            ON project_activity FOR SELECT
            USING (user_id = auth.uid()::text OR project_id IN (
                SELECT id FROM projects WHERE owner_id = auth.uid()::text OR is_public = true
            ));
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_collaborations') THEN
        CREATE POLICY "Users can view project collaborations"
            ON project_collaborations FOR SELECT
            USING (user_id = auth.uid()::text OR project_id IN (
                SELECT id FROM projects WHERE owner_id = auth.uid()::text OR is_public = true
            ));
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'snippets') THEN
        CREATE POLICY "users_can_view_public_snippets"
            ON snippets FOR SELECT
            USING (is_public = true OR owner_id = auth.uid()::text);

        CREATE POLICY "users_can_create_snippets"
            ON snippets FOR INSERT
            WITH CHECK (owner_id = auth.uid()::text);

        CREATE POLICY "users_can_update_own_snippets"
            ON snippets FOR UPDATE
            USING (owner_id = auth.uid()::text);
    END IF;
END $$;

-- 5. Update functions to accept TEXT (or handle casting)
-- Most internal functions used p_user_id UUID, they might need adjustment if called with TEXT
-- However, auth.uid() returns UUID, so casting to UUID is needed if we still want to compare with auth.uid() 
-- but since we are now supporting non-UUID IDs, we should probably change function params too.

-- Let's update check_user_quota
CREATE OR REPLACE FUNCTION check_user_quota(p_user_id TEXT)
RETURNS TABLE(can_build BOOLEAN, remaining_builds INTEGER, reason TEXT) AS $$
DECLARE
  v_quota RECORD;
  v_has_active_sub BOOLEAN;
BEGIN
  -- Check if user has active subscription
  SELECT COUNT(*) > 0 INTO v_has_active_sub
  FROM user_subscriptions
  WHERE user_id = p_user_id
  AND status = 'active'
  AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT v_has_active_sub THEN
    RETURN QUERY SELECT FALSE, 0, 'No active subscription';
    RETURN;
  END IF;

  SELECT * INTO v_quota FROM user_quotas WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT TRUE, 10, 'Default quota available';
    RETURN;
  END IF;

  IF v_quota.reset_at < NOW() THEN
    UPDATE user_quotas
    SET monthly_builds_used = 0,
        reset_at = NOW() + INTERVAL '1 month',
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN QUERY SELECT TRUE, v_quota.monthly_builds_limit, 'Quota reset';
    RETURN;
  END IF;

  IF v_quota.monthly_builds_used >= v_quota.monthly_builds_limit THEN
    RETURN QUERY SELECT FALSE, 0, 'Monthly quota exceeded';
    RETURN;
  END IF;

  RETURN QUERY SELECT 
    TRUE,
    (v_quota.monthly_builds_limit - v_quota.monthly_builds_used),
    'Quota available';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update record_rate_limit_event
CREATE OR REPLACE FUNCTION record_rate_limit_event(p_user_id TEXT, p_endpoint VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  INSERT INTO rate_limit_events (user_id, endpoint, timestamp)
  VALUES (p_user_id, p_endpoint, NOW());

  SELECT rate_limit_requests_per_minute INTO v_limit
  FROM user_quotas WHERE user_id = p_user_id;

  v_limit := COALESCE(v_limit, 30);

  SELECT COUNT(*) INTO v_count
  FROM rate_limit_events
  WHERE user_id = p_user_id
  AND endpoint = p_endpoint
  AND timestamp > NOW() - INTERVAL '1 minute';

  RETURN v_count <= v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update check_duplicate_build
CREATE OR REPLACE FUNCTION check_duplicate_build(p_user_id TEXT, p_checksum VARCHAR)
RETURNS TABLE(is_duplicate BOOLEAN, previous_build_id UUID, previous_status VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE,
    be.id,
    be.status
  FROM build_checksums bc
  JOIN build_executions be ON bc.build_id = be.id
  WHERE bc.user_id = p_user_id
  AND bc.checksum = p_checksum
  AND be.created_at > NOW() - INTERVAL '1 hour'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recreate Views
CREATE VIEW recent_build_failures AS
SELECT 
  be.id,
  be.user_id,
  be.blueprint_id,
  be.status,
  be.created_at,
  COUNT(be_errors.id) as error_count,
  STRING_AGG(DISTINCT be_errors.error_type, ', ') as error_types,
  be.error_message
FROM build_executions be
LEFT JOIN build_errors be_errors ON be.id = be_errors.build_id
WHERE be.status = 'failed'
AND be.created_at > NOW() - INTERVAL '24 hours'
GROUP BY be.id, be.user_id, be.blueprint_id, be.status, be.created_at, be.error_message
ORDER BY be.created_at DESC;

CREATE VIEW user_quota_status AS
SELECT 
  uq.user_id,
  us.tier,
  us.status as subscription_status,
  uq.monthly_builds_limit,
  uq.monthly_builds_used,
  (uq.monthly_builds_limit - uq.monthly_builds_used) as builds_remaining,
  ROUND(100.0 * uq.monthly_builds_used / NULLIF(uq.monthly_builds_limit, 0), 2) as usage_percent,
  uq.reset_at,
  CASE 
    WHEN uq.reset_at < NOW() THEN 'RESET_NEEDED'
    WHEN uq.monthly_builds_used >= uq.monthly_builds_limit THEN 'LIMIT_REACHED'
    ELSE 'ACTIVE'
  END as quota_status
FROM user_quotas uq
LEFT JOIN user_subscriptions us ON uq.user_id = us.user_id;

CREATE VIEW build_system_health AS
SELECT 
  DATE_TRUNC('hour', be.created_at) as hour,
  COUNT(*) as total_builds,
  SUM(CASE WHEN be.status = 'completed' THEN 1 ELSE 0 END) as successful_builds,
  SUM(CASE WHEN be.status = 'failed' THEN 1 ELSE 0 END) as failed_builds,
  ROUND(100.0 * SUM(CASE WHEN be.status = 'completed' THEN 1 ELSE 0 END) / 
    NULLIF(COUNT(*), 0), 2) as success_rate,
  ROUND(AVG(be.execution_time_ms), 2) as avg_duration_ms,
  COUNT(DISTINCT be.user_id) as unique_users
FROM build_executions be
WHERE be.created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', be.created_at)
ORDER BY hour DESC;

-- Grant permissions back to the views
GRANT SELECT ON recent_build_failures TO authenticated;
GRANT SELECT ON user_quota_status TO authenticated;
GRANT SELECT ON build_system_health TO authenticated;
