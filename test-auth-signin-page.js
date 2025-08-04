const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 정확한 로그인 페이지 경로 확인 중...');
    
    // /auth/signin 경로로 접속
    await page.goto('http://localhost:4000/auth/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // 페이지 완전 로드 대기
    
    // 스크린샷 저장
    await page.screenshot({ path: 'auth-signin-01-page.png', fullPage: true });
    console.log('✅ 로그인 페이지 스크린샷 저장: auth-signin-01-page.png');
    
    // DevAuthHelper 관련 요소 확인
    const elements = {
      devHelperContainer: await page.locator('.border-orange-300').count(),
      devHelperText: await page.locator('text=개발 환경 도우미').count(),
      adminLoginButton: await page.locator('text=관리자로 로그인').count(),
      orangeBgButton: await page.locator('.bg-orange-100').count()
    };
    
    console.log('\n2. DevAuthHelper 요소 검사:');
    console.log(`   - 오렌지색 테두리 컨테이너: ${elements.devHelperContainer}`);
    console.log(`   - "개발 환경 도우미" 텍스트: ${elements.devHelperText}`);
    console.log(`   - "관리자로 로그인" 버튼: ${elements.adminLoginButton}`);
    console.log(`   - 오렌지색 배경 버튼: ${elements.orangeBgButton}`);
    
    // 페이지 소스에서 민감한 정보 검색
    const pageSource = await page.content();
    const sensitiveInfo = {
      email: pageSource.includes('junsupark9999@gmail.com'),
      password: pageSource.includes('dkssud123!'),
      isDevelopmentTrue: pageSource.includes('isDevelopment = true')
    };
    
    console.log('\n3. 보안 검사 결과:');
    console.log(`   - 하드코딩된 이메일: ${sensitiveInfo.email ? '⚠️ 발견됨!' : '✅ 없음'}`);
    console.log(`   - 하드코딩된 비밀번호: ${sensitiveInfo.password ? '⚠️ 발견됨!' : '✅ 없음'}`);
    console.log(`   - isDevelopment = true: ${sensitiveInfo.isDevelopmentTrue ? '⚠️ 발견됨!' : '✅ 없음'}`);
    
    // 정상적인 로그인 폼 요소 확인
    const loginForm = {
      emailInput: await page.locator('input[type="email"]').count(),
      passwordInput: await page.locator('input[type="password"]').count(),
      submitButton: await page.locator('button[type="submit"]').count()
    };
    
    console.log('\n4. 로그인 폼 상태:');
    console.log(`   - 이메일 입력 필드: ${loginForm.emailInput > 0 ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   - 비밀번호 입력 필드: ${loginForm.passwordInput > 0 ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   - 제출 버튼: ${loginForm.submitButton > 0 ? '✅ 있음' : '❌ 없음'}`);
    
    // 결론
    const isSecure = !sensitiveInfo.email && !sensitiveInfo.password && 
                     !sensitiveInfo.isDevelopmentTrue && elements.devHelperText === 0;
    
    console.log(`\n5. 최종 평가: ${isSecure ? '✅ 보안 수정 완료!' : '⚠️ 추가 수정 필요'}`);
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'auth-signin-error.png' });
  } finally {
    await browser.close();
  }
})();