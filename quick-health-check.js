const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    console.log('🚀 Starting Playwright health check for localhost:4000...');
    
    // Launch browser
    browser = await chromium.launch({
      headless: true,
      timeout: 10000
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
      // Navigate to localhost:4000 with shorter timeout
      const response = await page.goto('http://localhost:4000', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      console.log(`✅ Page loaded with status: ${response.status()}`);
      
      // Wait a bit for page to render
      await page.waitForTimeout(2000);
      
      // Take screenshot
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `health-check-${timestamp}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`📸 Screenshot saved as ${screenshotPath}`);
      
      // Get page title
      const title = await page.title();
      console.log(`📄 Page title: "${title}"`);
      
      // Check for basic content
      try {
        const bodyText = await page.evaluate(() => document.body ? document.body.innerText : 'No body element');
        console.log(`📝 Page content preview: ${bodyText.substring(0, 200)}${bodyText.length > 200 ? '...' : ''}`);
      } catch (e) {
        console.log('📝 Could not read page content');
      }
      
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
      
      // Check page HTML structure
      const htmlSample = await page.evaluate(() => {
        return document.documentElement.outerHTML.substring(0, 500);
      });
      console.log('\n📋 HTML preview:');
      console.log(htmlSample + '...');
      
      console.log('\n🎉 Health check completed successfully!');
      
    } catch (navigationError) {
      console.error('❌ Failed to navigate to localhost:4000:', navigationError.message);
      
      // Try direct HTTP request
      console.log('\n🔍 Trying direct HTTP request...');
      const http = require('http');
      http.get('http://localhost:4000', (res) => {
        console.log(`HTTP Status: ${res.statusCode}`);
        console.log('Headers:', res.headers);
      }).on('error', (e) => {
        console.error('HTTP Error:', e.message);
      });
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