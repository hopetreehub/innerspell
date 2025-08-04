const { chromium } = require('playwright');

(async () => {
  console.log('🚀 프로덕션 준비 상태 점검 시작...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. 홈페이지 확인
    console.log('\n📍 홈페이지 확인...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/prod-check-01-homepage.png', fullPage: true });
    console.log('✅ 홈페이지 스크린샷 저장');

    // 2. 로그인 페이지 - DevAuthHelper 확인
    console.log('\n📍 로그인 페이지 확인...');
    await page.goto('http://localhost:4000/sign-in');
    await page.waitForLoadState('networkidle');
    
    // 개발 환경 도우미 확인
    const devHelper = await page.locator('text=개발 환경 도우미').isVisible();
    if (devHelper) {
      console.log('⚠️  개발 환경 도우미가 표시됨 - 제거 필요!');
      await page.screenshot({ path: 'screenshots/prod-check-02-signin-with-devhelper.png', fullPage: true });
    } else {
      console.log('✅ 개발 환경 도우미 없음');
      await page.screenshot({ path: 'screenshots/prod-check-02-signin-clean.png', fullPage: true });
    }

    // 3. 회원가입 페이지
    console.log('\n📍 회원가입 페이지 확인...');
    await page.goto('http://localhost:4000/sign-up');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/prod-check-03-signup.png', fullPage: true });

    // 4. 타로 카드 페이지
    console.log('\n📍 타로 카드 페이지 확인...');
    await page.goto('http://localhost:4000/tarot');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/prod-check-04-tarot.png', fullPage: true });

    // 5. 관리자 대시보드 접근 시도 (로그인 필요)
    console.log('\n📍 관리자 대시보드 접근 확인...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 로그인 페이지로 리다이렉트 되는지 확인
    const currentUrl = page.url();
    if (currentUrl.includes('/sign-in')) {
      console.log('✅ 관리자 페이지 보호됨 - 로그인 필요');
    } else {
      console.log('⚠️  관리자 페이지가 보호되지 않음!');
    }
    
    // 6. 콘솔 로그 확인
    console.log('\n📍 콘솔 로그 확인...');
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'warn' || msg.type() === 'error') {
        consoleLogs.push({ type: msg.type(), text: msg.text() });
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    const debugLogs = consoleLogs.filter(log => 
      log.text.includes('🔍') || 
      log.text.includes('🎉') || 
      log.text.includes('DEBUG') ||
      log.text.includes('console.log')
    );
    
    if (debugLogs.length > 0) {
      console.log(`⚠️  디버그 로그 ${debugLogs.length}개 발견됨 - 제거 필요!`);
      debugLogs.forEach(log => console.log(`   - ${log.type}: ${log.text.substring(0, 50)}...`));
    } else {
      console.log('✅ 디버그 로그 없음');
    }

    // 7. 환경 변수 확인
    console.log('\n📍 환경 변수 및 설정 확인...');
    console.log('   - NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('   - 포트: 4000');
    
    // 8. 테스트 계정 확인
    console.log('\n📍 테스트 계정으로 로그인 시도...');
    await page.goto('http://localhost:4000/sign-in');
    await page.fill('input[type="email"]', 'testadmin@innerspell.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    const hasToast = await page.locator('text=로그인 성공').isVisible().catch(() => false);
    if (hasToast) {
      console.log('⚠️  테스트 계정이 작동함 - 프로덕션에서는 제거 필요!');
    } else {
      console.log('✅ 테스트 계정 로그인 실패 (정상)');
    }

    console.log('\n✨ 프로덕션 준비 상태 점검 완료!');
    console.log('\n📋 정리 필요 항목:');
    console.log('1. DevAuthHelper 컴포넌트 제거');
    console.log('2. 디버그 로그 제거');
    console.log('3. 테스트 계정 제거 (testadmin@innerspell.com)');
    console.log('4. 개발용 주석 및 TODO 제거');
    console.log('5. NODE_ENV를 production으로 설정');

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
})();