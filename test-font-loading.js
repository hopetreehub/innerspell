const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testFontLoading() {
  console.log('🔍 Starting font loading test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  
  // Network monitoring for fonts
  const fontRequests = [];
  page.on('request', request => {
    if (request.url().includes('/fonts/') || request.url().includes('.woff') || request.url().includes('.woff2')) {
      fontRequests.push({
        url: request.url(),
        timestamp: Date.now()
      });
      console.log('📥 Font request:', request.url());
    }
  });

  page.on('response', response => {
    if (response.url().includes('/fonts/') || response.url().includes('.woff') || response.url().includes('.woff2')) {
      console.log(`📨 Font response: ${response.url()} - Status: ${response.status()}`);
    }
  });

  // Test pages
  const testPages = [
    { name: 'Home', url: 'http://localhost:4000' },
    { name: 'Tarot', url: 'http://localhost:4000/tarot' },
    { name: 'Dream', url: 'http://localhost:4000/dream' },
    { name: 'Admin', url: 'http://localhost:4000/admin' }
  ];

  for (const testPage of testPages) {
    try {
      console.log(`\n🌐 Testing ${testPage.name} page: ${testPage.url}`);
      
      await page.goto(testPage.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for fonts to load
      await page.waitForTimeout(3000);
      
      // Take screenshot
      const screenshotPath = path.join(__dirname, `font-test-${testPage.name.toLowerCase()}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      
      // Check for font files in Network tab (via JavaScript)
      const networkFonts = await page.evaluate(() => {
        const performanceEntries = performance.getEntriesByType('resource');
        return performanceEntries
          .filter(entry => entry.name.includes('/fonts/') || entry.name.includes('.woff'))
          .map(entry => ({
            name: entry.name,
            responseStart: entry.responseStart,
            responseEnd: entry.responseEnd,
            transferSize: entry.transferSize
          }));
      });
      
      console.log('🔍 Network font entries for', testPage.name, ':');
      networkFonts.forEach(font => {
        console.log(`  - ${font.name} (${font.transferSize} bytes)`);
      });

      // Check if Pretendard fonts are applied
      const fontCheck = await page.evaluate(() => {
        const testElement = document.querySelector('h1, h2, p, span, div');
        if (testElement) {
          const computedStyle = window.getComputedStyle(testElement);
          return {
            fontFamily: computedStyle.fontFamily,
            fontWeight: computedStyle.fontWeight,
            element: testElement.tagName
          };
        }
        return null;
      });
      
      if (fontCheck) {
        console.log(`✅ Font applied on ${testPage.name}: ${fontCheck.fontFamily} (${fontCheck.element})`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${testPage.name}:`, error.message);
    }
  }

  // Final summary
  console.log('\n📊 Font Loading Summary:');
  console.log(`Total font requests captured: ${fontRequests.length}`);
  fontRequests.forEach(req => {
    console.log(`  - ${req.url}`);
  });

  // Keep browser open for manual inspection
  console.log('\n🔍 Browser kept open for manual inspection. Check Network tab for font loading.');
  console.log('Press any key to close...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  await browser.close();
}

testFontLoading().catch(console.error);