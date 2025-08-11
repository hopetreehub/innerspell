const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // API 응답 캡처
  let apiResponse = null;
  page.on('response', async response => {
    if (response.url().includes('/api/tarot/interpret')) {
      console.log(`\n[API 응답 캡처] ${response.url()}`);
      console.log(`Status: ${response.status()} ${response.statusText()}`);
      
      try {
        const body = await response.text();
        apiResponse = {
          status: response.status(),
          statusText: response.statusText(),
          body: body
        };
        console.log(`Response Body: ${body.substring(0, 200)}...`);
      } catch (e) {
        console.log('Could not read response body');
      }
    }
  });
  
  try {
    console.log('=== 타로 리딩 오류 상태 점검 ===\n');
    
    // 1. 페이지 이동
    console.log('1. 타로 리딩 페이지 이동...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 2. 질문 입력
    console.log('2. 질문 입력...');
    await page.fill('textarea', '테스트 질문입니다');
    
    // 3. 카드 섞기
    console.log('3. 카드 섞기...');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 4. 카드 펼치기
    console.log('4. 카드 펼치기...');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    // 5. JavaScript로 카드 선택
    console.log('5. 카드 3장 선택 (JavaScript 사용)...');
    
    const selectedCount = await page.evaluate(() => {
      // 펼쳐진 카드 찾기
      const cards = document.querySelectorAll('div[role="button"][aria-label*="카드 선택"]');
      console.log(`찾은 카드 수: ${cards.length}`);
      
      let selected = 0;
      // 첫 3장 클릭
      for (let i = 0; i < cards.length && selected < 3; i++) {
        const card = cards[i];
        // 클릭 이벤트 발생
        card.click();
        selected++;
        console.log(`${i + 1}번째 카드 클릭`);
      }
      
      return selected;
    });
    
    console.log(`  - ${selectedCount}장의 카드 선택 완료`);
    await page.waitForTimeout(1000);
    
    // 선택 상태 스크린샷
    await page.screenshot({ path: 'cards-javascript-selected.png' });
    
    // 6. AI 해석 버튼 상태 확인
    console.log('\n6. AI 해석 버튼 상태 확인...');
    
    const buttonState = await page.evaluate(() => {
      const button = document.querySelector('button:has-text("AI 해석 받기")') ||
                      Array.from(document.querySelectorAll('button')).find(btn => 
                        btn.textContent.includes('AI 해석 받기')
                      );
      
      if (button) {
        return {
          exists: true,
          disabled: button.disabled,
          text: button.textContent,
          className: button.className
        };
      }
      return { exists: false };
    });
    
    console.log('버튼 상태:', buttonState);
    
    if (!buttonState.exists) {
      console.log('AI 해석 버튼을 찾을 수 없습니다!');
      return;
    }
    
    if (buttonState.disabled) {
      console.log('버튼이 비활성화 상태입니다. 카드를 더 선택해야 할 수 있습니다.');
    }
    
    // 7. AI 해석 버튼 클릭
    console.log('\n7. AI 해석 받기 버튼 클릭...');
    
    await page.evaluate(() => {
      const button = document.querySelector('button:has-text("AI 해석 받기")') ||
                      Array.from(document.querySelectorAll('button')).find(btn => 
                        btn.textContent.includes('AI 해석 받기')
                      );
      if (button && !button.disabled) {
        button.click();
        console.log('AI 해석 버튼 클릭됨');
      }
    });
    
    // 8. 응답 대기
    console.log('API 응답 대기 중... (15초)');
    await page.waitForTimeout(15000);
    
    // 9. 최종 스크린샷
    await page.screenshot({ path: 'error-recheck.png', fullPage: true });
    
    // 10. 오류 메시지 확인
    console.log('\n8. 화면 오류 메시지 확인...');
    
    const errors = await page.evaluate(() => {
      const errorMessages = [];
      
      // Toast 메시지
      const toasts = document.querySelectorAll('[data-state="open"]');
      toasts.forEach(toast => {
        const text = toast.textContent?.trim();
        if (text) errorMessages.push(`[Toast] ${text}`);
      });
      
      // 빨간색 텍스트
      const redTexts = document.querySelectorAll('.text-red-500, .text-red-600, .text-destructive');
      redTexts.forEach(el => {
        const text = el.textContent?.trim();
        if (text) errorMessages.push(`[Error Text] ${text}`);
      });
      
      // Alert 요소
      const alerts = document.querySelectorAll('[role="alert"]');
      alerts.forEach(alert => {
        const text = alert.textContent?.trim();
        if (text) errorMessages.push(`[Alert] ${text}`);
      });
      
      return errorMessages;
    });
    
    // 11. 결과 정리
    console.log('\n=== 최종 분석 결과 ===');
    
    if (apiResponse) {
      console.log('\n[API 응답 정보]');
      console.log(`- Status: ${apiResponse.status} ${apiResponse.statusText}`);
      
      if (apiResponse.status === 403) {
        console.log('⚠️  403 Forbidden - CSRF 토큰 문제 가능성');
      }
      
      if (apiResponse.body.includes('CSRF')) {
        console.log('⚠️  CSRF 토큰 오류 확인됨!');
      }
      
      console.log(`- Response: ${apiResponse.body}`);
    } else {
      console.log('\nAPI 응답을 캡처하지 못했습니다.');
    }
    
    if (errors.length > 0) {
      console.log('\n[화면에 표시된 오류]');
      errors.forEach(err => console.log(err));
    } else {
      console.log('\n화면에 표시된 오류 메시지가 없습니다.');
    }
    
    console.log('\n테스트 완료. 브라우저를 20초간 열어둡니다...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('\n테스트 실행 중 오류:', error.message);
    await page.screenshot({ path: 'script-error.png' });
  }
  
  await browser.close();
})();