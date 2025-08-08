const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('실시간 모니터링 클린 상태 확인...\n');
    
    // 관리자 대시보드 접속
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // 실시간 모니터링 탭 클릭
    await page.locator('button:has-text("실시간 모니터링")').click();
    await page.waitForTimeout(3000);
    
    // 자동 새로고침 끄기
    const autoRefreshBtn = await page.locator('button:has-text("자동 새로고침")').first();
    if (await autoRefreshBtn.isVisible()) {
      await autoRefreshBtn.click();
      console.log('자동 새로고침 OFF');
    }
    
    // 수동 새로고침
    await page.locator('button:has-text("새로고침")').first().click();
    await page.waitForTimeout(2000);
    
    console.log('=== 실시간 통계 값 ===');
    
    // 통계 카드 값 확인
    const statCards = [
      '활성 사용자',
      '활성 세션', 
      '오늘 리딩',
      '평균 응답시간',
      '오류율',
      '처리량'
    ];
    
    for (const cardTitle of statCards) {
      const card = await page.locator(`text="${cardTitle}"`).locator('..').locator('..').first();
      const value = await card.locator('.text-2xl').textContent().catch(() => 'N/A');
      console.log(`${cardTitle}: ${value}`);
    }
    
    console.log('\n=== 시스템 성능 메트릭 ===');
    
    // 성능 메트릭 확인
    const cpuText = await page.locator('text="CPU 사용률"').locator('..').textContent().catch(() => '');
    const memText = await page.locator('text="메모리 사용률"').locator('..').textContent().catch(() => '');
    
    console.log('CPU 사용률:', cpuText.match(/(\d+)%/)?.[1] || '0', '%');
    console.log('메모리 사용률:', memText.match(/(\d+)%/)?.[1] || '0', '%');
    
    // 스크린샷
    await page.screenshot({ 
      path: 'verify-realtime-clean.png',
      fullPage: true 
    });
    
    console.log('\n스크린샷 저장: verify-realtime-clean.png');
    console.log('\n✅ 모든 값이 0 또는 초기값이면 정상입니다.');
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await browser.close();
  }
})();