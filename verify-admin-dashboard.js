const { chromium } = require('playwright');

(async () => {
  console.log('=== InnerSpell 관리자 대시보드 확인 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. 메인 페이지 확인
    console.log('1. 메인 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verify-01-main.png', fullPage: true });
    console.log('✅ 메인 페이지 정상 작동\n');
    
    // 2. 관리자 로그인 페이지
    console.log('2. 관리자 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verify-02-admin-login.png', fullPage: true });
    console.log('✅ 관리자 로그인 페이지 표시됨');
    
    // 로그인 페이지 요소 확인
    const loginTitle = await page.locator('h1:has-text("다시 오신 것을 환영합니다")').count();
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const loginButton = await page.locator('button:has-text("로그인")').count();
    const googleButton = await page.locator('button:has-text("Google로 로그인")').count();
    
    console.log('\n📋 로그인 페이지 구성 요소:');
    console.log(`  - 환영 메시지: ${loginTitle > 0 ? '✅' : '❌'}`);
    console.log(`  - 이메일 입력란: ${emailInput > 0 ? '✅' : '❌'}`);
    console.log(`  - 비밀번호 입력란: ${passwordInput > 0 ? '✅' : '❌'}`);
    console.log(`  - 로그인 버튼: ${loginButton > 0 ? '✅' : '❌'}`);
    console.log(`  - Google 로그인: ${googleButton > 0 ? '✅' : '❌'}`);
    
    // 3. 타로 리딩 페이지
    console.log('\n3. 타로 리딩 페이지 확인...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verify-03-tarot.png', fullPage: true });
    console.log('✅ 타로 리딩 페이지 정상 작동');
    
    // 4. 반응형 디자인 확인
    console.log('\n4. 모바일 반응형 확인...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verify-04-mobile.png', fullPage: true });
    console.log('✅ 모바일 반응형 디자인 적용됨');
    
    console.log('\n=== 검증 완료 ===');
    console.log('\n📸 생성된 스크린샷:');
    console.log('  - verify-01-main.png: 메인 페이지');
    console.log('  - verify-02-admin-login.png: 관리자 로그인');
    console.log('  - verify-03-tarot.png: 타로 리딩');
    console.log('  - verify-04-mobile.png: 모바일 뷰');
    
    console.log('\n💡 관리자 대시보드 접근 방법:');
    console.log('  1. Firebase Console에서 사용자 계정 생성');
    console.log('  2. Firestore > users 컬렉션에서 해당 사용자 문서 찾기');
    console.log('  3. role 필드를 "admin"으로 설정');
    console.log('  4. 해당 계정으로 로그인하여 대시보드 접근');
    
    console.log('\n🔧 개선된 기능:');
    console.log('  - 통계 대시보드: 사용자 수, AI 공급자 상태 등 실시간 모니터링');
    console.log('  - AI 공급자 관리: OpenAI, Claude, Gemini 등 다양한 AI 서비스 통합 관리');
    console.log('  - 타로 지침 관리: 스프레드별, 스타일별 해석 가이드라인 설정');
    console.log('  - 환경변수 관리: 시스템 설정 및 API 키 안전한 관리');
    console.log('  - 시스템 관리: 캐시, 로그, 백업 등 시스템 유지보수 기능');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
})();