const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1. 관리자 대시보드 직접 접속 시도...');
    
    // 먼저 홈페이지로 이동
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2. 관리자 메뉴 찾기...');
    // 네비게이션에서 관리자 실행 링크 찾기
    const adminLink = await page.locator('a[href="/admin"]').first();
    if (await adminLink.count() > 0) {
      console.log('관리자 링크 발견 - 클릭');
      await adminLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      // 직접 URL로 이동
      console.log('관리자 링크 없음 - 직접 URL 이동');
      await page.goto('http://localhost:4000/admin', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
    }
    
    console.log('3. 현재 URL:', page.url());
    
    // 관리자 페이지인지 확인
    const isAdminPage = page.url().includes('/admin');
    if (!isAdminPage) {
      console.log('관리자 페이지가 아님 - 다시 시도');
      await page.goto('http://localhost:4000/admin?tab=usage-stats', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
    }
    
    await page.waitForTimeout(3000);
    
    console.log('4. 사용통계 탭 클릭...');
    // 사용통계 탭 찾기 및 클릭
    const statsTabSelector = [
      'button[value="usage-stats"]',
      'button:has-text("사용통계")',
      'button:has-text("Usage Stats")',
      '[role="tab"]:has-text("사용통계")',
      'text=사용통계'
    ];
    
    for (const selector of statsTabSelector) {
      const tab = await page.locator(selector).first();
      if (await tab.count() > 0) {
        console.log(`탭 발견: ${selector}`);
        await tab.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    console.log('5. 페이지 스크린샷 찍기...');
    await page.screenshot({ 
      path: 'admin-dashboard-final.png',
      fullPage: true 
    });
    
    console.log('6. 통계 값 확인...');
    
    // 실제 숫자 값들 찾기
    const statsToFind = [
      { label: '총 사용자', selector: 'text=/총 사용자|Total Users/i' },
      { label: '총 세션', selector: 'text=/총 세션|Total Sessions/i' },
      { label: '평균 세션/사용자', selector: 'text=/평균 세션|Average Session/i' },
      { label: '응답 시간', selector: 'text=/응답 시간|Response Time/i' },
      { label: '성공률', selector: 'text=/성공률|Success Rate/i' },
      { label: '총 요청', selector: 'text=/총 요청|Total Requests/i' },
      { label: '오류율', selector: 'text=/오류율|Error Rate/i' }
    ];
    
    for (const stat of statsToFind) {
      try {
        const labelElement = await page.locator(stat.selector).first();
        if (await labelElement.count() > 0) {
          // 가장 가까운 숫자 찾기
          const card = await labelElement.evaluateHandle(el => {
            let parent = el;
            while (parent && !parent.className.includes('card')) {
              parent = parent.parentElement;
            }
            return parent || el.parentElement;
          });
          
          const valueText = await card.evaluate(el => {
            // 숫자를 포함한 요소 찾기
            const numberElements = el.querySelectorAll('.text-2xl, .text-3xl, .text-4xl, h2, h3, [class*="font-bold"]');
            for (const numEl of numberElements) {
              const text = numEl.textContent.trim();
              if (/^\d/.test(text) || text === '0' || text.includes('%') || text.includes('ms')) {
                return text;
              }
            }
            return 'not found';
          });
          
          console.log(`${stat.label}: ${valueText}`);
        }
      } catch (e) {
        console.log(`${stat.label}: 찾기 실패`);
      }
    }
    
    // 모든 카드의 숫자 값 출력
    console.log('\n7. 모든 카드의 숫자 값:');
    const allCards = await page.$$('.card, [class*="card"]');
    console.log(`총 ${allCards.length}개의 카드 발견`);
    
    for (let i = 0; i < Math.min(allCards.length, 10); i++) {
      const card = allCards[i];
      const cardText = await card.evaluate(el => {
        const title = el.querySelector('.text-sm, .card-title, h3')?.textContent?.trim() || '';
        const value = el.querySelector('.text-2xl, .text-3xl, .text-4xl, [class*="font-bold"]')?.textContent?.trim() || '';
        return { title, value };
      });
      
      if (cardText.title && cardText.value) {
        console.log(`- ${cardText.title}: ${cardText.value}`);
      }
    }
    
    // 차트 영역 확인
    const charts = await page.$$('canvas, svg.recharts-surface, [class*="recharts"]');
    console.log(`\n8. 차트 개수: ${charts.length}`);
    
    // 통계 섹션 스크린샷
    const statsContent = await page.locator('[role="tabpanel"][data-state="active"]').first();
    if (await statsContent.count() > 0) {
      await statsContent.screenshot({ path: 'admin-stats-content.png' });
      console.log('\n통계 콘텐츠 스크린샷 저장: admin-stats-content.png');
    }
    
    console.log('\n전체 스크린샷 저장: admin-dashboard-final.png');
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'admin-final-error.png' });
  }
  
  await browser.close();
})();