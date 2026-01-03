# Build System Quick Reference

## Error Codes

| Code | Type | Message | Retryable | When |
|------|------|---------|-----------|------|
| VAL_001 | Validation | Blueprint validation failed | ❌ | Invalid blueprint structure |
| VAL_002 | Validation | Duplicate build detected | ❌ | Exact same blueprint within 1 hour |
| VAL_003 | Validation | File limit exceeded | ❌ | > 500 files in blueprint |
| VAL_004 | Validation | Validation failed | ❌ | Multiple validation errors |
| GH_001 | GitHub API | GitHub API request failed | ✅ | Network/API error |
| GH_002 | GitHub API | GitHub rate limit exceeded | ✅ | GitHub rate limit hit |
| GH_003 | GitHub API | GitHub authentication failed | ❌ | Invalid token |
| GEN_001 | Generation | Code generation timeout | ✅ | Build exceeded 10 min |
| GEN_002 | Generation | Code generation failed | ✅ | Generation error |
| GEN_003 | Generation | Failed to create build record | ✅ | Database error |
| DEP_001 | Deployment | Deployment failed | ✅ | GitHub push failed |
| DEP_002 | Deployment | Deployment timeout | ✅ | Deployment exceeded timeout |
| QTA_001 | Quota | Monthly quota exceeded | ❌ | User hit monthly limit |
| QTA_002 | Quota | Rate limit exceeded | ❌ | > 30 req/min (free) or > 100 req/min (pro) |
| QTA_003 | Quota | No active subscription | ❌ | No valid subscription |

## API Endpoints

### Execute Build
```
POST /api/builds/execute

Request:
{
  "blueprint_id": "uuid",
  "blueprint_version": 1,
  "force": false
}

Response (202 Accepted):
{
  "success": true,
  "build_id": "uuid",
  "remaining_quota": 9
}

Response (Error):
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "...",
    "retryable": true/false
  }
}

Status Codes:
- 200: Success (not used - async returns 202)
- 202: Accepted (build queued)
- 400: Bad request / validation error
- 401: Unauthorized
- 409: Conflict (duplicate)
- 429: Too many requests
- 500: Server error
```

## Database Queries

### Check User Quota Status
```sql
SELECT * FROM user_quota_status WHERE user_id = $1;
-- Returns: remaining builds, usage %, reset time, quota status
```

### Get Recent Build Failures
```sql
SELECT * FROM recent_build_failures
ORDER BY created_at DESC LIMIT 20;
```

### System Health (Last 24h)
```sql
SELECT * FROM build_system_health
WHERE hour > NOW() - INTERVAL '24 hours'
ORDER BY hour DESC;
```

### Error Distribution
```sql
SELECT error_type, COUNT(*) as count, 
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percent
FROM build_errors
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type
ORDER BY count DESC;
```

### User Build History
```sql
SELECT id, status, created_at, execution_time_ms
FROM build_executions
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 50;
```

### Build Error Details
```sql
SELECT * FROM build_errors
WHERE build_id = $1
ORDER BY created_at DESC;
```

## Rate Limits

| Tier | Requests/Minute | Monthly Builds | Files/Build | Max Duration |
|------|-----------------|----------------|-------------|--------------|
| Free | 30 | 10 | 500 | 10 min |
| Pro | 100 | 100 | 500 | 10 min |

## Blueprint Validation Rules

### Required Fields
- `name` (string): Blueprint name
- `structure` (object): File/folder structure

### Constraints
- Max 500 files per blueprint
- No circular dependencies allowed
- No missing required fields
- Valid JSON structure

### Valid Structure Example
```json
{
  "name": "My App",
  "structure": {
    "type": "folder",
    "name": "root",
    "children": [
      {
        "type": "folder",
        "name": "src",
        "children": [
          { "type": "file", "name": "index.ts" }
        ]
      }
    ]
  }
}
```

## Handling Errors

### Retryable Errors (5xx, timeouts)
```typescript
const result = await handler.retryBuildError(errorId);
if (result.canRetry) {
  // Attempt retry
} else {
  // Max retries exceeded or non-retryable
  console.log(result.reason);
}
```

### Record Error
```typescript
await handler.recordError(
  buildId,
  new Error("Details"),
  ErrorDefinitions.GITHUB_API_ERROR,
  { additional: "context" }
);
```

### Get Error Details
```typescript
const { errors, summary } = await handler.getErrorDetails(buildId);
// errors: BuildError[]
// summary: { error_type: count, ... }
```

## Common Issues & Solutions

### "No active subscription"
- Check: `SELECT * FROM user_subscriptions WHERE user_id = $1`
- Solution: User needs active subscription

### "Monthly quota exceeded"
- Check: `SELECT * FROM user_quota_status WHERE user_id = $1`
- Solution: Wait for monthly reset or upgrade tier

### "Rate limit exceeded"
- Check: `SELECT COUNT(*) FROM rate_limit_events WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '1 minute'`
- Solution: Wait a minute before retrying

### "Duplicate build detected"
- Check: Same blueprint within last hour
- Solution: Wait an hour or use `force: true` flag

### "File limit exceeded"
- Check: More than 500 files in blueprint
- Solution: Split into multiple blueprints

## Monitoring Commands

### Quick Health Check
```bash
# Check last hour metrics
curl -X GET "$SUPABASE_URL/rest/v1/build_system_health?select=*&order=hour.desc&limit=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Recent Errors
```bash
# Get last 10 errors
curl -X GET "$SUPABASE_URL/rest/v1/recent_build_failures?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### User Quota
```bash
# Check user quota
curl -X GET "$SUPABASE_URL/rest/v1/user_quota_status?user_id=eq.$USER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## Testing

### Run Validation Tests
```bash
npm run test -- build-validation.test.ts
```

### Manual API Test
```bash
curl -X POST http://localhost:3000/api/builds/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"blueprint_id":"test-id"}'
```

### Load Test
```bash
# Using Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/builds/execute
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Optional (defaults provided)
BUILD_TIMEOUT_MS=600000
MAX_BUILD_RETRIES=3
MAX_FILES_PER_BUILD=500
RATE_LIMIT_REQUESTS_PER_MINUTE=30

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info
```

## File Locations

| File | Purpose |
|------|---------|
| `supabase/migrations/20260103_build_system.sql` | Database schema |
| `lib/build-error-handler.ts` | Error handling logic |
| `app/api/builds/execute/route.ts` | API endpoint |
| `lib/build-validation.test.ts` | Test suite |
| `PRODUCTION_DEPLOYMENT.md` | Deployment guide |
| `PHASE_2_IMPLEMENTATION_SUMMARY.md` | Full documentation |

## Support Contacts

- **Database Issues**: Check Supabase dashboard
- **API Issues**: Check application logs
- **Errors**: Check Sentry dashboard
- **Performance**: Check Grafana dashboard

---

**Last Updated**: January 3, 2025
**Version**: 2.0 (Production Ready)
