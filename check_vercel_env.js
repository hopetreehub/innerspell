const { exec } = require('child_process');

console.log('🔍 Vercel 환경 변수 상세 확인 중...');

// Production 환경의 환경 변수 목록 가져오기
exec('npx vercel env ls production', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Vercel 환경 변수 조회 실패:', error);
    return;
  }
  
  console.log('📋 Production 환경 변수 목록:');
  console.log(stdout);
  
  if (stderr) {
    console.error('⚠️  Warning:', stderr);
  }
});