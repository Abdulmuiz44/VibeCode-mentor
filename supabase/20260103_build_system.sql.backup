-- Build execution system tables

-- User subscription tiers
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free' | 'pro'
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active' | 'cancelled' | 'expired'
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  payment_method VARCHAR(100),
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier ON user_subscriptions(tier);

-- Build execution tracking
CREATE TABLE build_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL,
  blueprint_version INTEGER NOT NULL DEFAULT 1,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  github_url VARCHAR(255),
  github_repo_id INTEGER,
  total_files_generated INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  error_message TEXT,
  logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_build_executions_user_id ON build_executions(user_id);
CREATE INDEX idx_build_executions_status ON build_executions(status);
CREATE INDEX idx_build_executions_blueprint_id ON build_executions(blueprint_id);

-- Build execution steps
CREATE TABLE build_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES build_executions(id) ON DELETE CASCADE,
  step_name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  output JSONB DEFAULT '[]'::jsonb,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_build_steps_build_id ON build_steps(build_id);
CREATE INDEX idx_build_steps_status ON build_steps(status);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

ALTER TABLE build_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own builds"
  ON build_executions
  FOR SELECT
  USING (user_id = auth.uid());

ALTER TABLE build_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own build steps"
  ON build_steps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM build_executions
      WHERE build_executions.id = build_steps.build_id
      AND build_executions.user_id = auth.uid()
    )
  );

-- Update blueprints table to add versioning
ALTER TABLE blueprints ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE blueprints ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE blueprints ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;
ALTER TABLE blueprints ADD COLUMN IF NOT EXISTS locked_for_build_id UUID;

-- GitHub tokens for user builds
CREATE TABLE IF NOT EXISTS github_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50) NOT NULL DEFAULT 'bearer',
  expires_at TIMESTAMP,
  github_username VARCHAR(255) NOT NULL,
  github_user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_github_tokens_user_id ON github_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_github_tokens_username ON github_tokens(github_username);

-- RLS for github_tokens
ALTER TABLE github_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own GitHub token"
  ON github_tokens
  FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- PHASE 2: Error Handling, Edge Cases, and Production Deployment
-- ============================================================================

-- Error tracking table
CREATE TABLE build_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES build_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES build_steps(id) ON DELETE SET NULL,
  error_type VARCHAR(100) NOT NULL, -- 'validation', 'github_api', 'generation', 'deployment', 'timeout', 'quota'
  error_code VARCHAR(50),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB, -- Additional context data
  is_retryable BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_build_errors_build_id ON build_errors(build_id);
CREATE INDEX idx_build_errors_error_type ON build_errors(error_type);
CREATE INDEX idx_build_errors_created_at ON build_errors(created_at);

-- Rate limiting and quota tracking
CREATE TABLE user_quotas (
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

CREATE INDEX idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX idx_user_quotas_reset_at ON user_quotas(reset_at);

-- Rate limit tracking (sliding window)
CREATE TABLE rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_events_user_id ON rate_limit_events(user_id);
CREATE INDEX idx_rate_limit_events_timestamp ON rate_limit_events(timestamp);

-- Build validation checksums (prevent duplicates)
CREATE TABLE build_checksums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blueprint_id UUID NOT NULL,
  checksum VARCHAR(64) NOT NULL, -- SHA256 of blueprint content
  build_id UUID REFERENCES build_executions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_build_checksums_user_id ON build_checksums(user_id);
CREATE INDEX idx_build_checksums_checksum ON build_checksums(checksum);
CREATE UNIQUE INDEX idx_build_checksums_unique ON build_checksums(user_id, blueprint_id, checksum);

-- Health checks and monitoring
CREATE TABLE build_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL, -- 'success_rate', 'avg_duration', 'error_rate', 'queue_length'
  metric_value NUMERIC(10,2) NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'hourly', -- 'hourly', 'daily', 'weekly'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_build_metrics_type ON build_metrics(metric_type);
CREATE INDEX idx_build_metrics_period_start ON build_metrics(period_start);

-- Deployment logs (detailed tracking)
CREATE TABLE deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES build_executions(id) ON DELETE CASCADE,
  environment VARCHAR(50) NOT NULL, -- 'development', 'staging', 'production'
  deployment_status VARCHAR(50) NOT NULL, -- 'pending', 'in_progress', 'succeeded', 'failed'
  commit_sha VARCHAR(40),
  branch_name VARCHAR(255),
  deployment_url VARCHAR(500),
  rolled_back BOOLEAN DEFAULT FALSE,
  rolled_back_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deployment_logs_build_id ON deployment_logs(build_id);
CREATE INDEX idx_deployment_logs_environment ON deployment_logs(environment);
CREATE INDEX idx_deployment_logs_status ON deployment_logs(deployment_status);

-- RLS Policies for new tables
ALTER TABLE build_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own build errors"
  ON build_errors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM build_executions
      WHERE build_executions.id = build_errors.build_id
      AND build_executions.user_id = auth.uid()
    )
  );

ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quotas"
  ON user_quotas
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own quotas"
  ON user_quotas
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rate limit events"
  ON rate_limit_events
  FOR SELECT
  USING (user_id = auth.uid());

ALTER TABLE build_checksums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own checksums"
  ON build_checksums
  FOR SELECT
  USING (user_id = auth.uid());

ALTER TABLE build_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view build metrics"
  ON build_metrics
  FOR SELECT
  USING (TRUE);

ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own deployment logs"
  ON deployment_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM build_executions
      WHERE build_executions.id = deployment_logs.build_id
      AND build_executions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR ERROR HANDLING AND VALIDATION
-- ============================================================================

-- Function to increment build error count
CREATE OR REPLACE FUNCTION increment_build_error_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE build_executions
  SET updated_at = NOW()
  WHERE id = NEW.build_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_build_errors_update
AFTER INSERT ON build_errors
FOR EACH ROW
EXECUTE FUNCTION increment_build_error_count();

-- Function to check user quota before build
CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID)
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

-- Function to record rate limit event
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

-- Function to check for duplicate builds
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

-- Function to auto-cleanup old rate limit events
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

-- Function to calculate build metrics
CREATE OR REPLACE FUNCTION calculate_build_metrics()
RETURNS TABLE(metric_type TEXT, metric_value NUMERIC, period_start TIMESTAMP, period_end TIMESTAMP) AS $$
DECLARE
  v_period_start TIMESTAMP;
  v_period_end TIMESTAMP;
BEGIN
  v_period_start := DATE_TRUNC('hour', NOW());
  v_period_end := v_period_start + INTERVAL '1 hour';

  -- Success rate
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

  -- Average duration
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

  -- Error rate
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
-- PRODUCTION CONSTRAINTS AND TRIGGERS
-- ============================================================================

-- Constraint to ensure build execution times are reasonable
ALTER TABLE build_executions
ADD CONSTRAINT check_execution_time CHECK (
  execution_time_ms IS NULL OR (execution_time_ms >= 0 AND execution_time_ms <= 3600000)
);

-- Constraint for quota limits
ALTER TABLE user_quotas
ADD CONSTRAINT check_positive_limits CHECK (
  monthly_builds_limit > 0
  AND files_per_build_limit > 0
  AND max_build_duration_seconds > 0
  AND rate_limit_requests_per_minute > 0
);

-- Constraint for error tracking
ALTER TABLE build_errors
ADD CONSTRAINT check_retry_count CHECK (
  retry_count >= 0 AND retry_count <= max_retries
);

-- Auto-update timestamp on build_executions
CREATE OR REPLACE FUNCTION update_build_executions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_build_executions_timestamp
BEFORE UPDATE ON build_executions
FOR EACH ROW
EXECUTE FUNCTION update_build_executions_timestamp();

-- Auto-update timestamp on user_quotas
CREATE OR REPLACE FUNCTION update_user_quotas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_quotas_timestamp
BEFORE UPDATE ON user_quotas
FOR EACH ROW
EXECUTE FUNCTION update_user_quotas_timestamp();

-- Auto-update timestamp on deployment_logs
CREATE OR REPLACE FUNCTION update_deployment_logs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deployment_logs_timestamp
BEFORE UPDATE ON deployment_logs
FOR EACH ROW
EXECUTE FUNCTION update_deployment_logs_timestamp();

-- ============================================================================
-- PRODUCTION VIEWS FOR MONITORING AND DEBUGGING
-- ============================================================================

-- View for recent build failures with error details
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

-- View for user quota status
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

-- View for build system health
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
-- GRANTS FOR PRODUCTION
-- ============================================================================

-- Grant basic permissions to authenticated users
GRANT SELECT ON user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON build_executions TO authenticated;
GRANT SELECT, INSERT ON build_steps TO authenticated;
GRANT SELECT, INSERT ON build_errors TO authenticated;
GRANT SELECT ON user_quotas TO authenticated;
GRANT INSERT ON rate_limit_events TO authenticated;
GRANT SELECT, INSERT ON build_checksums TO authenticated;
GRANT SELECT ON build_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON deployment_logs TO authenticated;

-- Grant view permissions
GRANT SELECT ON recent_build_failures TO authenticated;
GRANT SELECT ON user_quota_status TO authenticated;
GRANT SELECT ON build_system_health TO authenticated;

-- Grant admin-level access (for service roles)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
