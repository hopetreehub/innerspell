const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧹 개발 환경 도우미 제거 확인\n');
    
    // 로그인 페이지로 이동
    await page.goto('http://localhost:4000/sign-in', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ 로그인 페이지 로드 완료');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(3000);
    
    // 개발 환경 도우미 컴포넌트 존재 여부 확인
    const devHelper = await page.$('.border-orange-300');
    const adminLoginButton = await page.locator('text=관리자로 로그인').count();
    const devHelperText = await page.locator('text=개발 환경 도우미').count();
    
    console.log('🔍 개발 환경 도우미 상태:');
    console.log(`  - 도우미 컨테이너: ${devHelper ? '❌ 존재' : '✅ 제거됨'}`);
    console.log(`  - 관리자 로그인 버튼: ${adminLoginButton > 0 ? '❌ 존재' : '✅ 제거됨'}`);
    console.log(`  - 도우미 텍스트: ${devHelperText > 0 ? '❌ 존재' : '✅ 제거됨'}`);
    
    // 일반 로그인 폼 확인
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const loginButton = await page.locator('text=로그인').first().count();
    const googleButton = await page.locator('text=Google로 로그인').count();
    
    console.log('\n📋 일반 로그인 폼 상태:');
    console.log(`  - 이메일 입력: ${emailInput > 0 ? '✅ 존재' : '❌ 없음'}`);
    console.log(`  - 비밀번호 입력: ${passwordInput > 0 ? '✅ 존재' : '❌ 없음'}`);
    console.log(`  - 로그인 버튼: ${loginButton > 0 ? '✅ 존재' : '❌ 없음'}`);
    console.log(`  - Google 로그인: ${googleButton > 0 ? '✅ 존재' : '❌ 없음'}`);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'dev-helper-removed.png', 
      fullPage: true 
    });
    
    console.log('\n📊 결과: dev-helper-removed.png 저장');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
  } finally {
    await browser.close();
  }
})();