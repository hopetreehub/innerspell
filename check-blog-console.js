const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 메시지 수집
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  // 페이지 에러 수집
  page.on('pageerror', error => {
    console.error('[PAGE ERROR]', error.message);
  });

  // 요청 실패 모니터링
  page.on('requestfailed', request => {
    console.error('[REQUEST FAILED]', request.url(), request.failure().errorText);
  });

  try {
    console.log('Navigating to https://test-studio-firebase.vercel.app/blog...');
    
    // 네트워크 활동 모니터링
    page.on('request', request => {
      if (request.url().includes('blog') || request.url().includes('_next')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('blog') || response.url().includes('_next')) {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      }
    });

    await page.goto('https://test-studio-firebase.vercel.app/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 페이지 로드 완료 대기
    await page.waitForTimeout(3000);

    // 페이지 정보 확인
    const title = await page.title();
    const url = page.url();
    console.log('\n=== Page Info ===');
    console.log('Title:', title);
    console.log('URL:', url);

    // 콘솔 로그 요약
    console.log('\n=== Console Logs Summary ===');
    console.log('Total logs:', consoleLogs.length);
    
    const logTypes = {};
    consoleLogs.forEach(log => {
      logTypes[log.type] = (logTypes[log.type] || 0) + 1;
    });
    
    Object.entries(logTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

    // 에러와 경고 상세 정보
    const errors = consoleLogs.filter(log => log.type === 'error');
    const warnings = consoleLogs.filter(log => log.type === 'warning');

    if (errors.length > 0) {
      console.log('\n=== Errors Detail ===');
      errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error.text);
        if (error.location) {
          console.log('  Location:', error.location.url);
        }
      });
    }

    if (warnings.length > 0) {
      console.log('\n=== Warnings Detail ===');
      warnings.forEach((warning, index) => {
        console.log(`Warning ${index + 1}:`, warning.text);
      });
    }

    // 라우팅 관련 로그 확인
    const routingLogs = consoleLogs.filter(log => 
      log.text.toLowerCase().includes('route') || 
      log.text.toLowerCase().includes('navigation') ||
      log.text.toLowerCase().includes('path')
    );

    if (routingLogs.length > 0) {
      console.log('\n=== Routing Related Logs ===');
      routingLogs.forEach(log => {
        console.log(`[${log.type}] ${log.text}`);
      });
    }

    // 페이지 내용 확인
    const blogPosts = await page.locator('article').count();
    console.log('\n=== Page Content ===');
    console.log('Blog posts found:', blogPosts);

    // 스크린샷 저장
    await page.screenshot({ path: 'blog-page-console-check.png', fullPage: true });
    console.log('\nScreenshot saved as blog-page-console-check.png');

  } catch (error) {
    console.error('Error during page load:', error);
  }

  await browser.close();
})();