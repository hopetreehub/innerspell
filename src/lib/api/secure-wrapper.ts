import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/firebase/admin-lazy';
import { createRateLimitResponse, rateLimits } from '@/lib/rate-limit';
import { createHash, randomBytes } from 'crypto';

// Types for API security configuration
export interface SecurityConfig {
  requireAuth?: boolean;
  requireApiKey?: boolean;
  apiKeyHeader?: string;
  allowedRoles?: string[];
  rateLimit?: keyof typeof rateLimits | ReturnType<typeof rateLimits.api>;
  validateInput?: z.ZodSchema;
  corsOrigins?: string[];
  enableCSRF?: boolean;
  maxRequestSize?: number; // in bytes
  customValidation?: (req: NextRequest) => Promise<{ valid: boolean; error?: string }>;
}

export interface SecureContext {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    customClaims?: Record<string, any>;
  };
  apiKey?: string;
  requestId: string;
  clientIp?: string;
}

// Security headers to prevent common attacks
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
};

// CSRF token management (in-memory for now, use Redis in production)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean up expired CSRF tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * Main secure endpoint wrapper implementing defense in depth
 */
export function secureEndpoint<T = any>(
  handler: (req: NextRequest, context: SecureContext, params?: T) => Promise<Response>,
  config: SecurityConfig = {}
): (req: NextRequest, params?: { params: T }) => Promise<Response> {
  return async (req: NextRequest, routeParams?: { params: T }) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    try {
      // 1. Add security headers
      const headers = new Headers(SECURITY_HEADERS);
      headers.set('X-Request-ID', requestId);

      // 2. Size limit check
      if (config.maxRequestSize) {
        const contentLength = req.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > config.maxRequestSize) {
          return createErrorResponse('Request body too large', 413, headers);
        }
      }

      // 3. CORS handling
      if (config.corsOrigins) {
        const origin = req.headers.get('origin');
        if (origin && config.corsOrigins.includes(origin)) {
          headers.set('Access-Control-Allow-Origin', origin);
          headers.set('Access-Control-Allow-Credentials', 'true');
          headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
        }

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          return new NextResponse(null, { status: 204, headers });
        }
      }

      // 4. Rate limiting
      const rateLimitKey = config.rateLimit || 'api';
      const rateLimit = typeof rateLimitKey === 'string' ? rateLimits[rateLimitKey] : rateLimitKey;
      const rateLimitResult = rateLimit(req);
      
      if (!rateLimitResult.success) {
        const rateLimitResponse = createRateLimitResponse(rateLimitResult);
        if (rateLimitResponse) {
          // Add our security headers to rate limit response
          const rateLimitHeaders = new Headers(rateLimitResponse.headers);
          headers.forEach((value, key) => rateLimitHeaders.set(key, value));
          return new Response(rateLimitResponse.body, {
            status: rateLimitResponse.status,
            headers: rateLimitHeaders,
          });
        }
      }

      // Add rate limit headers
      headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

      // 5. Initialize context
      const context: SecureContext = {
        requestId,
        clientIp: getClientIP(req),
      };

      // 6. API Key validation
      if (config.requireApiKey) {
        const apiKeyHeader = config.apiKeyHeader || 'x-api-key';
        const apiKey = req.headers.get(apiKeyHeader);
        
        if (!apiKey) {
          return createErrorResponse('API key required', 401, headers);
        }

        // Validate API key (constant-time comparison)
        const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
        const isValidKey = validApiKeys.some(validKey => 
          timingSafeEqual(Buffer.from(apiKey), Buffer.from(validKey.trim()))
        );

        if (!isValidKey) {
          // Log suspicious activity
          console.warn(`Invalid API key attempt from ${context.clientIp} with key: ${apiKey.substring(0, 8)}...`);
          return createErrorResponse('Invalid API key', 401, headers);
        }

        context.apiKey = apiKey;
      }

      // 7. Authentication check
      if (config.requireAuth) {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          return createErrorResponse('Authorization required', 401, headers);
        }

        const token = authHeader.substring(7);
        
        try {
          const auth = await getAuth();
          const decodedToken = await auth.verifyIdToken(token);
          
          context.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            customClaims: decodedToken,
          };

          // Check role-based access
          if (config.allowedRoles && config.allowedRoles.length > 0) {
            const userRoles = decodedToken.roles || [];
            const hasRequiredRole = config.allowedRoles.some(role => 
              userRoles.includes(role)
            );
            
            if (!hasRequiredRole) {
              return createErrorResponse('Insufficient permissions', 403, headers);
            }
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          return createErrorResponse('Invalid or expired token', 401, headers);
        }
      }

      // 8. CSRF protection
      if (config.enableCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const csrfToken = req.headers.get('x-csrf-token');
        if (!csrfToken) {
          return createErrorResponse('CSRF token required', 403, headers);
        }

        const sessionId = context.user?.uid || context.clientIp || 'anonymous';
        const storedToken = csrfTokens.get(sessionId);
        
        if (!storedToken || storedToken.token !== csrfToken || storedToken.expires < Date.now()) {
          return createErrorResponse('Invalid CSRF token', 403, headers);
        }
      }

      // 9. Input validation
      if (config.validateInput && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const body = await req.json();
          const validatedData = config.validateInput.parse(body);
          
          // Create new request with validated data
          req = new NextRequest(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(validatedData),
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return createErrorResponse(
              'Validation failed',
              400,
              headers,
              { errors: error.errors }
            );
          }
          return createErrorResponse('Invalid request body', 400, headers);
        }
      }

      // 10. Custom validation
      if (config.customValidation) {
        const { valid, error } = await config.customValidation(req);
        if (!valid) {
          return createErrorResponse(error || 'Validation failed', 400, headers);
        }
      }

      // 11. Call the actual handler
      const response = await handler(req, context, routeParams?.params);

      // 12. Add security headers to response
      const responseHeaders = new Headers(response.headers);
      headers.forEach((value, key) => responseHeaders.set(key, value));

      // 13. Add performance metrics
      responseHeaders.set('X-Response-Time', `${Date.now() - startTime}ms`);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      // Log error securely (no sensitive data)
      console.error(`API Error [${requestId}]:`, {
        method: req.method,
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Return generic error to prevent information leakage
      return createErrorResponse(
        'Internal server error',
        500,
        headers,
        process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined
      );
    }
  };
}

/**
 * Generate CSRF token for a session
 */
export async function generateCSRFToken(sessionId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expires = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
  
  csrfTokens.set(sessionId, { token, expires });
  
  return token;
}

/**
 * Helper to create standardized error responses
 */
function createErrorResponse(
  message: string,
  status: number,
  headers: Headers,
  details?: any
): NextResponse {
  const body = {
    error: message,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };

  return NextResponse.json(body, { status, headers });
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

/**
 * Extract client IP from request
 */
function getClientIP(req: NextRequest): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return req.headers.get('x-real-ip') || 
         req.headers.get('cf-connecting-ip') || 
         undefined;
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  return createHash('sha256').update(a).digest().equals(
    createHash('sha256').update(b).digest()
  );
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}