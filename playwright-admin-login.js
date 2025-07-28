const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 관리자 로그인 후 통계 페이지 확인 시작...');
    
    // 관리자 페이지 접속
    const adminUrl = 'https://test-studio-firebase.vercel.app/admin';
    console.log(`📍 접속 URL: ${adminUrl}`);
    
    await page.goto(adminUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 이메일 입력
    await page.fill('input[type="email"], input[placeholder*="email"]', 'admin@innerspell.com');
    console.log('📧 이메일 입력 완료');
    
    // 비밀번호 입력
    await page.fill('input[type="password"]', 'admin123!');
    console.log('🔒 비밀번호 입력 완료');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"], button:has-text("로그인")');
    console.log('🔘 로그인 버튼 클릭');
    
    // 로그인 후 페이지 로딩 대기
    await page.waitForTimeout(5000);
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`🌐 현재 URL: ${currentUrl}`);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    // 통계 탭 확인
    const statsTabSelectors = [
      'text="통계"',
      'text="Statistics"',
      'button:has-text("통계")',
      'tab:has-text("통계")',
      '[role="tab"]:has-text("통계")',
      '.tab:has-text("통계")'
    ];
    
    let statsTabFound = false;
    let statsTabElement = null;
    
    for (const selector of statsTabSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`📊 통계 탭 발견 (${selector}): ${count}개`);
          statsTabFound = true;
          statsTabElement = page.locator(selector).first();
          break;
        }
      } catch (e) {
        // 선택자가 유효하지 않은 경우 무시
      }
    }
    
    if (!statsTabFound) {
      console.log('⚠️ 통계 탭을 찾을 수 없음 - 페이지 내용 확인');
      const bodyText = await page.locator('body').textContent();
      console.log('📋 페이지 텍스트에 "통계" 포함:', bodyText.includes('통계'));
    }
    
    // 차트 컴포넌트 확인
    const chartSelectors = [
      'canvas',
      'svg',
      '.chart',
      '[class*="chart"]',
      '[id*="chart"]',
      '.recharts-wrapper',
      '.highcharts-container'
    ];
    
    let totalCharts = 0;
    for (const selector of chartSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`📈 차트 요소 발견 (${selector}): ${count}개`);
        totalCharts += count;
      }
    }

    console.log(`📊 총 차트 요소: ${totalCharts}개`);
    
    // 탭 구조 확인
    const tabElements = await page.locator('[role="tab"], .tab, button[class*="tab"]').count();
    console.log(`🗂️ 탭 요소 총 개수: ${tabElements}개`);
    
    // 첫 번째 탭이 통계 탭인지 확인
    if (tabElements > 0) {
      const firstTab = page.locator('[role="tab"], .tab, button[class*="tab"]').first();
      const firstTabText = await firstTab.textContent();
      console.log(`🥇 첫 번째 탭 텍스트: "${firstTabText}"`);
      
      const isFirstTabStats = firstTabText && (firstTabText.includes('통계') || firstTabText.includes('Statistics'));
      console.log(`✅ 첫 번째 탭이 통계 탭인가: ${isFirstTabStats}`);
    }
    
    // 현재 활성 탭 확인
    const activeTab = await page.locator('[role="tab"][aria-selected="true"], .tab.active, .tab-active').count();
    if (activeTab > 0) {
      const activeTabText = await page.locator('[role="tab"][aria-selected="true"], .tab.active, .tab-active').first().textContent();
      console.log(`🎯 현재 활성 탭: "${activeTabText}"`);
    }
    
    // 관리자 대시보드 스크린샷
    const screenshotPath = '/mnt/e/project/test-studio-firebase/admin-dashboard-logged-in.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 로그인된 관리자 대시보드 스크린샷 저장: ${screenshotPath}`);
    
    // 통계 탭이 있다면 클릭해서 확인
    if (statsTabFound && statsTabElement) {
      console.log('🖱️ 통계 탭 클릭 시도...');
      await statsTabElement.click();
      await page.waitForTimeout(2000);
      
      // 통계 탭 클릭 후 스크린샷
      const statsScreenshotPath = '/mnt/e/project/test-studio-firebase/admin-stats-tab.png';
      await page.screenshot({ path: statsScreenshotPath, fullPage: true });
      console.log(`📸 통계 탭 클릭 후 스크린샷 저장: ${statsScreenshotPath}`);
      
      // 차트 다시 확인
      let chartsAfterClick = 0;
      for (const selector of chartSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`📈 통계 탭에서 차트 요소 (${selector}): ${count}개`);
          chartsAfterClick += count;
        }
      }
      console.log(`📊 통계 탭에서 총 차트 요소: ${chartsAfterClick}개`);
    }
    
    console.log('✅ 관리자 대시보드 확인 완료');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 발생 시에도 스크린샷 저장
    const errorScreenshotPath = '/mnt/e/project/test-studio-firebase/admin-login-error.png';
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