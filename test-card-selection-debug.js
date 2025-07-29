const { chromium } = require('@playwright/test');

(async () => {
  const url = 'https://test-studio-firebase.vercel.app';
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 // 느리게 실행해서 선택 상태를 정확히 관찰
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 카드 선택 과정 세밀 디버깅 시작');
    
    await page.goto(url);
    await page.waitForTimeout(3000);
    
    // 타로 리딩 페이지로 이동
    const readingLink = page.locator('a[href="/reading"]').first();
    await readingLink.click();
    await page.waitForTimeout(3000);
    
    // 카드 섞기
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(3000);
    
    // 카드 펼치기
    const spreadButton = page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(5000); // 더 긴 대기시간
    
    // 첫 번째 카드 선택 전 상태 스크린샷
    await page.screenshot({
      path: `screenshots/debug-01-before-first-card-${Date.now()}.png`,
      fullPage: true
    });
    
    // 선택 가능한 카드들 찾기
    console.log('\n📊 선택 가능한 카드 탐색:');
    
    const possibleCardSelectors = [
      'div[role="button"]',
      '[tabindex="0"]',
      '[onclick]',
      '.cursor-pointer',
      '[class*="card"]'
    ];
    
    let clickableCards = [];
    for (const selector of possibleCardSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const className = await element.getAttribute('class') || '';
          const ariaLabel = await element.getAttribute('aria-label') || '';
          
          if (isVisible && (className.includes('card') || ariaLabel.includes('카드'))) {
            clickableCards.push({
              element,
              index: i,
              selector,
              className,
              ariaLabel
            });
            console.log(`  발견: ${selector}[${i}] - ${ariaLabel}`);
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log(`\n총 ${clickableCards.length}개의 클릭 가능한 카드 발견`);
    
    if (clickableCards.length === 0) {
      console.log('❌ 클릭 가능한 카드가 없습니다!');
      await page.screenshot({
        path: `screenshots/debug-no-clickable-cards-${Date.now()}.png`,
        fullPage: true
      });
      return;
    }
    
    // 첫 번째 카드 선택
    console.log('\n1️⃣ 첫 번째 카드 선택 시도...');
    const firstCard = clickableCards[0];
    
    // 선택 전 "선택된 카드" 텍스트 확인
    const beforeFirstText = await page.locator('text=선택된 카드').textContent().catch(() => 'none');
    console.log(`선택 전 상태: ${beforeFirstText}`);
    
    await firstCard.element.click();
    await page.waitForTimeout(2000);
    
    // 선택 후 상태 확인
    const afterFirstText = await page.locator('text=선택된 카드').textContent().catch(() => 'none');
    console.log(`첫 카드 선택 후: ${afterFirstText}`);
    
    await page.screenshot({
      path: `screenshots/debug-02-after-first-card-${Date.now()}.png`,
      fullPage: true
    });
    
    // 두 번째 카드 선택
    if (clickableCards.length > 1) {
      console.log('\n2️⃣ 두 번째 카드 선택 시도...');
      const secondCard = clickableCards[1];
      
      await secondCard.element.click();
      await page.waitForTimeout(2000);
      
      const afterSecondText = await page.locator('text=선택된 카드').textContent().catch(() => 'none');
      console.log(`두 카드 선택 후: ${afterSecondText}`);
      
      await page.screenshot({
        path: `screenshots/debug-03-after-second-card-${Date.now()}.png`,
        fullPage: true
      });
    }
    
    // 세 번째 카드 선택
    if (clickableCards.length > 2) {
      console.log('\n3️⃣ 세 번째 카드 선택 시도...');
      const thirdCard = clickableCards[2];
      
      await thirdCard.element.click();
      await page.waitForTimeout(3000);
      
      const afterThirdText = await page.locator('text=선택된 카드').textContent().catch(() => 'none');
      console.log(`세 카드 선택 후: ${afterThirdText}`);
      
      await page.screenshot({
        path: `screenshots/debug-04-after-third-card-${Date.now()}.png`,
        fullPage: true
      });
      
      // AI 해석 버튼 확인
      console.log('\n🔍 AI 해석 버튼 확인...');
      const aiButton = page.locator('button:has-text("AI 해석 받기")');
      const aiButtonVisible = await aiButton.isVisible().catch(() => false);
      console.log(`AI 해석 버튼 표시: ${aiButtonVisible}`);
      
      if (aiButtonVisible) {
        console.log('✅ AI 해석 버튼이 나타났습니다!');
        await page.screenshot({
          path: `screenshots/debug-05-ai-button-visible-${Date.now()}.png`,
          fullPage: true
        });
      } else {
        console.log('❌ AI 해석 버튼이 나타나지 않았습니다.');
        
        // 모든 버튼 상태 확인
        const allButtons = await page.locator('button').all();
        console.log('\n모든 버튼 상태:');
        for (let i = 0; i < allButtons.length; i++) {
          try {
            const buttonText = await allButtons[i].textContent();
            const isVisible = await allButtons[i].isVisible();
            console.log(`  - "${buttonText}" (visible: ${isVisible})`);
          } catch (e) {
            console.log(`  - 버튼 ${i + 1}: 텍스트 읽기 실패`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류 발생:', error);
    await page.screenshot({
      path: `screenshots/debug-error-${Date.now()}.png`,
      fullPage: true
    });
  } finally {
    console.log('\n🏁 디버깅 완료. 5초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();