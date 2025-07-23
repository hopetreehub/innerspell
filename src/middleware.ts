import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './middleware/rate-limit';

// Rate limit configurations
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 login attempts per 15 minutes
});

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 AI requests per minute
});

export async function middleware(request: NextRequest) {
  // Apply rate limiting first
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/dev-auth')) {
    const rateLimitResponse = await authRateLimiter(request);
    if (rateLimitResponse.status === 429) return rateLimitResponse;
  }
  
  if (pathname.startsWith('/api/reading') || pathname.includes('tarot') || pathname.includes('dream')) {
    const rateLimitResponse = await aiRateLimiter(request);
    if (rateLimitResponse.status === 429) return rateLimitResponse;
  }
  
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = await apiRateLimiter(request);
    if (rateLimitResponse.status === 429) return rateLimitResponse;
  }
  
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Check if this is a logout request
  const isLogoutPath = request.nextUrl.pathname === '/' && request.nextUrl.searchParams.get('logout') === 'true';
  
  if (isLogoutPath) {
    // Disable all caching for logout
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }
  
  // CSRF Protection for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get or create CSRF token
    const csrfToken = request.cookies.get('csrf-token')?.value || 
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Set CSRF cookie if not exists
    if (!request.cookies.get('csrf-token')) {
      response.cookies.set('csrf-token', csrfToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    
    // For non-GET requests, verify CSRF token
    if (request.method !== 'GET') {
      const headerToken = request.headers.get('x-csrf-token');
      
      // Allow requests with valid CSRF token or with specific API secret
      const apiSecret = request.headers.get('x-api-secret');
      const validApiSecret = process.env.BLOG_API_SECRET_KEY === apiSecret;
      
      if (!validApiSecret && headerToken !== csrfToken) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
  }
  
  // Content Security Policy (adjust domains as needed)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://firebaseapp.com https://firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com https://api.openai.com; " +
      "frame-src 'self' https://innerspell-an7ce.firebaseapp.com;"
    );
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