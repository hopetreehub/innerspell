const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 네트워크 요청 상세 추적
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api/generate-tarot') || url.includes('/reading')) {
      console.log(`\n📤 REQUEST: ${request.method()} ${url}`);
      if (request.postData()) {
        console.log('📝 POST Data:', request.postData().substring(0, 300));
      }
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api/generate-tarot') || (url.includes('/reading') && response.status() !== 200)) {
      console.log(`\n📥 RESPONSE: ${response.status()} ${url}`);
      try {
        const body = await response.text();
        console.log('📄 Response:', body.substring(0, 500));
      } catch (e) {}
    }
  });
  
  // 콘솔 에러
  page.on('console', msg => {
    if (msg.text().includes('error') || msg.text().includes('Error')) {
      console.log(`\n🔴 CONSOLE: ${msg.text()}`);
    }
  });
  
  try {
    console.log('=== 최종 디버깅 테스트 ===\n');
    
    // 페이지 접속
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // 빠른 플로우 실행
    console.log('타로 리딩 플로우 실행...');
    
    // 1. 질문 입력
    await page.fill('textarea', '테스트 질문');
    
    // 2. 카드 섞기
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 3. 카드 펼치기
    try {
      await page.click('button:has-text("카드 펼치기")');
      await page.waitForTimeout(2000);
    } catch (e) {}
    
    // 4. 카드 3장 선택
    const cards = await page.$$('div[role="button"][aria-label*="카드"]');
    for (let i = 0; i < 3 && i < cards.length; i++) {
      await cards[i].click({ force: true });
      await page.waitForTimeout(300);
    }
    
    console.log('\n🎯 AI 해석 받기 버튼 클릭...');
    
    // 5. AI 해석 받기
    await page.click('button:has-text("AI 해석 받기")');
    
    // 60초 대기
    console.log('API 응답 대기 중...');
    
    // 주기적으로 상태 확인
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(5000);
      
      // 버튼 상태 확인
      const interpretButton = await page.$('button:has-text("해석 중")');
      if (interpretButton) {
        const isDisabled = await interpretButton.isDisabled();
        console.log(`⏳ ${5 * (i + 1)}초 경과: 버튼 상태 = 해석 중... (disabled: ${isDisabled})`);
      } else {
        console.log(`⏳ ${5 * (i + 1)}초 경과: 해석 중 버튼이 사라짐`);
        break;
      }
      
      // 오류나 결과 확인
      const alerts = await page.$$('[role="alert"], .toast, [data-sonner-toast]');
      for (const alert of alerts) {
        const text = await alert.textContent();
        if (text && text.trim()) {
          console.log(`📢 알림: ${text.trim()}`);
        }
      }
    }
    
    // 최종 상태
    console.log('\n=== 최종 상태 ===');
    
    // 해석 결과 확인
    const interpretationElements = await page.$$('[class*="interpretation"], [class*="result"]');
    if (interpretationElements.length > 0) {
      console.log('✅ 해석 결과가 표시됨');
    } else {
      console.log('❌ 해석 결과가 표시되지 않음');
    }
    
    // 스크린샷
    await page.screenshot({ path: 'error-reproduction.png', fullPage: true });
    
    console.log('\n테스트 완료. 브라우저를 닫으려면 Ctrl+C를 누르세요.');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('테스트 오류:', error);
  } finally {
    await browser.close();
  }
})();