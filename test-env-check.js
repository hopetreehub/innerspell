const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log('🚀 Checking environment variables and auth state...');
  
  // 모든 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    console.log(`📝 Console [${msg.type()}]:`, text);
  });
  
  try {
    // 홈페이지로 이동
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    console.log('✅ Homepage loaded');
    
    // 브라우저 콘솔에서 환경 변수 확인
    const envCheck = await page.evaluate(() => {
      return {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        NEXT_PUBLIC_ENABLE_DEV_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH || 'undefined',
        NEXT_PUBLIC_USE_REAL_AUTH: process.env.NEXT_PUBLIC_USE_REAL_AUTH || 'undefined'
      };
    });
    
    console.log('\n📋 Environment Variables in Browser:');
    console.log(JSON.stringify(envCheck, null, 2));
    
    // AuthContext가 로드되었는지 확인
    await page.waitForTimeout(3000);
    
    // 콘솔 로그 요약
    console.log('\n📊 Console Log Summary:');
    console.log(`Total logs captured: ${consoleLogs.length}`);
    
    const authLogs = consoleLogs.filter(log => 
      log.includes('Auth') || 
      log.includes('Dev') || 
      log.includes('Mock') ||
      log.includes('admin')
    );
    
    console.log(`\nAuth-related logs (${authLogs.length}):`);
    authLogs.forEach(log => console.log(log));
    
    // 현재 사용자 상태 확인
    const userState = await page.evaluate(() => {
      // React DevTools가 있다면 사용
      const reactFiber = document.querySelector('#__next')?._reactRootContainer?._internalRoot?.current;
      if (reactFiber) {
        console.log('Found React Fiber');
      }
      
      // localStorage 확인
      const localStorage = {
        emailForSignIn: window.localStorage.getItem('emailForSignIn'),
        userLoggedOut: window.localStorage.getItem('user-logged-out'),
        cacheBust: window.localStorage.getItem('cache-bust-timestamp')
      };
      
      return {
        localStorage,
        cookies: document.cookie
      };
    });
    
    console.log('\n🔍 Browser State:');
    console.log(JSON.stringify(userState, null, 2));
    
    // 스크린샷
    await page.screenshot({ path: 'screenshots/env-check.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n✅ Check completed. Browser will remain open.');
  console.log('Press Ctrl+C to close and exit.');
  
  await page.waitForTimeout(300000);
})();