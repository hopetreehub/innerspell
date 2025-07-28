import { NextRequest, NextResponse } from 'next/server';

// Advanced rate limiting store with more features
interface RateLimitBucket {
  count: number;
  lastReset: number;
  windowMs: number;
  max: number;
  blocked?: boolean;
  blockUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();
const blacklist = new Set<string>();

// Edge Runtime doesn't support setInterval - cleanup will happen on each request
// Cleanup function for old entries
function cleanupOldEntries() {
  const now = Date.now();
  const maxEntries = 1000; // Limit store size
  
  // If store is getting too large, cleanup oldest entries
  if (rateLimitStore.size > maxEntries) {
    const entries = Array.from(rateLimitStore.entries());
    entries.sort((a, b) => a[1].lastReset - b[1].lastReset);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      rateLimitStore.delete(entries[i][0]);
    }
  }
  
  // Remove entries older than 3 windows
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now - bucket.lastReset > bucket.windowMs * 3) {
      rateLimitStore.delete(key);
    }
  }
}

export interface AdvancedRateLimitOptions {
  windowMs: number;
  max: number;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  handler?: (req: NextRequest, res: NextResponse) => NextResponse;
  onLimitReached?: (req: NextRequest, identifier: string) => void;
  blockDuration?: number; // Duration to block repeat offenders
  blockThreshold?: number; // Number of violations before blocking
}

// Track violations for blocking
const violationCount = new Map<string, number>();

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Priority: CF > X-Real-IP > X-Forwarded-For > anonymous
  return cfConnectingIp || realIp || (forwarded ? forwarded.split(',')[0].trim() : 'anonymous');
}

export function advancedRateLimit(options: AdvancedRateLimitOptions) {
  const {
    windowMs = 60000,
    max = 100,
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = getClientIdentifier,
    handler,
    onLimitReached,
    blockDuration = 3600000, // 1 hour default
    blockThreshold = 3, // Block after 3 violations
  } = options;

  return async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse> {
    const identifier = keyGenerator(request);
    
    // Periodic cleanup (1% chance on each request)
    if (Math.random() < 0.01) {
      cleanupOldEntries();
    }
    
    // Check if identifier is blacklisted
    if (blacklist.has(identifier)) {
      return NextResponse.json(
        { error: 'Access denied. You have been temporarily blocked.' },
        { status: 403 }
      );
    }
    
    let bucket = rateLimitStore.get(identifier);
    const now = Date.now();
    
    // Check if blocked
    if (bucket?.blocked && bucket.blockUntil) {
      if (bucket.blockUntil > now) {
        return NextResponse.json(
          { 
            error: 'Access denied. You have been temporarily blocked.',
            retryAfter: Math.ceil((bucket.blockUntil - now) / 1000)
          },
          { 
            status: 403,
            headers: {
              'Retry-After': Math.ceil((bucket.blockUntil - now) / 1000).toString()
            }
          }
        );
      } else {
        // Block period expired - cleanup
        bucket.blocked = false;
        bucket.blockUntil = undefined;
        blacklist.delete(identifier);
        violationCount.delete(identifier);
      }
    }
    
    // Reset bucket if window expired
    if (!bucket || now - bucket.lastReset > windowMs) {
      bucket = {
        count: 0,
        lastReset: now,
        windowMs,
        max
      };
      rateLimitStore.set(identifier, bucket);
    }
    
    // Increment counter
    bucket.count++;
    
    // Check if limit exceeded
    if (bucket.count > max) {
      // Track violations
      const violations = (violationCount.get(identifier) || 0) + 1;
      violationCount.set(identifier, violations);
      
      // Block if threshold reached
      if (violations >= blockThreshold) {
        bucket.blocked = true;
        bucket.blockUntil = now + blockDuration;
        blacklist.add(identifier);
        
        // Edge Runtime doesn't support setTimeout
        // Blacklist cleanup will happen when checking blockUntil
      }
      
      // Call handler if provided
      if (onLimitReached) {
        onLimitReached(request, identifier);
      }
      
      const response = NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((bucket.lastReset + windowMs - now) / 1000),
          violations: violations
        },
        { status: 429 }
      );
      
      // Add headers
      if (standardHeaders) {
        response.headers.set('RateLimit-Limit', max.toString());
        response.headers.set('RateLimit-Remaining', '0');
        response.headers.set('RateLimit-Reset', new Date(bucket.lastReset + windowMs).toISOString());
        response.headers.set('RateLimit-Policy', `${max};w=${windowMs / 1000}`);
      }
      
      if (legacyHeaders) {
        response.headers.set('X-RateLimit-Limit', max.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', new Date(bucket.lastReset + windowMs).toISOString());
      }
      
      response.headers.set('Retry-After', Math.ceil((bucket.lastReset + windowMs - now) / 1000).toString());
      
      return handler ? handler(request, response) : response;
    }
    
    // Request is within limits
    const remaining = Math.max(0, max - bucket.count);
    const response = NextResponse.next();
    
    // Add headers for successful requests
    if (standardHeaders) {
      response.headers.set('RateLimit-Limit', max.toString());
      response.headers.set('RateLimit-Remaining', remaining.toString());
      response.headers.set('RateLimit-Reset', new Date(bucket.lastReset + windowMs).toISOString());
      response.headers.set('RateLimit-Policy', `${max};w=${windowMs / 1000}`);
    }
    
    if (legacyHeaders) {
      response.headers.set('X-RateLimit-Limit', max.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(bucket.lastReset + windowMs).toISOString());
    }
    
    return response;
  };
}

// Export specialized rate limiters
export const strictApiLimiter = advancedRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  blockThreshold: 2,
  blockDuration: 30 * 60 * 1000, // 30 minutes
  onLimitReached: (req, identifier) => {
    console.warn(`Rate limit exceeded for ${identifier} on ${req.url}`);
  }
});

export const authLimiter = advancedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  blockThreshold: 3,
  blockDuration: 60 * 60 * 1000, // 1 hour
  onLimitReached: (req, identifier) => {
    console.error(`Auth rate limit exceeded for ${identifier} - possible brute force attempt`);
  }
});

export const aiRequestLimiter = advancedRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  blockThreshold: 5,
  blockDuration: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (req) => {
    // For AI requests, also consider user ID if available
    const identifier = getClientIdentifier(req);
    const userId = req.headers.get('x-user-id');
    return userId ? `${identifier}:${userId}` : identifier;
  }
});