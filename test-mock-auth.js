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
  
  console.log('🚀 Testing Mock Authentication...');
  
  try {
    // 홈페이지로 이동
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    console.log('✅ Homepage loaded');
    
    // 콘솔 로그 출력
    page.on('console', msg => {
      if (msg.text().includes('Dev Auth') || msg.text().includes('Development Mode')) {
        console.log('📝 Console:', msg.text());
      }
    });
    
    // 잠시 대기하여 인증 상태 확인
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'screenshots/mock-auth-home.png', fullPage: true });
    
    // 관리자 페이지로 이동
    console.log('\n🔄 Navigating to admin page...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    
    // 페이지 URL 확인
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // 관리자 페이지가 로드되었는지 확인
    if (currentUrl.includes('/admin')) {
      console.log('✅ Successfully accessed admin page!');
      
      // 관리자 대시보드 요소 확인
      try {
        await page.waitForSelector('h1', { timeout: 5000 });
        const pageTitle = await page.$eval('h1', el => el.textContent);
        console.log('📄 Page title:', pageTitle);
        
        // 관리자 페이지 스크린샷
        await page.screenshot({ path: 'screenshots/mock-auth-admin.png', fullPage: true });
        console.log('📸 Admin page screenshot saved');
        
        // 탭 메뉴 확인
        const tabs = await page.$$('[role="tab"]');
        console.log(`📋 Found ${tabs.length} admin tabs`);
        
        if (tabs.length > 0) {
          const tabTexts = await Promise.all(
            tabs.map(tab => tab.textContent())
          );
          console.log('📑 Available tabs:', tabTexts);
        }
        
      } catch (error) {
        console.error('❌ Error checking admin page elements:', error.message);
      }
    } else {
      console.log('❌ Failed to access admin page - redirected to:', currentUrl);
    }
    
    // 네비게이션 바에서 사용자 정보 확인
    try {
      const userNavText = await page.textContent('nav');
      if (userNavText.includes('Dev Admin') || userNavText.includes('dev-admin@innerspell.com')) {
        console.log('✅ Mock admin user is logged in!');
      }
    } catch (error) {
      console.log('⚠️ Could not find user info in navigation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n🔍 Test completed. Browser will remain open for manual inspection.');
  console.log('Press Ctrl+C to close the browser and exit.');
  
  // 브라우저를 열어둔 상태로 유지
  await page.waitForTimeout(300000); // 5분 대기
})();