const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('의존성 정리 후 서버 상태 확인...');
  
  try {
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'cleanup-result-01-homepage.png', fullPage: true });
    console.log('✅ 홈페이지 정상 작동');
    
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'cleanup-result-02-reading.png', fullPage: true });
    console.log('✅ 타로 리딩 페이지 정상 작동');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    await page.screenshot({ path: 'cleanup-error.png', fullPage: true });
  }
  
  await browser.close();
})();