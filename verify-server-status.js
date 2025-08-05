const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('1. 홈페이지 접속 중...');
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'server-status-01-homepage.png', fullPage: true });
  
  console.log('2. 타로 리딩 페이지 확인...');
  await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'server-status-02-reading.png', fullPage: true });
  
  console.log('3. 관리자 페이지 확인...');
  await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'server-status-03-admin.png', fullPage: true });
  
  console.log('4. 블로그 페이지 확인...');
  await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'server-status-04-blog.png', fullPage: true });
  
  console.log('✅ 모든 페이지 확인 완료!');
  
  await browser.close();
})();