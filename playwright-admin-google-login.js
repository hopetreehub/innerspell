const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 관리자 Google 로그인 후 통계 페이지 확인 시작...');
    
    // 관리자 페이지 접속
    const adminUrl = 'https://test-studio-firebase.vercel.app/admin';
    console.log(`📍 접속 URL: ${adminUrl}`);
    
    await page.goto(adminUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`🌐 현재 URL: ${currentUrl}`);
    
    // Google 로그인 버튼 찾기
    const googleLoginSelectors = [
      'text="Google로 로그인"',  
      'button:has-text("Google")',
      '[data-provider="google"]',
      '.google-signin'
    ];
    
    let googleButtonFound = false;
    let googleButton = null;
    
    for (const selector of googleLoginSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`🔍 Google 로그인 버튼 발견 (${selector}): ${count}개`);
          googleButton = page.locator(selector).first();
          googleButtonFound = true;
          break;
        }
      } catch (e) {
        // 선택자가 유효하지 않은 경우 무시
      }
    }
    
    if (!googleButtonFound) {
      console.log('⚠️ Google 로그인 버튼을 찾을 수 없음. 일반 로그인 페이지일 수 있음.');
      
      // 일반 로그인 페이지 확인
      const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
      const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
      
      console.log(`📧 이메일 입력 필드: ${hasEmailInput ? '있음' : '없음'}`);
      console.log(`🔒 비밀번호 입력 필드: ${hasPasswordInput ? '있음' : '없음'}`);
      
      // 스크린샷 저장
      const screenshotPath = '/mnt/e/project/test-studio-firebase/admin-no-google-login.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Google 로그인 버튼 없는 상태 스크린샷: ${screenshotPath}`);
      
      return;
    }
    
    console.log('🖱️ Google 로그인 버튼 클릭 시도...');
    await googleButton.click();
    await page.waitForTimeout(3000);
    
    // Google 로그인 페이지로 이동했는지 확인
    const newUrl = page.url();
    console.log(`🌐 Google 로그인 후 URL: ${newUrl}`);
    
    if (newUrl.includes('accounts.google.com')) {
      console.log('🎯 Google 로그인 페이지로 리다이렉트됨');
      
      // Google 로그인 페이지 스크린샷
      const googleScreenshotPath = '/mnt/e/project/test-studio-firebase/google-login-page.png';
      await page.screenshot({ path: googleScreenshotPath, fullPage: true });
      console.log(`📸 Google 로그인 페이지 스크린샷: ${googleScreenshotPath}`);
      
      console.log('⚠️ Google 로그인은 실제 계정이 필요하므로 자동화할 수 없습니다.');
      console.log('📋 수동 테스트 가이드:');
      console.log('1. 브라우저에서 https://test-studio-firebase.vercel.app/admin 접속');
      console.log('2. "Google로 로그인" 버튼 클릭');
      console.log('3. junsupark9999@gmail.com 계정으로 로그인');
      console.log('4. 관리자 대시보드에서 첫 번째 탭이 "통계"인지 확인');
      console.log('5. 차트 컴포넌트들이 로드되는지 확인');
      
    } else {
      console.log('❌ Google 로그인 페이지로 리다이렉트되지 않음');
      
      // 현재 페이지 스크린샷
      const errorScreenshotPath = '/mnt/e/project/test-studio-firebase/google-login-failed.png';
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      console.log(`📸 Google 로그인 실패 스크린샷: ${errorScreenshotPath}`);
    }
    
    console.log('✅ Google 로그인 테스트 완료');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 발생 시에도 스크린샷 저장
    const errorScreenshotPath = '/mnt/e/project/test-studio-firebase/admin-google-login-error.png';
    try {
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      console.log(`📸 오류 상황 스크린샷 저장: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    // 브라우저를 자동으로 닫지 않고 수동 테스트를 위해 대기
    console.log('🔍 수동 테스트를 위해 브라우저를 열어둡니다. 5분 후 자동 종료됩니다...');
    await page.waitForTimeout(300000); // 5분 대기
    await browser.close();
  }
})();