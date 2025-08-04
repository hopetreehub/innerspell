const { chromium } = require('playwright');

(async () => {
  console.log('전체 로그인 플로우 테스트...');
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
    await page.screenshot({ path: 'login-flow-01-initial.png' });
    
    // 비밀번호 없이 로그인 화면인지 확인
    const isPasswordless = await page.locator('text=비밀번호 없이 로그인').isVisible().catch(() => false);
    
    if (isPasswordless) {
      console.log('📍 비밀번호 없이 로그인 화면 감지됨 - 뒤로가기 클릭...');
      const backButton = page.locator('button[variant="ghost"]:has(svg)').first();
      await backButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 2. 일반 로그인 폼이 표시되는지 확인
    console.log('📍 일반 로그인 폼 확인...');
    await page.waitForSelector('input[placeholder="your@email.com"]');
    await page.waitForSelector('input[placeholder="••••••••"]');
    
    // 3. 로그인 정보 입력
    console.log('📍 로그인 정보 입력...');
    await page.fill('input[placeholder="your@email.com"]', 'junsupark9999@gmail.com');
    await page.fill('input[placeholder="••••••••"]', 'dkssud123!');
    await page.screenshot({ path: 'login-flow-02-filled.png' });
    
    // 4. 로그인 버튼 찾기 (다양한 방법 시도)
    console.log('📍 로그인 버튼 찾기...');
    let loginButton;
    
    // 방법 1: type="submit" 버튼
    loginButton = page.locator('button[type="submit"]:has-text("로그인")');
    if (!(await loginButton.isVisible())) {
      // 방법 2: 텍스트로만 찾기
      loginButton = page.locator('button:has-text("로그인")').filter({ hasNotText: '이메일로' });
    }
    
    if (await loginButton.isVisible()) {
      console.log('✅ 로그인 버튼 발견');
      await loginButton.click();
      
      // 5. 로그인 결과 대기
      console.log('📍 로그인 처리 대기...');
      await page.waitForTimeout(5000);
      
      // 6. 현재 위치 확인
      const currentUrl = page.url();
      console.log('현재 URL:', currentUrl);
      await page.screenshot({ path: 'login-flow-03-result.png' });
      
      if (currentUrl === 'http://localhost:4000/' || currentUrl === 'http://localhost:4000/admin') {
        console.log('✅ 로그인 성공!');
        
        // 관리자 대시보드 접근 시도
        if (currentUrl !== 'http://localhost:4000/admin') {
          console.log('\n📍 관리자 대시보드 접근 시도...');
          await page.goto('http://localhost:4000/admin');
          await page.waitForLoadState('networkidle');
        }
        
        await page.screenshot({ path: 'login-flow-04-admin.png' });
        
        const dashboardVisible = await page.locator('h1:has-text("관리자 대시보드")').isVisible().catch(() => false);
        if (dashboardVisible) {
          console.log('✅ 관리자 대시보드 접근 성공!');
        } else {
          console.log('❌ 관리자 대시보드 접근 실패');
          const accessDenied = await page.locator('text=접근 권한이 없습니다').isVisible().catch(() => false);
          if (accessDenied) {
            console.log('⚠️ 권한 없음 메시지 표시됨 - 일반 사용자로 로그인됨');
          }
        }
      } else {
        console.log('❌ 로그인 실패');
        
        // 에러 메시지 확인
        const errorBox = page.locator('.bg-destructive\\/10');
        if (await errorBox.isVisible()) {
          const errorText = await errorBox.textContent();
          console.log('에러 메시지:', errorText);
        }
      }
    } else {
      console.log('❌ 로그인 버튼을 찾을 수 없음');
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ path: 'login-flow-error.png' });
  } finally {
    await page.waitForTimeout(30000); // 30초 대기
    await browser.close();
  }
})();