const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 로그인 페이지 접속 중...');
    await page.goto('http://localhost:4000/signin');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 저장
    await page.screenshot({ path: 'dev-auth-01-signin-page.png', fullPage: true });
    console.log('✅ 로그인 페이지 스크린샷 저장: dev-auth-01-signin-page.png');
    
    // DevAuthHelper 컴포넌트가 표시되는지 확인
    const devHelper = await page.locator('text=개발 환경 도우미').isVisible();
    console.log(`\n2. DevAuthHelper 표시 상태: ${devHelper ? '표시됨 (문제!)' : '숨겨짐 (정상)'}`);
    
    if (devHelper) {
      console.log('⚠️  경고: DevAuthHelper가 여전히 표시되고 있습니다!');
      await page.screenshot({ path: 'dev-auth-02-helper-visible.png', fullPage: true });
    } else {
      console.log('✅ DevAuthHelper가 정상적으로 숨겨져 있습니다.');
    }
    
    // 페이지 소스에서 하드코딩된 정보 확인
    const pageContent = await page.content();
    const hasHardcodedEmail = pageContent.includes('junsupark9999@gmail.com');
    const hasHardcodedPassword = pageContent.includes('dkssud123!');
    
    console.log(`\n3. 보안 검사 결과:`);
    console.log(`   - 하드코딩된 이메일 발견: ${hasHardcodedEmail ? 'YES (문제!)' : 'NO (정상)'}`);
    console.log(`   - 하드코딩된 비밀번호 발견: ${hasHardcodedPassword ? 'YES (문제!)' : 'NO (정상)'}`);
    
    // 일반 로그인 폼 확인
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    console.log('\n✅ 일반 로그인 폼이 정상적으로 표시됩니다.');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'dev-auth-error.png' });
  } finally {
    await browser.close();
  }
})();