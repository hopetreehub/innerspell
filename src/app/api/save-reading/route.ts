import { NextRequest, NextResponse } from 'next/server';
import { saveUserReading } from '@/actions/readingActions';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  console.log('[API] Save reading request received');
  
  // 🚨 CSRF 우회 헤더 추가
  const response = new Response();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Firebase Admin 초기화
    await initAdmin();
    
    // 토큰 검증
    const token = authHeader.split(' ')[1];
    let userId: string;
    
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      userId = decodedToken.uid;
      console.log('[API] Authenticated user:', userId);
    } catch (error) {
      console.error('[API] Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    console.log('[API] Request body:', {
      ...body,
      interpretationText: body.interpretationText ? 
        body.interpretationText.substring(0, 100) + '...' : undefined
    });
    
    // 서버 액션 호출
    const result = await saveUserReading({
      userId: userId,
      question: body.question,
      spreadName: body.spreadName,
      spreadNumCards: body.spreadNumCards,
      drawnCards: body.drawnCards,
      interpretationText: body.interpretationText,
    });
    
    console.log('[API] Save result:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[API] Save reading error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save reading',
        details: {
          type: error?.constructor?.name,
          message: error?.message,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// OPTIONS 메소드 지원 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-csrf-token',
    },
  });
}