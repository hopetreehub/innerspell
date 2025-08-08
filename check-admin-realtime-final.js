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
    await page.waitForTimeout(5000); // 페이지 로딩 대기
    
    // 실시간 모니터링 탭 클릭
    console.log('실시간 모니터링 탭 찾는 중...');
    const tabs = await page.locator('button[role="tab"]').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      console.log('탭 발견:', text);
      if (text && text.includes('실시간 모니터링')) {
        console.log('실시간 모니터링 탭 클릭!');
        await tab.click();
        break;
      }
    }
    
    await page.waitForTimeout(3000);
    
    // 페이지 내용 로그
    const pageTitle = await page.locator('h2:has-text("실시간 모니터링")').isVisible().catch(() => false);
    console.log('실시간 모니터링 제목 표시:', pageTitle);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'admin-realtime-final.png',
      fullPage: true 
    });
    console.log('스크린샷 저장: admin-realtime-final.png');
    
    // 통계 카드 확인
    const cards = await page.locator('.grid > div').all();
    console.log('\n--- 통계 카드 수:', cards.length, '---');
    
    for (let i = 0; i < Math.min(6, cards.length); i++) {
      const card = cards[i];
      const title = await card.locator('.text-sm').first().textContent().catch(() => '');
      const value = await card.locator('.text-2xl').textContent().catch(() => '');
      console.log(`${title}: ${value}`);
    }
    
    // 활성 세션 섹션 확인
    const sessionSection = await page.locator('text=/활성 세션/').isVisible().catch(() => false);
    const hasEmptySession = await page.locator('text=/현재 활성 세션이 없습니다/').isVisible().catch(() => false);
    console.log('\n활성 세션 섹션 표시:', sessionSection);
    console.log('빈 세션 메시지:', hasEmptySession);
    
    // 실시간 활동 스트림 확인
    const activitySection = await page.locator('text=/실시간 활동 스트림/').isVisible().catch(() => false);
    const hasEmptyActivity = await page.locator('text=/최근 활동이 없습니다/').isVisible().catch(() => false);
    console.log('\n활동 스트림 섹션 표시:', activitySection);
    console.log('빈 활동 메시지:', hasEmptyActivity);
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
})();