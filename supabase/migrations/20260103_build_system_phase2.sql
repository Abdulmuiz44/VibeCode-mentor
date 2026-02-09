-- ============================================================================
-- PHASE 2: Error Handling, Edge Cases, and Production Deployment
-- This migration adds error tracking, quotas, rate limiting, and monitoring
-- ============================================================================

-- Error tracking table
CREATE TABLE IF NOT EXISTS build_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES build_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES build_steps(id) ON DELETE SET NULL,
  error_type VARCHAR(100) NOT NULL,
  error_code VARCHAR(50),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  is_retryable BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_build_errors_build_id ON build_errors(build_id);
CREATE INDEX IF NOT EXISTS idx_build_errors_error_type ON build_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_build_errors_created_at ON build_errors(created_at);

-- Rate limiting and quota tracking
CREATE TABLE IF NOT EXISTS user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_builds_limit INTEGER DEFAULT 10,
  monthly_builds_used INTEGER DEFAULT 0,
  files_per_build_limit INTEGER DEFAULT 500,
  max_build_duration_seconds INTEGER DEFAULT 600,
  rate_limit_requests_per_minute INTEGER DEFAULT 30,
  reset_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quotas_reset_at ON user_quotas(reset_at);

-- Rate limit tracking (sliding window)
CREATE TABLE IF NOT EXISTS rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_user_id ON rate_limit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_timestamp ON rate_limit_events(timestamp);

-- Build validation checksums (prevent duplicates)
CREATE TABLE IF NOT EXISTS build_checksums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blueprint_id UUID NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  build_id UUID REFERENCES build_executions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_build_checksums_user_id ON build_checksums(user_id);
CREATE INDEX IF NOT EXISTS idx_build_checksums_checksum ON build_checksums(checksum);
CREATE UNIQUE INDEX IF NOT EXISTS idx_build_checksums_unique ON build_checksums(user_id, blueprint_id, checksum);

-- Health checks and monitoring
CREATE TABLE IF NOT EXISTS build_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_value NUMERIC(10,2) NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'hourly',
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_build_metrics_type ON build_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_build_metrics_period_start ON build_metrics(period_start);

-- Deployment logs (detailed tracking)
CREATE TABLE IF NOT EXISTS deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES build_executions(id) ON DELETE CASCADE,
  environment VARCHAR(50) NOT NULL,
  deployment_status VARCHAR(50) NOT NULL,
  commit_sha VARCHAR(40),
  branch_name VARCHAR(255),
  deployment_url VARCHAR(500),
  rolled_back BOOLEAN DEFAULT FALSE,
  rolled_back_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployment_logs_build_id ON deployment_logs(build_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_environment ON deployment_logs(environment);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_status ON deployment_logs(deployment_status);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Fix column type issue by dropping dependent objects, altering column, then recreating
DO $$
BEGIN
  BEGIN
    DROP POLICY "Users can view own build errors" ON build_errors;
  EXCEPTION WHEN undefined_object THEN
    -- Policy doesn't exist, continue
  END;
END $$;

-- Drop view that depends on build_id column
DROP VIEW IF EXISTS recent_build_failures;

-- Drop foreign key constraint before altering column type
ALTER TABLE build_errors DROP CONSTRAINT IF EXISTS build_errors_build_id_fkey;

-- Ensure build_id is UUID type (fix potential type mismatch)
ALTER TABLE build_errors ALTER COLUMN build_id TYPE UUID USING build_id::UUID;

-- Recreate foreign key constraint
ALTER TABLE build_errors ADD CONSTRAINT build_errors_build_id_fkey 
  FOREIGN KEY (build_id) REFERENCES build_executions(id) ON DELETE CASCADE;

ALTER TABLE build_errors ENABLE ROW LEVEL SECURITY;
-- Skip all policy creation for now - will be handled in separate migration after column type fix
-- CREATE POLICY "Users can view own build errors"
--   ON build_errors
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM build_executions
--       WHERE build_executions.id = build_errors.build_id::uuid
--       AND build_executions.user_id = auth.uid()
--     )
--   );

ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
-- Skip policy creation for now - will be handled in separate migration
-- CREATE POLICY "Users can view own quotas"
--   ON user_quotas
--   FOR SELECT
--   USING (user_id = auth.uid());

-- CREATE POLICY "Users can update own quotas"
--   ON user_quotas
--   FOR UPDATE
--   USING (user_id = auth.uid())
--   WITH CHECK (user_id = auth.uid());

ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;
-- Skip policy creation for now - will be handled in separate migration
-- CREATE POLICY "Users can view own rate limit events"
--   ON rate_limit_events
--   FOR SELECT
--   USING (user_id = auth.uid());

ALTER TABLE build_checksums ENABLE ROW LEVEL SECURITY;
-- Skip policy creation for now - will be handled in separate migration
-- CREATE POLICY "Users can view own checksums"
--   ON build_checksums
--   FOR SELECT
--   USING (user_id = auth.uid());

ALTER TABLE build_metrics ENABLE ROW LEVEL SECURITY;
-- Skip policy creation for now - will be handled in separate migration
-- CREATE POLICY "Everyone can view build metrics"
--   ON build_metrics
--   FOR SELECT
--   USING (TRUE);

ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
-- Skip policy creation for now - will be handled in separate migration
-- CREATE POLICY "Users can view own deployment logs"
--   ON deployment_logs
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM build_executions
--       WHERE build_executions.id = deployment_logs.build_id
--       AND build_executions.user_id = auth.uid()
--     )
--   );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_build_error_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE build_executions
  SET updated_at = NOW()
  WHERE id = NEW.build_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_build_errors_update ON build_errors;
CREATE TRIGGER trigger_build_errors_update
AFTER INSERT ON build_errors
FOR EACH ROW
EXECUTE FUNCTION increment_build_error_count();

CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID)
RETURNS TABLE(can_build BOOLEAN, remaining_builds INTEGER, reason TEXT) AS $$
DECLARE
  v_quota RECORD;
  v_has_active_sub BOOLEAN;
BEGIN
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

CREATE OR REPLACE FUNCTION record_rate_limit_event(p_user_id UUID, p_endpoint VARCHAR)
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

CREATE OR REPLACE FUNCTION check_duplicate_build(p_user_id UUID, p_checksum VARCHAR)
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

CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_events()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limit_events
  WHERE timestamp < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_build_metrics()
RETURNS TABLE(metric_type TEXT, metric_value NUMERIC, period_start TIMESTAMP, period_end TIMESTAMP) AS $$
DECLARE
  v_period_start TIMESTAMP;
  v_period_end TIMESTAMP;
BEGIN
  v_period_start := DATE_TRUNC('hour', NOW());
  v_period_end := v_period_start + INTERVAL '1 hour';

  RETURN QUERY
  SELECT 
    'success_rate'::TEXT,
    (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / 
     NULLIF(COUNT(*), 0))::NUMERIC,
    v_period_start,
    v_period_end
  FROM build_executions
  WHERE created_at >= v_period_start
  AND created_at < v_period_end;

  RETURN QUERY
  SELECT 
    'avg_duration_ms'::TEXT,
    AVG(execution_time_ms)::NUMERIC,
    v_period_start,
    v_period_end
  FROM build_executions
  WHERE created_at >= v_period_start
  AND created_at < v_period_end
  AND execution_time_ms IS NOT NULL;

  RETURN QUERY
  SELECT 
    'error_rate'::TEXT,
    (SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) * 100.0 / 
     NULLIF(COUNT(*), 0))::NUMERIC,
    v_period_start,
    v_period_end
  FROM build_executions
  WHERE created_at >= v_period_start
  AND created_at < v_period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONSTRAINTS AND TRIGGERS
-- ============================================================================

ALTER TABLE build_executions
DROP CONSTRAINT IF EXISTS check_execution_time;
ALTER TABLE build_executions
ADD CONSTRAINT check_execution_time CHECK (
  execution_time_ms IS NULL OR (execution_time_ms >= 0 AND execution_time_ms <= 3600000)
);

ALTER TABLE user_quotas
DROP CONSTRAINT IF EXISTS check_positive_limits;
ALTER TABLE user_quotas
ADD CONSTRAINT check_positive_limits CHECK (
  monthly_builds_limit > 0
  AND files_per_build_limit > 0
  AND max_build_duration_seconds > 0
  AND rate_limit_requests_per_minute > 0
);

ALTER TABLE build_errors
DROP CONSTRAINT IF EXISTS check_retry_count;
ALTER TABLE build_errors
ADD CONSTRAINT check_retry_count CHECK (
  retry_count >= 0 AND retry_count <= max_retries
);

CREATE OR REPLACE FUNCTION update_build_executions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_build_executions_timestamp ON build_executions;
CREATE TRIGGER trigger_build_executions_timestamp
BEFORE UPDATE ON build_executions
FOR EACH ROW
EXECUTE FUNCTION update_build_executions_timestamp();

CREATE OR REPLACE FUNCTION update_user_quotas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_quotas_timestamp ON user_quotas;
CREATE TRIGGER trigger_user_quotas_timestamp
BEFORE UPDATE ON user_quotas
FOR EACH ROW
EXECUTE FUNCTION update_user_quotas_timestamp();

CREATE OR REPLACE FUNCTION update_deployment_logs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deployment_logs_timestamp ON deployment_logs;
CREATE TRIGGER trigger_deployment_logs_timestamp
BEFORE UPDATE ON deployment_logs
FOR EACH ROW
EXECUTE FUNCTION update_deployment_logs_timestamp();

-- ============================================================================
-- VIEWS FOR MONITORING
-- ============================================================================

DROP VIEW IF EXISTS recent_build_failures;
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

DROP VIEW IF EXISTS user_quota_status;
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

DROP VIEW IF EXISTS build_system_health;
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

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON build_executions TO authenticated;
GRANT SELECT, INSERT ON build_steps TO authenticated;
GRANT SELECT, INSERT ON build_errors TO authenticated;
GRANT SELECT ON user_quotas TO authenticated;
GRANT INSERT ON rate_limit_events TO authenticated;
GRANT SELECT, INSERT ON build_checksums TO authenticated;
GRANT SELECT ON build_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON deployment_logs TO authenticated;

GRANT SELECT ON recent_build_failures TO authenticated;
GRANT SELECT ON user_quota_status TO authenticated;
GRANT SELECT ON build_system_health TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
