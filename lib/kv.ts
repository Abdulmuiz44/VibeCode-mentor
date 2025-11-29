import { kv } from '@vercel/kv';

// Check if KV is configured (for build-time safety)
const isKVConfigured = typeof process !== 'undefined' &&
  process.env.KV_REST_API_URL &&
  process.env.KV_REST_API_TOKEN;

/**
 * Rate Limiting for Free Tier Users
 * Returns: { allowed: boolean, current: number, limit: number }
 */
export async function checkRateLimit(userId: string | null, ip: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
}> {
  if (!isKVConfigured) {
    // In development without KV, allow all requests
    return { allowed: true, current: 0, limit: 10 };
  }

  const identifier = userId || ip;
  const date = new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
  const key = `rate:${identifier}:${yearMonth}`;

  try {
    const current = await kv.get<number>(key) || 0;
    const limit = 10; // Monthly limit

    if (current >= limit) {
      return { allowed: false, current, limit };
    }

    // Increment and set expiry to end of month
    const newCount = await kv.incr(key);

    // Calculate seconds until end of month
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const secondsUntilEndOfMonth = Math.floor((endOfMonth.getTime() - date.getTime()) / 1000);

    await kv.expire(key, secondsUntilEndOfMonth);

    return { allowed: true, current: newCount, limit };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open in case of errors
    return { allowed: true, current: 0, limit: 10 };
  }
}

/**
 * Chat rate limiting (free tier) - 3 per day.
 */
export async function checkChatRateLimit(userId: string | null, ip: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  if (!isKVConfigured) {
    // In development without KV, allow all requests
    return { allowed: true, current: 0, limit: 3 };
  }

  const identifier = userId || ip;
  const date = new Date().toISOString().split('T')[0];
  const key = `chat:${identifier}:${date}`;
  const limit = 3;

  try {
    const current = await kv.get<number>(key) || 0;
    if (current >= limit) {
      return { allowed: false, current, limit };
    }

    const newCount = await kv.incr(key);
    await kv.expireat(key, Math.floor(new Date().setHours(23, 59, 59, 999) / 1000));

    return { allowed: true, current: newCount, limit };
  } catch (error) {
    console.error('Chat rate limit check error:', error);
    return { allowed: true, current: 0, limit };
  }
}

/**
 * Get current usage count for a user/IP
 */
export async function getCurrentUsage(userId: string | null, ip: string): Promise<number> {
  if (!isKVConfigured) return 0;

  const identifier = userId || ip;
  const date = new Date().toISOString().split('T')[0];
  const key = `rate:${identifier}:${date}`;

  try {
    const count = await kv.get<number>(key);
    return count || 0;
  } catch (error) {
    console.error('Get usage error:', error);
    return 0;
  }
}

/**
 * Log generation analytics
 */
export async function logGeneration(
  userId: string | null,
  vibe: string,
  isPro: boolean
): Promise<void> {
  if (!isKVConfigured) return;

  try {
    // Total generations
    await kv.incr('stats:total');

    // Pro vs Free split
    if (isPro) {
      await kv.incr('stats:pro_count');
    } else {
      await kv.incr('stats:free_count');
    }

    // Top vibes (sorted set)
    const vibeKey = vibe.substring(0, 50).toLowerCase();
    await kv.zincrby('stats:vibes', 1, vibeKey);

    // Unique users (daily)
    const date = new Date().toISOString().split('T')[0];
    const identifier = userId || 'anon';
    await kv.sadd(`stats:users:${date}`, identifier);

    // Set expiry for daily users set (30 days)
    await kv.expire(`stats:users:${date}`, 30 * 24 * 60 * 60);
  } catch (error) {
    console.error('Log generation error:', error);
  }
}

/**
 * Get top vibes for prompt library
 */
export async function getTopVibes(limit: number = 10): Promise<Array<{ vibe: string; count: number }>> {
  if (!isKVConfigured) {
    return [];
  }

  try {
    const vibesData = await kv.zrange('stats:vibes', 0, limit - 1, { rev: true, withScores: true });

    // Parse vibes data (comes as [vibe1, score1, vibe2, score2, ...])
    const topVibes: Array<{ vibe: string; count: number }> = [];
    if (Array.isArray(vibesData)) {
      for (let i = 0; i < vibesData.length; i += 2) {
        topVibes.push({
          vibe: vibesData[i] as string,
          count: vibesData[i + 1] as number,
        });
      }
    }

    return topVibes;
  } catch (error) {
    console.error('Get top vibes error:', error);
    return [];
  }
}

/**
 * Get analytics data for admin dashboard
 */
export async function getAnalytics(): Promise<{
  totalGenerations: number;
  proCount: number;
  freeCount: number;
  topVibes: Array<{ vibe: string; count: number }>;
  dailyUsers: number;
}> {
  if (!isKVConfigured) {
    return {
      totalGenerations: 0,
      proCount: 0,
      freeCount: 0,
      topVibes: [],
      dailyUsers: 0,
    };
  }

  try {
    const [total, proCount, freeCount, vibesData, date] = await Promise.all([
      kv.get<number>('stats:total'),
      kv.get<number>('stats:pro_count'),
      kv.get<number>('stats:free_count'),
      kv.zrange('stats:vibes', 0, 9, { rev: true, withScores: true }),
      Promise.resolve(new Date().toISOString().split('T')[0]),
    ]);

    // Get daily active users count
    const dailyUsersCount = await kv.scard(`stats:users:${date}`) || 0;

    // Parse vibes data (comes as [vibe1, score1, vibe2, score2, ...])
    const topVibes: Array<{ vibe: string; count: number }> = [];
    if (Array.isArray(vibesData)) {
      for (let i = 0; i < vibesData.length; i += 2) {
        topVibes.push({
          vibe: vibesData[i] as string,
          count: vibesData[i + 1] as number,
        });
      }
    }

    return {
      totalGenerations: total || 0,
      proCount: proCount || 0,
      freeCount: freeCount || 0,
      topVibes,
      dailyUsers: dailyUsersCount,
    };
  } catch (error) {
    console.error('Get analytics error:', error);
    return {
      totalGenerations: 0,
      proCount: 0,
      freeCount: 0,
      topVibes: [],
      dailyUsers: 0,
    };
  }
}
