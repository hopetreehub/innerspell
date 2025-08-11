const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('개발 모드 및 인증 상태 확인...');
  
  try {
    // 환경 변수 확인
    console.log('\n=== 환경 변수 상태 ===');
    console.log('NEXT_PUBLIC_ENABLE_DEV_AUTH:', process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH || 'not set');
    console.log('NEXT_PUBLIC_USE_REAL_AUTH:', process.env.NEXT_PUBLIC_USE_REAL_AUTH || 'not set');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
    
    // 홈페이지로 이동하여 개발 모드 확인
    await page.goto('https://test-studio-firebase.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('\n홈페이지 로드 완료');
    await page.waitForTimeout(2000);

    // 콘솔 로그 수집
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('Auth') || msg.text().includes('DEV') || msg.text().includes('admin')) {
        consoleLogs.push(msg.text());
      }
    });

    // admin 페이지로 직접 이동 시도 (인증 없이)
    console.log('\n인증 없이 admin 페이지 접근 시도...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    if (currentUrl.includes('/admin')) {
      console.log('✅ 개발 모드 활성화! 인증 없이 admin 페이지 접근 가능');
      
      // Admin 페이지 스크린샷
      await page.screenshot({ 
        path: 'admin-dev-mode.png',
        fullPage: true 
      });
      console.log('Admin 페이지 스크린샷 저장: admin-dev-mode.png');
      
      // 실시간 모니터링 탭 확인
      console.log('\n실시간 모니터링 탭 확인...');
      const monitoringTab = page.locator('button[role="tab"]').filter({ hasText: /실시간|Real.*time|Monitoring/i });
      
      if (await monitoringTab.count() > 0) {
        await monitoringTab.first().click();
        console.log('실시간 모니터링 탭 클릭');
        
        // 로딩 대기
        await page.waitForTimeout(5000);
        
        await page.screenshot({ 
          path: 'admin-realtime-dev.png',
          fullPage: true 
        });
        console.log('실시간 모니터링 스크린샷 저장: admin-realtime-dev.png');
        
        // 컨텐츠 확인
        const pageContent = await page.content();
        const hasMonitoringContent = pageContent.includes('현재 접속자') || 
                                   pageContent.includes('활성 세션') || 
                                   pageContent.includes('Active Users') ||
                                   pageContent.includes('Sessions');
        
        console.log(`실시간 모니터링 컨텐츠: ${hasMonitoringContent ? '있음' : '없음'}`);
      }
      
      // 사용 통계 탭 확인
      console.log('\n사용 통계 탭 확인...');
      const statsTab = page.locator('button[role="tab"]').filter({ hasText: /통계|Stats|Usage/i });
      
      if (await statsTab.count() > 0) {
        await statsTab.first().click();
        console.log('사용 통계 탭 클릭');
        
        // 로딩 대기
        await page.waitForTimeout(5000);
        
        await page.screenshot({ 
          path: 'admin-stats-dev.png',
          fullPage: true 
        });
        console.log('사용 통계 스크린샷 저장: admin-stats-dev.png');
        
        // 차트 확인
        const charts = await page.locator('canvas, .recharts-wrapper, svg[class*="chart"], div[class*="chart"]').count();
        console.log(`차트/그래프 개수: ${charts}개`);
      }
      
    } else {
      console.log('❌ 개발 모드가 비활성화되어 있습니다. 인증이 필요합니다.');
      console.log('리다이렉트된 URL:', currentUrl);
    }
    
    // 수집된 콘솔 로그 출력
    if (consoleLogs.length > 0) {
      console.log('\n=== 관련 콘솔 로그 ===');
      consoleLogs.forEach(log => console.log(log));
    }

  } catch (error) {
    console.error('확인 중 오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // 브라우저를 열어둔 상태로 15초 대기
  console.log('\n브라우저를 15초간 열어둡니다...');
  await page.waitForTimeout(15000);

  await browser.close();
  console.log('확인 완료');
})();