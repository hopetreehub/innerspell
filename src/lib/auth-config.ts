/**
 * 인증 설정 - 개발/프로덕션 환경 구분
 */

export const authConfig = {
  // 실제 Firebase Auth 사용 여부
  useRealAuth: process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'true' || process.env.NODE_ENV === 'production',
  
  // 세션 설정
  session: {
    maxAge: 60 * 60 * 24 * 7, // 7일
    updateAge: 60 * 60 * 24, // 24시간마다 갱신
  },
  
  // 보안 설정
  security: {
    requireEmailVerification: process.env.NODE_ENV === 'production',
    allowedDomains: process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || [],
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15분
  },
  
  // 리다이렉트 설정
  redirects: {
    afterLogin: '/profile',
    afterLogout: '/',
    afterSignUp: '/finish-sign-in',
    unauthorized: '/sign-in',
  }
};

export function isProductionAuth(): boolean {
  return authConfig.useRealAuth;
}

export function shouldVerifyEmail(): boolean {
  return authConfig.security.requireEmailVerification;
}