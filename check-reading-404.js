const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable CDP to access network information
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');

  const networkRequests = [];
  const failed404Requests = [];

  // Track all network requests
  client.on('Network.responseReceived', (params) => {
    const request = {
      url: params.response.url,
      status: params.response.status,
      type: params.type,
      mimeType: params.response.mimeType
    };
    networkRequests.push(request);
    
    if (params.response.status === 404) {
      failed404Requests.push(request);
      console.log(`❌ 404 Error: ${params.response.url}`);
    }
  });

  console.log('Navigating to http://localhost:4000/reading...');
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait a bit for all resources to load
    await page.waitForTimeout(3000);

    // Take screenshot of the page
    await page.screenshot({ 
      path: 'reading-page-screenshot.png',
      fullPage: true 
    });

    console.log('\n📊 Network Request Summary:');
    console.log(`Total requests: ${networkRequests.length}`);
    console.log(`404 errors: ${failed404Requests.length}`);

    // Check for specific important files
    const importantFiles = [
      'main-app.js',
      'app-pages-internals.js',
      'layout.css',
      'webpack'
    ];

    console.log('\n🔍 Checking important files:');
    for (const fileName of importantFiles) {
      const requests = networkRequests.filter(req => req.url.includes(fileName));
      if (requests.length > 0) {
        requests.forEach(req => {
          const status = req.status === 200 ? '✅' : (req.status === 404 ? '❌' : '⚠️');
          console.log(`${status} ${fileName}: Status ${req.status}`);
        });
      } else {
        console.log(`⚪ ${fileName}: Not requested`);
      }
    }

    if (failed404Requests.length > 0) {
      console.log('\n❌ All 404 Errors:');
      failed404Requests.forEach(req => {
        console.log(`  - ${req.url}`);
      });
    } else {
      console.log('\n✅ No 404 errors detected!');
    }

    // Check if page content loaded properly
    const pageTitle = await page.title();
    const hasContent = await page.evaluate(() => {
      const mainContent = document.querySelector('main');
      return mainContent && mainContent.textContent.trim().length > 0;
    });

    console.log('\n📄 Page Status:');
    console.log(`Title: ${pageTitle}`);
    console.log(`Content loaded: ${hasContent ? 'Yes' : 'No'}`);

    // Try to open DevTools Network tab (this will show in the non-headless browser)
    console.log('\n🔧 Browser is open with DevTools. Check the Network tab manually for detailed info.');
    console.log('Press Ctrl+C when done reviewing...');

    // Keep browser open for manual inspection
    await new Promise(() => {});

  } catch (error) {
    console.error('Error during test:', error);
  }
})();