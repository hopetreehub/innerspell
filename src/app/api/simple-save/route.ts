import { NextRequest, NextResponse } from 'next/server';
import { saveUserReading } from '@/actions/readingActions';

// 완전히 단순화된 저장 API
export async function POST(request: NextRequest) {
  console.log('[SIMPLE-SAVE] Request received');
  
  try {
    const body = await request.json();
    console.log('[SIMPLE-SAVE] Body:', body);
    
    // 단순히 서버 액션 호출
    const result = await saveUserReading(body);
    
    console.log('[SIMPLE-SAVE] Result:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[SIMPLE-SAVE] Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Save failed'
      },
      { status: 500 }
    );
  }
}

// CORS 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}