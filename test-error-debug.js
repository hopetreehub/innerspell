const { chromium } = require('@playwright/test');

(async () => {
  const url = 'https://test-studio-firebase.vercel.app';
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 모든 타입의 에러 캐치
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('ERROR') || msg.text().includes('오류')) {
      errors.push({ type: 'console-error', message: msg.text() });
      console.log(`🚨 CONSOLE ERROR: ${msg.text()}`);
    }
    if (msg.text().includes('TAROT') || msg.text().includes('해석')) {
      console.log(`🎯 TAROT LOG: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push({ type: 'page-error', message: error.message });
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      errors.push({ type: 'http-error', message: `${response.status()} ${response.url()}` });
      console.log(`🚫 HTTP ERROR: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🔍 에러 디버그 모드로 AI 해석 테스트');
    
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
      path: `screenshots/error-debug-01-ready-${Date.now()}.png`,
      fullPage: true
    });
    
    console.log('\n🎯 AI 해석 버튼 클릭 및 에러 모니터링 시작');
    console.log(`클릭 전 에러 수: ${errors.length}`);
    
    const aiButton = page.locator('button:has-text("AI 해석 받기")');
    await aiButton.click();
    
    console.log('🖱️ AI 해석 버튼 클릭 완료. 에러 발생 관찰 중...');
    
    // 10초간 에러 및 토스트 메시지 관찰
    const startTime = Date.now();
    const maxWaitTime = 10000;
    
    let toastFound = false;
    let errorToastFound = false;
    
    while (Date.now() - startTime < maxWaitTime) {
      await page.waitForTimeout(500);
      
      // 토스트 메시지 확인
      const toastSelectors = [
        '[data-testid="toast"]',
        '.toast',
        '[class*="toast"]',
        '[role="status"]',
        '[role="alert"]',
        '.sonner-toast',
        '[data-sonner-toast]'
      ];
      
      for (const selector of toastSelectors) {
        try {
          const toastElement = page.locator(selector);
          if (await toastElement.count() > 0 && await toastElement.first().isVisible()) {
            const toastText = await toastElement.first().textContent();
            console.log(`🍞 토스트 메시지 발견: "${toastText}"`);
            
            if (toastText && (toastText.includes('오류') || toastText.includes('실패') || toastText.includes('Error'))) {
              errorToastFound = true;
              console.log(`🚨 에러 토스트 발견: "${toastText}"`);
            }
            toastFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (toastFound) break;
    }
    
    await page.screenshot({
      path: `screenshots/error-debug-02-after-click-${Date.now()}.png`,
      fullPage: true
    });
    
    console.log('\n📊 에러 디버그 결과:');
    console.log('='.repeat(50));
    console.log(`총 에러 수: ${errors.length}`);
    console.log(`토스트 메시지 발견: ${toastFound}`);
    console.log(`에러 토스트 발견: ${errorToastFound}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 발생한 에러들:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`);
      });
    } else {
      console.log('\n✅ 발견된 에러가 없습니다.');
      console.log('이는 generateTarotInterpretation 함수가 실행되지 않았거나, 조용히 실패했을 가능성을 시사합니다.');
    }
    
    // 현재 페이지 상태 확인
    const currentButtons = await page.locator('button').all();
    console.log('\n🔍 현재 페이지의 버튼들:');
    for (let i = 0; i < Math.min(currentButtons.length, 10); i++) {
      try {
        const buttonText = await currentButtons[i].textContent();
        const isVisible = await currentButtons[i].isVisible();
        console.log(`  - "${buttonText}" (visible: ${isVisible})`);
      } catch (e) {
        console.log(`  - 버튼 ${i + 1}: 텍스트 읽기 실패`);
      }
    }
    
    // 다이얼로그 상태 확인
    const dialogExists = await page.locator('[role="dialog"], [data-radix-dialog-content], [aria-modal="true"]').count();
    console.log(`\n🔍 다이얼로그 요소 개수: ${dialogExists}`);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({
      path: `screenshots/error-debug-error-${Date.now()}.png`,
      fullPage: true
    });
  } finally {
    console.log('\n🏁 에러 디버그 완료. 5초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();