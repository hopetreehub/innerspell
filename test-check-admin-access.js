const { chromium } = require('playwright');

(async () => {
  console.log('admin@innerspell.com 계정 관리자 권한 확인...');
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
    
    // 2. admin@innerspell.com으로 로그인
    console.log('📍 admin@innerspell.com으로 로그인...');
    await page.fill('input[placeholder="your@email.com"]', 'admin@innerspell.com');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    
    const loginButton = page.locator('button[type="submit"]:has-text("로그인")');
    await loginButton.click();
    
    // 3. 로그인 결과 대기
    console.log('📍 로그인 처리 대기...');
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('로그인 후 URL:', currentUrl);
    
    if (currentUrl === 'http://localhost:4000/' || currentUrl.includes('/admin')) {
      console.log('✅ 로그인 성공!');
      
      // 4. 관리자 대시보드 접근 시도
      console.log('\n📍 관리자 대시보드 접근 시도...');
      await page.goto('http://localhost:4000/admin');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'admin-access-check.png' });
      
      // 대시보드 접근 확인
      const dashboardVisible = await page.locator('h1:has-text("관리자 대시보드")').isVisible().catch(() => false);
      const accessDenied = await page.locator('text=접근 권한이 없습니다').isVisible().catch(() => false);
      
      if (dashboardVisible) {
        console.log('✅ 관리자 대시보드 접근 성공!');
        console.log('✅ admin@innerspell.com은 관리자 권한을 가지고 있습니다.');
      } else if (accessDenied) {
        console.log('❌ 관리자 대시보드 접근 실패');
        console.log('❌ admin@innerspell.com은 일반 사용자로 등록되었습니다.');
        console.log('\n📍 AuthContext.tsx 수정이 필요합니다.');
        console.log('role 판단 로직에 admin@innerspell.com 추가 필요');
      } else {
        console.log('❌ 예상치 못한 상태');
      }
    } else {
      console.log('❌ 로그인 실패');
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
  } finally {
    await page.waitForTimeout(10000); // 결과 확인
    await browser.close();
  }
})();