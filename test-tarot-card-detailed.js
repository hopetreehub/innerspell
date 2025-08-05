const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Capture page errors
  page.on('pageerror', (error) => {
    console.error('Page error:', error.message);
  });
  
  console.log('Opening tarot card page...');
  await page.goto('http://localhost:4000/tarot/major-21-world', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Wait a bit for any delayed errors
  await page.waitForTimeout(3000);
  
  // Print console logs
  console.log('\n=== Console Logs ===');
  consoleLogs.forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });
  
  // Check for error message in UI
  const errorMessage = await page.$eval('.text-red-600', el => el.textContent).catch(() => null);
  if (errorMessage) {
    console.log('\nError message in UI:', errorMessage);
  }
  
  // Check if we're on error page
  const errorDetailsButton = await page.$('button:has-text("에러 상세정보")');
  if (errorDetailsButton) {
    console.log('\nClicking error details button...');
    await errorDetailsButton.click();
    await page.waitForTimeout(1000);
    
    // Try to get error details
    const errorDetails = await page.$eval('pre', el => el.textContent).catch(() => null);
    if (errorDetails) {
      console.log('\nError details:', errorDetails);
    }
  }
  
  // Take screenshot with error
  await page.screenshot({ 
    path: 'tarot-card-error-details.png', 
    fullPage: true 
  });
  
  // Try to navigate to the page directly again with cache cleared
  console.log('\nTrying with cache cleared...');
  await page.context().clearCookies();
  await page.reload({ waitUntil: 'networkidle' });
  
  await page.waitForTimeout(2000);
  
  // Take another screenshot
  await page.screenshot({ 
    path: 'tarot-card-after-reload.png', 
    fullPage: true 
  });
  
  // Keep browser open for observation
  console.log('\nKeeping browser open for 5 seconds...');
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log('Test completed!');
})().catch(console.error);