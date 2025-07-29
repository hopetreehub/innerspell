const { chromium } = require('@playwright/test');

(async () => {
  const url = 'https://test-studio-firebase.vercel.app';
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 메시지 캐치
  page.on('console', msg => {
    console.log(`🖥️ CONSOLE ${msg.type()}: ${msg.text()}`);
  });
  
  // 네트워크 에러 캐치
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });
  
  // 응답 에러 캐치
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`🚫 HTTP ERROR: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🔍 콘솔 디버그 모드로 AI 해석 테스트');
    
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
      path: `screenshots/console-debug-01-ready-${Date.now()}.png`,
      fullPage: true
    });
    
    console.log('\n🎯 AI 해석 버튼 클릭 전 상태 확인');
    
    // AI 해석 버튼 상태 자세히 확인
    const aiButton = page.locator('button:has-text("AI 해석 받기")');
    const isVisible = await aiButton.isVisible();
    const isEnabled = await aiButton.isEnabled();
    const text = await aiButton.textContent();
    
    console.log(`AI 해석 버튼 - 표시: ${isVisible}, 활성화: ${isEnabled}, 텍스트: "${text}"`);
    
    if (isVisible && isEnabled) {
      console.log('\n🖱️ AI 해석 버튼 클릭...');
      
      // 클릭 전 콘솔 메시지 수집 시작
      console.log('--- AI 해석 버튼 클릭 시작 ---');
      
      await aiButton.click();
      
      console.log('--- AI 해석 버튼 클릭 완료 ---');
      
      // 클릭 후 잠시 대기하며 콘솔 메시지 관찰
      await page.waitForTimeout(5000);
      
      await page.screenshot({
        path: `screenshots/console-debug-02-after-click-${Date.now()}.png`,
        fullPage: true
      });
      
      // 다양한 다이얼로그 선택자 시도
      const dialogSelectors = [
        '[role="dialog"]',
        '.dialog',
        '[data-testid="interpretation-dialog"]',
        '[class*="dialog"]',
        '[class*="modal"]',
        '.modal',
        '[aria-modal="true"]'
      ];
      
      console.log('\n🔍 다이얼로그 요소 탐색:');
      for (const selector of dialogSelectors) {
        try {
          const elements = await page.locator(selector).count();
          const visible = elements > 0 ? await page.locator(selector).first().isVisible() : false;
          console.log(`  ${selector}: ${elements}개 요소, 표시: ${visible}`);
        } catch (e) {
          console.log(`  ${selector}: 오류 - ${e.message}`);
        }
      }
      
      // 페이지 변화 확인
      const bodyHTML = await page.locator('body').innerHTML();
      const hasInterpretationText = bodyHTML.includes('해석') || bodyHTML.includes('interpretation');
      console.log(`페이지에 해석 관련 텍스트 존재: ${hasInterpretationText}`);
      
      // AlertDialog 확인 (코드에서 사용하는 컴포넌트)
      const alertDialog = page.locator('[data-radix-dialog-content]');
      const alertDialogVisible = await alertDialog.isVisible().catch(() => false);
      console.log(`AlertDialog 표시: ${alertDialogVisible}`);
      
      if (alertDialogVisible) {
        console.log('✅ AlertDialog가 발견되었습니다!');
        await page.screenshot({
          path: `screenshots/console-debug-03-alert-dialog-${Date.now()}.png`,
          fullPage: true
        });
      }
      
    } else {
      console.log('❌ AI 해석 버튼이 클릭 가능한 상태가 아닙니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({
      path: `screenshots/console-debug-error-${Date.now()}.png`,
      fullPage: true
    });
  } finally {
    console.log('\n🏁 콘솔 디버그 완료. 5초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();