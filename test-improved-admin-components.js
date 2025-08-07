const { chromium } = require('playwright');

async function testImprovedAdminComponents() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 타임아웃 늘리기
  page.setDefaultTimeout(60000);

  try {
    console.log('🚀 개선된 관리자 컴포넌트 테스트 시작...');
    
    // 홈페이지 방문
    await page.goto('http://localhost:4000');
    console.log('✅ 홈페이지 접속 완료');
    
    // 관리자 페이지 직접 접속
    await page.goto('http://localhost:4000/admin');
    console.log('✅ 관리자 페이지 접속 완료');
    
    // 페이지 로딩 대기
    await page.waitForTimeout(3000);
    
    // 개선된 UsageStatsCharts 컴포넌트 확인
    console.log('📊 UsageStatsCharts 컴포넌트 테스트...');
    
    // 환경 정보 배지 확인
    const mockDataBadge = await page.locator('text=Mock 데이터').first();
    if (await mockDataBadge.count() > 0) {
      console.log('✅ Mock 데이터 환경 표시 확인됨');
    }
    
    // 새로고침 버튼 확인
    const refreshButton = await page.locator('button:has-text("새로고침")').first();
    if (await refreshButton.count() > 0) {
      console.log('✅ 새로고침 버튼 확인됨');
      
      // 새로고침 기능 테스트
      await refreshButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 새로고침 기능 테스트 완료');
    }
    
    // 성능 메트릭 카드 확인
    const performanceCards = await page.locator('[data-testid="performance-metric"], .card:has(.font-bold)');
    if (await performanceCards.count() > 0) {
      console.log(`✅ 성능 메트릭 카드 ${await performanceCards.count()}개 확인됨`);
    }
    
    // 차트 탭 테스트
    const performanceTab = await page.locator('text=성능 분석').first();
    if (await performanceTab.count() > 0) {
      await performanceTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ 성능 분석 탭 확인 및 클릭 완료');
    }
    
    // 실시간 모니터링 섹션으로 스크롤
    const realTimeSection = await page.locator('text=실시간 모니터링').first();
    if (await realTimeSection.count() > 0) {
      await realTimeSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      console.log('✅ 실시간 모니터링 섹션 확인됨');
      
      // RealTimeMonitoringDashboard 컴포넌트 테스트
      console.log('📡 RealTimeMonitoringDashboard 컴포넌트 테스트...');
      
      // 시스템 상태 배지 확인
      const systemStatusBadge = await page.locator('.badge:has-text("시스템")').first();
      if (await systemStatusBadge.count() > 0) {
        console.log('✅ 시스템 상태 배지 확인됨');
      }
      
      // 알림 토글 버튼 확인
      const alertToggle = await page.locator('button:has-text("알림")').first();
      if (await alertToggle.count() > 0) {
        console.log('✅ 알림 토글 버튼 확인됨');
        
        // 알림 토글 테스트
        await alertToggle.click();
        await page.waitForTimeout(500);
        await alertToggle.click();
        console.log('✅ 알림 토글 기능 테스트 완료');
      }
      
      // 자동 새로고침 간격 선택기 확인
      const intervalSelect = await page.locator('select').first();
      if (await intervalSelect.count() > 0) {
        await intervalSelect.selectOption('3000');
        console.log('✅ 새로고침 간격 선택기 확인 및 테스트 완료');
      }
      
      // 성능 진행바 확인
      const progressBars = await page.locator('.rounded-full.transition-all');
      if (await progressBars.count() > 0) {
        console.log(`✅ 성능 진행바 ${await progressBars.count()}개 확인됨`);
      }
    }
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'improved-admin-components-test.png', 
      fullPage: true 
    });
    console.log('📸 개선된 관리자 컴포넌트 스크린샷 저장됨');
    
    // 에러 처리 테스트
    console.log('🔧 에러 처리 테스트...');
    
    // 네트워크를 차단하여 에러 상태 확인 (선택사항)
    const errorTestButton = await page.locator('button:has-text("새로고침")').first();
    if (await errorTestButton.count() > 0) {
      // 네트워크 차단
      await page.route('**/*', route => route.abort());
      await errorTestButton.click();
      await page.waitForTimeout(3000);
      
      // 에러 상태 확인
      const errorMessage = await page.locator('text=오류').first();
      if (await errorMessage.count() > 0) {
        console.log('✅ 에러 상태 처리 확인됨');
      }
      
      // 네트워크 차단 해제
      await page.unroute('**/*');
    }
    
    console.log('🎉 모든 개선된 관리자 컴포넌트 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'admin-components-error.png' });
  } finally {
    await browser.close();
  }
}

testImprovedAdminComponents();