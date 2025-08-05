const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 메시지 수집
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push(`[${type}] ${text}`);
    console.log(`Console ${type}: ${text}`);
  });
  
  // 페이지 에러 수집
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.toString());
    console.log(`Page error: ${error}`);
  });
  
  try {
    console.log('Navigating to http://localhost:4000/tarot/major-00-fool');
    const response = await page.goto('http://localhost:4000/tarot/major-00-fool', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log(`Page loaded with status: ${response.status()}`);
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // 주요 요소들이 로드되었는지 확인
    const checks = {
      cardImage: await page.locator('img[alt*="The Fool"]').count() > 0,
      cardTitle: await page.locator('h1:has-text("The Fool")').count() > 0,
      cardDescription: await page.locator('text=/양팔을 벌리고|새로운 여정/').count() > 0,
      navigationLinks: await page.locator('a[href^="/tarot/"]').count() > 0
    };
    
    console.log('\n=== Page Elements Check ===');
    Object.entries(checks).forEach(([element, exists]) => {
      console.log(`${element}: ${exists ? '✓ Found' : '✗ Not found'}`);
    });
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'tarot-error-check.png',
      fullPage: true
    });
    console.log('Screenshot saved as tarot-error-check.png');
    
    // 콘솔 메시지 요약
    console.log('\n=== Console Messages Summary ===');
    if (consoleMessages.length === 0) {
      console.log('No console messages');
    } else {
      consoleMessages.forEach(msg => console.log(msg));
    }
    
    // 페이지 에러 요약
    console.log('\n=== Page Errors Summary ===');
    if (pageErrors.length === 0) {
      console.log('No page errors detected');
    } else {
      pageErrors.forEach(error => console.log(error));
    }
    
  } catch (error) {
    console.error('Error during page check:', error);
    // 에러 발생 시에도 스크린샷 촬영
    await page.screenshot({ 
      path: 'tarot-error-check.png',
      fullPage: true
    });
  } finally {
    await page.waitForTimeout(5000); // 브라우저 확인을 위해 대기
    await browser.close();
  }
})();