import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin 초기화 (이미 초기화되지 않은 경우에만)
if (!getApps().length) {
  // 개발 환경에서는 Mock 모드로 실행
  if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('🔧 개발 환경: Firebase Admin Mock 모드 실행');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '인증 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    // 카카오 토큰 엔드포인트로 액세스 토큰 요청
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/auth/kakao/callback`,
        code,
        client_secret: process.env.KAKAO_CLIENT_SECRET || '', // 선택사항
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('카카오 토큰 요청 실패:', errorData);
      return NextResponse.json(
        { error: '카카오 토큰 요청 실패', details: errorData },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 사용자 정보 요청
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('카카오 사용자 정보 요청 실패:', errorData);
      return NextResponse.json(
        { error: '카카오 사용자 정보 요청 실패', details: errorData },
        { status: 400 }
      );
    }

    const userInfo = await userResponse.json();

    // 개발 환경에서 Firebase Admin이 초기화되지 않은 경우 Mock 응답
    if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('🔧 개발 환경: 카카오 로그인 Mock 응답');
      return NextResponse.json({
        customToken: 'mock-custom-token-for-development',
        message: '개발 환경에서는 Mock 토큰을 사용합니다.'
      });
    }

    // Firebase Admin Auth 가져오기
    const auth = getAuth();

    // 카카오 사용자 정보에서 Firebase 사용자 생성
    const uid = `kakao_${userInfo.id}`;
    const email = userInfo.kakao_account?.email;
    const displayName = userInfo.kakao_account?.profile?.nickname || userInfo.properties?.nickname;
    const photoURL = userInfo.kakao_account?.profile?.profile_image_url || userInfo.properties?.profile_image;

    // Firebase 사용자 생성 또는 업데이트
    try {
      await auth.updateUser(uid, {
        email,
        displayName,
        photoURL,
        emailVerified: !!email, // 카카오에서 제공하는 이메일은 검증된 것으로 간주
      });
    } catch (error: any) {
      // 사용자가 존재하지 않으면 새로 생성
      if (error.code === 'auth/user-not-found') {
        await auth.createUser({
          uid,
          email,
          displayName,
          photoURL,
          emailVerified: !!email,
        });
      } else {
        throw error;
      }
    }

    // Firebase 커스텀 토큰 생성
    const customToken = await auth.createCustomToken(uid, {
      provider: 'kakao',
      kakao_id: userInfo.id,
      email,
      displayName,
    });

    return NextResponse.json({
      customToken,
      user: {
        uid,
        email,
        displayName,
        photoURL,
        provider: 'kakao'
      }
    });

  } catch (error: any) {
    console.error('카카오 인증 처리 오류:', error);
    return NextResponse.json(
      { 
        error: '카카오 인증 처리 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}