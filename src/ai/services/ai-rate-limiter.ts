/**
 * AI Rate Limiter Service
 * 
 * Implements rate limiting for AI API calls to prevent quota exhaustion
 * and ensure fair usage across users.
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  maxRequestsPerUser?: number; // Maximum requests per user per window
}

interface RequestRecord {
  timestamp: number;
  userId?: string;
}

class RateLimiter {
  private requests: RequestRecord[] = [];
  private userRequests: Map<string, RequestRecord[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Clean up old requests outside the current window
   */
  private cleanupOldRequests(now: number): void {
    const cutoff = now - this.config.windowMs;
    
    // Clean global requests
    this.requests = this.requests.filter(req => req.timestamp > cutoff);
    
    // Clean user-specific requests
    this.userRequests.forEach((requests, userId) => {
      const filtered = requests.filter(req => req.timestamp > cutoff);
      if (filtered.length === 0) {
        this.userRequests.delete(userId);
      } else {
        this.userRequests.set(userId, filtered);
      }
    });
  }

  /**
   * Check if a request is allowed
   */
  isAllowed(userId?: string): boolean {
    const now = Date.now();
    this.cleanupOldRequests(now);
    
    // Check global rate limit
    if (this.requests.length >= this.config.maxRequests) {
      console.log('[RATE_LIMITER] Global rate limit exceeded');
      return false;
    }
    
    // Check user-specific rate limit if configured
    if (userId && this.config.maxRequestsPerUser) {
      const userReqs = this.userRequests.get(userId) || [];
      if (userReqs.length >= this.config.maxRequestsPerUser) {
        console.log(`[RATE_LIMITER] User ${userId} rate limit exceeded`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Record a request
   */
  recordRequest(userId?: string): void {
    const now = Date.now();
    const record: RequestRecord = { timestamp: now, userId };
    
    // Record globally
    this.requests.push(record);
    
    // Record per user if userId provided
    if (userId) {
      const userReqs = this.userRequests.get(userId) || [];
      userReqs.push(record);
      this.userRequests.set(userId, userReqs);
    }
  }

  /**
   * Get time until next available request slot
   */
  getResetTime(userId?: string): number {
    const now = Date.now();
    this.cleanupOldRequests(now);
    
    let oldestRequest: number | null = null;
    
    // Check global limit
    if (this.requests.length >= this.config.maxRequests) {
      oldestRequest = this.requests[0].timestamp;
    }
    
    // Check user limit if applicable
    if (userId && this.config.maxRequestsPerUser) {
      const userReqs = this.userRequests.get(userId) || [];
      if (userReqs.length >= this.config.maxRequestsPerUser && userReqs[0].timestamp) {
        oldestRequest = oldestRequest 
          ? Math.min(oldestRequest, userReqs[0].timestamp)
          : userReqs[0].timestamp;
      }
    }
    
    if (oldestRequest) {
      return Math.max(0, (oldestRequest + this.config.windowMs) - now);
    }
    
    return 0;
  }

  /**
   * Get current usage statistics
   */
  getStats(userId?: string) {
    const now = Date.now();
    this.cleanupOldRequests(now);
    
    const stats = {
      globalUsage: this.requests.length,
      globalLimit: this.config.maxRequests,
      globalRemaining: Math.max(0, this.config.maxRequests - this.requests.length),
      resetTime: this.getResetTime(userId),
      userUsage: 0,
      userLimit: this.config.maxRequestsPerUser || 0,
      userRemaining: 0,
    };
    
    if (userId && this.config.maxRequestsPerUser) {
      const userReqs = this.userRequests.get(userId) || [];
      stats.userUsage = userReqs.length;
      stats.userRemaining = Math.max(0, this.config.maxRequestsPerUser - userReqs.length);
    }
    
    return stats;
  }
}

// Create rate limiters for different tiers
const rateLimiters = {
  // Default rate limiter for all requests
  default: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // 100 requests per hour globally
    maxRequestsPerUser: 10, // 10 requests per user per hour
  }),
  
  // Premium rate limiter for authenticated users
  premium: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 500, // 500 requests per hour globally
    maxRequestsPerUser: 50, // 50 requests per user per hour
  }),
};

/**
 * Check if an AI request is allowed based on rate limits
 */
export function checkRateLimit(userId?: string, isPremium: boolean = false): {
  allowed: boolean;
  resetTime?: number;
  message?: string;
} {
  const limiter = isPremium ? rateLimiters.premium : rateLimiters.default;
  const allowed = limiter.isAllowed(userId);
  
  if (!allowed) {
    const resetTime = limiter.getResetTime(userId);
    const resetMinutes = Math.ceil(resetTime / 1000 / 60);
    
    return {
      allowed: false,
      resetTime,
      message: `API 사용량 한도를 초과했습니다. ${resetMinutes}분 후에 다시 시도해주세요.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Record an AI request for rate limiting
 */
export function recordAIRequest(userId?: string, isPremium: boolean = false): void {
  const limiter = isPremium ? rateLimiters.premium : rateLimiters.default;
  limiter.recordRequest(userId);
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(userId?: string, isPremium: boolean = false) {
  const limiter = isPremium ? rateLimiters.premium : rateLimiters.default;
  return limiter.getStats(userId);
}