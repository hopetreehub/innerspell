import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, verifyCSRFToken } from '@/lib/security/encryption';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * CSRF 보호가 필요한 경로 패턴
 */
const PROTECTED_PATHS = [
  '/api/admin/',
  '/api/auth/',
  '/api/user/',
  '/api/tarot/',
  '/api/dream/',
];

/**
 * CSRF 토큰 생성 및 쿠키 설정
 */
export function setCSRFToken(response: NextResponse): string {
  const token = generateCSRFToken();
  
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24시간
  });
  
  return token;
}

/**
 * CSRF 보호 미들웨어
 */
export async function csrfProtection(request: NextRequest): Promise<NextResponse | null> {
  // GET 요청은 CSRF 검증 제외
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return null;
  }
  
  // 보호가 필요한 경로인지 확인
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (!isProtectedPath) {
    return null;
  }
  
  // 쿠키에서 CSRF 토큰 가져오기
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  
  // 헤더에서 CSRF 토큰 가져오기
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // 토큰이 없거나 일치하지 않으면 403 반환
  if (!cookieToken || !headerToken || !verifyCSRFToken(headerToken, cookieToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * CSRF 토큰을 클라이언트에서 가져오는 헬퍼 함수
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`));
  return match ? match[2] : null;
}

/**
 * fetch 요청에 CSRF 토큰을 추가하는 헬퍼 함수
 */
export function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getCSRFToken();
  
  if (token) {
    options.headers = {
      ...options.headers,
      [CSRF_HEADER_NAME]: token,
    };
  }
  
  return fetch(url, options);
}