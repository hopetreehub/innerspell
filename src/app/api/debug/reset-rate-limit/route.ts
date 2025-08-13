import { NextRequest, NextResponse } from 'next/server';

// Rate Limiter 상태를 초기화하는 디버그 API
export async function POST(request: NextRequest) {
  try {
    // 개발 환경에서만 허용
    if (process.env.NODE_ENV !== 'development' && process.env.VERCEL_ENV !== 'preview') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development/preview' },
        { status: 403 }
      );
    }

    // Rate Limiter 모듈 동적 import
    const { getRateLimitStats } = await import('@/ai/services/ai-rate-limiter');
    
    // 현재 상태 확인
    const beforeStats = getRateLimitStats();
    console.log('[DEBUG] Rate limit stats before reset:', beforeStats);
    
    // 메모리 기반 rate limiter 초기화를 위해 모듈 재로드
    // 실제로는 각 rate limiter의 requests 배열을 직접 초기화해야 함
    
    return NextResponse.json({
      success: true,
      message: 'Rate limit 상태를 확인했습니다.',
      beforeStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[DEBUG] Reset rate limit error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to reset rate limit',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { getRateLimitStats } = await import('@/ai/services/ai-rate-limiter');
    
    const stats = getRateLimitStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get rate limit stats' },
      { status: 500 }
    );
  }
}