const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testTarotGuidelinesLoading() {
  console.log('Starting Tarot Guidelines Loading Test...');
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[Browser Console - ${msg.type()}]: ${msg.text()}`);
  });
  
  // Track network requests
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('tarot') || request.url().includes('guideline')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('tarot') || response.url().includes('guideline')) {
      console.log(`[Network Response]: ${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    // Navigate to admin page
    console.log('\n1. Navigating to admin page...');
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for auth check
    await page.waitForTimeout(2000);
    
    // Check if we need to login
    const needsLogin = await page.isVisible('button:has-text("관리자 로그인")');
    
    if (needsLogin) {
      console.log('\n2. Logging in as admin...');
      await page.click('button:has-text("관리자 로그인")');
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'screenshots/tarot-loading-01-after-login.png',
        fullPage: true 
      });
    }
    
    // Wait for admin tabs to load
    console.log('\n3. Waiting for admin tabs to be visible...');
    await page.waitForSelector('button:has-text("타로 해석 지침 관리")', { 
      timeout: 10000,
      state: 'visible' 
    });
    
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-02-tabs-visible.png',
      fullPage: true 
    });
    
    // Clear console to track only tarot-related logs
    await page.evaluate(() => console.clear());
    
    // Record start time
    const startTime = Date.now();
    console.log(`\n4. Clicking "타로 해석 지침 관리" tab at ${new Date(startTime).toISOString()}`);
    
    // Click the tarot guidelines tab
    await page.click('button:has-text("타로 해석 지침 관리")');
    
    // Wait for loading to start
    await page.waitForTimeout(100);
    
    // Take screenshot during loading
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-03-loading-started.png',
      fullPage: true 
    });
    
    // Wait for content to load
    console.log('\n5. Waiting for guidelines to load...');
    
    // Try multiple selectors to catch when content loads
    const loadedPromise = Promise.race([
      page.waitForSelector('text=/타로 카드 해석 지침/', { timeout: 15000 }),
      page.waitForSelector('div:has-text("메이저 아르카나")', { timeout: 15000 }),
      page.waitForSelector('[data-testid="guidelines-loaded"]', { timeout: 15000 }),
      page.waitForSelector('.guideline-content', { timeout: 15000 })
    ]);
    
    await loadedPromise;
    const endTime = Date.now();
    const loadingTime = endTime - startTime;
    
    console.log(`\n✅ Guidelines loaded in ${loadingTime}ms (${(loadingTime/1000).toFixed(2)} seconds)`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-04-fully-loaded.png',
      fullPage: true 
    });
    
    // Wait a bit more to capture any delayed logs
    await page.waitForTimeout(2000);
    
    // Check for any loading indicators still visible
    const hasLoadingIndicator = await page.isVisible('.loading-spinner, .skeleton, [class*="loading"]');
    if (hasLoadingIndicator) {
      console.log('⚠️  Warning: Loading indicators still visible after content loaded');
    }
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      const tarotEntries = entries.filter(e => 
        e.name.includes('tarot') || 
        e.name.includes('guideline') ||
        e.name.includes('firestore')
      );
      
      return tarotEntries.map(e => ({
        name: e.name,
        duration: Math.round(e.duration),
        size: e.transferSize || 0
      }));
    });
    
    // Generate report
    const report = {
      testTime: new Date().toISOString(),
      loadingTime: loadingTime,
      loadingTimeSeconds: (loadingTime/1000).toFixed(2),
      networkRequests: networkRequests.length,
      performanceMetrics: performanceMetrics,
      hasErrors: false
    };
    
    // Save report
    await fs.writeFile(
      'tarot-guidelines-loading-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n=== LOADING PERFORMANCE SUMMARY ===');
    console.log(`Total Loading Time: ${loadingTime}ms (${(loadingTime/1000).toFixed(2)} seconds)`);
    console.log(`Network Requests: ${networkRequests.length}`);
    console.log(`Performance Metrics Captured: ${performanceMetrics.length}`);
    
    if (performanceMetrics.length > 0) {
      console.log('\nTop Resource Loading Times:');
      performanceMetrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .forEach(metric => {
          console.log(`  - ${metric.name.split('/').pop()}: ${metric.duration}ms`);
        });
    }
    
    // Check console for cache-related logs
    const consoleLogs = await page.evaluate(() => {
      return window.__consoleLogs || [];
    });
    
    const cacheRelatedLogs = consoleLogs.filter(log => 
      log.toLowerCase().includes('cache') || 
      log.toLowerCase().includes('tarot') ||
      log.toLowerCase().includes('guideline')
    );
    
    if (cacheRelatedLogs.length > 0) {
      console.log('\n=== CACHE-RELATED LOGS ===');
      cacheRelatedLogs.forEach(log => console.log(log));
    }
    
    // Keep browser open for 5 seconds to observe
    console.log('\n✅ Test completed. Keeping browser open for observation...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ 
      path: 'screenshots/tarot-loading-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n🏁 Test finished');
  }
}

// Add console log capture to page
const setupConsoleCapture = `
  window.__consoleLogs = [];
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.log = function(...args) {
    window.__consoleLogs.push(args.join(' '));
    originalLog.apply(console, args);
  };
  
  console.error = function(...args) {
    window.__consoleLogs.push('[ERROR] ' + args.join(' '));
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    window.__consoleLogs.push('[WARN] ' + args.join(' '));
    originalWarn.apply(console, args);
  };
`;

testTarotGuidelinesLoading();