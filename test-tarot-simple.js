const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console logs and errors
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[ERROR] ${error.message}`));
  
  console.log('Loading page...');
  const response = await page.goto('http://localhost:4000/tarot/major-21-world', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  console.log('Response status:', response.status());
  
  // Wait a bit for JS to execute
  await page.waitForTimeout(2000);
  
  // Check page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for error elements
  const hasError = await page.$('.error-message, [class*="error"], text=/오류/')
  console.log('Has error element:', !!hasError);
  
  // Print logs
  if (logs.length > 0) {
    console.log('\nConsole logs:');
    logs.forEach(log => console.log(log));
  }
  
  // Take screenshot
  await page.screenshot({ path: 'tarot-simple-test.png' });
  console.log('Screenshot saved to tarot-simple-test.png');
  
  await browser.close();
})().catch(console.error);