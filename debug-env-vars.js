// 환경 변수 디버깅 스크립트
console.log('🔍 환경 변수 상태 확인...\n');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_USE_REAL_AUTH:', process.env.NEXT_PUBLIC_USE_REAL_AUTH);
console.log('NEXT_PUBLIC_USE_REAL_AUTH type:', typeof process.env.NEXT_PUBLIC_USE_REAL_AUTH);
console.log('NEXT_PUBLIC_USE_REAL_AUTH === "true":', process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'true');
console.log('NEXT_PUBLIC_USE_REAL_AUTH !== "true":', process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true');

console.log('\n🔥 Firebase 설정:');
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ 설정됨' : '❌ 없음');
console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ 설정됨' : '❌ 없음');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ 설정됨' : '❌ 없음');

console.log('\n🎯 Mock vs Real 조건:');
const isDev = process.env.NODE_ENV === 'development';
const useRealAuth = process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'true';
const shouldUseMock = isDev && !useRealAuth;

console.log('isDev:', isDev);
console.log('useRealAuth:', useRealAuth);
console.log('shouldUseMock:', shouldUseMock);

console.log('\n📋 결론:');
if (shouldUseMock) {
  console.log('❌ Mock Auth가 사용될 예정');
} else {
  console.log('✅ Real Firebase Auth가 사용될 예정');
}