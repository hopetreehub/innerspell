import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security configurations
const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  api: {
    windowMs: 60 * 1000,
    maxRequests: 50,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
};

// WAF Rules - Block patterns
const BLOCKED_PATTERNS = [
  // SQL Injection patterns
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|where|table|database)\b)/i,
  /(\'|\")(\s*)(or|and)(\s*)(\'|\")/i,
  /(\b(union)(\s+)(all|distinct)?(\s+)(select)\b)/i,
  
  // XSS patterns
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  
  // Path traversal
  /\.\.(\/|\\)/g,
  /%2e%2e(\/|\\)/gi,
  
  // Command injection
  /(\||;|&|`|\$\(|\)\s*(cat|grep|wget|curl|bash|sh|cmd|powershell))/i,
  
  // Common vulnerability scanners
  /(acunetix|nikto|sqlmap|nmap|masscan|w3af)/i,
];

// Blocked user agents
const BLOCKED_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /ruby/i,
  /perl/i,
  /php/i,
  // Allow legitimate bots
  /!(googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp)/i,
];

// IP-based rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'anonymous';
}

function isRateLimited(ip: string, config: { windowMs: number; maxRequests: number }): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return false;
  }
  
  if (limit.count >= config.maxRequests) {
    return true;
  }
  
  limit.count++;
  return false;
}

function containsBlockedPattern(value: string): boolean {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(value));
}

function isBlockedUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent));
}

function generateCSP(): string {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.googleapis.com https://*.firebase.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://vercel.live https://vitals.vercel-insights.com",
    "frame-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];
  
  return csp.join('; ');
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;
  const userAgent = request.headers.get('user-agent');
  const ip = getClientIp(request);
  
  // Skip middleware for static assets
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') || 
      pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|otf)$/)) {
    return NextResponse.next();
  }
  
  // Block suspicious user agents
  if (isBlockedUserAgent(userAgent)) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Check URL path for malicious patterns
  if (containsBlockedPattern(pathname)) {
    console.warn(`[WAF] Blocked malicious path pattern from ${ip}: ${pathname}`);
    return new NextResponse('Bad Request', { status: 400 });
  }
  
  // Check query parameters for malicious patterns
  for (const [key, value] of searchParams.entries()) {
    if (containsBlockedPattern(key) || containsBlockedPattern(value)) {
      console.warn(`[WAF] Blocked malicious query pattern from ${ip}: ${key}=${value}`);
      return new NextResponse('Bad Request', { status: 400 });
    }
  }
  
  // Check request body for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    // Note: Body inspection would require parsing, which is async
    // For now, we'll rely on API-level validation
  }
  
  // Apply different rate limits based on the path
  let rateLimitConfig = { windowMs: RATE_LIMIT_CONFIG.windowMs, maxRequests: RATE_LIMIT_CONFIG.maxRequests };
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
    rateLimitConfig = RATE_LIMIT_CONFIG.auth;
  } else if (pathname.startsWith('/api/')) {
    rateLimitConfig = RATE_LIMIT_CONFIG.api;
  }
  
  // Check rate limiting
  if (isRateLimited(ip, rateLimitConfig)) {
    console.warn(`[RateLimit] Blocked ${ip} - exceeded ${rateLimitConfig.maxRequests} requests in ${rateLimitConfig.windowMs}ms`);
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(rateLimitConfig.windowMs / 1000)),
        'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + rateLimitConfig.windowMs).toISOString(),
      },
    });
  }
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Set dynamic CSP
  response.headers.set('Content-Security-Policy', generateCSP());
  
  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);
  
  // Log security events
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      ip,
      method,
      path: pathname,
      userAgent,
      referer: request.headers.get('referer'),
    }));
  }
  
  return response;
}

// Clean up old rate limit entries periodically
if (typeof global !== 'undefined' && !(global as any).rateLimitCleanupInterval) {
  (global as any).rateLimitCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, limit] of rateLimitStore.entries()) {
      if (now > limit.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }, 60 * 1000); // Clean up every minute
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};