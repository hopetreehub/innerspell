const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // API 응답 모니터링
  let interpretResponse = null;
  page.on('response', async response => {
    if (response.url().includes('/api/tarot/interpret')) {
      console.log(`\n🔍 [API 호출 감지]`);
      console.log(`URL: ${response.url()}`);
      console.log(`Status: ${response.status()} ${response.statusText()}`);
      console.log(`Headers:`, response.headers());
      
      try {
        const body = await response.text();
        interpretResponse = {
          status: response.status(),
          statusText: response.statusText(),
          body: body,
          headers: response.headers()
        };
        
        console.log(`\nResponse Body (첫 500자):`);
        console.log(body.substring(0, 500));
        
        if (response.status() === 403) {
          console.log('\n🚨 403 FORBIDDEN - CSRF 토큰 문제 확인!');
        }
      } catch (e) {
        console.log('응답 본문 읽기 실패');
      }
    }
  });
  
  try {
    console.log('=== 타로 리딩 CSRF 오류 점검 ===\n');
    
    // 1. 페이지 이동
    console.log('1. 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 2. 질문 입력
    console.log('2. 질문 입력...');
    await page.fill('textarea', '테스트 질문입니다');
    
    // 3. 카드 섞기
    console.log('3. 카드 섞기...');
    await page.click('button:text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 4. 카드 펼치기
    console.log('4. 카드 펼치기...');
    await page.click('button:text("카드 펼치기")');
    await page.waitForTimeout(3000);
    
    // 5. 카드 선택
    console.log('5. 카드 3장 선택...');
    const cards = await page.$$('div[role="button"][aria-label*="카드 선택"]');
    for (let i = 0; i < 3 && i < cards.length; i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    console.log(`  - ${Math.min(3, cards.length)}장 선택 완료`);
    
    // 6. 페이지 스크롤하여 AI 해석 버튼 찾기
    console.log('\n6. AI 해석 버튼 찾기...');
    
    // 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // 버튼 찾기
    const interpretButton = await page.$('button:text("AI 해석 받기")');
    if (!interpretButton) {
      console.log('❌ AI 해석 버튼을 찾을 수 없습니다.');
      
      // 모든 버튼 텍스트 출력
      const allButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(btn => btn.textContent.trim());
      });
      console.log('\n페이지의 모든 버튼:', allButtons);
      
      // 전체 페이지 스크린샷
      await page.screenshot({ path: 'full-page-no-button.png', fullPage: true });
      return;
    }
    
    console.log('✅ AI 해석 버튼 발견');
    
    // 7. 버튼이 보이도록 스크롤
    await interpretButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // 8. 버튼 클릭
    console.log('\n7. AI 해석 받기 버튼 클릭...');
    await interpretButton.click();
    console.log('✅ 클릭 완료, API 응답 대기 중...');
    
    // 9. 응답 대기
    await page.waitForTimeout(10000);
    
    // 10. 최종 스크린샷
    console.log('\n8. 최종 상태 캡처...');
    await page.screenshot({ path: 'error-recheck.png', fullPage: true });
    
    // 11. 화면 오류 확인
    const errors = await page.evaluate(() => {
      const errorMessages = [];
      
      // Toast 메시지
      document.querySelectorAll('[role="status"]').forEach(el => {
        const text = el.textContent?.trim();
        if (text) errorMessages.push(`[Toast] ${text}`);
      });
      
      // 오류 텍스트
      document.querySelectorAll('.text-red-500, .text-destructive').forEach(el => {
        const text = el.textContent?.trim();
        if (text) errorMessages.push(`[Error] ${text}`);
      });
      
      return errorMessages;
    });
    
    // 12. 결과 출력
    console.log('\n\n=== 📊 분석 결과 ===');
    
    if (interpretResponse) {
      console.log('\n[API 응답 정보]');
      console.log(`Status: ${interpretResponse.status} ${interpretResponse.statusText}`);
      
      if (interpretResponse.status === 403 || interpretResponse.body.includes('CSRF')) {
        console.log('\n🚨 CSRF 토큰 오류 발생!');
        console.log('오류 내용:', interpretResponse.body);
      } else if (interpretResponse.status === 200) {
        console.log('✅ API 호출 성공!');
      }
    } else {
      console.log('\n❓ API 호출이 발생하지 않았습니다.');
    }
    
    if (errors.length > 0) {
      console.log('\n[화면 오류]');
      errors.forEach(err => console.log(err));
    }
    
    console.log('\n\n브라우저를 20초간 열어둡니다. Network 탭을 확인하세요.');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('\n오류 발생:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }
  
  await browser.close();
})();