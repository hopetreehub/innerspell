const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // API 응답 모니터링
  page.on('response', async response => {
    const url = response.url();
    
    // API 호출 로깅
    if (url.includes('/api/')) {
      console.log(`\n[API 호출] ${new Date().toLocaleTimeString()}`);
      console.log(`URL: ${url}`);
      console.log(`Method: ${response.request().method()}`);
      console.log(`Status: ${response.status()} ${response.statusText()}`);
      
      // 헤더 정보
      const requestHeaders = response.request().headers();
      console.log('\n요청 헤더:');
      if (requestHeaders['x-csrf-token']) {
        console.log(`  X-CSRF-Token: ${requestHeaders['x-csrf-token']}`);
      }
      if (requestHeaders['cookie']) {
        console.log(`  Cookie: ${requestHeaders['cookie'].substring(0, 50)}...`);
      }
      
      // 타로 해석 API인 경우 상세 정보
      if (url.includes('/api/tarot/interpret')) {
        console.log('\n🎯 타로 해석 API 호출 감지!');
        
        try {
          const responseBody = await response.text();
          console.log('\n응답 내용:');
          console.log(responseBody.substring(0, 500));
          
          if (response.status() === 403) {
            console.log('\n🚨 403 FORBIDDEN - CSRF 토큰 검증 실패!');
            if (responseBody.includes('CSRF') || responseBody.includes('csrf')) {
              console.log('CSRF 관련 오류 메시지 확인됨');
            }
          } else if (response.status() === 200) {
            console.log('\n✅ API 호출 성공!');
          }
        } catch (e) {
          console.log('응답 본문 읽기 실패:', e.message);
        }
      }
    }
  });
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`\n[브라우저 콘솔 에러] ${msg.text()}`);
    }
  });
  
  console.log('=== API 모니터링 시작 ===\n');
  console.log('1. 타로 리딩 페이지로 이동합니다...');
  
  await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
  
  console.log('\n✅ 페이지 로드 완료');
  console.log('\n📌 수동 테스트 안내:');
  console.log('1. 질문을 입력하세요');
  console.log('2. "카드 섞기" 버튼을 클릭하세요');
  console.log('3. "카드 펼치기" 버튼을 클릭하세요');
  console.log('4. 카드 3장을 선택하세요');
  console.log('5. "AI 해석 받기" 버튼을 클릭하세요');
  console.log('\n⏳ API 호출을 모니터링하고 있습니다...');
  console.log('(테스트를 마치려면 Ctrl+C를 누르세요)\n');
  
  // 무한 대기
  await new Promise(() => {});
})();