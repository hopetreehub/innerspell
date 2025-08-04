const { chromium } = require('playwright');

(async () => {
  console.log('수동 로그인 테스트...');
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
    await page.waitForTimeout(2000);
    
    // 2. 수동으로 로그인 정보 입력
    console.log('📍 로그인 정보 입력...');
    await page.fill('input[placeholder="your@email.com"]', 'junsupark9999@gmail.com');
    await page.fill('input[placeholder="••••••••"]', 'dkssud123!');
    await page.screenshot({ path: 'manual-login-01-filled.png' });
    
    // 3. 로그인 버튼 클릭
    console.log('📍 로그인 버튼 클릭...');
    const loginButton = page.locator('button:has-text("로그인")').first();
    await loginButton.click();
    
    // 4. 로그인 결과 대기
    console.log('📍 로그인 처리 대기...');
    await page.waitForTimeout(5000);
    
    // 5. 현재 위치 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    await page.screenshot({ path: 'manual-login-02-result.png' });
    
    if (currentUrl === 'http://localhost:4000/') {
      console.log('✅ 홈페이지로 이동됨 - 로그인 성공!');
      
      // 관리자 대시보드 접근 시도
      console.log('\n📍 관리자 대시보드 접근 시도...');
      await page.goto('http://localhost:4000/admin');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'manual-login-03-admin.png' });
      
      const dashboardVisible = await page.locator('h1:has-text("관리자 대시보드")').isVisible().catch(() => false);
      if (dashboardVisible) {
        console.log('✅ 관리자 대시보드 접근 성공!');
      } else {
        console.log('❌ 관리자 대시보드 접근 실패');
      }
    } else {
      console.log('❌ 로그인 실패');
      
      // 에러 메시지 확인
      const errorMessages = await page.locator('.text-destructive').allTextContents();
      if (errorMessages.length > 0) {
        console.log('에러 메시지:', errorMessages);
      }
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
  } finally {
    await page.waitForTimeout(30000); // 30초 대기
    await browser.close();
  }
})();