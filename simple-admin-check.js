const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Admin 페이지 간단 확인...');
  
  try {
    // 바로 admin 페이지로 이동
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    
    // 5초 대기
    await page.waitForTimeout(5000);
    
    const url = page.url();
    console.log(`현재 URL: ${url}`);
    
    // 스크린샷
    await page.screenshot({ path: 'current-page.png', fullPage: true });
    console.log('스크린샷 저장: current-page.png');
    
    // 페이지 제목
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 주요 텍스트 확인
    const texts = await page.locator('h1, h2, button').allTextContents();
    console.log('\n페이지의 주요 텍스트:');
    texts.slice(0, 10).forEach(text => {
      if (text.trim()) console.log(`- ${text.trim()}`);
    });

  } catch (error) {
    console.error('오류:', error.message);
  }

  await page.waitForTimeout(10000);
  await browser.close();
})();