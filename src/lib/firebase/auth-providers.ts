'use client';

import { GoogleAuthProvider } from 'firebase/auth';

/**
 * Google Auth Provider 설정
 */
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

/**
 * 카카오톡 로그인을 위한 커스텀 토큰 기반 인증
 * Firebase Auth는 직접적인 카카오톡 Provider를 지원하지 않으므로
 * 카카오 로그인 후 커스텀 토큰을 생성하여 Firebase Auth에 연동
 */

// 카카오 JavaScript SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

/**
 * 카카오 SDK 초기화
 */
export const initKakaoSDK = () => {
  if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
    if (kakaoKey) {
      window.Kakao.init(kakaoKey);
      console.log('✅ 카카오 SDK 초기화 완료');
    } else {
      console.error('❌ 카카오 JavaScript Key가 설정되지 않았습니다.');
    }
  }
};

/**
 * 카카오 로그인 실행
 * Kakao SDK 2.x에서는 authorize 메서드를 사용하며, 리다이렉트 방식으로 작동
 */
export const loginWithKakao = (): void => {
  if (!window.Kakao || !window.Kakao.isInitialized()) {
    throw new Error('카카오 SDK가 초기화되지 않았습니다.');
  }

  // Kakao SDK 2.x 버전에서는 authorize 메서드 사용
  // 로그인 완료 후 redirectUri로 리다이렉트됨
  window.Kakao.Auth.authorize({
    redirectUri: window.location.origin + '/auth/kakao/callback',
  });
};

/**
 * 카카오 로그아웃
 */
export const logoutFromKakao = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      resolve(); // SDK가 없으면 그냥 완료 처리
      return;
    }

    window.Kakao.Auth.logout(() => {
      resolve();
    });
  });
};