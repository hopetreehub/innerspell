const { chromium } = require('playwright');
const fs = require('fs');

async function testFinalOptimization() {
  console.log('Starting final loading optimization verification...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const consoleLogs = [];
  const performanceData = [];
  
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
    console.log('\n=== FINAL OPTIMIZATION VERIFICATION ===\n');
    
    // Test 1: Check if preload page is now working after deployment
    console.log('1. Testing preload page after deployment...');
    
    try {
      const preloadResponse = await page.goto('https://test-studio-firebase.vercel.app/preload-admin-data', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      
      console.log(`Preload page status: ${preloadResponse.status()}`);
      
      if (preloadResponse.status() === 200) {
        console.log('✅ Preload page is now accessible!');
        
        await page.waitForTimeout(3000);
        
        // Look for the preload UI elements
        const hasPreloadUI = await page.locator('text=/관리자 데이터 최적화|데이터를 사전 로딩/i').isVisible().catch(() => false);
        console.log(`Preload UI detected: ${hasPreloadUI}`);
        
        // Wait for preload completion
        try {
          await page.waitForSelector('text=🎉 모든 데이터 사전 로딩 완료', {
            timeout: 30000
          });
          console.log('✅ Preload process completed successfully');
          
          const preloadStartTime = Date.now();
          
          // Wait for auto-redirect or click manual button
          try {
            await page.waitForURL('**/admin', { timeout: 5000 });
            console.log('✅ Auto-redirected to admin page');
          } catch {
            const adminButton = page.locator('text=/관리자 페이지로 이동/i');
            if (await adminButton.isVisible()) {
              await adminButton.click();
              console.log('✅ Manually navigated to admin page');
            }
          }
          
          await page.screenshot({
            path: 'final-01-preload-success.png',
            fullPage: true
          });
          
        } catch (error) {
          console.log('⚠️ Preload process timeout, continuing with test...');
        }
        
      } else {
        console.log('❌ Preload page still returns:', preloadResponse.status());
      }
      
    } catch (error) {
      console.log('❌ Preload page error:', error.message);
    }
    
    // Test 2: Measure admin page performance
    console.log('\n2. Testing admin page performance...');
    
    const adminStartTime = Date.now();
    
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    const adminLoadTime = Date.now() - adminStartTime;
    console.log(`Admin page load time: ${adminLoadTime}ms`);
    
    performanceData.push({
      operation: 'Admin Page Load',
      time: adminLoadTime
    });
    
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: 'final-02-admin-page-loaded.png',
      fullPage: true
    });
    
    // Test 3: Check authentication flow
    console.log('\n3. Testing authentication and admin dashboard access...');
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('sign-in')) {
      console.log('Redirected to sign-in as expected (not authenticated)');
      
      // Test sign-in page performance
      const signInStartTime = Date.now();
      
      const googleButton = page.locator('button:has-text("Google로 로그인"), button:has-text("Sign in with Google")');
      if (await googleButton.isVisible()) {
        console.log('✅ Google sign-in button found');
        
        const signInLoadTime = Date.now() - signInStartTime;
        performanceData.push({
          operation: 'Sign-in Page Load',
          time: signInLoadTime
        });
      }
      
      await page.screenshot({
        path: 'final-03-signin-page.png',
        fullPage: true
      });
      
    } else {
      console.log('Direct admin access (user authenticated)');
      
      // Test admin dashboard tabs if accessible
      const aiProviderTab = page.locator('text=/AI Provider Management|AI 제공자 관리/i');
      if (await aiProviderTab.isVisible()) {
        console.log('✅ AI Provider Management tab found');
        
        const tabStartTime = Date.now();
        await aiProviderTab.click();
        await page.waitForTimeout(2000);
        const tabLoadTime = Date.now() - tabStartTime;
        
        performanceData.push({
          operation: 'AI Provider Tab Load',
          time: tabLoadTime
        });
        
        console.log(`AI Provider tab load time: ${tabLoadTime}ms`);
      }
      
      const tarotTab = page.locator('text=/Tarot Guideline Management|타로 지침 관리/i');
      if (await tarotTab.isVisible()) {
        console.log('✅ Tarot Guidelines tab found');
        
        const tabStartTime = Date.now();
        await tarotTab.click();
        await page.waitForTimeout(2000);
        const tabLoadTime = Date.now() - tabStartTime;
        
        performanceData.push({
          operation: 'Tarot Guidelines Tab Load',
          time: tabLoadTime
        });
        
        console.log(`Tarot Guidelines tab load time: ${tabLoadTime}ms`);
      }
      
      await page.screenshot({
        path: 'final-04-admin-dashboard.png',
        fullPage: true
      });
    }
    
    // Test 4: Check caching and optimization indicators
    console.log('\n4. Analyzing optimization indicators...');
    
    // Check browser storage for caching
    const storageInfo = await page.evaluate(() => {
      return {
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage),
        indexedDB: typeof indexedDB !== 'undefined'
      };
    });
    
    console.log('Browser storage:', storageInfo);
    
    // Check for service worker
    const serviceWorkerInfo = await page.evaluate(() => {
      return {
        hasServiceWorker: 'serviceWorker' in navigator,
        swRegistered: navigator.serviceWorker?.controller !== null
      };
    });
    
    console.log('Service Worker:', serviceWorkerInfo);
    
    // Performance API data
    const performanceMetrics = await page.evaluate(() => {
      if (!performance.getEntriesByType) return null;
      
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart,
        loadComplete: navigation?.loadEventEnd - navigation?.navigationStart,
        resourceCount: resources.length,
        cacheHits: resources.filter(r => r.transferSize === 0).length
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);
    
    // Filter cache-related console logs
    const cacheRelatedLogs = consoleLogs.filter(log => 
      log.text.toLowerCase().includes('cache') ||
      log.text.toLowerCase().includes('stored') ||
      log.text.toLowerCase().includes('preload') ||
      log.text.toLowerCase().includes('optimization')
    );
    
    console.log(`Cache-related console logs: ${cacheRelatedLogs.length}`);
    
    // Test 5: Overall performance assessment
    console.log('\n5. Final performance assessment...');
    
    const averageLoadTime = performanceData.length > 0 
      ? performanceData.reduce((sum, p) => sum + p.time, 0) / performanceData.length
      : 0;
    
    const optimizationScore = {
      preloadPageWorking: false, // Will be updated based on actual test
      adminPageSpeed: adminLoadTime < 3000 ? 'Fast' : adminLoadTime < 5000 ? 'Moderate' : 'Slow',
      cacheUtilization: cacheRelatedLogs.length > 0 ? 'Active' : 'Limited',
      serviceWorkerEnabled: serviceWorkerInfo.swRegistered,
      averageLoadTime: Math.round(averageLoadTime)
    };
    
    // Generate final report
    const finalReport = {
      timestamp: new Date().toISOString(),
      testResults: {
        preloadPageStatus: 'To be determined from test results',
        performanceData: performanceData,
        optimizationScore: optimizationScore,
        browserStorage: storageInfo,
        serviceWorker: serviceWorkerInfo,
        performanceMetrics: performanceMetrics,
        cacheIndicators: cacheRelatedLogs.length
      },
      summary: {
        adminPageLoadTime: `${adminLoadTime}ms`,
        averageOperationTime: `${averageLoadTime}ms`,
        cacheOptimization: cacheRelatedLogs.length > 0 ? 'Detected' : 'Not detected',
        overallPerformance: adminLoadTime < 1000 ? 'Excellent' : adminLoadTime < 3000 ? 'Good' : 'Needs improvement'
      },
      recommendations: [
        adminLoadTime > 3000 ? 'Consider further optimization for admin page loading' : 'Admin page loading performance is good',
        cacheRelatedLogs.length === 0 ? 'Implement more cache indicators in console logging' : 'Cache optimization appears to be working',
        'Continue monitoring performance metrics',
        'Consider implementing preload functionality if not currently working'
      ]
    };
    
    // Save all data
    fs.writeFileSync(
      'final-optimization-verification-report.json',
      JSON.stringify(finalReport, null, 2)
    );
    
    fs.writeFileSync(
      'final-optimization-console-logs.json',
      JSON.stringify(consoleLogs, null, 2)
    );
    
    // Display final summary
    console.log('\n=== FINAL OPTIMIZATION VERIFICATION RESULTS ===');
    console.log(`Admin Page Load Time: ${adminLoadTime}ms`);
    console.log(`Average Operation Time: ${averageLoadTime}ms`);
    console.log(`Performance Rating: ${finalReport.summary.overallPerformance}`);
    console.log(`Cache Optimization: ${finalReport.summary.cacheOptimization}`);
    console.log(`Service Worker: ${serviceWorkerInfo.swRegistered ? 'Active' : 'Inactive'}`);
    console.log(`Resource Cache Hits: ${performanceMetrics?.cacheHits || 0}/${performanceMetrics?.resourceCount || 0}`);
    console.log('===============================================\n');
    
    console.log('✅ Final optimization verification completed!');
    console.log('📊 Reports saved: final-optimization-verification-report.json');
    console.log('🖼️  Screenshots saved with final-* prefix');
    
  } catch (error) {
    console.error('Final test error:', error);
    
    await page.screenshot({
      path: 'final-verification-error.png',
      fullPage: true
    });
  }
  
  console.log('\nTest completed. Browser will remain open for inspection.');
  console.log('Press Ctrl+C to close the browser and exit.');
  
  await new Promise(() => {});
}

// Run the final verification
testFinalOptimization().catch(console.error);