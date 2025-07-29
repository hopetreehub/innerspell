const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('=== 로컬(포트 4000)과 Vercel 비교 ===');
    
    // 1. 로컬 홈페이지 접속
    console.log('\n1. 로컬 홈페이지 (localhost:4000) 접속...');
    await page.goto('http://localhost:4000', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // 로컬 홈페이지 스크린샷
    await page.screenshot({ 
      path: 'screenshots/local-01-homepage.png',
      fullPage: true 
    });
    console.log('✓ 로컬 홈페이지 스크린샷 저장: screenshots/local-01-homepage.png');
    
    // 2. 로컬 타로리딩 페이지 접속
    console.log('\n2. 로컬 타로리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // 로컬 타로리딩 페이지 스크린샷
    await page.screenshot({ 
      path: 'screenshots/local-02-reading-page.png',
      fullPage: true 
    });
    console.log('✓ 로컬 타로리딩 페이지 스크린샷 저장: screenshots/local-02-reading-page.png');
    
    // 페이지 제목 비교
    const localTitle = await page.title();
    console.log(`✓ 로컬 페이지 타이틀: ${localTitle}`);
    
    console.log('\n=== 로컬과 Vercel 비교 완료 ===');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();