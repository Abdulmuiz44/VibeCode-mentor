# Rate Limiting & Usage Analytics

## Overview
VibeCode Mentor includes production-ready rate limiting and usage analytics powered by Vercel KV (Redis).

## Features

### 1. **Rate Limiting (Free Tier)**
- **10 generations per day** for free users
- Counter resets daily at midnight
- Rate limiting based on:
  - User ID (authenticated users)
  - IP address (anonymous users)
- Pro users bypass rate limits completely

### 2. **Usage Counter UI**
Visible in the header navigation:
- **Free users**: Shows remaining generations (e.g., "8/10 free left")
- **Pro users**: Shows "⚡ Unlimited" badge
- Real-time circular progress indicator
- Color-coded warnings (green → yellow → red)

### 3. **Usage Analytics Dashboard**
Access at `/admin` with password protection.

**Tracks:**
- Total generations (all-time)
- Pro vs Free tier split
- Top 10 most popular project vibes
- Daily active users

**Visualizations:**
- Pie chart: Pro vs Free distribution
- Bar chart: Top project vibes
- Stats cards: Key metrics
- Detailed table: All popular vibes ranked

### 4. **Data Logged Per Generation**
- Total generation count
- Pro/Free tier classification
- Project vibe/idea (first 50 chars)
- Unique daily users
- Auto-expiring keys (30 days for daily data)

## Setup

### 1. Install Dependencies
Already installed:
```bash
pnpm add @vercel/kv recharts
```

### 2. Configure Vercel KV

#### Option A: Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → **KV (Redis)**
5. Name your database (e.g., `vibecode-kv`)
6. Click **Create**
7. Go to **.env.local** tab
8. Copy all `KV_*` environment variables

#### Option B: Local Development with Upstash
1. Create free account at [Upstash](https://upstash.com/)
2. Create new Redis database
3. Copy REST API credentials
4. Add to `.env.local`:
   ```env
   KV_URL=https://your-db.upstash.io
   KV_REST_API_URL=https://your-db.upstash.io
   KV_REST_API_TOKEN=your_token_here
   KV_REST_API_READ_ONLY_TOKEN=your_readonly_token
   ```

### 3. Set Admin Password
Add to `.env.local`:
```env
ADMIN_PASSWORD=your_secure_password_here
```

### 4. Deploy to Vercel
```bash
git push origin main
```

Vercel will automatically:
- Detect KV database
- Link environment variables
- Deploy with rate limiting enabled

## API Routes

### `/api/usage` (GET)
Returns current usage for a user/IP:
```json
{
  "current": 3,
  "limit": 10,
  "remaining": 7
}
```

### `/api/mentor` (POST)
Enhanced with rate limiting:
```json
// Request
{
  "projectIdea": "Build a todo app",
  "userId": "user123" // optional
}

// Rate limit error (429)
{
  "error": "Rate limit exceeded",
  "message": "You've reached the limit of 10 free generations per day. Upgrade to Pro for unlimited access!",
  "current": 10,
  "limit": 10
}
```

### `/api/admin/auth` (POST)
Authenticate for admin dashboard:
```json
{
  "password": "your_admin_password"
}
```

### `/api/admin/analytics` (GET)
Returns full analytics data:
```json
{
  "totalGenerations": 1523,
  "proCount": 487,
  "freeCount": 1036,
  "topVibes": [
    { "vibe": "build a todo app", "count": 45 },
    { "vibe": "ai chat bot", "count": 38 }
  ],
  "dailyUsers": 23
}
```

## Development Without KV

The app gracefully handles missing KV configuration:
- Rate limiting disabled in development
- Analytics returns zero values
- No errors thrown
- Development workflow unaffected

## Testing

### Test Rate Limiting
1. Generate 10 blueprints as free user
2. 11th attempt should show rate limit error
3. Sign in with Google (Pro user)
4. Unlimited generations work

### Test Analytics
1. Navigate to `/admin`
2. Enter admin password
3. View real-time analytics
4. Generate blueprints and refresh to see updates

## Redis Key Structure

```
rate:{uid|ip}:{date}          → Count (int, expires daily)
stats:total                    → Total generations (int)
stats:pro_count                → Pro generations (int)
stats:free_count               → Free generations (int)
stats:vibes                    → Sorted set (vibe → count)
stats:users:{date}             → Set of unique users (expires 30d)
```

## Security

### Rate Limiting
- Cannot be bypassed by clearing localStorage
- Server-side enforcement with Redis
- IP-based fallback for anonymous users
- Pro status verified server-side with Supabase

### Admin Dashboard
- Password protected
- Session-based authentication
- No hardcoded credentials
- Environment variable configuration

### Analytics Privacy
- Project vibes truncated to 50 chars
- No full blueprint content stored
- Anonymous users tracked as "anon"
- Daily user sets auto-expire

## Performance

- **Redis operations**: < 10ms response time
- **Rate limit check**: Single Redis GET
- **Analytics fetch**: 5 parallel Redis commands
- **No impact on generation speed**: Async logging

## Cost Estimates

### Vercel KV Pricing
- **Hobby Plan**: 256MB storage, 10K commands/day (FREE)
- **Pro Plan**: 1GB storage, 1M commands/month ($10/mo)

### Expected Usage
- **1K generations/day**: ~5K Redis commands
- **Storage**: < 100MB for 1 year of data
- **Conclusion**: Hobby plan sufficient for most use cases

## Troubleshooting

### "Failed to fetch usage"
- Check KV environment variables in Vercel
- Verify KV database is linked to project
- Check Vercel deployment logs

### Admin dashboard shows zeros
- Generate at least one blueprint first
- Check KV connection in deployment logs
- Verify ADMIN_PASSWORD is set

### Rate limit not working
- Check if user is marked as Pro (bypasses limits)
- Clear Redis test data: `redis-cli DEL rate:*`
- Verify system clock is correct (daily resets)

## Future Enhancements

- [ ] Weekly/monthly usage trends
- [ ] User-specific analytics
- [ ] Export analytics to CSV
- [ ] Webhook notifications for milestones
- [ ] A/B testing for conversion rates
- [ ] Geographic user distribution
- [ ] Average blueprint quality scores
