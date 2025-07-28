const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'https://test-studio-firebase.vercel.app';
  
  console.log('=== User Tracking System Verification ===\n');

  try {
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        console.log('Browser console:', msg.text());
      }
    });

    // Monitor network requests
    const trackingRequests = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('track') || url.includes('analytics') || url.includes('stats') || 
          url.includes('usage') || url.includes('telemetry') || url.includes('log')) {
        trackingRequests.push({
          url: url,
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    // 1. Visit main page
    console.log('1. Visiting main page...');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Check initial tracking state
    const initialTracking = await page.evaluate(() => {
      return {
        localStorage: Object.entries(localStorage).map(([key, value]) => ({
          key,
          value: value.substring(0, 100) + (value.length > 100 ? '...' : '')
        })),
        sessionStorage: Object.entries(sessionStorage).map(([key, value]) => ({
          key,
          value: value.substring(0, 100) + (value.length > 100 ? '...' : '')
        })),
        cookies: document.cookie,
        hasGoogleAnalytics: !!(window.gtag || window.ga),
        hasFirebaseAnalytics: !!(window.firebase && window.firebase.analytics)
      };
    });

    console.log('\nInitial tracking state:');
    console.log('- LocalStorage items:', initialTracking.localStorage.length);
    initialTracking.localStorage.forEach(item => {
      console.log(`  • ${item.key}: ${item.value}`);
    });
    console.log('- SessionStorage items:', initialTracking.sessionStorage.length);
    console.log('- Has Google Analytics:', initialTracking.hasGoogleAnalytics);
    console.log('- Has Firebase Analytics:', initialTracking.hasFirebaseAnalytics);

    // 2. Navigate to different pages
    console.log('\n2. Navigating to track user activity...');
    
    const pagesToVisit = [
      { url: '/tarot', name: 'Tarot Page' },
      { url: '/blog', name: 'Blog Page' },
      { url: '/tarot', name: 'Tarot Page (revisit)' }
    ];

    for (const pageInfo of pagesToVisit) {
      console.log(`\nVisiting ${pageInfo.name}...`);
      await page.goto(baseUrl + pageInfo.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Simulate user interaction
      await page.mouse.move(100, 100);
      await page.mouse.click(100, 100);
      
      // Try clicking on interactive elements
      const clickableElements = await page.$$('button, a, [role="button"], .card, .tarot-card');
      if (clickableElements.length > 0) {
        await clickableElements[0].click();
        console.log(`  - Clicked on an element in ${pageInfo.name}`);
      }
    }

    // 3. Check final tracking state
    console.log('\n3. Checking final tracking state...');
    await page.waitForTimeout(2000);

    const finalTracking = await page.evaluate(() => {
      // Force any pending tracking to fire
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('test-event', { test: true });
      }
      
      return {
        localStorage: Object.entries(localStorage).map(([key, value]) => ({
          key,
          value: value.substring(0, 200) + (value.length > 200 ? '...' : '')
        })),
        sessionStorage: Object.entries(sessionStorage).map(([key, value]) => ({
          key,
          value: value.substring(0, 200) + (value.length > 200 ? '...' : '')
        }))
      };
    });

    console.log('\nFinal tracking state:');
    console.log('- LocalStorage items:', finalTracking.localStorage.length);
    finalTracking.localStorage.forEach(item => {
      console.log(`  • ${item.key}: ${item.value}`);
    });
    console.log('- SessionStorage items:', finalTracking.sessionStorage.length);
    finalTracking.sessionStorage.forEach(item => {
      console.log(`  • ${item.key}: ${item.value}`);
    });

    // 4. Analyze tracking requests
    console.log('\n4. Tracking network requests:');
    console.log(`- Total tracking requests: ${trackingRequests.length}`);
    trackingRequests.forEach((req, index) => {
      console.log(`\n  Request ${index + 1}:`);
      console.log(`  - URL: ${req.url}`);
      console.log(`  - Method: ${req.method}`);
      if (req.postData) {
        console.log(`  - Data: ${req.postData.substring(0, 100)}...`);
      }
    });

    // 5. Check for custom tracking implementation
    console.log('\n5. Checking for custom tracking implementation...');
    const customTracking = await page.evaluate(() => {
      // Look for tracking-related functions
      const trackingFunctions = [];
      for (const key in window) {
        if (key.toLowerCase().includes('track') || 
            key.toLowerCase().includes('analytics') ||
            key.toLowerCase().includes('usage')) {
          trackingFunctions.push(key);
        }
      }
      
      // Check for Firebase usage tracking
      const hasFirebaseUsage = !!(window.firebase && (
        window.firebase.analytics ||
        window.firebase.performance ||
        window.firebase.database
      ));
      
      return {
        trackingFunctions,
        hasFirebaseUsage,
        performanceAPI: !!window.performance && !!window.performance.getEntriesByType
      };
    });

    console.log('- Tracking functions found:', customTracking.trackingFunctions);
    console.log('- Has Firebase usage tracking:', customTracking.hasFirebaseUsage);
    console.log('- Performance API available:', customTracking.performanceAPI);

    // Take final screenshot
    await page.screenshot({ 
      path: `vercel-tracking-final-${Date.now()}.png`,
      fullPage: true 
    });

    console.log('\n=== Verification Complete ===');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
  } finally {
    await browser.close();
  }
})();