const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  
  // 캐시 클리어
  await context.clearCookies();
  await context.clearPermissions();
  
  const page = await context.newPage();

  try {
    console.log('=== 실시간 모니터링 최종 확인 ===\n');
    
    // 강제 새로고침으로 관리자 대시보드 접속
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('페이지 로드 완료, 대기 중...');
    await page.waitForTimeout(10000);
    
    // 실시간 모니터링 탭 클릭
    const tabs = await page.locator('button[role="tab"]').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && text.includes('실시간 모니터링')) {
        await tab.click();
        console.log('실시간 모니터링 탭 클릭');
        break;
      }
    }
    
    await page.waitForTimeout(5000);
    
    // 네트워크 요청 모니터링 시작
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('admin')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/') && response.status() === 200) {
        console.log(`API 응답: ${response.url()} - ${response.status()}`);
      }
    });
    
    // 새로고침 버튼 클릭
    const refreshButton = await page.locator('button:has-text("새로고침")').first();
    if (await refreshButton.isVisible()) {
      console.log('\n새로고침 버튼 클릭...');
      await refreshButton.click();
      await page.waitForTimeout(3000);
    }
    
    console.log('\n=== 현재 표시되는 값 확인 ===');
    
    // 실제 표시되는 값 읽기
    const values = await page.evaluate(() => {
      const result = {};
      
      // 모든 통계 카드 찾기
      const cards = document.querySelectorAll('.grid > div');
      cards.forEach(card => {
        const titleEl = card.querySelector('.text-sm.font-medium');
        const valueEl = card.querySelector('.text-2xl.font-bold');
        
        if (titleEl && valueEl) {
          const title = titleEl.textContent.trim();
          const value = valueEl.textContent.trim();
          result[title] = value;
        }
      });
      
      // 시스템 성능 대시보드 값 찾기
      const performanceSection = document.querySelector('h4:has-text("시스템 성능 대시보드")');
      if (performanceSection) {
        const parent = performanceSection.closest('.card');
        if (parent) {
          const spans = parent.querySelectorAll('span.text-sm');
          spans.forEach(span => {
            const text = span.textContent;
            if (text.includes('%')) {
              const label = span.previousSibling?.textContent || '';
              result[`성능-${label.trim()}`] = text;
            }
          });
        }
      }
      
      return result;
    });
    
    console.log('\n표시되는 값:');
    Object.entries(values).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
      if (value !== '0' && value !== '0ms' && value !== '0%' && value !== '100%') {
        console.log(`  ⚠️  목업 데이터 의심!`);
      }
    });
    
    console.log('\n=== API 요청 로그 ===');
    requests.forEach(req => {
      console.log(`${req.method} ${req.url}`);
    });
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'final-realtime-monitoring-check.png',
      fullPage: true 
    });
    console.log('\n스크린샷 저장: final-realtime-monitoring-check.png');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
})();