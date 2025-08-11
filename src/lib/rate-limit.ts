import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // 시간 윈도우 (밀리초)
  maxRequests: number; // 최대 요청 수
  keyGenerator?: (req: NextRequest) => string; // 키 생성 함수
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// 메모리 기반 저장소 (프로덕션에서는 Redis 사용 권장)
const store: RateLimitStore = {};

// 주기적으로 만료된 항목 정리
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // 1분마다 정리

export function createRateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return function rateLimit(req: NextRequest): {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    // 키 생성 (IP 주소 기반 또는 사용자 정의)
    const key = keyGenerator 
      ? keyGenerator(req)
      : getClientIP(req) || 'anonymous';

    const now = Date.now();
    const resetTime = now + windowMs;

    // 기존 레코드 확인
    if (!store[key] || store[key].resetTime < now) {
      // 새로운 윈도우 시작
      store[key] = {
        count: 1,
        resetTime,
      };
      
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    // 기존 윈도우 내에서 요청 증가
    store[key].count++;

    const remaining = Math.max(0, maxRequests - store[key].count);
    const success = store[key].count <= maxRequests;

    return {
      success,
      limit: maxRequests,
      remaining,
      resetTime: store[key].resetTime,
    };
  };
}

function getClientIP(req: NextRequest): string | null {
  // Vercel, Cloudflare 등의 프록시 헤더 확인
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Next.js에서 직접 IP 가져오기는 제한적
  return null;
}

// 사전 정의된 Rate Limit 설정들
export const rateLimits = {
  // API 일반 요청 (분당 60회)
  api: createRateLimit({
    windowMs: 60 * 1000, // 1분
    maxRequests: 60,
  }),

  // AI 타로 리딩 (분당 5회)
  tarotReading: createRateLimit({
    windowMs: 60 * 1000, // 1분
    maxRequests: 5,
  }),

  // 인증 관련 (분당 10회)
  auth: createRateLimit({
    windowMs: 60 * 1000, // 1분
    maxRequests: 10,
  }),

  // 커뮤니티 포스트 작성 (분당 3회)
  communityPost: createRateLimit({
    windowMs: 60 * 1000, // 1분
    maxRequests: 3,
  }),

  // 댓글 작성 (분당 10회)
  comment: createRateLimit({
    windowMs: 60 * 1000, // 1분
    maxRequests: 10,
  }),
};

export function createRateLimitResponse(result: {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}) {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries()),
        },
      }
    );
  }

  return null; // Rate limit 통과
}