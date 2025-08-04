const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧹 최종 정리 상태 확인\n');
    
    // 강제 새로고침으로 캐시 무시
    await page.goto('http://localhost:4000/sign-in', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 강제 새로고침
    await page.reload({ waitUntil: 'networkidle' });
    
    console.log('✅ 로그인 페이지 로드 완료');
    
    // 개발 환경 도우미 완전 제거 확인
    const devHelperElements = [
      await page.locator('text=개발 환경 도우미').count(),
      await page.locator('text=관리자로 로그인').count(),
      await page.locator('.border-orange-300').count(),
      await page.locator('.bg-orange-50').count()
    ];
    
    const totalDevElements = devHelperElements.reduce((sum, count) => sum + count, 0);
    
    console.log('🔍 개발 환경 도우미 제거 상태:');
    console.log(`  - 도우미 텍스트: ${devHelperElements[0]} 개`);
    console.log(`  - 관리자 버튼: ${devHelperElements[1]} 개`);
    console.log(`  - 주황색 테두리: ${devHelperElements[2]} 개`);
    console.log(`  - 주황색 배경: ${devHelperElements[3]} 개`);
    console.log(`  - 총 개발 요소: ${totalDevElements} 개`);
    console.log(`  - 상태: ${totalDevElements === 0 ? '✅ 완전 제거됨' : '❌ 일부 요소 남아있음'}`);
    
    // 일반 로그인 폼 요소 확인
    const loginElements = {
      title: await page.locator('h2').first().textContent(),
      emailInput: await page.locator('input[type="email"]').count(),
      passwordInput: await page.locator('input[type="password"]').count(),
      loginButton: await page.locator('button:has-text("로그인")').first().count(),
      googleButton: await page.locator('button:has-text("Google로 로그인")').count(),
      signupLink: await page.locator('a[href="/sign-up"]').count()
    };
    
    console.log('\n📋 일반 로그인 폼 상태:');
    console.log(`  - 제목: "${loginElements.title}"`);
    console.log(`  - 이메일 입력: ${loginElements.emailInput} 개`);
    console.log(`  - 비밀번호 입력: ${loginElements.passwordInput} 개`);
    console.log(`  - 로그인 버튼: ${loginElements.loginButton} 개`);
    console.log(`  - Google 로그인: ${loginElements.googleButton} 개`);
    console.log(`  - 회원가입 링크: ${loginElements.signupLink} 개`);
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'final-clean-signin.png', 
      fullPage: true 
    });
    
    console.log('\n📊 결과: final-clean-signin.png 저장');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
  } finally {
    await browser.close();
  }
})();