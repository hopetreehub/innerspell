const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testTarotGuidelinesWithManualAuth() {
  console.log('🎯 TAROT GUIDELINES LOADING PERFORMANCE TEST');
  console.log('═'.repeat(50));
  console.log('📋 This test will measure the exact loading time for the Tarot Guidelines tab');
  console.log('🔐 Manual Google authentication will be required');
  console.log('═'.repeat(50));
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 50
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Comprehensive logging
  const testLogs = [];
  const performanceMarkers = [];
  
  function addLog(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    testLogs.push(logEntry);
    console.log(logEntry);
  }
  
  function addPerformanceMarker(event, timestamp = Date.now()) {
    performanceMarkers.push({ event, timestamp });
    addLog(`⏱️  MARKER: ${event}`, 'perf');
  }
  
  // Console and network monitoring
  page.on('console', msg => {
    if (msg.text().includes('tarot') || 
        msg.text().includes('guideline') || 
        msg.text().includes('cache') ||
        msg.text().includes('admin')) {
      addLog(`BROWSER: ${msg.text()}`, 'console');
    }
  });
  
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('admin') || 
        request.url().includes('tarot') || 
        request.url().includes('guideline') ||
        request.url().includes('firestore')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
      addLog(`📡 REQUEST: ${request.method()} ${request.url().split('/').slice(-2).join('/')}`, 'network');
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('admin') || 
        response.url().includes('tarot') || 
        response.url().includes('guideline')) {
      addLog(`📡 RESPONSE: ${response.status()} ${response.url().split('/').slice(-2).join('/')}`, 'network');
    }
  });
  
  try {
    addPerformanceMarker('TEST_START');
    
    // Phase 1: Navigate to admin page
    addLog('📍 Phase 1: Navigating to admin page', 'phase');
    addPerformanceMarker('NAVIGATION_START');
    
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 25000 
    });
    
    addPerformanceMarker('NAVIGATION_COMPLETE');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'screenshots/tarot-perf-01-navigation.png',
      fullPage: true 
    });
    
    // Phase 2: Handle authentication
    addLog('🔐 Phase 2: Authentication handling', 'phase');
    
    const currentUrl = page.url();
    addLog(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('sign-in')) {
      addLog('🔐 Sign-in page detected - manual authentication required');
      
      await page.screenshot({ 
        path: 'screenshots/tarot-perf-02-signin-page.png',
        fullPage: true 
      });
      
      // Check for Google login button
      const googleButtonExists = await page.isVisible('button:has-text("Google")');
      addLog(`Google login button visible: ${googleButtonExists}`);
      
      if (googleButtonExists) {
        addLog('🚨 MANUAL INTERVENTION REQUIRED', 'important');
        addLog('Please complete the following steps:', 'important');
        addLog('1. Click the Google login button', 'important');
        addLog('2. Complete the Google OAuth process', 'important');
        addLog('3. Wait for redirect to admin page', 'important');
        addLog('4. The test will automatically continue once admin tabs are detected', 'important');
        
        // Wait for manual authentication (up to 2 minutes)
        addLog('⏳ Waiting for manual authentication (max 120 seconds)...');
        
        let authCompleted = false;
        let waitTime = 0;
        const maxWaitTime = 120000; // 2 minutes
        const checkInterval = 2000; // Check every 2 seconds
        
        while (!authCompleted && waitTime < maxWaitTime) {
          await page.waitForTimeout(checkInterval);
          waitTime += checkInterval;
          
          // Check if we're back on admin page with tabs
          const hasAdminTabs = await page.isVisible('button:has-text("타로 해석 지침 관리")');
          const currentUrlCheck = page.url();
          
          if (hasAdminTabs && currentUrlCheck.includes('admin')) {
            authCompleted = true;
            addLog('✅ Authentication completed successfully!');
            addPerformanceMarker('AUTH_COMPLETE');
          } else {
            addLog(`⏳ Waiting... (${waitTime/1000}s) - Current: ${currentUrlCheck.split('/').slice(-1)[0]}`);
          }
        }
        
        if (!authCompleted) {
          throw new Error('Authentication timeout - manual login not completed within 2 minutes');
        }
      } else {
        throw new Error('Google login button not found on sign-in page');
      }
    }
    
    // Phase 3: Verify admin access
    addLog('🛡️  Phase 3: Verifying admin access', 'phase');
    
    // Ensure we're on the admin page
    if (!page.url().includes('admin')) {
      addLog('Navigating back to admin page...');
      await page.goto('https://test-studio-firebase.vercel.app/admin');
      await page.waitForTimeout(2000);
    }
    
    // Wait for admin tabs to be visible
    await page.waitForSelector('button:has-text("타로 해석 지침 관리")', { 
      timeout: 10000,
      state: 'visible' 
    });
    
    addLog('✅ Admin tabs confirmed visible');
    addPerformanceMarker('ADMIN_TABS_READY');
    
    await page.screenshot({ 
      path: 'screenshots/tarot-perf-03-admin-ready.png',
      fullPage: true 
    });
    
    // Phase 4: PERFORMANCE TEST - Tab Click Timing
    addLog('🎯 Phase 4: STARTING TAROT GUIDELINES PERFORMANCE MEASUREMENT', 'phase');
    addLog('━'.repeat(60), 'separator');
    addLog('🚀 BEGINNING PRECISE TIMING MEASUREMENT', 'important');
    
    // Clear any existing console logs
    await page.evaluate(() => console.clear());
    
    // Prepare for timing
    const tabClickStartTime = Date.now();
    addPerformanceMarker('TAB_CLICK_START', tabClickStartTime);
    
    addLog(`🎯 CLICKING TAROT GUIDELINES TAB at ${new Date(tabClickStartTime).toISOString()}`, 'timing');
    
    // Click the tab
    await page.click('button:has-text("타로 해석 지침 관리")');
    
    // Immediate post-click screenshot
    await page.screenshot({ 
      path: 'screenshots/tarot-perf-04-tab-clicked.png',
      fullPage: true 
    });
    
    addLog('📸 Post-click screenshot captured', 'timing');
    
    // Phase 5: Monitor loading process
    addLog('🔍 Phase 5: Monitoring content loading process', 'phase');
    
    let loadingComplete = false;
    let monitoringStep = 0;
    const maxMonitoringSteps = 60; // Max 30 seconds at 500ms intervals
    const monitorInterval = 500;
    
    while (!loadingComplete && monitoringStep < maxMonitoringSteps) {
      monitoringStep++;
      await page.waitForTimeout(monitorInterval);
      
      // Check loading status
      const loadingStatus = await page.evaluate(() => {
        const body = document.body;
        const bodyText = body.textContent || '';
        
        return {
          // Content indicators
          hasTarotContent: bodyText.includes('타로') || bodyText.includes('카드'),
          hasGuidelineContent: bodyText.includes('지침') || bodyText.includes('해석'),
          hasSpecificContent: bodyText.includes('메이저') || bodyText.includes('아르카나'),
          
          // Loading indicators
          hasLoadingSpinner: !!document.querySelector('.loading, .spinner, [class*="load"]'),
          hasSkeletonLoader: !!document.querySelector('.skeleton, [class*="skeleton"]'),
          
          // Content metrics
          contentLength: bodyText.length,
          uniqueWords: new Set(bodyText.toLowerCase().split(/\s+/)).size,
          
          timestamp: Date.now()
        };
      });
      
      const elapsed = Date.now() - tabClickStartTime;
      addLog(`📊 Step ${monitoringStep} (${elapsed}ms): Content=${loadingStatus.contentLength}chars, ` +
             `Tarot=${loadingStatus.hasTarotContent}, Guidelines=${loadingStatus.hasGuidelineContent}, ` +
             `Loading=${loadingStatus.hasLoadingSpinner}, Words=${loadingStatus.uniqueWords}`, 'monitor');
      
      // Consider loading complete if we have substantial tarot content and no loading indicators
      if ((loadingStatus.hasTarotContent && loadingStatus.hasGuidelineContent) || 
          loadingStatus.hasSpecificContent) {
        
        if (!loadingStatus.hasLoadingSpinner && 
            !loadingStatus.hasSkeletonLoader && 
            loadingStatus.contentLength > 2000 &&
            loadingStatus.uniqueWords > 100) {
          
          loadingComplete = true;
          const finalLoadTime = Date.now() - tabClickStartTime;
          addPerformanceMarker('CONTENT_LOADED', Date.now());
          
          addLog('🎉 LOADING COMPLETED!', 'success');
          addLog(`⏱️  FINAL LOADING TIME: ${finalLoadTime}ms (${(finalLoadTime/1000).toFixed(2)}s)`, 'timing');
          
          break;
        }
      }
      
      // Take periodic screenshots
      if (monitoringStep % 6 === 0) { // Every 3 seconds
        await page.screenshot({ 
          path: `screenshots/tarot-perf-05-loading-${String(monitoringStep).padStart(2, '0')}.png`,
          fullPage: true 
        });
      }
    }
    
    // Final measurements
    const totalLoadingTime = Date.now() - tabClickStartTime;
    addPerformanceMarker('MONITORING_COMPLETE');
    
    if (!loadingComplete) {
      addLog('⚠️  Maximum monitoring time reached - content may still be loading', 'warning');
    }
    
    // Final state capture
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'screenshots/tarot-perf-06-final-state.png',
      fullPage: true 
    });
    
    // Get comprehensive performance data
    const performanceData = await page.evaluate(() => {
      const perf = window.performance;
      const resources = perf.getEntriesByType('resource');
      const navigation = perf.getEntriesByType('navigation')[0];
      
      return {
        navigation: {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
          firstPaint: Math.round(perf.getEntriesByName('first-paint')[0]?.startTime || 0),
          firstContentfulPaint: Math.round(perf.getEntriesByName('first-contentful-paint')[0]?.startTime || 0)
        },
        resources: resources
          .filter(r => r.name.includes('admin') || r.name.includes('tarot') || r.name.includes('guideline'))
          .map(r => ({
            name: r.name.split('/').slice(-2).join('/'),
            duration: Math.round(r.duration),
            size: r.transferSize || 0,
            type: r.initiatorType
          }))
          .sort((a, b) => b.duration - a.duration)
      };
    });
    
    // Compile comprehensive report
    const report = {
      // Test metadata
      testTimestamp: new Date().toISOString(),
      testUrl: 'https://test-studio-firebase.vercel.app/admin',
      testDuration: Date.now() - performanceMarkers[0].timestamp,
      
      // Key performance metrics
      tabClickToContentLoad: totalLoadingTime,
      tabClickToContentLoadSeconds: (totalLoadingTime/1000).toFixed(2),
      loadingCompleted: loadingComplete,
      monitoringSteps: monitoringStep,
      
      // Performance markers
      performanceMarkers: performanceMarkers.map(m => ({
        event: m.event,
        timestamp: m.timestamp,
        relativeTime: m.timestamp - performanceMarkers[0].timestamp
      })),
      
      // Network data
      networkRequests: networkRequests.length,
      networkRequestDetails: networkRequests.map(req => ({
        method: req.method,
        url: req.url.split('/').slice(-2).join('/'),
        timestamp: req.timestamp - tabClickStartTime
      })),
      
      // Browser performance
      performanceData: performanceData,
      
      // Logs and debugging
      relevantLogs: testLogs.filter(log => 
        log.includes('tarot') || 
        log.includes('guideline') || 
        log.includes('cache') ||
        log.includes('TIMING') ||
        log.includes('MARKER')
      )
    };
    
    // Save comprehensive report
    const reportFileName = `tarot-guidelines-performance-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    await fs.writeFile(reportFileName, JSON.stringify(report, null, 2));
    
    // Final summary
    addLog('═'.repeat(60), 'separator');
    addLog('📊 TAROT GUIDELINES LOADING PERFORMANCE SUMMARY', 'summary');
    addLog('═'.repeat(60), 'separator');
    addLog(`⏱️  Tab Click to Content Load: ${totalLoadingTime}ms (${(totalLoadingTime/1000).toFixed(2)} seconds)`, 'result');
    addLog(`✅ Loading Completed: ${loadingComplete}`, 'result');
    addLog(`🔄 Monitoring Steps: ${monitoringStep}`, 'result');
    addLog(`📡 Network Requests: ${networkRequests.length}`, 'result');
    addLog(`📸 Screenshots Captured: ${monitoringStep + 6}`, 'result');
    addLog(`📋 Report Saved: ${reportFileName}`, 'result');
    
    if (performanceData.resources.length > 0) {
      addLog('📦 Top Resource Loading Times:', 'result');
      performanceData.resources.slice(0, 5).forEach(resource => {
        addLog(`   • ${resource.name}: ${resource.duration}ms (${(resource.size/1024).toFixed(1)}KB)`, 'result');
      });
    }
    
    if (performanceData.navigation.firstContentfulPaint > 0) {
      addLog(`🎨 First Contentful Paint: ${performanceData.navigation.firstContentfulPaint}ms`, 'result');
    }
    
    addLog('═'.repeat(60), 'separator');
    addLog('🎯 TEST COMPLETED SUCCESSFULLY', 'success');
    
    // Keep browser open for manual inspection
    addLog('👀 Keeping browser open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    addLog(`❌ TEST ERROR: ${error.message}`, 'error');
    await page.screenshot({ 
      path: 'screenshots/tarot-perf-ERROR.png',
      fullPage: true 
    });
    
    // Save error report
    const errorReport = {
      error: error.message,
      testLogs: testLogs,
      performanceMarkers: performanceMarkers,
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile('tarot-guidelines-error-report.json', JSON.stringify(errorReport, null, 2));
  } finally {
    await browser.close();
    addLog('🏁 Browser closed - test completed');
  }
}

testTarotGuidelinesWithManualAuth();