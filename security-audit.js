const fs = require('fs');

console.log('🔒 보안 설정 검토\n');

// .env 파일들 읽기
const envLocal = fs.readFileSync('.env.local', 'utf8');
const envProd = fs.readFileSync('.env.production.local', 'utf8');

console.log('🔍 보안 이슈 체크:\n');

// 1. 개발 환경 인증 정보 체크
const devCredentials = [
  'NEXT_PUBLIC_DEV_ADMIN_EMAIL',
  'NEXT_PUBLIC_DEV_ADMIN_PASSWORD'
];

console.log('1. 개발 환경 인증 정보:');
devCredentials.forEach(key => {
  const inLocal = envLocal.includes(key);
  const inProd = envProd.includes(key);
  
  console.log(`   ${key}:`);
  console.log(`     - .env.local: ${inLocal ? '✅ 존재' : '❌ 없음'}`);
  console.log(`     - .env.production.local: ${inProd ? '❌ 보안 위험' : '✅ 제외됨'}`);
});

// 2. API 키 강도 체크
console.log('\n2. API 키 보안 강도:');

const checkApiKeyStrength = (key, value) => {
  const hasNumbers = /\d/.test(value);
  const hasLetters = /[a-zA-Z]/.test(value);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
  const isLongEnough = value.length >= 20;
  const notDefault = !value.includes('dev') && !value.includes('12345');
  
  const score = [hasNumbers, hasLetters, hasSpecialChars, isLongEnough, notDefault]
    .filter(Boolean).length;
  
  const strength = score >= 4 ? '강함' : score >= 3 ? '보통' : '약함';
  const status = score >= 3 ? '✅' : '⚠️';
  
  console.log(`   ${key}: ${status} ${strength} (점수: ${score}/5)`);
  
  if (!notDefault) console.log(`     - ⚠️  기본값 사용 중 - 변경 필요`);
  if (!isLongEnough) console.log(`     - ⚠️  길이 부족 (현재: ${value.length}, 권장: 20+)`);
};

// .env.local API 키들
const localApiKeys = envLocal.match(/(?:API_KEY|SECRET_KEY)=(.+)/g) || [];
console.log('   개발 환경:');
localApiKeys.forEach(line => {
  const [key, value] = line.split('=');
  checkApiKeyStrength(key, value);
});

// .env.production.local API 키들  
const prodApiKeys = envProd.match(/(?:API_KEY|SECRET_KEY)=(.+)/g) || [];
console.log('   프로덕션 환경:');
prodApiKeys.forEach(line => {
  const [key, value] = line.split('=');
  checkApiKeyStrength(key, value);
});

// 3. Firebase 설정 체크
console.log('\n3. Firebase 설정:');
const firebaseKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

firebaseKeys.forEach(key => {
  const localMatch = envLocal.match(new RegExp(key + '=(.+)'));
  const prodMatch = envProd.match(new RegExp(key + '=(.+)'));
  
  if (localMatch && prodMatch) {
    const localValue = localMatch[1];
    const prodValue = prodMatch[1];
    const consistent = localValue === prodValue;
    
    console.log(`   ${key}: ${consistent ? '✅' : '❌'} ${consistent ? '일관됨' : '불일치'}`);
  }
});

// 4. 보안 헤더 체크 (next.config.js)
console.log('\n4. 보안 헤더 설정:');
if (fs.existsSync('next.config.js')) {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  const hasSecurityHeaders = nextConfig.includes('X-Frame-Options') || 
                           nextConfig.includes('X-Content-Type-Options') ||
                           nextConfig.includes('X-XSS-Protection');
  
  console.log(`   보안 헤더: ${hasSecurityHeaders ? '✅ 설정됨' : '❌ 설정 필요'}`);
} else {
  console.log('   next.config.js: ❌ 파일 없음');
}

// 5. .gitignore 체크
console.log('\n5. .gitignore 설정:');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const envIgnored = gitignore.includes('.env.local') || gitignore.includes('.env*.local');
  
  console.log(`   환경 변수 파일: ${envIgnored ? '✅ 무시됨' : '❌ 노출 위험'}`);
} else {
  console.log('   .gitignore: ❌ 파일 없음');
}

console.log('\n📋 보안 권장사항:');
console.log('   1. 프로덕션 API 키들을 강력한 랜덤 문자열로 교체');
console.log('   2. Firebase 서비스 계정 키를 실제 키로 교체');
console.log('   3. 개발 환경 인증 정보가 프로덕션에 포함되지 않도록 확인');
console.log('   4. next.config.js에 보안 헤더 추가 검토');
console.log('   5. 환경 변수 파일이 Git에 커밋되지 않도록 확인');