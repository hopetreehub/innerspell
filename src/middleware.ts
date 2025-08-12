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
  
  // AI API 엔드포인트에만 레이트 리미터 적용 (페이지 라우트는 제외)
  if (pathname.startsWith('/api/reading') || 
      pathname.startsWith('/api/generate-tarot') || 
      pathname.startsWith('/api/dream') ||
      pathname.startsWith('/api/ai/')) {
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
      const expectedSecret = (process.env.BLOG_API_SECRET_KEY || '').trim();
      const validApiSecret = expectedSecret === apiSecret;
      
      // 특정 엔드포인트는 CSRF 검증 건너뛰기
      const isDevelopmentMode = process.env.NODE_ENV === 'development';
      const isUploadApi = request.nextUrl.pathname.startsWith('/api/upload/');
      const isBlogApi = request.nextUrl.pathname.startsWith('/api/blog/');
      const isTarotApi = request.nextUrl.pathname.startsWith('/api/generate-tarot-interpretation');
      const isActivityApi = request.nextUrl.pathname.startsWith('/api/admin/activities');
      const isReadingApi = request.nextUrl.pathname.startsWith('/api/reading/');
      
      // 🔴 CRITICAL: 타로 해석 API는 프로덕션에서도 CSRF 검증 완화
      if (isTarotApi || isReadingApi || (isDevelopmentMode && (isUploadApi || isBlogApi || isActivityApi))) {
        console.log('🎯 Skipping CSRF check for', request.nextUrl.pathname, 'Environment:', process.env.NODE_ENV);
        // 타로 관련 API에 대해 CSRF 검증 완전히 건너뛰기
        // continue to next without CSRF validation
      } else if (!validApiSecret && headerToken !== csrfToken) {
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
    console.log('CSP Policy Set:', cspPolicy); // 디버깅용
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