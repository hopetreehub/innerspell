import { NextRequest, NextResponse } from 'next/server';
import { getAI } from '@/ai/genkit';

export async function GET(request: NextRequest) {
  console.log('[DEBUG-ENV] ========== ENVIRONMENT CHECK START ==========');
  
  // 보안을 위해 프로덕션에서는 특정 쿼리 파라미터가 있을 때만 동작
  const debugKey = request.nextUrl.searchParams.get('key');
  if (process.env.NODE_ENV === 'production' && debugKey !== 'debug-innerspell-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const environmentInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
    },
    apiKeys: {
      // API 키 존재 여부만 표시 (보안)
      GOOGLE_API_KEY: {
        exists: !!process.env.GOOGLE_API_KEY,
        length: process.env.GOOGLE_API_KEY?.length || 0,
        prefix: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 10) + '...' : 'NOT SET'
      },
      GEMINI_API_KEY: {
        exists: !!process.env.GEMINI_API_KEY,
        length: process.env.GEMINI_API_KEY?.length || 0,
        prefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT SET'
      },
      OPENAI_API_KEY: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        prefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'NOT SET'
      },
      ANTHROPIC_API_KEY: {
        exists: !!process.env.ANTHROPIC_API_KEY,
        length: process.env.ANTHROPIC_API_KEY?.length || 0,
        prefix: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 7) + '...' : 'NOT SET'
      },
      ENCRYPTION_KEY: {
        exists: !!process.env.ENCRYPTION_KEY,
        length: process.env.ENCRYPTION_KEY?.length || 0,
      },
      FIREBASE_SERVICE_ACCOUNT_KEY: {
        exists: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        length: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
        isJson: false
      }
    },
    publicVars: {
      NEXT_PUBLIC_FIREBASE_API_KEY: {
        exists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        prefix: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10) + '...' : 'NOT SET'
      },
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET',
      NEXT_PUBLIC_USE_REAL_AUTH: process.env.NEXT_PUBLIC_USE_REAL_AUTH || 'NOT SET',
    }
  };
  
  // Firebase 서비스 계정 키가 올바른 JSON인지 확인
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      environmentInfo.apiKeys.FIREBASE_SERVICE_ACCOUNT_KEY.isJson = true;
    } catch (e) {
      environmentInfo.apiKeys.FIREBASE_SERVICE_ACCOUNT_KEY.isJson = false;
    }
  }
  
  // AI 초기화 테스트
  let aiInitTest = {
    success: false,
    error: null,
    hasInstance: false
  };
  
  try {
    console.log('[DEBUG-ENV] Testing AI initialization...');
    const ai = await getAI();
    aiInitTest.success = true;
    aiInitTest.hasInstance = !!ai;
    console.log('[DEBUG-ENV] AI initialization successful');
  } catch (error) {
    console.error('[DEBUG-ENV] AI initialization failed:', error);
    aiInitTest.error = error?.message || 'Unknown error';
  }
  
  const response = {
    ...environmentInfo,
    aiInitTest,
    recommendations: []
  };
  
  // 권장사항 추가
  if (!environmentInfo.apiKeys.GOOGLE_API_KEY.exists && !environmentInfo.apiKeys.OPENAI_API_KEY.exists) {
    response.recommendations.push('⚠️ No AI API keys found! Set either GOOGLE_API_KEY or OPENAI_API_KEY in Vercel environment variables.');
  }
  
  if (!environmentInfo.apiKeys.ENCRYPTION_KEY.exists) {
    response.recommendations.push('⚠️ ENCRYPTION_KEY is not set. This may cause issues with encrypted data.');
  }
  
  if (!environmentInfo.apiKeys.FIREBASE_SERVICE_ACCOUNT_KEY.exists) {
    response.recommendations.push('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not work.');
  } else if (!environmentInfo.apiKeys.FIREBASE_SERVICE_ACCOUNT_KEY.isJson) {
    response.recommendations.push('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Make sure to stringify the JSON properly.');
  }
  
  console.log('[DEBUG-ENV] Environment check complete:', response);
  console.log('[DEBUG-ENV] ========== ENVIRONMENT CHECK END ==========');
  
  return NextResponse.json(response, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}
// Force rebuild Wed Aug 13 06:59:44 KST 2025
