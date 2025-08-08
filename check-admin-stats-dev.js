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
    console.log('1. 개발 모드로 관리자 페이지 직접 접속...');
    // 개발 모드에서는 로그인 없이 바로 접속 가능
    await page.goto('http://localhost:4000/admin?tab=usage-stats', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2. 페이지 로딩 대기...');
    await page.waitForTimeout(3000);
    
    console.log('3. 사용통계 탭 확인...');
    // 사용통계 탭이 이미 선택되어 있는지 확인
    const usageStatsTab = await page.locator('[value="usage-stats"]').first();
    if (await usageStatsTab.count() > 0) {
      const isSelected = await usageStatsTab.getAttribute('data-state');
      console.log(`사용통계 탭 상태: ${isSelected}`);
      
      if (isSelected !== 'active') {
        await usageStatsTab.click();
        await page.waitForTimeout(2000);
      }
    }
    
    console.log('4. 통계 카드 내용 확인...');
    
    // 전체 페이지 스크린샷
    await page.screenshot({ 
      path: 'admin-usage-stats-full.png',
      fullPage: true 
    });
    console.log('전체 페이지 스크린샷 저장: admin-usage-stats-full.png');
    
    // 통계 카드들 찾기
    const statCards = await page.$$('.stat-card, .metric-card, [class*="stat"], [class*="metric"], .bg-card');
    console.log(`발견된 통계 관련 요소 수: ${statCards.length}`);
    
    // 각 통계 값 확인
    const statTexts = [
      '전체 사용자', 'Total Users',
      '활성 사용자', 'Active Users', 
      '신규 사용자', 'New Users',
      '총 세션', 'Total Sessions',
      '타로 리딩', 'Tarot Readings',
      '평균 세션', 'Average Session'
    ];
    
    for (const statText of statTexts) {
      const elements = await page.$$(`text=/${statText}/i`);
      if (elements.length > 0) {
        console.log(`\n"${statText}" 찾음:`);
        
        for (const element of elements) {
          try {
            // 부모 요소 찾기
            const parent = await element.evaluateHandle(el => el.parentElement?.parentElement || el.parentElement);
            
            // 숫자 값 찾기
            const numberText = await parent.evaluate(el => {
              // 다양한 선택자로 숫자 찾기
              const selectors = [
                '.text-3xl', '.text-4xl', '.text-2xl',
                'h2', 'h3', 'h4',
                '.value', '.number',
                '[class*="value"]', '[class*="number"]',
                'span', 'div'
              ];
              
              for (const selector of selectors) {
                const numElements = el.querySelectorAll(selector);
                for (const numEl of numElements) {
                  const text = numEl.textContent.trim();
                  // 숫자가 포함된 텍스트 찾기
                  if (/^\d+/.test(text) || text === '0') {
                    return text;
                  }
                }
              }
              return null;
            });
            
            if (numberText !== null) {
              console.log(`  값: ${numberText}`);
            }
          } catch (e) {
            // 에러 무시
          }
        }
      }
    }
    
    // 모든 숫자 요소 직접 확인
    console.log('\n5. 페이지의 모든 숫자 값:');
    const allNumbers = await page.$$eval(
      '.text-3xl, .text-4xl, .text-2xl, h2, h3, [class*="stat"] span, [class*="metric"] span',
      elements => elements.map(el => ({
        text: el.textContent.trim(),
        className: el.className,
        parentText: el.parentElement?.textContent.trim()
      })).filter(item => /^\d+/.test(item.text) || item.text === '0')
    );
    
    allNumbers.forEach(num => {
      console.log(`- "${num.text}" (parent: ${num.parentText?.substring(0, 50)}...)`);
    });
    
    // 사용통계 섹션만 스크린샷
    const statsContent = await page.$('[value="usage-stats"] + div, [data-state="active"][data-value="usage-stats"]').catch(() => null);
    if (!statsContent) {
      // 다른 방법으로 통계 섹션 찾기
      const usageStatsSection = await page.$('text=/사용통계|Usage Statistics/i').catch(() => null);
      if (usageStatsSection) {
        const section = await usageStatsSection.evaluateHandle(el => {
          let parent = el.parentElement;
          while (parent && !parent.className.includes('card')) {
            parent = parent.parentElement;
          }
          return parent || el.parentElement?.parentElement;
        });
        
        if (section) {
          await section.screenshot({ path: 'admin-usage-stats-section.png' });
          console.log('\n사용통계 섹션 스크린샷 저장: admin-usage-stats-section.png');
        }
      }
    }
    
    // 차트 확인
    const charts = await page.$$('canvas, svg.recharts-surface, [class*="chart"]');
    console.log(`\n차트 요소 수: ${charts.length}`);
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'admin-stats-error.png' });
  }
  
  console.log('\n브라우저를 열어두었습니다. 수동으로 확인하실 수 있습니다.');
  console.log('종료하려면 Ctrl+C를 누르세요.');
  
  await new Promise(() => {});
})();