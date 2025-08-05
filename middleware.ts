import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // 관리자 페이지 보호 (개발/프로덕션 모두 적용)
  if (pathname.startsWith('/admin')) {
    // 인증 토큰 확인
    const authToken = request.cookies.get('auth-token')?.value;
    const sessionToken = request.cookies.get('__session')?.value;
    
    // 개발 환경에서는 특별한 개발자 토큰도 허용
    const devBypass = process.env.NODE_ENV === 'development' && 
                     request.headers.get('x-dev-bypass') === 'true';
    
    if (!authToken && !sessionToken && !devBypass) {
      // 관리자 페이지는 반드시 인증 후 접근 가능하도록 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 개발 환경에서는 다른 페이지 모든 접근 허용
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Vercel Preview 환경에서 비밀번호 보호
  if (process.env.VERCEL_ENV === 'preview') {
    const basicAuth = request.headers.get('authorization');

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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};