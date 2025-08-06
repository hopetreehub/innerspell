const { chromium } = require('playwright');

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그와 네트워크 오류 수집
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`);
  });

  const pages = [
    { name: 'home', url: 'http://localhost:4000/', title: '홈페이지' },
    { name: 'tarot-main', url: 'http://localhost:4000/tarot', title: '타로 메인' },
    { name: 'login', url: 'http://localhost:4000/login', title: '로그인' }
  ];

  for (const pageInfo of pages) {
    console.log(`\n📄 Visiting ${pageInfo.title}...`);
    
    try {
      const startTime = Date.now();
      await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const loadTime = Date.now() - startTime;
      
      // 페이지 로딩 대기
      await page.waitForTimeout(3000);
      
      // 스크린샷 캡처
      await page.screenshot({ 
        path: `${pageInfo.name}-screenshot.png`,
        fullPage: true 
      });
      
      console.log(`   ✅ Screenshot captured: ${pageInfo.name}-screenshot.png`);
      console.log(`   ⏱️  Load time: ${loadTime}ms`);
      
      if (logs.length > 0) {
        console.log(`   📝 Console logs (${logs.length}):`);
        logs.slice(-3).forEach(log => console.log(`      ${log}`));
      }
      
      if (failedRequests.length > 0) {
        console.log(`   ❌ Failed requests:`);
        failedRequests.forEach(req => console.log(`      ${req}`));
      }
      
      // 로그 초기화
      logs.length = 0;
      failedRequests.length = 0;
      
    } catch (error) {
      console.log(`   ⚠️  Error loading ${pageInfo.title}: ${error.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ Quick review completed!');
}

takeScreenshots().catch(console.error);