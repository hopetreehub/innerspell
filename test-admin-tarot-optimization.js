const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAdminTarotOptimization() {
  console.log('🚀 Testing Admin Tarot Optimization on Vercel');
  console.log('===============================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(logEntry);
    console.log('Console:', logEntry);
  });
  
  // Track network timing
  const networkTiming = [];
  page.on('response', response => {
    if (response.url().includes('tarot') || response.url().includes('admin')) {
      networkTiming.push({
        url: response.url(),
        status: response.status(),
        timing: response.timing()
      });
    }
  });
  
  try {
    console.log('\n🏠 Step 1: Navigate to homepage first');
    await page.goto('https://test-studio-firebase.vercel.app/', { 
      waitUntil: 'networkidle' 
    });
    
    await page.screenshot({ 
      path: 'screenshots/admin-test-01-homepage.png',
      fullPage: true 
    });
    console.log('📸 Homepage screenshot saved');
    
    console.log('\n🔐 Step 2: Try Google login');
    
    // Look for Google login button
    const googleButton = page.locator('button:has-text("Google로 로그인")');
    const hasGoogleButton = await googleButton.isVisible();
    
    if (hasGoogleButton) {
      console.log('🔑 Found Google login button, clicking...');
      await googleButton.click();
      await page.waitForTimeout(3000); // Wait for potential redirect or popup
      
      await page.screenshot({ 
        path: 'screenshots/admin-test-02-after-google-click.png',
        fullPage: true 
      });
      console.log('📸 After Google click screenshot saved');
    }
    
    console.log('\n📱 Step 3: Navigate directly to admin with authentication');
    
    // Try navigating directly to admin page
    await page.goto('https://test-studio-firebase.vercel.app/admin', { 
      waitUntil: 'networkidle' 
    });
    
    await page.screenshot({ 
      path: 'screenshots/admin-test-03-admin-direct.png',
      fullPage: true 
    });
    console.log('📸 Direct admin access screenshot saved');
    
    // Check if we're on admin page or redirected
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // If we see an admin key input, use it
    const adminKeyInput = page.locator('input[type="password"]');
    const hasAdminKeyInput = await adminKeyInput.isVisible();
    
    if (hasAdminKeyInput) {
      console.log('🔑 Found admin key input, entering admin123...');
      await adminKeyInput.fill('admin123');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'screenshots/admin-test-04-after-admin-key.png',
        fullPage: true 
      });
    }
    
    console.log('\n🔍 Step 4: Look for admin dashboard or tarot tabs');
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);
    
    // Check for various possible admin indicators
    const possibleSelectors = [
      'button:has-text("타로 지침")',
      '[data-tab="tarot"]',
      '.admin-dashboard',
      'h1:has-text("관리자")',
      'h1:has-text("Admin")',
      '[role="tab"]',
      'button[role="tab"]'
    ];
    
    let foundElements = [];
    for (const selector of possibleSelectors) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible();
      const count = await element.count();
      
      if (isVisible || count > 0) {
        const text = count > 0 ? await element.first().textContent() : '';
        foundElements.push({
          selector,
          isVisible,
          count,
          text: text?.trim() || ''
        });
      }
    }
    
    console.log('\n🔍 Found Elements:');
    foundElements.forEach(el => {
      console.log(`  ${el.selector}: visible=${el.isVisible}, count=${el.count}, text="${el.text}"`);
    });
    
    // If we found any tabs, test them
    const tabElements = await page.locator('[role="tab"], button[role="tab"]').all();
    
    if (tabElements.length > 0) {
      console.log(`\n📊 Found ${tabElements.length} tabs, testing them...`);
      
      for (let i = 0; i < tabElements.length; i++) {
        const tabText = await tabElements[i].textContent();
        console.log(`🔄 Testing tab ${i + 1}: "${tabText?.trim()}"`);
        
        const startTime = Date.now();
        await tabElements[i].click();
        await page.waitForTimeout(1000); // Wait for tab content to load
        const loadTime = Date.now() - startTime;
        
        console.log(`⏱️ Tab "${tabText?.trim()}" load time: ${loadTime}ms`);
        
        await page.screenshot({ 
          path: `screenshots/admin-test-tab-${i + 1}-${tabText?.trim().replace(/[^a-zA-Z0-9]/g, '')}.png`,
          fullPage: true 
        });
        
        // Check if this is the tarot guidelines tab
        if (tabText?.includes('타로') || tabText?.includes('지침')) {
          console.log('🎯 Found tarot guidelines tab!');
          
          // Look for tarot-specific content
          const tarotContent = await page.locator('div:has-text("타로"), div:has-text("카드"), div:has-text("해석")').count();
          console.log(`📊 Tarot-related content elements: ${tarotContent}`);
          
          // Check for any loading indicators
          const loadingIndicators = await page.locator('.loading, .spinner, [data-loading="true"]').count();
          console.log(`⏳ Loading indicators: ${loadingIndicators}`);
          
          // Performance assessment for tarot tab
          if (loadTime < 1000 && loadingIndicators === 0) {
            console.log('🏆 EXCELLENT: Tarot tab loads instantly with optimizations!');
          } else if (loadTime < 2000) {
            console.log('✅ GOOD: Tarot tab shows improvement');
          } else {
            console.log('⚠️ NEEDS WORK: Tarot tab still slow');
          }
        }
      }
    } else {
      console.log('❌ No tabs found - might not be on admin dashboard');
    }
    
    console.log('\n📈 Performance Analysis:');
    console.log('========================');
    
    // Analyze console logs for optimization clues
    const optimizationLogs = consoleLogs.filter(log => 
      log.toLowerCase().includes('optimiz') || 
      log.toLowerCase().includes('tarot') ||
      log.toLowerCase().includes('loading') ||
      log.toLowerCase().includes('guideline')
    );
    
    if (optimizationLogs.length > 0) {
      console.log('🔍 Optimization-related logs:');
      optimizationLogs.forEach(log => console.log(`  ${log}`));
    }
    
    // Network timing analysis
    if (networkTiming.length > 0) {
      console.log('\n🌐 Network Performance:');
      networkTiming.forEach(timing => {
        console.log(`  ${timing.url}: ${timing.status} (${timing.timing?.responseEnd || 'N/A'}ms)`);
      });
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshots/admin-test-final-state.png',
      fullPage: true 
    });
    console.log('📸 Final state screenshot saved');
    
    console.log('\n✅ Admin Tarot Optimization Test Complete!');
    
  } catch (error) {
    console.error('❌ Error during admin test:', error);
    
    await page.screenshot({ 
      path: 'screenshots/admin-test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the test
testAdminTarotOptimization().catch(console.error);