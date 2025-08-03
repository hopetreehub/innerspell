import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiSecurityMiddleware } from '@/middleware/api-security';

export async function middleware(request: NextRequest) {
  // Apply API security to all API routes first
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return await apiSecurityMiddleware(request);
  }

  // 개발 환경에서는 페이지 접근 모든 허용
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Vercel Preview 환경에서 비밀번호 보호
  if (process.env.VERCEL_ENV === 'preview') {
    const basicAuth = request.headers.get('authorization');
    const url = request.nextUrl;

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // 환경 변수에서 인증 정보 확인
      if (user === process.env.PREVIEW_AUTH_USER && pwd === process.env.PREVIEW_AUTH_PASSWORD) {
        return NextResponse.next();
      }
    }

    url.pathname = '/api/auth/preview';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes for security middleware
     * Exclude only:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};