import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

/**
 * Enhanced rate limiting with multiple strategies
 */

// Rate limit strategies
export enum RateLimitStrategy {
  SLIDING_WINDOW = 'sliding_window',
  FIXED_WINDOW = 'fixed_window',
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket',
}

// Rate limit tier definitions
export interface RateLimitTier {
  name: string;
  windowMs: number;
  maxRequests: number;
  strategy: RateLimitStrategy;
  blockDuration?: number; // How long to block after exceeding limit
  costPerRequest?: number; // For token bucket
  refillRate?: number; // For token bucket
  penalty?: number; // Multiplier for repeat offenders
}

// Predefined rate limit tiers
export const rateLimitTiers: Record<string, RateLimitTier> = {
  // Public endpoints
  public: {
    name: 'public',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
  },

  // Authenticated user endpoints
  authenticated: {
    name: 'authenticated',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
  },

  // AI/Expensive operations
  ai: {
    name: 'ai',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    costPerRequest: 1,
    refillRate: 0.1, // 1 token per 10 seconds
    blockDuration: 5 * 60 * 1000, // 5 minute block
  },

  // Authentication endpoints
  auth: {
    name: 'auth',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    blockDuration: 15 * 60 * 1000, // 15 minute block
    penalty: 2, // Double the block time for repeat offenders
  },

  // Write operations (posts, comments)
  write: {
    name: 'write',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    blockDuration: 60 * 1000, // 1 minute block
  },

  // Admin operations
  admin: {
    name: 'admin',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
  },

  // Search endpoints
  search: {
    name: 'search',
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
  },

  // File upload
  upload: {
    name: 'upload',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    blockDuration: 60 * 60 * 1000, // 1 hour block
  },
};

// Storage interfaces
interface RateLimitRecord {
  count: number;
  firstRequest: number;
  lastRequest: number;
  windowStart: number;
  tokens?: number; // For token bucket
  blocked?: boolean;
  blockExpires?: number;
  violations?: number; // Track repeat violations
  requests?: number[]; // Timestamps for sliding window
}

// In-memory storage (use Redis in production)
const storage = new Map<string, RateLimitRecord>();
const blacklist = new Map<string, number>(); // IP -> block expiry

// Clean up storage periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean expired records
  for (const [key, record] of storage.entries()) {
    if (record.windowStart + 24 * 60 * 60 * 1000 < now) { // 24 hours old
      storage.delete(key);
    }
  }
  
  // Clean expired blacklist entries
  for (const [ip, expiry] of blacklist.entries()) {
    if (expiry < now) {
      blacklist.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * Enhanced rate limiter class
 */
export class EnhancedRateLimiter {
  private tier: RateLimitTier;

  constructor(tier: RateLimitTier | keyof typeof rateLimitTiers) {
    this.tier = typeof tier === 'string' ? rateLimitTiers[tier] : tier;
  }

  /**
   * Check if request is allowed
   */
  async check(req: NextRequest, identifier?: string): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
    reason?: string;
  }> {
    const key = this.generateKey(req, identifier);
    const ip = this.getClientIP(req);
    const now = Date.now();

    // Check blacklist first
    if (ip && blacklist.has(ip)) {
      const blockExpiry = blacklist.get(ip)!;
      if (blockExpiry > now) {
        return {
          allowed: false,
          limit: this.tier.maxRequests,
          remaining: 0,
          reset: blockExpiry,
          retryAfter: Math.ceil((blockExpiry - now) / 1000),
          reason: 'IP temporarily blocked due to rate limit violations',
        };
      } else {
        blacklist.delete(ip);
      }
    }

    // Get or create record
    let record = storage.get(key);
    if (!record) {
      record = this.createNewRecord(now);
      storage.set(key, record);
    }

    // Check if currently blocked
    if (record.blocked && record.blockExpires && record.blockExpires > now) {
      return {
        allowed: false,
        limit: this.tier.maxRequests,
        remaining: 0,
        reset: record.blockExpires,
        retryAfter: Math.ceil((record.blockExpires - now) / 1000),
        reason: 'Rate limit exceeded',
      };
    }

    // Apply strategy
    let result;
    switch (this.tier.strategy) {
      case RateLimitStrategy.SLIDING_WINDOW:
        result = this.slidingWindow(record, now);
        break;
      case RateLimitStrategy.FIXED_WINDOW:
        result = this.fixedWindow(record, now);
        break;
      case RateLimitStrategy.TOKEN_BUCKET:
        result = this.tokenBucket(record, now);
        break;
      case RateLimitStrategy.LEAKY_BUCKET:
        result = this.leakyBucket(record, now);
        break;
      default:
        result = this.slidingWindow(record, now);
    }

    // Handle rate limit exceeded
    if (!result.allowed) {
      record.violations = (record.violations || 0) + 1;
      
      // Apply penalty for repeat offenders
      if (this.tier.penalty && record.violations > 2) {
        const penaltyMultiplier = Math.min(record.violations, 5);
        record.blockExpires = now + (this.tier.blockDuration || this.tier.windowMs) * penaltyMultiplier;
        record.blocked = true;
        
        // Add to blacklist for severe violations
        if (record.violations > 5 && ip) {
          blacklist.set(ip, record.blockExpires);
        }
      } else if (this.tier.blockDuration) {
        record.blockExpires = now + this.tier.blockDuration;
        record.blocked = true;
      }
    }

    // Update record
    storage.set(key, record);

    return {
      allowed: result.allowed,
      limit: this.tier.maxRequests,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.retryAfter,
      reason: result.reason,
    };
  }

  /**
   * Sliding window algorithm
   */
  private slidingWindow(record: RateLimitRecord, now: number): any {
    const windowStart = now - this.tier.windowMs;
    
    // Initialize requests array if not exists
    if (!record.requests) {
      record.requests = [];
    }
    
    // Remove old requests outside the window
    record.requests = record.requests.filter(timestamp => timestamp > windowStart);
    
    // Check if we can add new request
    if (record.requests.length < this.tier.maxRequests) {
      record.requests.push(now);
      return {
        allowed: true,
        remaining: this.tier.maxRequests - record.requests.length,
        reset: windowStart + this.tier.windowMs,
      };
    }
    
    // Find when the oldest request will expire
    const oldestRequest = Math.min(...record.requests);
    const reset = oldestRequest + this.tier.windowMs;
    
    return {
      allowed: false,
      remaining: 0,
      reset,
      retryAfter: Math.ceil((reset - now) / 1000),
      reason: 'Rate limit exceeded',
    };
  }

  /**
   * Fixed window algorithm
   */
  private fixedWindow(record: RateLimitRecord, now: number): any {
    // Check if we're in a new window
    if (now > record.windowStart + this.tier.windowMs) {
      record.windowStart = now;
      record.count = 0;
    }
    
    if (record.count < this.tier.maxRequests) {
      record.count++;
      return {
        allowed: true,
        remaining: this.tier.maxRequests - record.count,
        reset: record.windowStart + this.tier.windowMs,
      };
    }
    
    const reset = record.windowStart + this.tier.windowMs;
    return {
      allowed: false,
      remaining: 0,
      reset,
      retryAfter: Math.ceil((reset - now) / 1000),
      reason: 'Rate limit exceeded',
    };
  }

  /**
   * Token bucket algorithm
   */
  private tokenBucket(record: RateLimitRecord, now: number): any {
    const refillRate = this.tier.refillRate || 1;
    const costPerRequest = this.tier.costPerRequest || 1;
    const maxTokens = this.tier.maxRequests;
    
    // Initialize tokens if not set
    if (record.tokens === undefined) {
      record.tokens = maxTokens;
    }
    
    // Refill tokens based on time passed
    const timePassed = now - record.lastRequest;
    const tokensToAdd = (timePassed / 1000) * refillRate;
    record.tokens = Math.min(maxTokens, record.tokens + tokensToAdd);
    
    // Check if we have enough tokens
    if (record.tokens >= costPerRequest) {
      record.tokens -= costPerRequest;
      record.lastRequest = now;
      return {
        allowed: true,
        remaining: Math.floor(record.tokens),
        reset: now + this.tier.windowMs,
      };
    }
    
    // Calculate when we'll have enough tokens
    const tokensNeeded = costPerRequest - record.tokens;
    const timeToWait = (tokensNeeded / refillRate) * 1000;
    const reset = now + timeToWait;
    
    return {
      allowed: false,
      remaining: Math.floor(record.tokens),
      reset,
      retryAfter: Math.ceil(timeToWait / 1000),
      reason: 'Insufficient tokens',
    };
  }

  /**
   * Leaky bucket algorithm
   */
  private leakyBucket(record: RateLimitRecord, now: number): any {
    const leakRate = this.tier.maxRequests / this.tier.windowMs * 1000; // requests per second
    
    // Calculate how much has leaked since last request
    const timePassed = now - record.lastRequest;
    const leaked = (timePassed / 1000) * leakRate;
    
    // Update bucket
    record.count = Math.max(0, record.count - leaked);
    
    // Check if we can add to bucket
    if (record.count < this.tier.maxRequests) {
      record.count++;
      record.lastRequest = now;
      return {
        allowed: true,
        remaining: Math.floor(this.tier.maxRequests - record.count),
        reset: now + this.tier.windowMs,
      };
    }
    
    // Calculate when bucket will have space
    const timeToWait = ((record.count - this.tier.maxRequests + 1) / leakRate) * 1000;
    const reset = now + timeToWait;
    
    return {
      allowed: false,
      remaining: 0,
      reset,
      retryAfter: Math.ceil(timeToWait / 1000),
      reason: 'Bucket full',
    };
  }

  /**
   * Generate unique key for rate limiting
   */
  private generateKey(req: NextRequest, identifier?: string): string {
    if (identifier) {
      return `${this.tier.name}:${identifier}`;
    }
    
    const ip = this.getClientIP(req) || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const hash = createHash('md5').update(`${ip}:${userAgent}`).digest('hex');
    
    return `${this.tier.name}:${hash}`;
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: NextRequest): string | null {
    return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
           req.headers.get('x-real-ip') ||
           req.headers.get('cf-connecting-ip') ||
           null;
  }

  /**
   * Create new rate limit record
   */
  private createNewRecord(now: number): RateLimitRecord {
    return {
      count: 0,
      firstRequest: now,
      lastRequest: now,
      windowStart: now,
      tokens: this.tier.strategy === RateLimitStrategy.TOKEN_BUCKET ? this.tier.maxRequests : undefined,
      requests: this.tier.strategy === RateLimitStrategy.SLIDING_WINDOW ? [] : undefined,
    };
  }
}

/**
 * Create rate limiter for specific endpoint
 */
export function createRateLimiter(tier: keyof typeof rateLimitTiers | RateLimitTier) {
  return new EnhancedRateLimiter(tier);
}

/**
 * Rate limit middleware factory
 */
export function withRateLimit(tier: keyof typeof rateLimitTiers | RateLimitTier) {
  const limiter = createRateLimiter(tier);
  
  return async (req: NextRequest, identifier?: string) => {
    const result = await limiter.check(req, identifier);
    
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
    
    if (result.retryAfter) {
      headers.set('Retry-After', result.retryAfter.toString());
    }
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: result.reason || 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers.entries()),
          },
        }
      );
    }
    
    return { headers, allowed: true };
  };
}