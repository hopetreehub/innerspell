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
    console.log('1. 관리자 페이지 접속 중...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 로그인이 필요한 경우 처리
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('로그인 필요 - 관리자 계정으로 로그인 중...');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle' });
    }
    
    console.log('2. 사용 통계 탭 찾기...');
    // 사용 통계 탭 클릭
    const statsTab = await page.locator('text=사용 통계').first();
    if (await statsTab.count() > 0) {
      await statsTab.click();
      await page.waitForTimeout(2000);
    } else {
      // 영어로 된 탭 찾기
      const usageStatsTab = await page.locator('text=Usage Statistics').first();
      if (await usageStatsTab.count() > 0) {
        await usageStatsTab.click();
        await page.waitForTimeout(2000);
      }
    }
    
    console.log('3. 통계 값들 확인 중...');
    
    // 스크린샷 찍기
    await page.screenshot({ 
      path: 'admin-statistics-full.png',
      fullPage: true 
    });
    
    // 통계 카드들 찾기
    const statCards = await page.$$('.stat-card, .metric-card, [class*="stat"], [class*="metric"]');
    console.log(`발견된 통계 카드 수: ${statCards.length}`);
    
    // 각 통계 값 확인
    const stats = [
      { name: '전체 사용자', selector: 'text=/전체 사용자|Total Users/i' },
      { name: '활성 사용자', selector: 'text=/활성 사용자|Active Users/i' },
      { name: '신규 사용자', selector: 'text=/신규 사용자|New Users/i' },
      { name: '총 세션수', selector: 'text=/총 세션|Total Sessions/i' },
      { name: '타로 리딩', selector: 'text=/타로 리딩|Tarot Readings/i' },
      { name: '평균 세션 시간', selector: 'text=/평균 세션|Average Session/i' }
    ];
    
    for (const stat of stats) {
      const element = await page.locator(stat.selector).first();
      if (await element.count() > 0) {
        // 해당 통계의 부모 요소에서 숫자 찾기
        const parent = await element.locator('..').first();
        const valueElement = await parent.locator('.value, .number, [class*="value"], [class*="number"], h2, h3, span').first();
        
        if (await valueElement.count() > 0) {
          const value = await valueElement.textContent();
          console.log(`${stat.name}: ${value}`);
        } else {
          // 직접 텍스트 내용 확인
          const text = await parent.textContent();
          console.log(`${stat.name} (전체 텍스트): ${text}`);
        }
      }
    }
    
    // 실제 DOM 구조 확인
    console.log('\n4. 페이지의 실제 통계 요소들:');
    const allNumbers = await page.$$eval('h2, h3, .text-2xl, .text-3xl, .text-4xl, [class*="stat"] span', 
      elements => elements.map(el => ({
        text: el.textContent.trim(),
        className: el.className,
        tagName: el.tagName
      }))
    );
    
    allNumbers.forEach(num => {
      if (num.text && /\d/.test(num.text)) {
        console.log(`- ${num.tagName}.${num.className}: "${num.text}"`);
      }
    });
    
    // 통계 섹션 스크린샷
    const statsSection = await page.$('.statistics-section, .usage-statistics, [class*="statistic"], main');
    if (statsSection) {
      await statsSection.screenshot({ path: 'admin-statistics-section.png' });
      console.log('\n통계 섹션 스크린샷 저장: admin-statistics-section.png');
    }
    
    console.log('\n전체 페이지 스크린샷 저장: admin-statistics-full.png');
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'admin-error.png' });
  }
  
  // 브라우저는 열어둠
  console.log('\n브라우저를 열어두었습니다. 수동으로 확인하실 수 있습니다.');
  console.log('종료하려면 Ctrl+C를 누르세요.');
  
  // 프로세스 유지
  await new Promise(() => {});
})();