import { env, isProduction } from '@/lib/config/env';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for development/demo and fallback
const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  AUTH_LOGIN: { limit: 5, windowSeconds: 60 }, // 5 attempts per minute
  EVENT_SUBMISSION: { limit: 10, windowSeconds: 3600 }, // 10 per hour
  COMMUNITY_REPORT: { limit: 5, windowSeconds: 3600 }, // 5 per hour
  ORG_REGISTRATION: { limit: 3, windowSeconds: 3600 }, // 3 per hour
  FILE_UPLOAD: { limit: 20, windowSeconds: 3600 }, // 20 per hour
  ADMIN_ACTION: { limit: 60, windowSeconds: 60 }, // 60 per minute
};

export async function checkRateLimit(
  identifier: string,
  actionType: keyof typeof RATE_LIMITS | RateLimitConfig
): Promise<{ success: boolean; allowed: boolean; limit: number; remaining: number; reset: number }> {
  const config =
    typeof actionType === 'string' ? RATE_LIMITS[actionType] : actionType;
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // If Upstash Redis is configured in production
  if (isProduction && env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, config.windowSeconds);
      }

      const ttl = await redis.ttl(key);
      const remaining = Math.max(0, config.limit - current);

      const isOk = current <= config.limit;
      return {
        success: isOk,
        allowed: isOk,
        limit: config.limit,
        remaining,
        reset: now + (ttl > 0 ? ttl * 1000 : config.windowSeconds * 1000),
      };
    } catch (err) {
      console.warn('Redis rate limiter encountered error, falling back to memory guard:', err);
    }
  }

  // Memory sliding window fallback
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + config.windowSeconds * 1000,
    });
    return {
      success: true,
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + config.windowSeconds * 1000,
    };
  }

  record.count += 1;
  memoryStore.set(key, record);

  const remaining = Math.max(0, config.limit - record.count);
  const isAllowed = record.count <= config.limit;

  return {
    success: isAllowed,
    allowed: isAllowed,
    limit: config.limit,
    remaining,
    reset: record.resetTime,
  };
}
