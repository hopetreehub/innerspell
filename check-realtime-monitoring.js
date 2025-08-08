const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('실시간 모니터링 페이지 확인 중...');
    
    // 관리자 대시보드로 이동
    await page.goto('http://localhost:4000/admin/monitoring', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'realtime-monitoring-clean.png',
      fullPage: true 
    });
    console.log('스크린샷 저장: realtime-monitoring-clean.png');
    
    // 페이지 내용 확인
    const pageContent = await page.content();
    const hasEmptyState = pageContent.includes('개발 모드 - 데이터 없음') || 
                         pageContent.includes('최근 활동이 없습니다') ||
                         pageContent.includes('현재 활성 세션이 없습니다');
    
    // 실시간 통계 값 확인
    const activeUsersText = await page.textContent('text=/활성 사용자/').catch(() => '');
    const activeSessionsText = await page.textContent('text=/활성 세션/').catch(() => '');
    const todayReadingsText = await page.textContent('text=/오늘 리딩/').catch(() => '');
    
    console.log('\n--- 페이지 상태 ---');
    console.log('빈 상태 표시:', hasEmptyState ? '예' : '아니오');
    console.log('활성 사용자 영역:', activeUsersText);
    console.log('활성 세션 영역:', activeSessionsText);
    console.log('오늘 리딩 영역:', todayReadingsText);
    
    // 시스템 성능 메트릭 확인
    const performanceSection = await page.locator('text=/시스템 성능 대시보드/').isVisible().catch(() => false);
    console.log('시스템 성능 섹션 표시:', performanceSection ? '예' : '아니오');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
})();