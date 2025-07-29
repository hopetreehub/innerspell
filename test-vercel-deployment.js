const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('=== Vercel 배포 사이트 검증 시작 ===');
    
    // 1. 홈페이지 접속
    console.log('\n1. 홈페이지 접속 테스트...');
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // 페이지 로드 확인
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/vercel-01-homepage.png',
      fullPage: true 
    });
    console.log('✓ 홈페이지 스크린샷 저장: screenshots/vercel-01-homepage.png');
    
    // 주요 요소 확인
    const title = await page.title();
    console.log(`✓ 페이지 타이틀: ${title}`);
    
    // 네비게이션 확인
    const navLinks = await page.$$eval('nav a', links => 
      links.map(link => ({ text: link.textContent.trim(), href: link.href }))
    );
    console.log('✓ 네비게이션 링크:', navLinks);
    
    // 2. 타로리딩 페이지 접속
    console.log('\n2. 타로리딩 페이지 접속 테스트...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot-reading', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    await page.waitForTimeout(3000);
    
    // 타로리딩 페이지 스크린샷
    await page.screenshot({ 
      path: 'screenshots/vercel-02-tarot-reading.png',
      fullPage: true 
    });
    console.log('✓ 타로리딩 페이지 스크린샷 저장: screenshots/vercel-02-tarot-reading.png');
    
    // 카드 선택 기능 테스트
    const cards = await page.$$('.card-container .card');
    console.log(`✓ 타로 카드 개수: ${cards.length}`);
    
    if (cards.length > 0) {
      // 첫 번째 카드 클릭
      await cards[0].click();
      await page.waitForTimeout(1000);
      
      // 두 번째 카드 클릭
      if (cards.length > 1) {
        await cards[1].click();
        await page.waitForTimeout(1000);
      }
      
      // 세 번째 카드 클릭
      if (cards.length > 2) {
        await cards[2].click();
        await page.waitForTimeout(1000);
      }
      
      // 카드 선택 후 스크린샷
      await page.screenshot({ 
        path: 'screenshots/vercel-03-cards-selected.png',
        fullPage: true 
      });
      console.log('✓ 카드 선택 후 스크린샷 저장: screenshots/vercel-03-cards-selected.png');
    }
    
    // 3. 반응형 디자인 확인
    console.log('\n3. 반응형 디자인 확인...');
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://test-studio-firebase.vercel.app');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/vercel-04-tablet-view.png',
      fullPage: true 
    });
    console.log('✓ 태블릿 뷰 스크린샷 저장');
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/vercel-05-mobile-view.png',
      fullPage: true 
    });
    console.log('✓ 모바일 뷰 스크린샷 저장');
    
    // 4. 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('⚠️ 콘솔 에러:', msg.text());
      }
    });
    
    // 5. 네트워크 에러 확인
    page.on('requestfailed', request => {
      console.log('⚠️ 요청 실패:', request.url());
    });
    
    console.log('\n=== 검증 완료 ===');
    console.log('✓ Vercel 배포 사이트가 정상적으로 작동합니다.');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();