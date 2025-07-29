const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('=== Vercel 타로리딩 페이지 확인 ===');
    
    // /reading 페이지 접속
    console.log('\n1. /reading 페이지 접속...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    await page.waitForTimeout(5000);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'screenshots/vercel-reading-page.png',
      fullPage: true 
    });
    console.log('✓ 타로리딩 페이지 스크린샷 저장: screenshots/vercel-reading-page.png');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`✓ 페이지 타이틀: ${title}`);
    
    // 타로 카드 요소 확인
    const cardElements = await page.$$('.card, [data-card], .tarot-card');
    console.log(`✓ 타로 카드 요소 개수: ${cardElements.length}`);
    
    // 카드 컨테이너 확인
    const cardContainers = await page.$$('.card-container, .cards-container, .tarot-cards');
    console.log(`✓ 카드 컨테이너 개수: ${cardContainers.length}`);
    
    // 페이지 내용 확인
    const bodyText = await page.textContent('body');
    console.log('✓ 페이지 내용 포함 확인:', bodyText.includes('타로') || bodyText.includes('카드') || bodyText.includes('리딩'));
    
    console.log('\n=== 타로리딩 페이지 확인 완료 ===');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();