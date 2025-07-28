import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { csrfProtection, setCSRFToken } from './middleware/csrf';
import { strictApiLimiter, authLimiter, aiRequestLimiter } from './middleware/simple-rate-limit';

export async function middleware(request: NextRequest) {
  // Apply advanced rate limiting first
  const { pathname } = request.nextUrl;
  
  // Auth endpoints - strict limiting
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/dev-auth')) {
    const rateLimitResponse = await authLimiter(request);
    if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
      return rateLimitResponse;
    }
  }
  
  // AI endpoints - moderate limiting with user-based tracking
  if (pathname.startsWith('/api/reading') || pathname.includes('tarot') || pathname.includes('dream')) {
    const rateLimitResponse = await aiRequestLimiter(request);
    if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
      return rateLimitResponse;
    }
  }
  
  // General API endpoints - standard limiting
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = await strictApiLimiter(request);
    if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
      return rateLimitResponse;
    }
  }
  
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Check if this is a logout request
  const isLogoutPath = request.nextUrl.pathname === '/' && request.nextUrl.searchParams.get('logout') === 'true';
  
  // AGGRESSIVE CACHE BUSTING FOR AUTH-RELATED PATHS
  const isAuthPath = pathname.startsWith('/admin') || 
                     pathname.startsWith('/api/auth') || 
                     pathname.startsWith('/api/dev-auth') || 
                     pathname.startsWith('/sign-in') || 
                     pathname.startsWith('/sign-up') || 
                     isLogoutPath;
  
  if (isAuthPath || isLogoutPath) {
    // EMERGENCY CACHE INVALIDATION - Multiple layers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"${Date.now()}-${Math.random().toString(36)}"`);
    
    // Force browser to revalidate
    response.headers.set('Vary', 'Cookie, Authorization, X-Requested-With, Accept, Accept-Encoding, Accept-Language');
  }
  
  // CSRF Protection temporarily disabled for Edge Runtime debugging
  // TODO: Re-enable after fixing Edge Runtime compatibility
  /*
  if (process.env.NODE_ENV === 'production') {
    const csrfResponse = await csrfProtection(request);
    if (csrfResponse) {
      return csrfResponse;
    }
    
    // Set CSRF token for all responses
    if (!request.cookies.get('csrf-token')) {
      setCSRFToken(response);
    }
  }
  */
  
  // Content Security Policy (Firebase 도메인 추가 - v2 강제 업데이트)
  if (process.env.NODE_ENV === 'production') {
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.firebaseapp.com https://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com https://api.openai.com https://*.googleapis.com",
      "frame-src 'self' https://innerspell-an7ce.firebaseapp.com https://*.firebaseapp.com"
    ].join("; ");
    
    response.headers.set('Content-Security-Policy', cspPolicy);
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health).*)',
  ],
};