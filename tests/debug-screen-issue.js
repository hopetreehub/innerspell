const { chromium } = require('playwright');

(async () => {
  console.log('🔍 화면 표시 문제 디버깅 시작 (포트 4000)\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized', '--disable-web-security', '--no-sandbox'],
    slowMo: 1000 // 1초 슬로우 모션
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ko-KR'
  });
  
  const page = await context.newPage();

  try {
    console.log('1. 홈페이지 접속 중...');
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log('2. 페이지 로딩 상태 확인...');
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log(`   📄 페이지 타이틀: ${title}`);
    
    // 메인 컨텐츠 로딩 확인
    await page.waitForSelector('main', { timeout: 30000 });
    console.log('   ✅ main 엘리먼트 로딩됨');
    
    // 네비게이션 확인
    const navExists = await page.locator('nav').count();
    console.log(`   📌 네비게이션 메뉴: ${navExists}개`);
    
    // 히어로 섹션 확인
    const heroText = await page.locator('h1').first().textContent();
    console.log(`   🎯 히어로 텍스트: ${heroText}`);
    
    // 이미지 로딩 확인
    const images = await page.locator('img').count();
    console.log(`   🖼️ 이미지 개수: ${images}개`);
    
    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/debug-full-page.png',
      fullPage: true
    });
    console.log('   📸 전체 페이지 스크린샷 저장됨');
    
    // CSS 스타일 확인
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontFamily: computedStyle.fontFamily,
        visibility: computedStyle.visibility,
        display: computedStyle.display
      };
    });
    console.log('   🎨 Body 스타일:', bodyStyles);
    
    // JavaScript 에러 확인
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // 콘솔 에러 확인
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 네트워크 에러 확인
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()}: ${response.url()}`);
      }
    });
    
    console.log('\n3. 각 페이지별 테스트...');
    
    const pages = [
      { name: '블로그', url: '/blog' },
      { name: '타로리딩', url: '/reading' },
      { name: '백과사전', url: '/encyclopedia' },
      { name: '커뮤니티', url: '/community' },
      { name: '로그인', url: '/sign-in' }
    ];
    
    for (const pageInfo of pages) {
      try {
        console.log(`\n   ${pageInfo.name} 페이지 테스트...`);
        await page.goto(`http://localhost:4000${pageInfo.url}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        
        const pageTitle = await page.title();
        console.log(`     ✅ ${pageInfo.name} 로딩 성공: ${pageTitle}`);
        
        await page.screenshot({
          path: `tests/screenshots/debug-${pageInfo.name}.png`,
          fullPage: true
        });
        
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.log(`     ❌ ${pageInfo.name} 에러: ${error.message}`);
      }
    }
    
    console.log('\n4. 에러 리포트:');
    console.log(`   🟥 JavaScript 에러: ${jsErrors.length}개`);
    jsErrors.forEach(error => console.log(`     - ${error}`));
    
    console.log(`   🟧 콘솔 에러: ${consoleErrors.length}개`);
    consoleErrors.forEach(error => console.log(`     - ${error}`));
    
    console.log(`   🟨 네트워크 에러: ${networkErrors.length}개`);
    networkErrors.forEach(error => console.log(`     - ${error}`));
    
    console.log('\n✅ 디버깅 완료');
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error.message);
    
    await page.screenshot({
      path: 'tests/screenshots/debug-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
})();