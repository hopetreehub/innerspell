import { NextRequest, NextResponse } from 'next/server';
import { generateTarotInterpretation } from '@/ai/flows/generate-tarot-interpretation';

export async function GET(request: NextRequest) {
  console.log('[TEST-TAROT] ========== TAROT TEST START ==========');
  
  // 보안을 위해 프로덕션에서는 특정 쿼리 파라미터가 있을 때만 동작
  const debugKey = request.nextUrl.searchParams.get('key');
  if (process.env.NODE_ENV === 'production' && debugKey !== 'debug-innerspell-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 테스트용 간단한 타로 해석 요청
  const testInput = {
    question: "테스트 질문: 오늘의 운세는 어떨까요?",
    cardSpread: "1-card",
    cardInterpretations: "The Fool (정방향) - 새로운 시작, 모험, 순수함",
    isGuestUser: false,
    spreadId: "1-card",
    styleId: "traditional"
  };
  
  const testResult = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    testInput,
    result: null,
    error: null,
    success: false
  };
  
  try {
    console.log('[TEST-TAROT] Starting tarot interpretation test...');
    const startTime = Date.now();
    
    const result = await generateTarotInterpretation(testInput);
    
    const duration = Date.now() - startTime;
    
    testResult.result = {
      interpretation: result.interpretation,
      interpretationLength: result.interpretation.length,
      duration: `${duration}ms`,
      success: true
    };
    testResult.success = true;
    
    console.log('[TEST-TAROT] Test successful:', {
      duration,
      interpretationLength: result.interpretation.length
    });
    
  } catch (error) {
    console.error('[TEST-TAROT] Test failed:', error);
    testResult.error = {
      message: error?.message || 'Unknown error',
      type: error?.constructor?.name || 'UnknownError',
      stack: error?.stack
    };
    testResult.success = false;
  }
  
  console.log('[TEST-TAROT] ========== TAROT TEST END ==========');
  
  return NextResponse.json(testResult, {
    status: testResult.success ? 200 : 500,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}