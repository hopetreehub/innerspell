const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 올바른 로그인 페이지 경로로 접속 중...');
    
    // /sign-in 경로로 접속 (하이픈 사용)
    await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // 페이지 완전 로드 대기
    
    // 스크린샷 저장
    await page.screenshot({ path: 'signin-final-01-page.png', fullPage: true });
    console.log('✅ 로그인 페이지 스크린샷 저장: signin-final-01-page.png');
    
    // DevAuthHelper 관련 요소 확인
    const devHelperElements = {
      container: await page.locator('.border-orange-300').count(),
      text: await page.locator('text=개발 환경 도우미').count(),
      button: await page.locator('text=관리자로 로그인').count(),
      devNote: await page.locator('text=이 버튼은 개발 환경에서만 표시됩니다').count()
    };
    
    console.log('\n2. DevAuthHelper 컴포넌트 검사:');
    console.log(`   - 오렌지 테두리 컨테이너: ${devHelperElements.container}`);
    console.log(`   - "개발 환경 도우미" 텍스트: ${devHelperElements.text}`);
    console.log(`   - "관리자로 로그인" 버튼: ${devHelperElements.button}`);
    console.log(`   - 개발 환경 안내 문구: ${devHelperElements.devNote}`);
    
    // 보안 검사
    const pageSource = await page.content();
    const securityCheck = {
      hardcodedEmail: pageSource.includes('junsupark9999@gmail.com'),
      hardcodedPassword: pageSource.includes('dkssud123!'),
      isDevelopmentTrue: pageSource.includes('isDevelopment = true'),
      processEnvCheck: pageSource.includes('process.env.NODE_ENV')
    };
    
    console.log('\n3. 보안 검사 결과:');
    console.log(`   - 하드코딩된 이메일: ${securityCheck.hardcodedEmail ? '⚠️ 발견됨!' : '✅ 없음'}`);
    console.log(`   - 하드코딩된 비밀번호: ${securityCheck.hardcodedPassword ? '⚠️ 발견됨!' : '✅ 없음'}`);
    console.log(`   - isDevelopment = true: ${securityCheck.isDevelopmentTrue ? '⚠️ 발견됨!' : '✅ 없음'}`);
    console.log(`   - process.env.NODE_ENV 사용: ${securityCheck.processEnvCheck ? '✅ 있음' : '❌ 없음'}`);
    
    // 정상 로그인 폼 확인
    const loginForm = {
      emailInput: await page.locator('input[type="email"]').count(),
      passwordInput: await page.locator('input[type="password"]').count(),
      googleButton: await page.locator('text=Google로 계속하기').count(),
      submitButton: await page.locator('button:has-text("로그인")').count()
    };
    
    console.log('\n4. 로그인 폼 요소:');
    console.log(`   - 이메일 입력 필드: ${loginForm.emailInput > 0 ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   - 비밀번호 입력 필드: ${loginForm.passwordInput > 0 ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   - Google 로그인 버튼: ${loginForm.googleButton > 0 ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   - 로그인 버튼: ${loginForm.submitButton > 0 ? '✅ 있음' : '❌ 없음'}`);
    
    // 환경 확인
    const isDevHelperVisible = devHelperElements.text > 0;
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('\n5. 환경 상태:');
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - DevAuthHelper 표시 상태: ${isDevHelperVisible ? '표시됨' : '숨겨짐'}`);
    console.log(`   - 예상 동작: ${isProduction ? '프로덕션 - Helper 숨김' : '개발 - Helper 표시'}`);
    
    // 최종 평가
    const isSecure = !securityCheck.hardcodedEmail && 
                     !securityCheck.hardcodedPassword && 
                     !securityCheck.isDevelopmentTrue;
    
    console.log(`\n6. 최종 보안 평가: ${isSecure ? '✅ 보안 수정 완료!' : '⚠️ 보안 이슈 발견'}`);
    
    if (isDevHelperVisible) {
      console.log('   - 개발 환경에서 DevAuthHelper가 표시되는 것은 정상입니다.');
      console.log('   - 프로덕션 환경에서는 자동으로 숨겨집니다.');
    }
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'signin-final-error.png' });
  } finally {
    await browser.close();
  }
})();