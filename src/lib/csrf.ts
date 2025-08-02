// CSRF Token 유틸리티
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  // 쿠키에서 CSRF 토큰 찾기
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

// API 요청을 위한 기본 헤더 생성
export function getApiHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  // CSRF 토큰 시도
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  } else if (process.env.NEXT_PUBLIC_BLOG_API_SECRET) {
    // CSRF 토큰이 없으면 API secret 사용 (환경변수에서만)
    headers['x-api-secret'] = process.env.NEXT_PUBLIC_BLOG_API_SECRET;
  }
  
  return headers;
}

// fetch 래퍼 함수
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = getApiHeaders(options.headers as Record<string, string>);
  
  return fetch(url, {
    ...options,
    headers,
  });
}