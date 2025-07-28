const { chromium } = require('playwright');
const fs = require('fs');

async function testPreloadOptimization() {
  console.log('Starting Vercel preload optimization test...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // Enable console logs
    acceptDownloads: true
  });
  
  const page = await context.newPage();
  
  // Monitor console logs for cache indicators
  const consoleLogs = [];
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
    // Step 1: Visit preload page
    console.log('\n1. Visiting preload page...');
    await page.goto('https://test-studio-firebase.vercel.app/preload-admin-data', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of preload page
    await page.screenshot({
      path: 'vercel-preload-01-page-loaded.png',
      fullPage: true
    });
    console.log('Screenshot saved: vercel-preload-01-page-loaded.png');
    
    // Wait for preload to complete (looking for success indicators)
    console.log('\n2. Waiting for preload to complete...');
    
    // Wait for preload process to complete by looking for success message
    try {
      await page.waitForSelector('text=🎉 모든 데이터 사전 로딩 완료', {
        timeout: 30000
      });
      console.log('✅ Preload completed successfully');
    } catch (error) {
      console.log('⚠️ Preload completion message not found, continuing...');
    }
    
    // Wait a bit more for cache to be populated
    await page.waitForTimeout(3000);
    
    // Take screenshot after preload completes
    await page.screenshot({
      path: 'vercel-preload-02-completed.png',
      fullPage: true
    });
    console.log('Screenshot saved: vercel-preload-02-completed.png');
    
    // Step 3: Navigate to admin page and measure load time
    console.log('\n3. Navigating to admin page...');
    
    const adminStartTime = Date.now();
    
    // Either wait for auto-redirect or manually navigate
    try {
      await page.waitForURL('**/admin', { timeout: 5000 });
      console.log('✅ Auto-redirected to admin page');
    } catch {
      console.log('⚠️ No auto-redirect, navigating manually...');
      await page.goto('https://test-studio-firebase.vercel.app/admin', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
    }
    
    // Wait for authentication check
    await page.waitForTimeout(3000);
    
    // Handle authentication if needed
    const isSignInPage = await page.locator('text=/sign in|로그인|Sign In/i').isVisible().catch(() => false);
    
    if (isSignInPage) {
      console.log('Authentication required. Signing in...');
      
      // Click sign in button
      await page.click('button:has-text("Sign in with Google"), button:has-text("구글로 로그인"), button:has-text("Google로 로그인")');
      
      // Wait for OAuth redirect
      await page.waitForTimeout(5000);
      
      // Check if we're back on admin page
      await page.waitForURL('**/admin', { timeout: 30000 }).catch(() => {
        console.log('Waiting for redirect back to admin page...');
      });
    }
    
    // Wait for admin page to fully load
    console.log('\n4. Waiting for admin page data to load...');
    
    // Wait for AI Provider Management tab to be visible
    await page.waitForSelector('text=/AI Provider Management|AI 제공자 관리/i', {
      timeout: 30000
    });
    
    const adminLoadTime = Date.now() - adminStartTime;
    console.log(`Admin page load time: ${adminLoadTime}ms`);
    
    // Take screenshot of loaded admin page
    await page.screenshot({
      path: 'vercel-preload-03-admin-loaded.png',
      fullPage: true
    });
    console.log('Screenshot saved: vercel-preload-03-admin-loaded.png');
    
    // Test AI Provider Management tab
    console.log('\n5. Testing AI Provider Management tab...');
    
    // Click on AI Provider Management tab if not already active
    const aiProviderTab = page.locator('text=/AI Provider Management|AI 제공자 관리/i');
    if (await aiProviderTab.isVisible()) {
      await aiProviderTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Measure data loading time
    const aiProviderStartTime = Date.now();
    
    // Wait for providers list to load
    await page.waitForSelector('[class*="provider"], [class*="card"], [class*="list"]', {
      timeout: 10000
    }).catch(() => console.log('Provider list selector not found'));
    
    const aiProviderLoadTime = Date.now() - aiProviderStartTime;
    console.log(`AI Provider data load time: ${aiProviderLoadTime}ms`);
    
    await page.screenshot({
      path: 'vercel-preload-04-ai-providers-loaded.png',
      fullPage: true
    });
    console.log('Screenshot saved: vercel-preload-04-ai-providers-loaded.png');
    
    // Test Tarot Guideline Management tab
    console.log('\n6. Testing Tarot Guideline Management tab...');
    
    // Click on Tarot Guideline Management tab
    const tarotTab = page.locator('text=/Tarot Guideline Management|타로 지침 관리/i');
    if (await tarotTab.isVisible()) {
      await tarotTab.click();
      
      const tarotStartTime = Date.now();
      
      // Wait for guidelines to load
      await page.waitForTimeout(2000);
      
      const tarotLoadTime = Date.now() - tarotStartTime;
      console.log(`Tarot Guidelines data load time: ${tarotLoadTime}ms`);
      
      await page.screenshot({
        path: 'vercel-preload-05-tarot-guidelines-loaded.png',
        fullPage: true
      });
      console.log('Screenshot saved: vercel-preload-05-tarot-guidelines-loaded.png');
    }
    
    // Analyze console logs for cache usage
    console.log('\n7. Analyzing cache usage from console logs...');
    
    const cacheRelatedLogs = consoleLogs.filter(log => 
      log.text.toLowerCase().includes('cache') ||
      log.text.toLowerCase().includes('preload') ||
      log.text.toLowerCase().includes('indexed') ||
      log.text.toLowerCase().includes('stored')
    );
    
    if (cacheRelatedLogs.length > 0) {
      console.log('\nCache-related console logs found:');
      cacheRelatedLogs.forEach(log => {
        console.log(`[${log.time}] ${log.text}`);
      });
    }
    
    // Generate optimization report
    const report = {
      timestamp: new Date().toISOString(),
      results: {
        preloadPageVisited: true,
        adminPageLoadTime: `${adminLoadTime}ms`,
        aiProviderLoadTime: `${aiProviderLoadTime}ms`,
        tarotGuidelineLoadTime: `${tarotLoadTime}ms`,
        cacheLogsFound: cacheRelatedLogs.length,
        totalConsoleLogs: consoleLogs.length
      },
      optimizationNotes: [
        'Preload page successfully visited',
        'Admin page loaded with potential cache optimization',
        `Total load time for admin page: ${adminLoadTime}ms`,
        cacheRelatedLogs.length > 0 ? 'Cache usage detected in console logs' : 'No explicit cache logs found'
      ]
    };
    
    // Save report
    fs.writeFileSync(
      'vercel-preload-optimization-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log('\nOptimization report saved: vercel-preload-optimization-report.json');
    
    // Display summary
    console.log('\n=== OPTIMIZATION TEST SUMMARY ===');
    console.log(`Admin Page Load Time: ${adminLoadTime}ms`);
    console.log(`AI Provider Data Load: ${aiProviderLoadTime}ms`);
    console.log(`Tarot Guidelines Load: ${tarotLoadTime}ms`);
    console.log(`Cache-related logs: ${cacheRelatedLogs.length}`);
    console.log('================================\n');
    
  } catch (error) {
    console.error('Test error:', error);
    
    // Take error screenshot
    await page.screenshot({
      path: 'vercel-preload-error.png',
      fullPage: true
    });
    console.log('Error screenshot saved: vercel-preload-error.png');
  }
  
  // Keep browser open for manual inspection
  console.log('\nTest completed. Browser will remain open for inspection.');
  console.log('Press Ctrl+C to close the browser and exit.');
  
  // Wait indefinitely
  await new Promise(() => {});
}

// Run the test
testPreloadOptimization().catch(console.error);