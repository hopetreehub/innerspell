const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // API 응답 캡처
  let apiError = null;
  page.on('response', async response => {
    if (response.url().includes('/api/tarot/interpret')) {
      console.log(`\n[API 응답] ${response.url()}`);
      console.log(`Status: ${response.status()} ${response.statusText()}`);
      
      if (response.status() >= 400) {
        try {
          const body = await response.text();
          apiError = {
            status: response.status(),
            statusText: response.statusText(),
            body: body
          };
          console.log(`Error Body: ${body}`);
        } catch (e) {
          console.log('Could not read error body');
        }
      }
    }
  });
  
  // 콘솔 에러 캡처
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[콘솔 에러] ${msg.text()}`);
    }
  });
  
  try {
    console.log('=== 타로 리딩 CSRF 오류 점검 ===\n');
    
    // 1. 페이지 이동
    console.log('1. 타로 리딩 페이지 이동...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    console.log('2. 질문 입력...');
    await page.fill('textarea', '테스트 질문입니다');
    
    // 3. 카드 섞기
    console.log('3. 카드 섞기 클릭...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 4. 카드 펼치기
    console.log('4. 카드 펼치기 클릭...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    // 5. 카드가 펼쳐졌는지 확인
    const spreadCards = await page.$$('.flex.gap-4 > div[role="button"]');
    console.log(`펼쳐진 카드 수: ${spreadCards.length}`);
    
    if (spreadCards.length === 0) {
      // 다른 선택자로 시도
      const altCards = await page.$$('div[aria-label*="카드 선택"]');
      console.log(`대체 선택자로 찾은 카드 수: ${altCards.length}`);
      
      // 첫 3장 선택
      for (let i = 0; i < 3 && i < altCards.length; i++) {
        await altCards[i].click();
        console.log(`  - ${i + 1}번째 카드 선택`);
        await page.waitForTimeout(500);
      }
    } else {
      // 카드 3장 선택
      for (let i = 0; i < 3 && i < spreadCards.length; i++) {
        await spreadCards[i].click();
        console.log(`  - ${i + 1}번째 카드 선택`);
        await page.waitForTimeout(500);
      }
    }
    
    // 선택 확인 스크린샷
    await page.screenshot({ path: 'cards-selected-final.png' });
    
    // 6. AI 해석 버튼 찾기 및 클릭
    console.log('\n6. AI 해석 받기 버튼 클릭...');
    
    // 버튼이 활성화될 때까지 대기
    await page.waitForSelector('button:has-text("AI 해석 받기"):not([disabled])', { 
      timeout: 5000 
    });
    
    // 네트워크 탭 열기 (디버깅용)
    await page.evaluate(() => {
      console.log('AI 해석 요청 시작...');
    });
    
    // 버튼 클릭
    await page.click('button:has-text("AI 해석 받기")');
    console.log('버튼 클릭 완료, 응답 대기 중...');
    
    // 7. 응답 대기 (최대 15초)
    await page.waitForTimeout(15000);
    
    // 8. 최종 스크린샷
    await page.screenshot({ path: 'error-recheck.png', fullPage: true });
    
    // 9. 화면의 오류 메시지 찾기
    console.log('\n화면 오류 메시지 확인...');
    const errorTexts = await page.evaluate(() => {
      const errors = [];
      
      // 다양한 오류 표시 요소 찾기
      const errorElements = document.querySelectorAll(
        '.text-red-500, .text-red-600, .bg-red-50, .bg-destructive, .toast-error, [role="alert"]'
      );
      
      errorElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text) errors.push(text);
      });
      
      // Toast 메시지 확인
      const toasts = document.querySelectorAll('[data-radix-collection-item], [role="status"]');
      toasts.forEach(toast => {
        const text = toast.textContent?.trim();
        if (text && (text.includes('오류') || text.includes('실패') || text.includes('Error'))) {
          errors.push(text);
        }
      });
      
      return errors;
    });
    
    // 10. 결과 출력
    console.log('\n=== 분석 결과 ===');
    
    if (apiError) {
      console.log('\n[API 오류 상세]');
      console.log(`Status: ${apiError.status} ${apiError.statusText}`);
      console.log(`Body: ${apiError.body}`);
      
      // CSRF 오류인지 확인
      if (apiError.body.includes('CSRF') || apiError.status === 403) {
        console.log('\n⚠️  CSRF 토큰 오류 확인됨!');
      }
    }
    
    if (errorTexts.length > 0) {
      console.log('\n[화면 오류 메시지]');
      errorTexts.forEach(text => console.log(` - ${text}`));
    }
    
    console.log('\n브라우저를 열어두었습니다. 수동으로 확인 후 닫아주세요.');
    
    // 대기
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n테스트 중 오류:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  }
  
  await browser.close();
})();