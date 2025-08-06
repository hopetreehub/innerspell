const { chromium } = require('playwright');

async function testUpdatedFontLoading() {
  console.log('🔍 Testing updated font loading with local Pretendard files...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  
  // Network monitoring
  const fontRequests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/fonts/') || url.includes('.woff') || url.includes('.woff2') || url.includes('pretendard')) {
      fontRequests.push({
        url: url,
        timestamp: Date.now(),
        type: url.includes('pretendard') ? 'CDN' : 'LOCAL'
      });
      console.log(`📥 Font request (${url.includes('pretendard') ? 'CDN' : 'LOCAL'}):`, url);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/fonts/') || url.includes('.woff') || url.includes('.woff2') || url.includes('pretendard')) {
      console.log(`📨 Font response (${url.includes('pretendard') ? 'CDN' : 'LOCAL'}): ${url} - Status: ${response.status()}`);
    }
  });

  try {
    console.log('\n🌐 Testing Home page with cache bypass...');
    
    // Go to homepage with cache bypass
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Force refresh to bypass cache
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait for fonts to load
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'font-test-updated-home.png', 
      fullPage: false 
    });
    console.log('📸 Screenshot saved: font-test-updated-home.png');
    
    // Check computed font styles
    const fontCheck = await page.evaluate(() => {
      // Get different elements to test font application
      const elements = [
        { selector: 'h1', name: 'H1' },
        { selector: 'h2', name: 'H2' },
        { selector: 'p', name: 'P' },
        { selector: 'button', name: 'Button' },
        { selector: 'nav a', name: 'Nav Link' }
      ];
      
      const results = [];
      elements.forEach(({ selector, name }) => {
        const el = document.querySelector(selector);
        if (el) {
          const style = window.getComputedStyle(el);
          results.push({
            element: name,
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontSize: style.fontSize
          });
        }
      });
      
      return results;
    });
    
    console.log('\n✅ Font application results:');
    fontCheck.forEach(result => {
      console.log(`  ${result.element}: ${result.fontFamily} (${result.fontWeight}, ${result.fontSize})`);
    });

    // Check network performance entries
    const networkFonts = await page.evaluate(() => {
      const performanceEntries = performance.getEntriesByType('resource');
      return performanceEntries
        .filter(entry => 
          entry.name.includes('/fonts/') || 
          entry.name.includes('.woff') || 
          entry.name.includes('pretendard')
        )
        .map(entry => ({
          name: entry.name,
          transferSize: entry.transferSize,
          duration: entry.duration,
          type: entry.name.includes('pretendard') ? 'CDN' : 'LOCAL'
        }));
    });
    
    console.log('\n🔍 Network font performance:');
    networkFonts.forEach(font => {
      console.log(`  ${font.type}: ${font.name}`);
      console.log(`    Size: ${font.transferSize} bytes, Load time: ${font.duration.toFixed(2)}ms`);
    });

    // Summary
    console.log('\n📊 Font Loading Summary:');
    const localFonts = fontRequests.filter(req => req.type === 'LOCAL');
    const cdnFonts = fontRequests.filter(req => req.type === 'CDN');
    
    console.log(`Local font requests: ${localFonts.length}`);
    localFonts.forEach(req => console.log(`  - ${req.url}`));
    
    console.log(`CDN font requests: ${cdnFonts.length}`);
    cdnFonts.forEach(req => console.log(`  - ${req.url}`));

    // Wait for user inspection
    console.log('\n🔍 Browser kept open for manual inspection...');
    console.log('Check Developer Tools > Network tab for font loading details.');
    console.log('Press any key to close...');
    
    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

  } catch (error) {
    console.error('❌ Error during font testing:', error.message);
  } finally {
    await browser.close();
  }
}

testUpdatedFontLoading().catch(console.error);