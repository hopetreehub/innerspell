const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 1000 // 각 동작마다 1초 대기
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 모든 콘솔 로그 캡처
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // 네트워크 에러 캡처
  page.on('response', response => {
    if (response.url().includes('/api/') && response.status() >= 400) {
      console.log(`\n[네트워크 에러] ${response.url()}`);
      console.log(`Status: ${response.status()} ${response.statusText()}`);
    }
  });
  
  try {
    console.log('1. 타로 리딩 페이지로 이동...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 페이지 완전 로드 대기
    await page.waitForTimeout(5000);
    
    console.log('2. 페이지 스크린샷 저장...');
    await page.screenshot({ path: 'tarot-page-loaded.png', fullPage: true });
    
    console.log('3. 질문 입력 필드 찾기...');
    const questionInput = await page.$('textarea');
    if (!questionInput) {
      console.error('질문 입력 필드를 찾을 수 없습니다!');
      const html = await page.content();
      console.log('페이지 HTML 일부:', html.substring(0, 500));
    } else {
      await questionInput.fill('테스트 질문입니다');
      console.log('질문 입력 완료');
    }
    
    // 카드 섞기
    console.log('4. 카드 섞기...');
    const shuffleBtn = await page.$('button:has-text("카드 섞기")');
    if (shuffleBtn) {
      await shuffleBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // 카드 펼치기
    console.log('5. 카드 펼치기...');
    const spreadBtn = await page.$('button:has-text("카드 펼치기")');
    if (spreadBtn) {
      await spreadBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // 카드 선택
    console.log('6. 카드 선택...');
    const cards = await page.$$('.cursor-pointer');
    console.log(`찾은 카드 수: ${cards.length}`);
    
    for (let i = 0; i < 3 && i < cards.length; i++) {
      await cards[i].click();
      await page.waitForTimeout(1000);
    }
    
    // AI 해석 버튼 클릭 전 스크린샷
    await page.screenshot({ path: 'before-ai-click.png', fullPage: true });
    
    console.log('7. AI 해석 받기...');
    const aiBtn = await page.$('button:has-text("AI 해석 받기")');
    if (aiBtn) {
      await aiBtn.click();
      console.log('AI 해석 버튼 클릭 완료');
      
      // 응답 대기
      await page.waitForTimeout(10000);
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'error-recheck.png', fullPage: true });
    
    // 오류 메시지 확인
    const errorElement = await page.$('.text-red-500, .error, .alert');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      console.log('\n[화면 오류 메시지]:', errorText);
    }
    
    console.log('\n테스트 완료. 브라우저를 30초간 열어둡니다...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('스크립트 오류:', error.message);
    await page.screenshot({ path: 'script-error.png', fullPage: true });
  }
  
  await browser.close();
})();