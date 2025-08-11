const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Admin 페이지 접근을 위한 로그인 프로세스 시작...');
  
  try {
    // 로그인 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('로그인 페이지 로드 완료');
    await page.waitForTimeout(2000);

    // 관리자 테스트 계정으로 로그인
    console.log('\n관리자 계정으로 로그인 시도...');
    console.log('이메일: admin@example.com');
    
    // 이메일 입력
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.waitForTimeout(500);
    
    // 비밀번호 입력
    await page.fill('input[type="password"]', 'admin123456');
    await page.waitForTimeout(500);
    
    // 로그인 전 스크린샷
    await page.screenshot({ 
      path: 'login-form-filled.png'
    });
    console.log('로그인 폼 스크린샷 저장: login-form-filled.png');
    
    // 로그인 버튼 클릭
    await page.click('button:has-text("로그인")');
    console.log('로그인 버튼 클릭');
    
    // 로그인 처리 대기
    await page.waitForTimeout(5000);
    
    // 현재 URL 확인
    const afterLoginUrl = page.url();
    console.log(`\n로그인 후 URL: ${afterLoginUrl}`);
    
    if (afterLoginUrl.includes('/admin')) {
      console.log('✅ Admin 페이지로 성공적으로 이동했습니다.');
      
      // Admin 페이지가 완전히 로드될 때까지 대기
      await page.waitForTimeout(3000);
      
      // Admin 페이지 전체 스크린샷
      await page.screenshot({ 
        path: 'admin-dashboard.png',
        fullPage: true 
      });
      console.log('Admin 대시보드 스크린샷 저장: admin-dashboard.png');
      
      // 실시간 모니터링 탭 클릭
      console.log('\n실시간 모니터링 탭 확인...');
      const monitoringTab = page.locator('button[role="tab"]:has-text("실시간")');
      if (await monitoringTab.count() > 0) {
        await monitoringTab.click();
        console.log('실시간 모니터링 탭 클릭');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'admin-realtime-monitoring.png',
          fullPage: true 
        });
        console.log('실시간 모니터링 스크린샷 저장: admin-realtime-monitoring.png');
      }
      
      // 사용통계 탭 클릭
      console.log('\n사용통계 탭 확인...');
      const statsTab = page.locator('button[role="tab"]:has-text("통계")');
      if (await statsTab.count() > 0) {
        await statsTab.click();
        console.log('사용통계 탭 클릭');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'admin-usage-stats.png',
          fullPage: true 
        });
        console.log('사용통계 스크린샷 저장: admin-usage-stats.png');
      }
      
      // 개발 모드 메시지 확인
      const pageContent = await page.content();
      if (pageContent.includes('개발 모드') || pageContent.includes('Development Mode')) {
        console.log('\n⚠️ 개발 모드 메시지가 발견되었습니다.');
      } else {
        console.log('\n✅ 개발 모드 메시지가 표시되지 않습니다.');
      }
      
      // 실제 데이터 표시 확인
      const numbers = await page.locator('text=/[0-9]+/').allTextContents();
      const hasRealData = numbers.some(num => parseInt(num) > 0);
      
      if (hasRealData) {
        console.log('✅ 실제 데이터가 표시되고 있습니다.');
        console.log(`  - 샘플 데이터: ${numbers.slice(0, 5).join(', ')}`);
      } else {
        console.log('⚠️ 데이터가 표시되지 않거나 모두 0입니다.');
      }
      
    } else {
      console.log('❌ Admin 페이지로 이동하지 못했습니다.');
      console.log('현재 페이지 스크린샷 저장 중...');
      await page.screenshot({ 
        path: 'login-failed.png',
        fullPage: true 
      });
      
      // 오류 메시지 확인
      const errorMessage = await page.locator('text=/오류|에러|Error|잘못/i').textContent().catch(() => null);
      if (errorMessage) {
        console.log(`오류 메시지: ${errorMessage}`);
      }
    }

    // 다른 계정으로도 시도
    if (!afterLoginUrl.includes('/admin')) {
      console.log('\n\n다른 테스트 계정으로 재시도...');
      
      // 로그아웃 또는 로그인 페이지로 다시 이동
      await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
        waitUntil: 'networkidle'
      });
      
      // 이메일 입력
      await page.fill('input[type="email"]', 'test@example.com');
      await page.waitForTimeout(500);
      
      // 비밀번호 입력
      await page.fill('input[type="password"]', 'test123456');
      await page.waitForTimeout(500);
      
      // 로그인 버튼 클릭
      await page.click('button:has-text("로그인")');
      console.log('일반 사용자로 로그인 시도');
      
      await page.waitForTimeout(5000);
      
      const secondAttemptUrl = page.url();
      console.log(`두 번째 시도 후 URL: ${secondAttemptUrl}`);
      
      // Admin 페이지로 직접 이동 시도
      await page.goto('https://test-studio-firebase.vercel.app/admin', {
        waitUntil: 'networkidle'
      });
      
      await page.waitForTimeout(3000);
      
      const adminAccessUrl = page.url();
      console.log(`Admin 직접 접근 후 URL: ${adminAccessUrl}`);
      
      if (!adminAccessUrl.includes('/admin')) {
        console.log('✅ 일반 사용자는 Admin 페이지에 접근할 수 없음 (정상)');
      }
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // 브라우저를 열어둔 상태로 15초 대기
  console.log('\n브라우저를 15초간 열어둡니다...');
  await page.waitForTimeout(15000);

  await browser.close();
  console.log('테스트 완료');
})();