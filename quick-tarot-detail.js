const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4000/tarot/0');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/tarot-detail-0.png', fullPage: true });
  
  await browser.close();
  console.log('Done!');
})();