const { chromium } = require('@playwright/test');

(async () => {
  const url = 'https://test-studio-firebase.vercel.app';
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 타로 리딩 페이지 구조 디버깅 시작');
    
    // 1. 사이트 접속
    await page.goto(url);
    await page.waitForTimeout(3000);
    
    // 2. 타로 리딩 페이지로 이동
    const readingLink = page.locator('a[href="/reading"]').first();
    await readingLink.click();
    await page.waitForTimeout(3000);
    
    // 3. 페이지 요소 분석
    console.log('\n📊 페이지 요소 분석:');
    
    // 가능한 카드 선택자들 확인
    const cardSelectors = [
      '.tarot-card',
      '.card',
      '[data-testid="tarot-card"]',
      '.card-deck .card',
      '.playing-card',
      '[class*="card"]',
      'button[class*="card"]',
      'div[class*="card"]'
    ];
    
    for (const selector of cardSelectors) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        console.log(`  ${selector}: ${count}개 요소 발견`);
        
        if (count > 0) {
          for (let i = 0; i < Math.min(count, 3); i++) {
            try {
              const element = elements.nth(i);
              const isVisible = await element.isVisible();
              const text = await element.textContent();
              console.log(`    - 요소 ${i + 1}: visible=${isVisible}, text="${text}"`);
            } catch (e) {
              console.log(`    - 요소 ${i + 1}: 정보 읽기 실패`);
            }
          }
        }
      } catch (e) {
        console.log(`  ${selector}: 오류 - ${e.message}`);
      }
    }
    
    // 4. 페이지 전체 HTML 구조 확인
    console.log('\n📋 페이지 내 모든 버튼과 클릭 가능한 요소:');
    const clickableElements = await page.locator('button, [role="button"], [onclick], [tabindex="0"]').all();
    console.log(`총 클릭 가능한 요소: ${clickableElements.length}개`);
    
    for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
      try {
        const element = clickableElements[i];
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.getAttribute('class') || '';
        const text = await element.textContent() || '';
        const isVisible = await element.isVisible();
        
        console.log(`  ${i + 1}. ${tagName} - class: "${className}" - text: "${text.substring(0, 50)}" - visible: ${isVisible}`);
      } catch (e) {
        console.log(`  ${i + 1}. 요소 정보 읽기 실패`);
      }
    }
    
    // 5. 스크린샷 저장
    await page.screenshot({
      path: `screenshots/debug-reading-page-${Date.now()}.png`,
      fullPage: true
    });
    console.log('\n✅ 디버그 스크린샷 저장 완료');
    
    // 6. 페이지 소스 일부 확인
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('\n📄 페이지 HTML 구조 (처음 500자):');
    console.log(bodyHTML.substring(0, 500));
    
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