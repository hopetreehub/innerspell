const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('관리자 대시보드 접속 중...');
    
    // 관리자 대시보드로 이동
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 실시간 모니터링 탭 클릭
    const realtimeTab = await page.locator('button:has-text("실시간 모니터링")').first();
    if (await realtimeTab.isVisible()) {
      console.log('실시간 모니터링 탭 발견, 클릭...');
      await realtimeTab.click();
      await page.waitForTimeout(2000);
    }
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'admin-realtime-monitoring-clean.png',
      fullPage: true 
    });
    console.log('스크린샷 저장: admin-realtime-monitoring-clean.png');
    
    // 실시간 통계 카드 값 확인
    const activeUsersCard = await page.locator('div:has-text("활성 사용자") >> .. >> text=/[0-9]+/').first();
    const activeUsersValue = await activeUsersCard.textContent().catch(() => '0');
    
    const activeSessionsCard = await page.locator('div:has-text("활성 세션") >> .. >> text=/[0-9]+/').first();
    const activeSessionsValue = await activeSessionsCard.textContent().catch(() => '0');
    
    const todayReadingsCard = await page.locator('div:has-text("오늘 리딩") >> .. >> text=/[0-9]+/').first();
    const todayReadingsValue = await todayReadingsCard.textContent().catch(() => '0');
    
    const responseTimeCard = await page.locator('div:has-text("평균 응답시간") >> .. >> text=/[0-9]+ms/').first();
    const responseTimeValue = await responseTimeCard.textContent().catch(() => '0ms');
    
    console.log('\n--- 실시간 통계 값 ---');
    console.log('활성 사용자:', activeUsersValue);
    console.log('활성 세션:', activeSessionsValue);
    console.log('오늘 리딩:', todayReadingsValue);
    console.log('평균 응답시간:', responseTimeValue);
    
    // 성능 메트릭 확인
    const cpuUsageText = await page.locator('text=/CPU 사용률.*[0-9]+%/').first().textContent().catch(() => 'CPU: 0%');
    const memoryUsageText = await page.locator('text=/메모리 사용률.*[0-9]+%/').first().textContent().catch(() => '메모리: 0%');
    const errorRateText = await page.locator('text=/오류율.*[0-9]+/').first().textContent().catch(() => '오류율: 0%');
    
    console.log('\n--- 시스템 성능 ---');
    console.log(cpuUsageText);
    console.log(memoryUsageText);
    console.log(errorRateText);
    
    // 빈 상태 메시지 확인
    const hasEmptyMessage = await page.locator('text=/현재 활성 세션이 없습니다|최근 활동이 없습니다/').isVisible().catch(() => false);
    console.log('\n빈 상태 메시지 표시:', hasEmptyMessage ? '예' : '아니오');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
})();