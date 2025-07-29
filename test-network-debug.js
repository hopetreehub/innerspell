const { chromium } = require('@playwright/test');

(async () => {
  const url = 'https://test-studio-firebase.vercel.app';
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 네트워크 요청 모니터링
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData()
    });
    
    if (request.url().includes('interpretation') || request.url().includes('ai') || request.url().includes('generate')) {
      console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
      if (request.postData()) {
        console.log(`📝 POST DATA: ${request.postData().substring(0, 200)}...`);
      }
    }
  });
  
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers()
    });
    
    if (response.url().includes('interpretation') || response.url().includes('ai') || response.url().includes('generate')) {
      console.log(`📡 RESPONSE: ${response.status()} ${response.url()}`);
    }
    
    if (response.status() >= 400) {
      console.log(`🚫 HTTP ERROR: ${response.status()} ${response.url()}`);
    }
  });
  
  // 콘솔 메시지 캐치
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('TAROT') || msg.text().includes('interpretation')) {
      console.log(`🖥️ CONSOLE ${msg.type()}: ${msg.text()}`);
    }
  });
  
  // 페이지 에러 캐치
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });
  
  try {
    console.log('🔍 네트워크 디버그 모드로 AI 해석 테스트');
    
    await page.goto(url);
    await page.waitForTimeout(3000);
    
    // 타로 리딩 페이지로 이동
    const readingLink = page.locator('a[href="/reading"]').first();
    await readingLink.click();
    await page.waitForTimeout(3000);
    
    // 질문 입력
    const questionTextarea = page.locator('textarea');
    await questionTextarea.fill('내가 앞으로 어떤 방향으로 나아가야 할까요?');
    await page.waitForTimeout(1000);
    
    // 카드 섞기
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(3000);
    
    // 카드 펼치기
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(5000);
    
    // 3장 카드 선택
    for (let i = 0; i < 3; i++) {
      const card = page.locator('div[role="button"]').nth(i);
      await card.click({ force: true });
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({
      path: `screenshots/network-debug-01-ready-${Date.now()}.png`,
      fullPage: true
    });
    
    console.log('\n🎯 AI 해석 버튼 클릭 및 네트워크 모니터링 시작');
    
    const aiButton = page.locator('button:has-text("AI 해석 받기")');
    
    // 클릭 전 요청 수
    const requestCountBefore = requests.length;
    console.log(`클릭 전 총 요청 수: ${requestCountBefore}`);
    
    await aiButton.click();
    
    console.log('🖱️ AI 해석 버튼 클릭 완료. 네트워크 활동 관찰 중...');
    
    // 30초간 네트워크 활동 관찰
    const startTime = Date.now();
    const maxWaitTime = 30000;
    
    let aiRequestFound = false;
    let aiResponse = null;
    
    while (Date.now() - startTime < maxWaitTime) {
      await page.waitForTimeout(1000);
      
      // 새로운 요청 확인
      const currentRequestCount = requests.length;
      if (currentRequestCount > requestCountBefore) {
        const newRequests = requests.slice(requestCountBefore);
        
        for (const req of newRequests) {
          if (req.url.includes('api') || req.url.includes('interpretation') || req.url.includes('ai') || req.url.includes('generate')) {
            aiRequestFound = true;
            console.log(`🎯 AI 관련 요청 발견: ${req.method} ${req.url}`);
          }
        }
      }
      
      // 응답 확인
      const aiResponses = responses.filter(res => 
        res.url.includes('api') && (
          res.url.includes('interpretation') || 
          res.url.includes('ai') || 
          res.url.includes('generate')
        )
      );
      
      if (aiResponses.length > 0) {
        aiResponse = aiResponses[aiResponses.length - 1];
        console.log(`🎯 AI 관련 응답: ${aiResponse.status} ${aiResponse.url}`);
        break;
      }
      
      // 다이얼로그 확인
      const dialogVisible = await page.locator('[role="dialog"], [data-radix-dialog-content]').isVisible().catch(() => false);
      if (dialogVisible) {
        console.log('✅ 다이얼로그가 나타났습니다!');
        break;
      }
    }
    
    await page.screenshot({
      path: `screenshots/network-debug-02-after-wait-${Date.now()}.png`,
      fullPage: true
    });
    
    // 결과 분석
    console.log('\n📊 네트워크 디버그 결과:');
    console.log('='.repeat(50));
    console.log(`총 요청 수: ${requests.length}`);
    console.log(`AI 관련 요청 발견: ${aiRequestFound}`);
    
    if (aiResponse) {
      console.log(`AI 응답 상태: ${aiResponse.status}`);
      if (aiResponse.status >= 400) {
        console.log('❌ AI 요청이 실패했습니다.');
      } else {
        console.log('✅ AI 요청이 성공했습니다.');
      }
    } else {
      console.log('❌ AI 관련 네트워크 요청을 찾을 수 없습니다.');
    }
    
    // 최근 요청들 출력
    console.log('\n최근 5개 요청:');
    const recentRequests = requests.slice(-5);
    recentRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`);
    });
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({
      path: `screenshots/network-debug-error-${Date.now()}.png`,
      fullPage: true
    });
  } finally {
    console.log('\n🏁 네트워크 디버그 완료. 5초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();