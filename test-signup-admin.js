const { chromium } = require('playwright');

(async () => {
  console.log('관리자 계정 회원가입 테스트...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. 회원가입 페이지로 이동
    console.log('\n📍 회원가입 페이지 이동...');
    await page.goto('http://localhost:4000/sign-up');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'signup-01-initial.png' });
    
    // 2. 회원가입 정보 입력
    console.log('📍 회원가입 정보 입력...');
    await page.fill('input[placeholder="사용하실 닉네임을 입력하세요"]', 'Admin User');
    await page.fill('input[placeholder="your@email.com"]', 'admin@innerspell.com');
    await page.fill('input[placeholder="•••••••• (6자 이상)"]', 'admin123');
    await page.screenshot({ path: 'signup-02-filled.png' });
    
    // 3. 회원가입 버튼 클릭 (약관 동의 체크박스가 없을 수 있음)
    console.log('📍 회원가입 버튼 클릭...');
    const signupButton = page.locator('button[type="submit"]:has-text("이메일로 회원가입")');
    await signupButton.click();
    
    // 5. 회원가입 결과 대기
    console.log('📍 회원가입 처리 대기...');
    await page.waitForTimeout(5000);
    
    // 6. 현재 위치 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    await page.screenshot({ path: 'signup-03-result.png' });
    
    if (currentUrl === 'http://localhost:4000/' || currentUrl.includes('/onboarding')) {
      console.log('✅ 회원가입 성공!');
      
      // 관리자 대시보드 접근 시도
      console.log('\n📍 관리자 대시보드 접근 시도...');
      await page.goto('http://localhost:4000/admin');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'signup-04-admin.png' });
      
      const dashboardVisible = await page.locator('h1:has-text("관리자 대시보드")').isVisible().catch(() => false);
      if (dashboardVisible) {
        console.log('✅ 관리자 대시보드 접근 성공!');
      } else {
        console.log('❌ 관리자 대시보드 접근 실패 - 일반 사용자로 가입됨');
      }
    } else {
      console.log('❌ 회원가입 실패');
      
      // 에러 메시지 확인
      const errorBox = page.locator('.bg-destructive\\/10');
      if (await errorBox.isVisible()) {
        const errorText = await errorBox.textContent();
        console.log('에러 메시지:', errorText);
      }
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ path: 'signup-error.png' });
  } finally {
    await page.waitForTimeout(30000); // 30초 대기
    await browser.close();
  }
})();