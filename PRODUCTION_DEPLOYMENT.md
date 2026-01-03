# Production Deployment Guide: Build System Phase 2

## Overview
This document outlines the deployment strategy for error handling, edge cases, and production safety features.

## Pre-Deployment Checklist

### 1. Database Migration
- [ ] Run the migration: `20260103_build_system.sql`
  ```bash
  # Using Supabase CLI
  supabase db push
  
  # Or manually in Supabase dashboard: SQL Editor
  ```

- [ ] Verify all tables created:
  - `build_errors`
  - `user_quotas`
  - `rate_limit_events`
  - `build_checksums`
  - `build_metrics`
  - `deployment_logs`

- [ ] Verify all functions created:
  - `check_user_quota()`
  - `record_rate_limit_event()`
  - `check_duplicate_build()`
  - `cleanup_old_rate_limit_events()`
  - `calculate_build_metrics()`

- [ ] Verify all views created:
  - `recent_build_failures`
  - `user_quota_status`
  - `build_system_health`

### 2. Seed Initial Data
```sql
-- Create default quotas for existing users
INSERT INTO user_quotas (user_id, monthly_builds_limit, monthly_builds_used)
SELECT id, 10, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_quotas);
```

### 3. API Implementation
- [ ] Deploy `lib/build-error-handler.ts`
- [ ] Deploy `app/api/builds/execute/route.ts`
- [ ] Test all error scenarios locally first
- [ ] Update environment variables:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_url
  SUPABASE_SERVICE_ROLE_KEY=your_key
  ```

### 4. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# Build System
BUILD_TIMEOUT_MS=600000
MAX_BUILD_RETRIES=3
MAX_FILES_PER_BUILD=500
RATE_LIMIT_REQUESTS_PER_MINUTE=30

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info
```

### 5. Error Monitoring Setup

#### Configure Sentry
```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend: (event) => {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
    }
    return event;
  },
});
```

#### Configure Logging
```typescript
// lib/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

## Deployment Steps

### Step 1: Staging Deployment
```bash
# Deploy to staging environment
vercel deploy --prod --scope=your-team

# Run smoke tests
npm run test:e2e -- --env staging
```

### Step 2: Monitor Staging
- [ ] Check error rates (should be < 1%)
- [ ] Monitor API response times (should be < 2s)
- [ ] Monitor database queries (check slow query log)
- [ ] Test quota enforcement
- [ ] Test rate limiting
- [ ] Test error recovery

### Step 3: Production Deployment
```bash
# Deploy to production
vercel deploy --prod

# Verify deployment
curl https://your-domain/api/health
```

### Step 4: Post-Deployment Verification
- [ ] All database tables accessible
- [ ] All functions callable
- [ ] API endpoints responding
- [ ] Error logging working
- [ ] Quota checks functioning
- [ ] Rate limiting enforced

## Monitoring & Alerts

### Key Metrics to Monitor
1. **Error Rate**: `failed_builds / total_builds`
   - Alert threshold: > 5%
   - Check interval: 5 minutes

2. **Success Rate**: `completed_builds / total_builds`
   - Target: > 95%
   - Alert threshold: < 90%

3. **Average Build Duration**: `AVG(execution_time_ms)`
   - Baseline: 30-60s
   - Alert threshold: > 120s

4. **Rate Limit Violations**: `COUNT(rate_limit_events WHERE timestamp > NOW() - '1 hour')`
   - Alert threshold: > 100 per user per minute

5. **Quota Exceeded**: `COUNT(quota_exceeded_errors)`
   - Alert threshold: > 10% of requests

### Monitoring Queries

```sql
-- Recent failures in last 24 hours
SELECT * FROM recent_build_failures
ORDER BY created_at DESC
LIMIT 20;

-- User quota status
SELECT * FROM user_quota_status
WHERE quota_status != 'ACTIVE'
ORDER BY usage_percent DESC;

-- System health (last 7 days)
SELECT * FROM build_system_health
ORDER BY hour DESC;

-- Error distribution
SELECT error_type, COUNT(*) as count
FROM build_errors
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type
ORDER BY count DESC;
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Build System Monitoring",
    "panels": [
      {
        "title": "Success Rate",
        "targets": [
          {
            "query": "SELECT success_rate FROM build_system_health ORDER BY hour DESC LIMIT 24"
          }
        ]
      },
      {
        "title": "Error Types",
        "targets": [
          {
            "query": "SELECT error_type, COUNT(*) FROM build_errors GROUP BY error_type"
          }
        ]
      },
      {
        "title": "Average Build Duration",
        "targets": [
          {
            "query": "SELECT avg_duration_ms FROM build_system_health ORDER BY hour DESC LIMIT 24"
          }
        ]
      },
      {
        "title": "Quota Usage",
        "targets": [
          {
            "query": "SELECT usage_percent FROM user_quota_status"
          }
        ]
      }
    ]
  }
}
```

## Rollback Plan

### If Critical Issues Occur

1. **Immediate Action**
   - Disable build creation via feature flag
   - Notify users
   - Scale down build workers

2. **Diagnostic Steps**
   ```bash
   # Check recent errors
   SELECT * FROM recent_build_failures
   WHERE created_at > NOW() - INTERVAL '1 hour'
   LIMIT 50;

   # Check error patterns
   SELECT error_type, error_code, COUNT(*)
   FROM build_errors
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY error_type, error_code;
   ```

3. **Rollback Procedure**
   ```bash
   # Revert to previous version
   vercel rollback

   # Confirm rollback
   curl https://your-domain/api/health
   ```

4. **Post-Rollback**
   - Monitor error rates return to normal
   - Document incident
   - Plan root cause analysis

## Maintenance Tasks

### Daily
- [ ] Monitor error dashboard
- [ ] Check quota reset processes
- [ ] Verify rate limits working

### Weekly
- [ ] Analyze error patterns
- [ ] Review slow queries
- [ ] Update monitoring alerts if needed

### Monthly
- [ ] Clean up old rate limit events (automated)
- [ ] Archive old build logs
- [ ] Review quota configurations
- [ ] Performance optimization review

### Quarterly
- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Security audit

## Production Constraints

### Rate Limits
- **Free tier**: 30 requests/minute per user
- **Pro tier**: 100 requests/minute per user

### Quotas
- **Free tier**: 10 builds/month
- **Pro tier**: 100 builds/month

### Build Limits
- **Max files per build**: 500
- **Max build duration**: 10 minutes
- **Max concurrent builds**: 10 per user

### Data Retention
- **Build logs**: 90 days
- **Rate limit events**: 24 hours (auto-cleanup)
- **Error records**: 180 days

## Troubleshooting

### High Error Rate
1. Check error logs: `SELECT * FROM recent_build_failures`
2. Check database connectivity
3. Check GitHub API status
4. Review recent code changes

### Slow Builds
1. Profile slow queries
2. Check build_executions indexes
3. Review blueprint validation logic
4. Check external API latency

### Quota Issues
1. Verify quota reset logic
2. Check user_quotas table
3. Verify subscription status
4. Manual quota reset if needed

## Support

For issues or questions:
1. Check error logs and dashboards
2. Review Sentry error tracking
3. Check GitHub issues in main repo
4. Contact development team

---

**Last Updated**: January 3, 2025
**Deployment Status**: Ready for Production
