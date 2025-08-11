import { NextRequest } from 'next/server';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

export async function validateApiAccess(request: NextRequest): Promise<ValidationResult> {
  try {
    // 개발 모드에서는 더 관대한 검증
    const isDevelopmentMode = process.env.NODE_ENV === 'development';
    
    if (isDevelopmentMode) {
      // 개발 모드에서는 API secret 또는 Authorization 헤더 중 하나만 있으면 통과
      const apiSecret = request.headers.get('x-api-secret');
      const authorization = request.headers.get('authorization');
      
      if (apiSecret || authorization) {
        return { isValid: true };
      }
      
      // 로컬 개발에서는 기본 허용
      const host = request.headers.get('host');
      if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
        return { isValid: true };
      }
    }

    // CSRF 토큰 검증 (선택적)
    const csrfToken = request.headers.get('x-csrf-token');
    
    // API Secret 검증
    const apiSecret = request.headers.get('x-api-secret');
    const expectedSecret = process.env.NEXT_PUBLIC_BLOG_API_SECRET || 'c3UqPIMPMcos5QJPHcKMVDH4TQBUQ01rqDkmDLLT02c=';
    
    if (apiSecret === expectedSecret) {
      return { isValid: true };
    }

    // Authorization 토큰 검증 (Firebase Auth)
    const authorization = request.headers.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      
      // 개발 모드에서는 mock-token도 허용
      if (isDevelopmentMode && token === 'mock-token') {
        return { isValid: true };
      }
      
      // 실제 프로덕션에서는 Firebase Auth 토큰 검증 필요
      // TODO: Firebase Auth 토큰 검증 로직 구현
      return { isValid: true };
    }

    // 검증 실패
    return {
      isValid: false,
      error: '인증이 필요합니다.',
      statusCode: 401
    };

  } catch (error) {
    console.error('❌ API validation error:', error);
    return {
      isValid: false,
      error: '인증 검증 중 오류가 발생했습니다.',
      statusCode: 500
    };
  }
}

// Rate limiting을 위한 간단한 메모리 저장소
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  clientId: string,
  limit: number = 100,
  windowMs: number = 60000 // 1분
): ValidationResult {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    // 새로운 윈도우 시작
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + windowMs
    });
    return { isValid: true };
  }

  if (clientData.count >= limit) {
    return {
      isValid: false,
      error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      statusCode: 429
    };
  }

  // 요청 카운트 증가
  clientData.count++;
  rateLimitMap.set(clientId, clientData);

  return { isValid: true };
}