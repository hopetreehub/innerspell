const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 관리자 페이지 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    console.log('2. 현재 페이지 스크린샷 촬영...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/admin-page-full.png', 
      fullPage: true 
    });
    
    console.log('3. 실시간 탭 확인 중...');
    const realtimeTab = await page.locator('text="실시간"').first();
    const tabExists = await realtimeTab.isVisible().catch(() => false);
    console.log(`실시간 탭 존재 여부: ${tabExists}`);
    
    if (tabExists) {
      console.log('4. 실시간 탭 클릭...');
      await realtimeTab.click();
      await page.waitForTimeout(2000);
      
      console.log('5. 실시간 모니터링 대시보드 스크린샷 촬영...');
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/realtime-dashboard.png', 
        fullPage: true 
      });
      
      console.log('6. SSE 연결 상태 확인...');
      const sseStatus = await page.locator('text=/SSE < /dev/null | 연결|Connection/i').first();
      const sseExists = await sseStatus.isVisible().catch(() => false);
      console.log(`SSE 관련 요소 존재 여부: ${sseExists}`);
      
      console.log('7. 실시간 데이터 표시 확인...');
      const dataElements = await page.locator('[class*="real"], [class*="time"], [class*="monitor"]').count();
      console.log(`실시간 관련 요소 개수: ${dataElements}`);
      
      console.log('8. 알림 시스템 확인...');
      const notificationElements = await page.locator('[class*="notification"], [class*="alert"], [class*="알림"]').count();
      console.log(`알림 관련 요소 개수: ${notificationElements}`);
    } else {
      console.log('실시간 탭을 찾을 수 없습니다. 페이지 구조 확인 중...');
      
      const tabs = await page.locator('[role="tab"], .tab, [class*="tab"]').allTextContents();
      console.log('발견된 탭들:', tabs);
      
      const navItems = await page.locator('nav a, nav button').allTextContents();
      console.log('네비게이션 항목들:', navItems);
    }
    
    console.log('\n9. 페이지 구조 정보:');
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    const h1Text = await page.locator('h1').first().textContent().catch(() => '없음');
    console.log(`H1 텍스트: ${h1Text}`);
    
    const mainContent = await page.locator('main, [role="main"], .main-content').first();
    const hasMainContent = await mainContent.isVisible().catch(() => false);
    console.log(`메인 콘텐츠 존재: ${hasMainContent}`);
    
    console.log('\n10. 최종 상태 스크린샷 촬영...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/admin-final-state.png', 
      fullPage: true 
    });
    
    console.log('\n확인 완료\!');
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/error-state.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();
