const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // API 에러 추적
  let apiError = null;
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api/') || url.includes('functions') || url.includes('tarot')) {
      console.log(`[API] ${url} - ${response.status()}`);
      
      if (response.status() >= 400) {
        try {
          const body = await response.text();
          apiError = {
            url: url,
            status: response.status(),
            body: body
          };
          console.log(`[API ERROR] ${response.status()} - ${body}`);
        } catch (e) {
          console.log(`[API ERROR] ${response.status()} - Could not read response body`);
        }
      }
    }
  });
  
  try {
    console.log('=== 타로 리딩 오류 재현 ===\n');
    
    // 1. 페이지 접속
    console.log('1. 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    console.log('2. 질문 입력...');
    await page.fill('textarea', '나의 미래는 어떻게 될까요?');
    
    // 3. 카드 섞기
    console.log('3. 카드 섞기...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 4. 카드 펼치기
    console.log('4. 카드 펼치기...');
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 5. 카드 선택 - force 옵션 사용
    console.log('5. 카드 선택 (force click)...');
    const cardElements = await page.$$('div[role="button"][aria-label*="카드"]');
    console.log(`  발견된 카드: ${cardElements.length}개`);
    
    let selectedCount = 0;
    for (let i = 0; i < cardElements.length && selectedCount < 3; i++) {
      try {
        // force 옵션으로 클릭
        await cardElements[i].click({ force: true });
        selectedCount++;
        console.log(`  카드 ${selectedCount} 선택됨`);
        await page.waitForTimeout(500);
      } catch (e) {
        console.log(`  카드 ${i + 1} 클릭 실패: ${e.message}`);
      }
    }
    
    // 스크린샷
    await page.screenshot({ path: 'cards-selected.png' });
    
    // 6. AI 해석 받기
    console.log(`\n6. AI 해석 받기 (선택된 카드: ${selectedCount}장)...`);
    
    const interpretButton = page.locator('button:has-text("AI 해석 받기")');
    if (await interpretButton.isVisible()) {
      // API 응답 대기 설정
      const responsePromise = page.waitForResponse(
        response => {
          const url = response.url();
          return url.includes('api/') || url.includes('functions') || url.includes('generate-tarot');
        },
        { timeout: 30000 }
      );
      
      await interpretButton.click();
      console.log('  버튼 클릭됨, API 응답 대기...');
      
      try {
        const response = await responsePromise;
        console.log(`\n  API 응답 받음: ${response.url()}`);
        console.log(`  상태 코드: ${response.status()}`);
      } catch (e) {
        console.log('  API 응답 타임아웃');
      }
    }
    
    // 7. 결과 대기
    await page.waitForTimeout(5000);
    
    // 8. 오류 확인
    console.log('\n7. 오류 메시지 확인...');
    
    // Toast 메시지 확인
    const toasts = await page.$$('[role="status"], [data-toast], .toast');
    for (const toast of toasts) {
      const text = await toast.textContent();
      if (text && text.trim()) {
        console.log(`\n🔔 Toast 메시지: "${text.trim()}"`);
      }
    }
    
    // Alert 메시지 확인
    const alerts = await page.$$('[role="alert"], .alert, .error-message');
    for (const alert of alerts) {
      const text = await alert.textContent();
      if (text && text.trim()) {
        console.log(`\n🚨 Alert 메시지: "${text.trim()}"`);
      }
    }
    
    // 오류 클래스 확인
    const errorElements = await page.$$('.text-red-500, .text-destructive, .error, .danger');
    for (const el of errorElements) {
      const text = await el.textContent();
      if (text && text.trim() && text.length > 10) {
        console.log(`\n❌ 오류 텍스트: "${text.trim()}"`);
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'error-reproduction.png',
      fullPage: true 
    });
    
    // API 에러 요약
    if (apiError) {
      console.log('\n=== API 에러 상세 ===');
      console.log(`URL: ${apiError.url}`);
      console.log(`상태: ${apiError.status}`);
      console.log(`응답:`);
      console.log(apiError.body);
    }
    
    console.log('\n✅ 테스트 완료');
    console.log('스크린샷 저장됨: error-reproduction.png');
    
    // 브라우저 유지
    console.log('\n브라우저를 닫으려면 Ctrl+C를 누르세요.');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('\n❌ 테스트 오류:', error.message);
    await page.screenshot({ path: 'error-reproduction.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();