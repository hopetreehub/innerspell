// Quick API Test for AI Model Fix
const https = require('https');

function testAPI() {
  console.log('🔬 간단 API 테스트 시작');
  console.log('========================\n');
  
  const postData = JSON.stringify({
    question: '오늘의 운세는 어떤가요?',
    cardSpread: '1장 뽑기',
    selectedCards: ['the-fool']
  });
  
  const options = {
    hostname: 'test-studio-firebase.vercel.app',
    port: 443,
    path: '/api/tarot/generate-interpretation',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('API 요청 전송 중...');
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers['content-type']);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== API 응답 ===');
      try {
        const response = JSON.parse(data);
        
        if (data.includes('NOT_FOUND') || data.includes('gpt-3.5-turbo')) {
          console.log('❌ 모델 오류 여전히 존재:');
          console.log(data);
        } else if (response.success && response.interpretation) {
          console.log('✅ AI 해석 성공!');
          console.log('해석 길이:', response.interpretation.length, '자');
          console.log('모델 오류 해결됨!');
        } else {
          console.log('⚠️ 응답 구조 확인 필요:');
          console.log(JSON.stringify(response, null, 2));
        }
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('Request error:', e);
  });
  
  req.write(postData);
  req.end();
}

testAPI();