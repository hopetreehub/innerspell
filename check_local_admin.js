const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 로컬 관리자 페이지 접속...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('2. 현재 페이지 상태 확인...');
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    const url = page.url();
    console.log(`현재 URL: ${url}`);
    
    // 페이지 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/local-admin-page.png', 
      fullPage: true 
    });
    
    // 로그인 필요한지 확인
    const isLoginPage = url.includes('/sign-in');
    if (isLoginPage) {
      console.log('로그인 페이지로 리다이렉트됨. 관리자 페이지 접근을 위해 로그인이 필요합니다.');
    } else {
      console.log('3. 실시간 탭 찾기 시도...');
      
      // 실시간 탭 찾기 (다양한 선택자 시도)
      const realtimeSelectors = [
        'text="실시간"',
        '[value="live-monitoring"]',
        'button:has-text("실시간")',
        'div:has-text("실시간")',
        '[data-state="active"][value="live-monitoring"]',
        '.tab:has-text("실시간")'
      ];
      
      let realtimeTab = null;
      for (const selector of realtimeSelectors) {
        try {
          const element = await page.locator(selector).first();
          const isVisible = await element.isVisible().catch(() => false);
          if (isVisible) {
            console.log(`실시간 탭 발견: ${selector}`);
            realtimeTab = element;
            break;
          }
        } catch (e) {
          // 계속 시도
        }
      }
      
      if (realtimeTab) {
        console.log('4. 실시간 탭 클릭...');
        await realtimeTab.click();
        await page.waitForTimeout(5000);
        
        console.log('5. 실시간 모니터링 대시보드 확인...');
        await page.screenshot({ 
          path: '/mnt/e/project/test-studio-firebase/local-realtime-dashboard.png', 
          fullPage: true 
        });
        
        // SSE 연결 상태 확인
        const connectionStatusElements = await page.locator('text=/연결 < /dev/null | Connection|SSE|실시간/i').count();
        console.log(`연결 상태 관련 요소: ${connectionStatusElements}개`);
        
        // 실시간 데이터 카드들 확인
        const statsCards = await page.locator('[class*="card"]:has(h3), [class*="Card"]:has(h3)').count();
        console.log(`통계 카드 개수: ${statsCards}개`);
        
        // 알림 시스템 확인
        const alertElements = await page.locator('text=/알림|Alert|Notification/i').count();
        console.log(`알림 관련 요소: ${alertElements}개`);
        
        console.log('6. 실시간 기능들 확인...');
        
        // 활성 사용자 섹션
        const activeUsersSection = await page.locator('text="활성 사용자"').isVisible().catch(() => false);
        console.log(`활성 사용자 섹션 존재: ${activeUsersSection}`);
        
        // 실시간 이벤트 섹션
        const realtimeEventsSection = await page.locator('text="실시간 이벤트"').isVisible().catch(() => false);
        console.log(`실시간 이벤트 섹션 존재: ${realtimeEventsSection}`);
        
        // 시스템 성능 섹션
        const performanceSection = await page.locator('text=/메모리|CPU|성능/').isVisible().catch(() => false);
        console.log(`시스템 성능 섹션 존재: ${performanceSection}`);
        
      } else {
        console.log('실시간 탭을 찾을 수 없습니다.');
        
        // 모든 탭들 나열
        const allTabs = await page.locator('[role="tab"], .tab, button').allTextContents();
        console.log('발견된 탭들:', allTabs.filter(text => text.trim().length > 0));
        
        // TabsList의 HTML 구조 확인
        const tabsList = await page.locator('[role="tablist"]').first();
        if (await tabsList.isVisible().catch(() => false)) {
          const tabsHTML = await tabsList.innerHTML().catch(() => '');
          console.log('TabsList HTML (일부):', tabsHTML.substring(0, 1000));
        }
      }
    }
    
    console.log('7. 최종 스크린샷...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/local-final-state.png', 
      fullPage: true 
    });
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/local-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();
