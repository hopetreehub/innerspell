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
  
  console.log('🚀 Testing Admin Page in Dev Mode...');
  
  // 콘솔 로그 캡처
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Admin Page') || text.includes('Dev') || text.includes('Mock') || text.includes('DEV AUTH')) {
      console.log(`📝 Console: ${text}`);
    }
  });
  
  try {
    // 관리자 페이지로 직접 이동
    console.log('🔄 Navigating directly to /admin...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle', timeout: 30000 });
    
    // 페이지 로드 후 잠시 대기
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/admin')) {
      console.log('✅ Successfully stayed on admin page!');
      
      // 관리자 대시보드 요소 확인
      try {
        // 탭 메뉴 확인
        const tabs = await page.$$('[role="tab"]');
        console.log(`\n📋 Found ${tabs.length} admin tabs`);
        
        if (tabs.length > 0) {
          const tabTexts = await Promise.all(
            tabs.map(tab => tab.textContent())
          );
          console.log('📑 Available tabs:', tabTexts);
          
          // 첫 번째 탭 클릭
          await tabs[0].click();
          console.log('✅ Clicked first tab');
        }
        
        // 페이지 제목 확인
        const pageTitle = await page.textContent('h1');
        console.log('📄 Page title:', pageTitle);
        
        // 스크린샷
        await page.screenshot({ path: 'screenshots/admin-dev-mode.png', fullPage: true });
        console.log('📸 Screenshot saved');
        
      } catch (error) {
        console.error('❌ Error checking admin elements:', error.message);
      }
    } else {
      console.log('❌ Redirected away from admin page to:', currentUrl);
      await page.screenshot({ path: 'screenshots/admin-dev-mode-redirect.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'screenshots/admin-dev-mode-error.png', fullPage: true });
  }
  
  console.log('\n✅ Test completed. Browser remains open.');
  console.log('Press Ctrl+C to exit.');
  
  await page.waitForTimeout(300000);
})();