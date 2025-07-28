const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 로그인 페이지로 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // 로그인 페이지 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/login-page.png', 
      fullPage: true 
    });
    
    console.log('2. 로그인 시도는 건너뛰고 관리자 페이지로 직접 이동...');
    
    // 관리자 페이지로 직접 이동 (로그인 상태라면 접근 가능)
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    console.log('3. 현재 페이지 상태 확인...');
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    const url = page.url();
    console.log(`현재 URL: ${url}`);
    
    // 페이지 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/admin-access-attempt.png', 
      fullPage: true 
    });
    
    // 실시간 탭 찾기 시도
    console.log('4. 실시간 탭 찾기...');
    
    // 다양한 선택자로 실시간 탭 찾기
    const selectors = [
      'text="실시간"',
      '[data-testid*="realtime"]',
      '[data-testid*="live"]',
      'button:has-text("실시간")',
      'div:has-text("실시간")',
      '[value="live-monitoring"]',
      'text="Activity"'
    ];
    
    let realtimeElement = null;
    for (const selector of selectors) {
      try {
        realtimeElement = await page.locator(selector).first();
        const isVisible = await realtimeElement.isVisible().catch(() => false);
        if (isVisible) {
          console.log(`실시간 요소 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 선택자가 없으면 계속
      }
    }
    
    if (realtimeElement && await realtimeElement.isVisible().catch(() => false)) {
      console.log('5. 실시간 탭 클릭...');
      await realtimeElement.click();
      await page.waitForTimeout(3000);
      
      console.log('6. 실시간 대시보드 스크린샷...');
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/realtime-dashboard-vercel.png', 
        fullPage: true 
      });
      
      // SSE 연결 상태 확인
      console.log('7. SSE 연결 상태 확인...');
      const sseElements = await page.locator('text=/SSE < /dev/null | 연결|Connection|실시간 연결/i').count();
      console.log(`SSE 관련 요소 개수: ${sseElements}`);
      
      // 실시간 데이터 요소들 확인
      const realtimeDataElements = await page.locator('[class*="real"], [class*="time"], [class*="monitor"], [class*="dashboard"]').count();
      console.log(`실시간 데이터 관련 요소 개수: ${realtimeDataElements}`);
      
      // 알림 시스템 확인
      const alertElements = await page.locator('[class*="alert"], [class*="notification"], text=/알림/i').count();
      console.log(`알림 관련 요소 개수: ${alertElements}`);
      
    } else {
      console.log('실시간 탭을 찾을 수 없습니다.');
      
      // 페이지에 있는 모든 탭들 확인
      const allTabs = await page.locator('[role="tab"], .tab, button').allTextContents();
      console.log('페이지의 모든 탭/버튼:', allTabs.filter(text => text.trim().length > 0));
      
      // TabsList 요소 확인
      const tabsList = await page.locator('[role="tablist"], .tabs-list').first();
      if (await tabsList.isVisible().catch(() => false)) {
        const tabsListHTML = await tabsList.innerHTML();
        console.log('TabsList HTML 일부:', tabsListHTML.substring(0, 500));
      }
    }
    
    console.log('8. 최종 페이지 상태 스크린샷...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/final-admin-state.png', 
      fullPage: true 
    });
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/error-screenshot.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();
