const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log(`CONSOLE: ${msg.type()}: ${msg.text()}`));
  
  // Enable network logging
  page.on('response', response => {
    console.log(`NETWORK: ${response.status()} ${response.url()}`);
  });
  
  // Try different URLs
  const urlsToTry = [
    'https://innerspell.vercel.app',
    'https://innerspell.vercel.app/',
    'https://innerspell.vercel.app/api/health',
    'https://innerspell.vercel.app/tarot-reading'
  ];
  
  for (let url of urlsToTry) {
    console.log(`\n=== Trying URL: ${url} ===`);
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const title = await page.title();
      console.log(`Page title: ${title}`);
      
      // Take screenshot
      const filename = `test-${url.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`Screenshot saved: ${filename}`);
      
      // Check if we're on a login page
      const isLoginPage = await page.locator('text*="Log in", text*="Sign in", text*="Login"').count() > 0;
      console.log(`Is login page: ${isLoginPage}`);
      
      // Check for any visible content
      const bodyText = await page.locator('body').textContent();
      console.log(`Body text length: ${bodyText.length}`);
      console.log(`Body preview: ${bodyText.substring(0, 200)}...`);
      
    } catch (error) {
      console.error(`Error with ${url}:`, error.message);
    }
  }
  
  console.log('\nTest completed. Closing browser...');
  await browser.close();
})();