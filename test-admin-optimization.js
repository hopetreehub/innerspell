const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('📊 관리자 페이지 최적화 테스트...');
    
    // 관리자 페이지로 이동
    console.log('1. 관리자 페이지 접속 (사용통계 탭)...');
    await page.goto('http://localhost:4000/admin?tab=usage-stats');
    await page.waitForTimeout(3000);
    
    // 로그인 여부 확인
    const isLoginPage = await page.url().includes('sign-in');
    if (isLoginPage) {
      console.log('⚠️ 로그인이 필요합니다. 홈페이지로 이동하여 최적화 효과를 보여드리겠습니다.');
      
      // 홈페이지로 이동
      await page.goto('http://localhost:4000/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'test-screenshots/home-optimized.png',
        fullPage: true 
      });
      console.log('✅ 홈페이지 스크린샷 저장');
    } else {
      // 관리자 페이지 스크린샷
      await page.screenshot({ 
        path: 'test-screenshots/admin-usage-stats.png',
        fullPage: true 
      });
      console.log('✅ 관리자 사용통계 스크린샷 저장');
      
      // 실시간 모니터링 탭으로 이동
      console.log('\n2. 실시간 모니터링 탭으로 이동...');
      await page.goto('http://localhost:4000/admin?tab=real-time-monitoring');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-screenshots/admin-realtime-monitoring.png',
        fullPage: true 
      });
      console.log('✅ 실시간 모니터링 스크린샷 저장');
    }

    console.log('\n✨ 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();