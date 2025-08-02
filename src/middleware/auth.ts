import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { rateLimits, createRateLimitResponse } from '@/lib/rate-limit';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    admin?: boolean;
  };
}

/**
 * Authentication middleware wrapper
 * Verifies session cookie and adds user to request
 */
export async function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: {
    requireAdmin?: boolean;
    rateLimit?: keyof typeof rateLimits;
  }
): Promise<(request: NextRequest) => Promise<NextResponse>> {
  return async (request: NextRequest) => {
    // Apply rate limiting if specified
    if (options?.rateLimit) {
      const rateLimitResult = rateLimits[options.rateLimit](request);
      const rateLimitResponse = createRateLimitResponse(rateLimitResult);
      if (rateLimitResponse) {
        return rateLimitResponse as NextResponse;
      }
    }
    
    // Get session cookie
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    try {
      // Verify session cookie
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);
      
      // Check if admin is required
      if (options?.requireAdmin && !decodedClaims.admin) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
      
      // Add user to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified,
        admin: decodedClaims.admin || false
      };
      
      // Call the handler with authenticated request
      return handler(authenticatedRequest);
      
    } catch (error) {
      console.error('Session verification error:', error);
      
      // Clear invalid session cookie
      const response = NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
      response.cookies.delete('session');
      
      return response;
    }
  };
}

/**
 * API key authentication middleware
 * For external service integration
 */
export async function withApiKey(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: {
    rateLimit?: keyof typeof rateLimits;
  }
): Promise<(request: NextRequest) => Promise<NextResponse>> {
  return async (request: NextRequest) => {
    // Apply rate limiting if specified
    if (options?.rateLimit) {
      const rateLimitResult = rateLimits[options.rateLimit](request);
      const rateLimitResponse = createRateLimitResponse(rateLimitResult);
      if (rateLimitResponse) {
        return rateLimitResponse as NextResponse;
      }
    }
    
    // Check API key
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.BLOG_API_SECRET_KEY;
    
    if (!expectedKey) {
      console.error('BLOG_API_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'API not configured' },
        { status: 500 }
      );
    }
    
    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    return handler(request);
  };
}

/**
 * Combined authentication middleware
 * Allows either session or API key authentication
 */
export async function withAuthOrApiKey(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options?: {
    requireAdmin?: boolean;
    rateLimit?: keyof typeof rateLimits;
  }
): Promise<(request: NextRequest) => Promise<NextResponse>> {
  return async (request: NextRequest) => {
    // Apply rate limiting if specified
    if (options?.rateLimit) {
      const rateLimitResult = rateLimits[options.rateLimit](request);
      const rateLimitResponse = createRateLimitResponse(rateLimitResult);
      if (rateLimitResponse) {
        return rateLimitResponse as NextResponse;
      }
    }
    
    // Check for API key first
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      const expectedKey = process.env.BLOG_API_SECRET_KEY;
      if (expectedKey && apiKey === expectedKey) {
        // API key is valid, treat as admin
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = {
          uid: 'api-key-user',
          admin: true
        };
        return handler(authenticatedRequest);
      }
    }
    
    // Fall back to session authentication
    const authHandler = await withAuth(handler, options);
    return authHandler(request);
  };
}

/**
 * CSRF protection middleware
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    // Skip CSRF check for GET requests
    if (request.method === 'GET') {
      return handler(request);
    }
    
    // Check CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionCsrfToken = request.cookies.get('csrf-token');
    
    if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken.value) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    return handler(request);
  };
}