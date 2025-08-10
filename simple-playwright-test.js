const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright test for localhost:4000...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📡 Navigating to http://localhost:4000...');
    
    const response = await page.goto('http://localhost:4000', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    console.log(`✅ Page loaded! Status: ${response.status()}`);
    
    // Wait for content to render
    await page.waitForTimeout(3000);
    
    // Take screenshot
    const screenshotPath = 'localhost-4000-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Get page info
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Check for console errors
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    
    // Get page content
    const pageContent = await page.evaluate(() => {
      return {
        hasBody: !!document.body,
        bodyText: document.body ? document.body.innerText.substring(0, 200) : 'No body',
        hasReactRoot: !!document.getElementById('__next'),
        documentTitle: document.title,
        headScripts: Array.from(document.head.querySelectorAll('script')).length,
        bodyScripts: Array.from(document.body.querySelectorAll('script')).length
      };
    });
    
    console.log('\n📊 Page Analysis:');
    console.log(`- Has body element: ${pageContent.hasBody}`);
    console.log(`- Has Next.js root: ${pageContent.hasReactRoot}`);
    console.log(`- Document title: "${pageContent.documentTitle}"`);
    console.log(`- Scripts in head: ${pageContent.headScripts}`);
    console.log(`- Scripts in body: ${pageContent.bodyScripts}`);
    console.log(`- Content preview: ${pageContent.bodyText}...`);
    
    if (consoleLogs.length > 0) {
      console.log('\n🔍 Console logs:');
      consoleLogs.forEach(log => console.log(log));
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
})();