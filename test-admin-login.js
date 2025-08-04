const { chromium } = require('playwright');

(async () => {
  console.log('관리자 로그인 테스트 시작...');
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
    await page.screenshot({ path: 'admin-login-01-signin-page.png' });

    // 2. 로그인 폼 입력
    console.log('📍 로그인 정보 입력...');
    await page.fill('input[placeholder="your@email.com"]', 'admin@innerspell.com');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.screenshot({ path: 'admin-login-02-filled.png' });

    // 3. 로그인 버튼 클릭
    console.log('📍 로그인 시도...');
    await page.click('button[type="submit"]');
    
    // 로그인 완료 대기
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'admin-login-03-after-submit.png' });

    // 4. 로그인 성공 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    // 홈페이지로 리다이렉트 되었는지 확인
    if (currentUrl === 'http://localhost:4000/') {
      console.log('✅ 홈페이지로 리다이렉트됨');
      
      // 관리자 대시보드 접근 시도
      console.log('\n📍 관리자 대시보드 접근 시도...');
      await page.goto('http://localhost:4000/admin');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'admin-login-04-admin-page.png' });
      
      const dashboardVisible = await page.locator('h1:has-text("관리자 대시보드")').isVisible().catch(() => false);
      if (dashboardVisible) {
        console.log('✅ 관리자 대시보드 접근 성공!');
      } else {
        console.log('❌ 관리자 대시보드 접근 실패');
        
        // 에러 메시지 확인
        const errorMessage = await page.locator('text=접근 권한이 없습니다').isVisible().catch(() => false);
        if (errorMessage) {
          console.log('❌ 권한 없음 메시지 표시됨');
        }
      }
    } else {
      console.log('❌ 로그인 실패 - 여전히 로그인 페이지에 있음');
      
      // 에러 메시지 확인
      const errorVisible = await page.locator('text=로그인에 실패했습니다').isVisible().catch(() => false);
      if (errorVisible) {
        console.log('❌ 로그인 에러 메시지 표시됨');
      }
    }

    // 5. 콘솔 에러 확인
    console.log('\n📍 콘솔 에러 확인...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });

  } catch (error) {
    console.error('테스트 중 오류:', error);
  } finally {
    await page.waitForTimeout(10000); // 결과 확인을 위해 대기
    await browser.close();
  }
})();