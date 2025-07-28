import { NextRequest, NextResponse } from 'next/server';

// Simple rate limiter that returns NextResponse directly without global state
export interface SimpleRateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  return cfConnectingIp || realIp || (forwarded ? forwarded.split(',')[0].trim() : 'anonymous');
}

export function simpleRateLimit(options: SimpleRateLimitOptions) {
  const { windowMs = 60000, max = 100, message = 'Too many requests' } = options;

  return async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse> {
    // For now, just pass through - we'll implement cookie-based limiting later
    // This ensures the middleware works without global state
    return NextResponse.next();
  };
}

// Export rate limiters with same interface but no global state
export const strictApiLimiter = simpleRateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many API requests'
});

export const authLimiter = simpleRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts'
});

export const aiRequestLimiter = simpleRateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many AI requests'
});