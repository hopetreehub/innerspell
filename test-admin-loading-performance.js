const { chromium } = require('playwright');
const fs = require('fs');

async function testAdminLoadingPerformance() {
  console.log('Starting admin loading performance test...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Monitor console logs for cache and performance indicators
  const consoleLogs = [];
  const performanceMetrics = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({
      time: new Date().toISOString(),
      type: msg.type(),
      text: text
    });
    console.log(`[Console ${msg.type()}] ${text}`);
  });
  
  try {
    // Test 1: Direct admin page access (will likely redirect to sign-in)
    console.log('\n1. Testing direct admin page access...');
    
    const adminStartTime = Date.now();
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    const adminLoadTime = Date.now() - adminStartTime;
    
    await page.screenshot({
      path: 'admin-performance-01-initial-access.png',
      fullPage: true
    });
    console.log(`Admin page initial access time: ${adminLoadTime}ms`);
    
    // Test 2: Check if redirected to sign-in
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('sign-in')) {
      console.log('\n2. Redirected to sign-in page as expected...');
      
      // Try to test the sign-in flow
      const signInStartTime = Date.now();
      
      // Look for Google sign-in button
      const googleButton = page.locator('button:has-text("Sign in with Google"), button:has-text("구글로 로그인"), button:has-text("Google로 로그인")');
      
      if (await googleButton.isVisible()) {
        console.log('Google sign-in button found');
        await page.screenshot({
          path: 'admin-performance-02-signin-page.png',
          fullPage: true
        });
        
        // Note: We won't actually click sign-in as it requires real authentication
        console.log('Note: Real authentication would be required to proceed further');
      }
    } else {
      console.log('\n2. Admin page loaded directly (user might be authenticated)...');
      
      // Test admin page tabs loading performance
      await page.waitForTimeout(2000);
      
      // Check for AI Provider Management tab
      const aiProviderTab = page.locator('text=/AI Provider Management|AI 제공자 관리/i');
      if (await aiProviderTab.isVisible()) {
        console.log('AI Provider Management tab found');
        
        const tabStartTime = Date.now();
        await aiProviderTab.click();
        await page.waitForTimeout(2000);
        const tabLoadTime = Date.now() - tabStartTime;
        
        await page.screenshot({
          path: 'admin-performance-03-ai-providers-tab.png',
          fullPage: true
        });
        
        performanceMetrics.push({
          operation: 'AI Provider Tab Load',
          time: tabLoadTime
        });
        console.log(`AI Provider tab load time: ${tabLoadTime}ms`);
      }
      
      // Check for Tarot Guidelines tab
      const tarotTab = page.locator('text=/Tarot Guideline Management|타로 지침 관리/i');
      if (await tarotTab.isVisible()) {
        console.log('Tarot Guidelines tab found');
        
        const tabStartTime = Date.now();
        await tarotTab.click();
        await page.waitForTimeout(2000);
        const tabLoadTime = Date.now() - tabStartTime;
        
        await page.screenshot({
          path: 'admin-performance-04-tarot-guidelines-tab.png',
          fullPage: true
        });
        
        performanceMetrics.push({
          operation: 'Tarot Guidelines Tab Load',
          time: tabLoadTime
        });
        console.log(`Tarot Guidelines tab load time: ${tabLoadTime}ms`);
      }
    }
    
    // Test 3: Check for cache-related browser storage
    console.log('\n3. Checking browser storage for cache data...');
    
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        items[key] = value ? value.substring(0, 100) + '...' : value; // Truncate for readability
      }
      return items;
    });
    
    const sessionStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        items[key] = value ? value.substring(0, 100) + '...' : value;
      }
      return items;
    });
    
    console.log('LocalStorage keys:', Object.keys(localStorage));
    console.log('SessionStorage keys:', Object.keys(sessionStorage));
    
    // Test 4: Check IndexedDB for cached data
    const indexedDBInfo = await page.evaluate(async () => {
      if (!window.indexedDB) return 'IndexedDB not supported';
      
      try {
        const databases = await indexedDB.databases();
        return databases.map(db => ({ name: db.name, version: db.version }));
      } catch (error) {
        return `Error accessing IndexedDB: ${error.message}`;
      }
    });
    
    console.log('IndexedDB info:', indexedDBInfo);
    
    // Test 5: Performance API metrics
    const performanceData = await page.evaluate(() => {
      if (!window.performance) return 'Performance API not available';
      
      const navigation = performance.getEntriesByType('navigation')[0];
      if (!navigation) return 'Navigation timing not available';
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 'N/A',
        resourceCount: performance.getEntriesByType('resource').length
      };
    });
    
    console.log('Performance metrics:', performanceData);
    
    // Analyze console logs for cache/optimization indicators
    const cacheRelatedLogs = consoleLogs.filter(log => 
      log.text.toLowerCase().includes('cache') ||
      log.text.toLowerCase().includes('preload') ||
      log.text.toLowerCase().includes('indexed') ||
      log.text.toLowerCase().includes('stored') ||
      log.text.toLowerCase().includes('optimization')
    );
    
    // Generate performance report
    const report = {
      timestamp: new Date().toISOString(),
      testResults: {
        adminPageInitialLoad: adminLoadTime,
        currentUrl: currentUrl,
        redirectedToSignIn: currentUrl.includes('sign-in'),
        tabLoadTimes: performanceMetrics,
        performanceMetrics: performanceData,
        cacheIndicators: {
          localStorageKeys: Object.keys(localStorage).length,
          sessionStorageKeys: Object.keys(sessionStorage).length,
          indexedDBInfo: indexedDBInfo,
          cacheRelatedLogs: cacheRelatedLogs.length
        }
      },
      optimizationNotes: [
        `Admin page initial load: ${adminLoadTime}ms`,
        currentUrl.includes('sign-in') ? 'Properly redirected to sign-in (not authenticated)' : 'Direct admin access (authenticated)',
        `Console logs indicating cache usage: ${cacheRelatedLogs.length}`,
        `Browser storage items: localStorage(${Object.keys(localStorage).length}), sessionStorage(${Object.keys(sessionStorage).length})`
      ],
      recommendations: [
        'Preload page appears to have 404 issue - needs investigation',
        'Cache optimization may need browser storage inspection',
        'Consider implementing service worker for better caching',
        'Monitor console logs for cache hit/miss indicators'
      ]
    };
    
    // Save detailed report
    fs.writeFileSync(
      'admin-loading-performance-report.json',
      JSON.stringify(report, null, 2)
    );
    
    // Save console logs
    fs.writeFileSync(
      'admin-performance-console-logs.json',
      JSON.stringify(consoleLogs, null, 2)
    );
    
    // Display summary
    console.log('\n=== ADMIN LOADING PERFORMANCE SUMMARY ===');
    console.log(`Initial Load Time: ${adminLoadTime}ms`);
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Authentication Status: ${currentUrl.includes('sign-in') ? 'Not authenticated' : 'Authenticated'}`);
    console.log(`Cache-related Logs: ${cacheRelatedLogs.length}`);
    console.log(`Browser Storage: localStorage(${Object.keys(localStorage).length}) sessionStorage(${Object.keys(sessionStorage).length})`);
    console.log('=========================================\n');
    
    console.log('Performance report saved: admin-loading-performance-report.json');
    console.log('Console logs saved: admin-performance-console-logs.json');
    
  } catch (error) {
    console.error('Test error:', error);
    
    await page.screenshot({
      path: 'admin-performance-error.png',
      fullPage: true
    });
    console.log('Error screenshot saved: admin-performance-error.png');
  }
  
  // Keep browser open for manual inspection
  console.log('\nTest completed. Browser will remain open for inspection.');
  console.log('Press Ctrl+C to close the browser and exit.');
  
  await new Promise(() => {});
}

// Run the test
testAdminLoadingPerformance().catch(console.error);