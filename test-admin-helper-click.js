const { chromium } = require('playwright');

(async () => {
  console.log('개발 도우미로 관리자 로그인 테스트...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. 로그인 페이지 이동
    console.log('\n📍 로그인 페이지 이동...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 페이지 완전 로드 대기
    
    // 2. 개발 도우미 버튼 찾기 및 클릭
    console.log('📍 개발 도우미 버튼 찾기...');
    
    // 여러 방법으로 버튼 찾기 시도
    let clicked = false;
    
    // 방법 1: 텍스트로 찾기
    try {
      const adminBtn = page.locator('button:has-text("관리자로 로그인")');
      if (await adminBtn.isVisible()) {
        await adminBtn.click();
        clicked = true;
        console.log('✅ 관리자 로그인 버튼 클릭 (텍스트)');
      }
    } catch (e) {}
    
    // 방법 2: 이모지로 찾기
    if (!clicked) {
      try {
        const adminBtn = page.locator('button:has-text("🔐 관리자로 로그인")');
        if (await adminBtn.isVisible()) {
          await adminBtn.click();
          clicked = true;
          console.log('✅ 관리자 로그인 버튼 클릭 (이모지)');
        }
      } catch (e) {}
    }
    
    if (clicked) {
      console.log('📍 로그인 처리 대기...');
      await page.waitForTimeout(3000);
      
      // 현재 URL 확인
      const currentUrl = page.url();
      console.log('현재 URL:', currentUrl);
      
      if (currentUrl.includes('/admin')) {
        console.log('✅ 관리자 대시보드로 이동됨!');
        await page.screenshot({ path: 'admin-helper-success.png' });
      } else if (currentUrl === 'http://localhost:4000/') {
        console.log('✅ 홈페이지로 이동됨');
        
        // 관리자 대시보드 접근 시도
        console.log('\n📍 관리자 대시보드 접근 시도...');
        await page.goto('http://localhost:4000/admin');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'admin-helper-dashboard.png' });
        
        const dashboardVisible = await page.locator('h1:has-text("관리자 대시보드")').isVisible().catch(() => false);
        if (dashboardVisible) {
          console.log('✅ 관리자 대시보드 접근 성공!');
        } else {
          console.log('❌ 관리자 대시보드 접근 실패');
          
          // 에러 메시지 확인
          const errorMsg = await page.locator('text=접근 권한이 없습니다').isVisible().catch(() => false);
          if (errorMsg) {
            console.log('❌ 권한 없음 메시지 표시됨');
          }
        }
      } else {
        console.log('❌ 로그인 실패 - 여전히 로그인 페이지');
        
        // 에러 메시지 확인
        const errorMsg = await page.locator('text=로그인에 실패했습니다').isVisible().catch(() => false);
        if (errorMsg) {
          console.log('❌ 로그인 에러 메시지 표시됨');
        }
      }
    } else {
      console.log('❌ 관리자 로그인 버튼을 찾을 수 없음');
      await page.screenshot({ path: 'admin-helper-not-found.png' });
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
  } finally {
    await page.waitForTimeout(10000); // 결과 확인
    await browser.close();
  }
})();