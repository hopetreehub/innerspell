const { chromium } = require('playwright');

async function verifyScreens() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const pages = [
    { url: 'http://localhost:4000', name: 'homepage' },
    { url: 'http://localhost:4000/tarot', name: 'tarot' },
    { url: 'http://localhost:4000/admin', name: 'admin' },
    { url: 'http://localhost:4000/dream', name: 'dream' },
    { url: 'http://localhost:4000/tarot/0', name: 'tarot-detail-0' }
  ];
  
  for (const pageInfo of pages) {
    console.log(`\nNavigating to ${pageInfo.name}: ${pageInfo.url}`);
    
    try {
      await page.goto(pageInfo.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait a bit for any animations or lazy loading
      await page.waitForTimeout(2000);
      
      // Take screenshot
      const screenshotPath = `/mnt/e/project/test-studio-firebase/screenshots/${pageInfo.name}-${Date.now()}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`✓ Screenshot saved: ${screenshotPath}`);
      
      // Check for any errors on the page
      const errorElements = await page.$$('text=/error|Error|ERROR/i');
      if (errorElements.length > 0) {
        console.log(`⚠️  Found ${errorElements.length} error text(s) on ${pageInfo.name}`);
      }
      
      // Check if page is blank
      const bodyText = await page.evaluate(() => document.body.innerText.trim());
      if (!bodyText) {
        console.log(`⚠️  Page appears to be blank: ${pageInfo.name}`);
      }
      
    } catch (error) {
      console.error(`✗ Error on ${pageInfo.name}: ${error.message}`);
    }
  }
  
  console.log('\nKeeping browser open for manual inspection...');
  console.log('Press Ctrl+C to close when done.');
  
  // Keep browser open
  await new Promise(() => {});
}

verifyScreens().catch(console.error);