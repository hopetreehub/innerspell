const { chromium } = require('playwright');

(async () => {
  console.log('개발 환경 도우미로 관리자 로그인 테스트...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. 로그인 페이지로 이동
    console.log('\n📍 로그인 페이지 이동...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    // 2. 개발 환경 도우미의 "관리자로 로그인" 버튼 클릭
    console.log('📍 개발 환경 도우미의 관리자 로그인 버튼 클릭...');
    const adminButton = page.locator('button:has-text("관리자로 로그인")');
    
    if (await adminButton.isVisible()) {
      await adminButton.click();
      console.log('✅ 관리자 로그인 버튼 클릭됨');
      
      // 로그인 완료 대기
      await page.waitForTimeout(3000);
      
      // 현재 URL 확인
      const currentUrl = page.url();
      console.log('현재 URL:', currentUrl);
      
      if (currentUrl === 'http://localhost:4000/admin') {
        console.log('✅ 관리자 대시보드로 이동됨!');
        await page.screenshot({ path: 'dev-helper-admin-success.png' });
      } else if (currentUrl === 'http://localhost:4000/') {
        console.log('✅ 홈페이지로 이동됨');
        
        // 관리자 대시보드 접근 시도
        console.log('\n📍 관리자 대시보드 접근 시도...');
        await page.goto('http://localhost:4000/admin');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'dev-helper-admin-page.png' });
        
        const dashboardVisible = await page.locator('h1:has-text("관리자 대시보드")').isVisible().catch(() => false);
        if (dashboardVisible) {
          console.log('✅ 관리자 대시보드 접근 성공!');
        } else {
          console.log('❌ 관리자 대시보드 접근 실패');
        }
      }
    } else {
      console.log('❌ 개발 환경 도우미가 표시되지 않음');
      
      // 수동으로 testadmin@innerspell.com 로그인 시도
      console.log('\n📍 testadmin@innerspell.com으로 로그인 시도...');
      await page.fill('input[placeholder="your@email.com"]', 'testadmin@innerspell.com');
      await page.fill('input[placeholder="••••••••"]', 'test123');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      const afterTestAdminUrl = page.url();
      console.log('로그인 후 URL:', afterTestAdminUrl);
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
  } finally {
    await page.waitForTimeout(5000); // 결과 확인을 위해 대기
    await browser.close();
  }
})();