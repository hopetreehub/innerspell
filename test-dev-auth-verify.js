const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 서버 상태 확인 중...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // 홈페이지 스크린샷
    await page.screenshot({ path: 'dev-auth-01-homepage.png', fullPage: true });
    console.log('✅ 홈페이지 스크린샷 저장: dev-auth-01-homepage.png');
    
    // 로그인 페이지로 이동
    console.log('\n2. 로그인 페이지로 이동 중...');
    await page.goto('http://localhost:4000/signin');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000); // 추가 대기
    
    // 로그인 페이지 스크린샷
    await page.screenshot({ path: 'dev-auth-02-signin-page.png', fullPage: true });
    console.log('✅ 로그인 페이지 스크린샷 저장: dev-auth-02-signin-page.png');
    
    // DevAuthHelper 컴포넌트 확인
    const devHelperText = await page.locator('text=개발 환경 도우미').count();
    const devHelperButton = await page.locator('text=관리자로 로그인').count();
    
    console.log(`\n3. DevAuthHelper 검사 결과:`);
    console.log(`   - "개발 환경 도우미" 텍스트: ${devHelperText > 0 ? '발견됨' : '없음'}`);
    console.log(`   - "관리자로 로그인" 버튼: ${devHelperButton > 0 ? '발견됨' : '없음'}`);
    
    // NODE_ENV 확인을 위한 콘솔 로그 캡처
    page.on('console', msg => {
      if (msg.text().includes('NODE_ENV')) {
        console.log('   - 콘솔 로그:', msg.text());
      }
    });
    
    // 개발자 도구에서 환경 변수 확인
    await page.evaluate(() => {
      console.log('NODE_ENV:', process.env.NODE_ENV);
    });
    
    // 페이지 소스 검사
    const pageContent = await page.content();
    const securityCheck = {
      hardcodedEmail: pageContent.includes('junsupark9999@gmail.com'),
      hardcodedPassword: pageContent.includes('dkssud123!'),
      devAuthHelper: pageContent.includes('DevAuthHelper')
    };
    
    console.log(`\n4. 보안 검사 결과:`);
    console.log(`   - 하드코딩된 이메일: ${securityCheck.hardcodedEmail ? '⚠️ 발견됨' : '✅ 없음'}`);
    console.log(`   - 하드코딩된 비밀번호: ${securityCheck.hardcodedPassword ? '⚠️ 발견됨' : '✅ 없음'}`);
    console.log(`   - DevAuthHelper 컴포넌트: ${securityCheck.devAuthHelper ? '로드됨' : '제거됨'}`);
    
    // 정상적인 로그인 폼 확인
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    
    console.log(`\n5. 로그인 폼 상태:`);
    console.log(`   - 이메일 입력 필드: ${emailInput > 0 ? '✅ 존재' : '❌ 없음'}`);
    console.log(`   - 비밀번호 입력 필드: ${passwordInput > 0 ? '✅ 존재' : '❌ 없음'}`);
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'dev-auth-error.png' });
  } finally {
    await browser.close();
  }
})();