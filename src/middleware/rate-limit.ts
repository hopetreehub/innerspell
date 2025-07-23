import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// In-memory store for rate limiting (프로덕션에서는 Redis 사용 권장)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  message?: string;  // Error message
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later.'
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  
  return async function rateLimitMiddleware(req: NextRequest) {
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'anonymous';
    
    const now = Date.now();
    const resetTime = now + finalConfig.windowMs;
    
    // Clean up expired entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
    
    // Get or create rate limit entry
    const rateLimitEntry = rateLimitStore.get(ip) || { count: 0, resetTime };
    
    // Check if limit exceeded
    if (rateLimitEntry.count >= finalConfig.max && rateLimitEntry.resetTime > now) {
      return NextResponse.json(
        { error: finalConfig.message },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': finalConfig.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitEntry.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitEntry.resetTime - now) / 1000).toString()
          }
        }
      );
    }
    
    // Increment counter
    rateLimitEntry.count++;
    rateLimitStore.set(ip, rateLimitEntry);
    
    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', finalConfig.max.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, finalConfig.max - rateLimitEntry.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitEntry.resetTime).toISOString());
    
    return response;
  };
}