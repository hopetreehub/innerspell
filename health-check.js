const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    console.log('🚀 Starting Playwright health check for localhost:4000...');
    
    // Launch browser
    browser = await chromium.launch({
      headless: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Listen for console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Listen for page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    console.log('📡 Attempting to connect to http://localhost:4000...');
    
    try {
      // Navigate to localhost:4000
      const response = await page.goto('http://localhost:4000', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      console.log(`✅ Page loaded with status: ${response.status()}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'health-check-screenshot.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved as health-check-screenshot.png');
      
      // Get page title
      const title = await page.title();
      console.log(`📄 Page title: "${title}"`);
      
      // Check for basic content
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log(`📝 Page content preview: ${bodyText.substring(0, 200)}...`);
      
      // Report console logs
      if (consoleLogs.length > 0) {
        console.log('\n🔍 Console logs detected:');
        consoleLogs.forEach(log => {
          console.log(`  [${log.type}] ${log.text}`);
        });
      } else {
        console.log('\n✅ No console logs detected');
      }
      
      // Report page errors
      if (pageErrors.length > 0) {
        console.log('\n❌ Page errors detected:');
        pageErrors.forEach(error => {
          console.log(`  ${error}`);
        });
      } else {
        console.log('✅ No page errors detected');
      }
      
      // Check for common elements
      const hasReactRoot = await page.evaluate(() => {
        return document.getElementById('root') !== null || 
               document.getElementById('__next') !== null ||
               document.querySelector('[id*="app"]') !== null;
      });
      
      if (hasReactRoot) {
        console.log('✅ React/Next.js root element found');
      }
      
      console.log('\n🎉 Health check completed successfully!');
      
    } catch (navigationError) {
      console.error('❌ Failed to navigate to localhost:4000:', navigationError.message);
      
      // Check if server is running
      try {
        const { exec } = require('child_process');
        exec('lsof -i :4000', (error, stdout, stderr) => {
          if (stdout) {
            console.log('\n🔍 Port 4000 is in use by:');
            console.log(stdout);
          } else {
            console.log('\n⚠️  Port 4000 appears to be free - no server running');
          }
        });
      } catch (e) {
        console.log('Could not check port status');
      }
    }
    
  } catch (error) {
    console.error('❌ Playwright error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🔒 Browser closed');
    }
  }
})();