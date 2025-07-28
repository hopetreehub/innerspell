const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 관리자 대시보드 통계 탭 확인...');
    
    // 콘솔 로그 캡처
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('admin') || text.includes('stats') || text.includes('chart')) {
        console.log(`[CONSOLE] ${text}`);
      }
    });
    
    // 홈페이지부터 시작
    await page.goto('https://test-studio-firebase.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📍 홈페이지 접속 완료');
    
    // 로그인 상태 확인
    const isLoggedIn = await page.locator('text="로그인"').count() === 0;
    console.log(`🔐 로그인 상태: ${isLoggedIn ? '로그인됨' : '로그인 안됨'}`);
    
    // 관리자 메뉴 확인
    const adminMenuSelectors = [
      'text="관리자 설정"',
      'text="관리자"',
      'text="Admin"',
      '[href="/admin"]',
      'a:has-text("관리자")'
    ];
    
    let adminMenuFound = false;
    for (const selector of adminMenuSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`🎯 관리자 메뉴 발견 (${selector}): ${count}개`);
          adminMenuFound = true;
          break;
        }
      } catch (e) {
        // 선택자 오류 무시
      }
    }
    
    if (!adminMenuFound) {
      console.log('⚠️ 관리자 메뉴를 찾을 수 없음. 직접 admin 페이지로 이동합니다.');
    }
    
    // 관리자 페이지 직접 접속
    console.log('📍 관리자 페이지 직접 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`🌐 현재 URL: ${currentUrl}`);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    if (currentUrl.includes('/sign-in')) {
      console.log('🚨 로그인 페이지로 리다이렉트됨 - 관리자 권한 필요');
      
      // 로그인 페이지 스크린샷
      const loginScreenshotPath = '/mnt/e/project/test-studio-firebase/admin-login-required.png';
      await page.screenshot({ path: loginScreenshotPath, fullPage: true });
      console.log(`📸 로그인 필요 스크린샷: ${loginScreenshotPath}`);
      
      console.log('\n📋 수동 테스트 가이드:');
      console.log('1. 브라우저 시크릿 모드에서 https://test-studio-firebase.vercel.app 접속');
      console.log('2. "로그인" → "Google로 로그인" 클릭');
      console.log('3. junsupark9999@gmail.com 계정으로 로그인');
      console.log('4. 상단 메뉴에서 "관리자 설정" 클릭 또는 /admin URL 직접 접속');
      console.log('5. 첫 번째 탭이 "통계" 탭인지 확인');
      console.log('6. 통계 차트들이 로드되는지 확인');
      
    } else {
      console.log('✅ 관리자 대시보드 접속 성공');
      
      // 탭 구조 확인
      const tabSelectors = [
        '[role="tab"]',
        '.tab',
        'button[data-state]',
        '[data-radix-collection-item]'
      ];
      
      let tabs = [];
      for (const selector of tabSelectors) {
        try {
          const tabElements = await page.locator(selector).all();
          if (tabElements.length > 0) {
            console.log(`🗂️ 탭 발견 (${selector}): ${tabElements.length}개`);
            
            for (let i = 0; i < Math.min(tabElements.length, 10); i++) {
              const tabText = await tabElements[i].textContent();
              tabs.push(tabText?.trim() || '');
            }
            break;
          }
        } catch (e) {
          // 선택자 오류 무시
        }
      }
      
      console.log(`📊 발견된 탭들: ${JSON.stringify(tabs)}`);
      
      // 첫 번째 탭이 통계인지 확인
      const firstTabIsStats = tabs.length > 0 && (
        tabs[0].includes('통계') || 
        tabs[0].includes('Stats') || 
        tabs[0].includes('BarChart')
      );
      console.log(`🥇 첫 번째 탭이 통계 탭인가: ${firstTabIsStats}`);
      
      // 현재 활성 탭 확인
      const activeTabSelectors = [
        '[role="tab"][data-state="active"]',
        '[role="tab"][aria-selected="true"]',
        '.tab-active',
        '.tab.active'
      ];
      
      let activeTabText = '';
      for (const selector of activeTabSelectors) {
        try {
          const activeTab = page.locator(selector).first();
          if (await activeTab.count() > 0) {
            activeTabText = await activeTab.textContent();
            console.log(`🎯 현재 활성 탭: "${activeTabText?.trim()}"`);
            break;
          }
        } catch (e) {
          // 선택자 오류 무시
        }
      }
      
      // 차트 컴포넌트 확인
      const chartSelectors = [
        'canvas',
        'svg',
        '.recharts-wrapper',
        '.chart',
        '[class*="chart"]',
        '.highcharts-container'
      ];
      
      let totalCharts = 0;
      const chartDetails = [];
      
      for (const selector of chartSelectors) {
        try {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`📈 차트 요소 발견 (${selector}): ${count}개`);
            totalCharts += count;
            chartDetails.push(`${selector}: ${count}개`);
          }
        } catch (e) {
          // 선택자 오류 무시
        }
      }
      
      console.log(`📊 총 차트 요소: ${totalCharts}개`);
      console.log(`📈 차트 상세: [${chartDetails.join(', ')}]`);
      
      // 통계 관련 텍스트 확인
      const bodyText = await page.locator('body').textContent();
      const hasStatsText = bodyText?.includes('통계') || bodyText?.includes('Statistics');
      const hasChartText = bodyText?.includes('차트') || bodyText?.includes('Chart');
      
      console.log(`📋 페이지에 통계 텍스트 포함: ${hasStatsText}`);
      console.log(`📊 페이지에 차트 텍스트 포함: ${hasChartText}`);
      
      // 관리자 대시보드 스크린샷
      const dashboardScreenshotPath = '/mnt/e/project/test-studio-firebase/admin-dashboard-verification.png';
      await page.screenshot({ path: dashboardScreenshotPath, fullPage: true });
      console.log(`📸 관리자 대시보드 스크린샷: ${dashboardScreenshotPath}`);
      
      // 통계 탭 클릭 시도
      if (tabs.length > 0) {
        console.log('🖱️ 통계 탭 클릭 시도...');
        try {
          const statsTab = page.locator('[role="tab"]').first();
          await statsTab.click();
          await page.waitForTimeout(3000);
          
          // 통계 탭 클릭 후 차트 재확인
          let chartsAfterClick = 0;
          for (const selector of chartSelectors) {
            try {
              const count = await page.locator(selector).count();
              if (count > 0) {
                chartsAfterClick += count;
              }
            } catch (e) {
              // 선택자 오류 무시
            }
          }
          
          console.log(`📊 통계 탭 클릭 후 차트 요소: ${chartsAfterClick}개`);
          
          // 통계 탭 클릭 후 스크린샷
          const statsScreenshotPath = '/mnt/e/project/test-studio-firebase/admin-stats-tab-clicked.png';
          await page.screenshot({ path: statsScreenshotPath, fullPage: true });
          console.log(`📸 통계 탭 클릭 후 스크린샷: ${statsScreenshotPath}`);
          
        } catch (e) {
          console.log('❌ 통계 탭 클릭 실패:', e.message);
        }
      }
    }
    
    // 콘솔 로그 분석
    console.log(`\n📝 콘솔 로그 분석 (총 ${logs.length}개):`);
    const adminLogs = logs.filter(log => log.includes('admin') || log.includes('Admin'));
    const statsLogs = logs.filter(log => log.includes('stats') || log.includes('통계'));
    const chartLogs = logs.filter(log => log.includes('chart') || log.includes('Chart'));
    
    console.log(`   - 관리자 관련 로그: ${adminLogs.length}개`);
    console.log(`   - 통계 관련 로그: ${statsLogs.length}개`);
    console.log(`   - 차트 관련 로그: ${chartLogs.length}개`);
    
    if (adminLogs.length > 0) {
      console.log('   📋 주요 관리자 로그:');
      adminLogs.slice(0, 3).forEach(log => console.log(`      ${log}`));
    }
    
    console.log('✅ 관리자 대시보드 확인 완료');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 발생 시에도 스크린샷 저장
    const errorScreenshotPath = '/mnt/e/project/test-studio-firebase/admin-dashboard-error.png';
    try {
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      console.log(`📸 오류 상황 스크린샷 저장: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    await browser.close();
  }
})();