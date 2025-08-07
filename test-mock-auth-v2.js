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
  
  console.log('🚀 Testing Mock Authentication v2...');
  
  // 모든 콘솔 로그 캡처
  const authLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Auth') || text.includes('Dev') || text.includes('Mock') || text.includes('Environment')) {
      authLogs.push(text);
      console.log(`📝 Auth Log: ${text}`);
    }
  });
  
  try {
    // 홈페이지로 이동
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    console.log('✅ Homepage loaded');
    
    // 인증 로그 대기
    await page.waitForTimeout(3000);
    
    console.log(`\n📊 Total auth logs captured: ${authLogs.length}`);
    
    // 관리자 링크가 있는지 확인
    const adminLink = await page.$('a[href="/admin"]');
    if (adminLink) {
      console.log('✅ Found admin link in navigation!');
    } else {
      console.log('❌ Admin link not found in navigation');
    }
    
    // 사용자 정보 확인
    const userNavText = await page.textContent('nav');
    console.log('\n📍 Navigation text includes:');
    if (userNavText.includes('Dev Admin')) {
      console.log('✅ Dev Admin user detected');
    }
    if (userNavText.includes('로그인')) {
      console.log('❌ Login button found - user not logged in');
    }
    
    // 스크린샷
    await page.screenshot({ path: 'screenshots/mock-auth-v2-home.png', fullPage: true });
    
    // 관리자 페이지 직접 접근 시도
    console.log('\n🔄 Attempting direct navigation to /admin...');
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle', timeout: 15000 });
    
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/admin')) {
      console.log('✅ Successfully accessed admin page!');
      await page.screenshot({ path: 'screenshots/mock-auth-v2-admin.png', fullPage: true });
    } else {
      console.log('❌ Redirected away from admin page to:', currentUrl);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  console.log('\n✅ Test completed. Browser remains open.');
  console.log('Press Ctrl+C to exit.');
  
  await page.waitForTimeout(300000);
})();