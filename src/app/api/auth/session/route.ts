import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

// 세션 쿠키 생성 API
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }
    
    // ID 토큰 검증
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // 세션 쿠키 생성 (7일)
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    // 쿠키 설정
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    const response = NextResponse.json({ 
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
      timestamp: Date.now() // Cache busting
    });
    
    // EMERGENCY: No caching for auth responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Auth-Response', 'no-cache');
    
    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}

// 세션 검증 API
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // 세션 쿠키 검증
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);
    
    const response = NextResponse.json({
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
      },
      timestamp: Date.now() // Cache busting
    });
    
    // EMERGENCY: No caching for auth responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Auth-Response', 'no-cache');
    
    return response;
  } catch (error) {
    const errorResponse = NextResponse.json({ 
      authenticated: false, 
      timestamp: Date.now() // Cache busting
    }, { status: 401 });
    
    // EMERGENCY: No caching for auth errors
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
}

// 로그아웃 API
export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  
  const response = NextResponse.json({ 
    success: true, 
    timestamp: Date.now() // Cache busting
  });
  
  // EMERGENCY: No caching for logout
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
  
  return response;
}