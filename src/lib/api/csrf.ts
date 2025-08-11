/**
 * CSRF 토큰 관리 유틸리티
 */

/**
 * 쿠키에서 CSRF 토큰 가져오기
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * API 요청에 CSRF 토큰 헤더 추가
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const csrfToken = getCSRFToken();
  
  if (csrfToken) {
    return {
      ...headers,
      'x-csrf-token': csrfToken,
    };
  }
  
  return headers;
}