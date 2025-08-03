import { NextRequest, NextResponse } from 'next/server';
import { rateLimits, createRateLimitResponse } from '@/lib/rate-limit';

// Security headers that should be applied to all API responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firebasestorage.googleapis.com https://firebaseapp.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com; frame-src 'self' https://innerspell.firebaseapp.com https://*.firebaseapp.com;",
};

// CORS configuration
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000',
  'https://innerspell.vercel.app',
  'https://innerspell.com',
  'https://www.innerspell.com',
];

// API routes that require different rate limiting
const RATE_LIMIT_CONFIG: Record<string, keyof typeof rateLimits> = {
  '/api/auth': 'auth',
  '/api/community/posts': 'communityPost',
  '/api/comments': 'comment',
  '/api/tarot/reading': 'tarotReading',
  '/api/upload': 'api',
  '/api/search': 'api',
};

/**
 * API Security Middleware
 * Applies security headers, CORS, and rate limiting to API routes
 */
export async function apiSecurityMiddleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 1. Check request method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse('Method Not Allowed', { 
      status: 405,
      headers: {
        'Allow': allowedMethods.join(', '),
      },
    });
  }

  // 2. Apply CORS
  const origin = request.headers.get('origin');
  const corsHeaders: HeadersInit = {};

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With';
    corsHeaders['Access-Control-Max-Age'] = '86400'; // 24 hours
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 204,
      headers: corsHeaders,
    });
  }

  // 3. Apply rate limiting
  const pathname = request.nextUrl.pathname;
  let rateLimitKey: keyof typeof rateLimits = 'api'; // default

  // Find specific rate limit for this path
  for (const [path, limit] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (pathname.startsWith(path)) {
      rateLimitKey = limit;
      break;
    }
  }

  const rateLimitResult = rateLimits[rateLimitKey](request);
  const rateLimitResponse = createRateLimitResponse(rateLimitResult);

  if (rateLimitResponse) {
    // Add CORS headers to rate limit response
    const headers = new Headers(rateLimitResponse.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(rateLimitResponse.body, {
      status: rateLimitResponse.status,
      headers,
    });
  }

  // 4. Content-Type validation for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json') && !contentType?.includes('multipart/form-data')) {
      return new NextResponse(
        JSON.stringify({ error: 'Content-Type must be application/json or multipart/form-data' }),
        { 
          status: 415,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
            ...SECURITY_HEADERS,
          },
        }
      );
    }
  }

  // 5. Add security headers to the response
  const response = NextResponse.next();
  
  // Apply all headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

  // 6. Add request ID for tracing
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  response.headers.set('X-Request-ID', requestId);

  // 7. Log security events (in production, send to monitoring service)
  if (process.env.NODE_ENV === 'production') {
    const logData = {
      timestamp: new Date().toISOString(),
      requestId,
      method: request.method,
      path: pathname,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      origin: origin || 'none',
      rateLimitRemaining: rateLimitResult.remaining,
    };
    
    // In production, send to monitoring service
    console.log('[API Security]', JSON.stringify(logData));
  }

  return response;
}

/**
 * Create middleware configuration for specific routes
 */
export const apiSecurityConfig = {
  // Public endpoints (no auth required)
  public: [
    '/api/health',
    '/api/robots.txt',
    '/api/sitemap.xml',
  ],
  
  // Endpoints that require authentication
  authenticated: [
    '/api/user',
    '/api/community',
    '/api/comments',
    '/api/tarot/save',
  ],
  
  // Admin only endpoints
  admin: [
    '/api/admin',
    '/api/analytics',
    '/api/users/manage',
  ],
  
  // Endpoints with special rate limits
  rateLimited: {
    strict: ['/api/auth', '/api/tarot/reading'],
    moderate: ['/api/community/posts', '/api/comments'],
    relaxed: ['/api/search', '/api/user/profile'],
  },
};