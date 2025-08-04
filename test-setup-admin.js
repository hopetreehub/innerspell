const fetch = require('node-fetch');

async function setupAdmin() {
  console.log('관리자 계정 설정 시작...');
  
  try {
    // Vercel 배포된 앱에 요청
    const response = await fetch('https://test-studio-firebase.vercel.app/api/setup-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secretKey: 'setup-innerspell-admin-2024'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 성공:', result.message);
      console.log('\n📋 관리자 계정 정보:');
      console.log('이메일:', result.email);
      console.log('비밀번호:', result.password);
    } else {
      console.error('❌ 오류:', result.error);
    }
  } catch (error) {
    console.error('❌ 요청 실패:', error.message);
  }
}

setupAdmin();