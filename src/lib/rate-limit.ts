import { Ratelimit } from '@upstash/ratelimit';
import { redis, isRedisRemote } from './redis';

// In-Memory sliding window rate limiter fallback
class MemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();

  async limit(identifier: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    const validTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Math.ceil((validTimestamps[0] + windowMs - now) / 1000),
      };
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - validTimestamps.length,
      reset: Math.ceil(windowMs / 1000),
    };
  }
}

const memoryLimiter = new MemoryRateLimiter();

// Remote Upstash Ratelimit instances
const upstashPublicLimiter = isRedisRemote
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:public',
    })
  : null;

const upstashOrdersLimiter = isRedisRemote
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(25, '1 m'),
      analytics: true,
      prefix: 'ratelimit:orders',
    })
  : null;

const upstashDisplayLimiter = isRedisRemote
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, '1 m'),
      analytics: true,
      prefix: 'ratelimit:display',
    })
  : null;

export type RateLimitType = 'public' | 'orders' | 'display' | 'dashboard';

export async function checkRateLimit(
  req: Request,
  type: RateLimitType = 'public'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Extract client IP or fallback identifier
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const identifier = `${type}:${ip}`;

  if (isRedisRemote) {
    try {
      const limiter =
        type === 'orders'
          ? upstashOrdersLimiter
          : type === 'display'
          ? upstashDisplayLimiter
          : upstashPublicLimiter;

      if (limiter) {
        const result = await limiter.limit(identifier);
        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        };
      }
    } catch (e) {
      // Fallback to memory on remote network error
    }
  }

  // Local In-Memory Fallback
  const maxReq = type === 'orders' ? 25 : type === 'display' ? 200 : 100;
  return memoryLimiter.limit(identifier, maxReq, 60000);
}