import { NextRequest, NextResponse } from 'next/server';
import { rateLimits, createRateLimitResponse } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting 적용
  let rateLimitResult: {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } | undefined;

  // API 경로별 Rate Limit 적용
  if (pathname.startsWith('/api/ai/') || pathname.includes('tarot')) {
    // AI 타로 리딩 API
    rateLimitResult = rateLimits.tarotReading(request);
  } else if (pathname.startsWith('/api/auth/')) {
    // 인증 관련 API
    rateLimitResult = rateLimits.auth(request);
  } else if (pathname.startsWith('/api/community/')) {
    // 커뮤니티 관련 API
    if (request.method === 'POST') {
      rateLimitResult = rateLimits.communityPost(request);
    } else {
      rateLimitResult = rateLimits.api(request);
    }
  } else if (pathname.startsWith('/api/')) {
    // 일반 API
    rateLimitResult = rateLimits.api(request);
  }

  // Rate limit 체크
  if (rateLimitResult) {
    const rateLimitResponse = createRateLimitResponse(rateLimitResult);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Rate limit 헤더를 응답에 추가
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    return response;
  }

  // 보안 헤더 추가
  const response = NextResponse.next();
  
  // CSP (Content Security Policy) 헤더
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.openai.com https://*.googleapis.com https://*.firebaseapp.com https://*.cloudfunctions.net",
    "frame-src 'self' https://www.youtube.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

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
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};