const { chromium } = require('playwright');

(async () => {
  console.log('🎯 로고 1/4 위치 최종 검증\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 가이드라인 추가 및 스크린샷
    await page.evaluate(() => {
      const container = document.querySelector('header .container');
      if (container) {
        // 1/4 위치 선
        const line = document.createElement('div');
        line.style.cssText = 'position:absolute;left:25%;top:0;width:2px;height:100%;background:lime;z-index:9999';
        container.appendChild(line);
      }
    });
    
    await page.screenshot({
      path: 'tests/screenshots/logo-at-quarter.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 100 }
    });
    
    console.log('✅ 스크린샷 저장: logo-at-quarter.png');
    console.log('🟢 초록선이 1/4 위치를 나타냅니다');
    
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await browser.close();
  }
})();