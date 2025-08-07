const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function verifyAdminFixes() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text, time: new Date().toISOString() });
    console.log(`[${type.toUpperCase()}] ${text}`);
  });
  
  // Collect network errors
  page.on('requestfailed', request => {
    console.error(`Request failed: ${request.url()} - ${request.failure().errorText}`);
    consoleMessages.push({ 
      type: 'network-error', 
      text: `Failed: ${request.url()} - ${request.failure().errorText}`,
      time: new Date().toISOString()
    });
  });

  try {
    console.log('1. Navigating to admin page...');
    await page.goto('http://localhost:4000/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2. Waiting for page to load...');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/admin-initial.png',
      fullPage: true 
    });

    console.log('3. Looking for Usage Statistics tab...');
    // Try different selectors for the Usage Statistics tab
    const usageStatsSelectors = [
      'text=사용통계',
      'button:has-text("사용통계")',
      '[role="tab"]:has-text("사용통계")',
      'div:has-text("사용통계")',
      'span:has-text("사용통계")'
    ];
    
    let usageStatsTab = null;
    for (const selector of usageStatsSelectors) {
      try {
        usageStatsTab = await page.locator(selector).first();
        if (await usageStatsTab.isVisible()) {
          console.log(`Found Usage Stats tab with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!usageStatsTab || !(await usageStatsTab.isVisible())) {
      console.error('Could not find Usage Statistics tab');
      // Take screenshot of current state
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/no-usage-stats-tab.png',
        fullPage: true 
      });
    } else {
      console.log('4. Clicking on Usage Statistics tab...');
      await usageStatsTab.click();
      await page.waitForTimeout(2000);
      
      console.log('5. Waiting for charts to load...');
      // Wait for chart containers or canvas elements
      try {
        await page.waitForSelector('canvas', { timeout: 10000 });
        console.log('Charts detected');
      } catch (e) {
        console.log('No canvas elements found, checking for other chart elements...');
        try {
          await page.waitForSelector('[class*="chart"]', { timeout: 5000 });
        } catch (e2) {
          console.log('No chart elements found');
        }
      }
      
      await page.waitForTimeout(3000);
      
      console.log('6. Taking screenshot of Usage Statistics...');
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/usage-stats-fixed.png',
        fullPage: true 
      });
    }
    
    console.log('7. Looking for Real-time Monitoring tab...');
    // Try different selectors for the Real-time Monitoring tab
    const realtimeSelectors = [
      'text=실시간 모니터링',
      'button:has-text("실시간 모니터링")',
      '[role="tab"]:has-text("실시간 모니터링")',
      'div:has-text("실시간 모니터링")',
      'span:has-text("실시간 모니터링")'
    ];
    
    let realtimeTab = null;
    for (const selector of realtimeSelectors) {
      try {
        realtimeTab = await page.locator(selector).first();
        if (await realtimeTab.isVisible()) {
          console.log(`Found Real-time Monitoring tab with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!realtimeTab || !(await realtimeTab.isVisible())) {
      console.error('Could not find Real-time Monitoring tab');
      // Take screenshot of current state
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/no-realtime-tab.png',
        fullPage: true 
      });
    } else {
      console.log('8. Clicking on Real-time Monitoring tab...');
      await realtimeTab.click();
      await page.waitForTimeout(2000);
      
      console.log('9. Waiting for data to load...');
      // Wait for monitoring elements
      try {
        await page.waitForSelector('[class*="monitoring"]', { timeout: 10000 });
        console.log('Monitoring elements detected');
      } catch (e) {
        console.log('No monitoring elements found, checking for data elements...');
        try {
          await page.waitForSelector('[class*="real-time"]', { timeout: 5000 });
        } catch (e2) {
          console.log('No real-time elements found');
        }
      }
      
      await page.waitForTimeout(3000);
      
      console.log('10. Taking screenshot of Real-time Monitoring...');
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/realtime-monitoring-fixed.png',
        fullPage: true 
      });
    }
    
    // Save console logs
    console.log('\n11. Saving console messages...');
    await fs.writeFile(
      '/mnt/e/project/test-studio-firebase/qa-screenshots/console-logs.json',
      JSON.stringify(consoleMessages, null, 2)
    );
    
    // Print summary
    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log(`Total console messages: ${consoleMessages.length}`);
    
    const errors = consoleMessages.filter(m => m.type === 'error' || m.type === 'network-error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors found:');
      errors.forEach(err => {
        console.log(`- [${err.time}] ${err.text}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\nWarnings found:');
      warnings.forEach(warn => {
        console.log(`- [${warn.time}] ${warn.text}`);
      });
    }
    
    console.log('\nScreenshots saved to:');
    console.log('- /mnt/e/project/test-studio-firebase/qa-screenshots/admin-initial.png');
    console.log('- /mnt/e/project/test-studio-firebase/qa-screenshots/usage-stats-fixed.png');
    console.log('- /mnt/e/project/test-studio-firebase/qa-screenshots/realtime-monitoring-fixed.png');
    console.log('- /mnt/e/project/test-studio-firebase/qa-screenshots/console-logs.json');
    
  } catch (error) {
    console.error('Error during verification:', error);
    // Take error screenshot
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/error-state.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the verification
verifyAdminFixes().catch(console.error);