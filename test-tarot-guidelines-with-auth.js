const { chromium } = require('playwright');
const path = require('path');

async function testTarotGuidelinesWithAuth() {
  console.log('🔍 Starting Tarot Guidelines Access Test with Authentication...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. First login as a regular user (not admin)
    console.log('1️⃣ Navigating to sign-in page...');
    await page.goto('http://localhost:4000/sign-in', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Fill in login form with test user credentials
    console.log('2️⃣ Logging in as regular user...');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click login button
    await page.click('button:has-text("로그인")');
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('   Login attempt completed, current URL:', page.url());
    
    // 2. Now navigate to tarot-guidelines
    console.log('3️⃣ Navigating to /tarot-guidelines as authenticated user...');
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to settle
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-auth-1-page.png'),
      fullPage: true 
    });
    console.log('✅ Screenshot saved: Tarot guidelines page with auth');
    
    // Check for access restriction elements
    console.log('4️⃣ Checking page content...');
    
    // Look for any of the expected elements
    const titleVisible = await page.locator('text="관리자 전용 페이지"').isVisible().catch(() => false);
    const lockIconVisible = await page.locator('svg.lucide-lock, [data-lucide="lock"]').first().isVisible().catch(() => false);
    const adminButtonVisible = await page.locator('button:has-text("관리자 대시보드로 이동")').isVisible().catch(() => false);
    
    console.log(`   "관리자 전용 페이지" title visible: ${titleVisible}`);
    console.log(`   Lock icon visible: ${lockIconVisible}`);
    console.log(`   "관리자 대시보드로 이동" button visible: ${adminButtonVisible}`);
    
    // Check page content by looking at text
    const pageText = await page.textContent('body');
    if (pageText.includes('관리자')) {
      console.log('✅ Found "관리자" text on page');
    }
    if (pageText.includes('타로')) {
      console.log('✅ Found "타로" text on page');
    }
    
    // Take close-up of main content area
    const mainElement = await page.locator('main, .main-content, div.min-h-screen').first();
    if (await mainElement.isVisible()) {
      await mainElement.screenshot({ 
        path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-auth-2-main.png')
      });
      console.log('✅ Screenshot saved: Main content area');
    }
    
    // If admin button is visible, click it
    if (adminButtonVisible) {
      console.log('5️⃣ Clicking "관리자 대시보드로 이동" button...');
      await page.click('button:has-text("관리자 대시보드로 이동")');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const finalUrl = page.url();
      console.log(`   Final URL: ${finalUrl}`);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-auth-3-after-click.png'),
        fullPage: true 
      });
      console.log('✅ Screenshot saved: After button click');
      
      // Check if we're on admin page with tarot-guidelines tab
      if (finalUrl.includes('/admin') && finalUrl.includes('tab=tarot-guidelines')) {
        console.log('✅ Successfully redirected to admin page with tarot-guidelines tab');
        
        // Check if the tab is active
        const tarotTab = await page.locator('button:has-text("타로 지침")').first();
        if (await tarotTab.isVisible()) {
          console.log('✅ Found "타로 지침" tab');
          
          // Take screenshot of tabs
          const tabsArea = await page.locator('[role="tablist"], .tabs, div:has(> button:has-text("타로 지침"))').first();
          if (await tabsArea.isVisible()) {
            await tabsArea.screenshot({ 
              path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-auth-4-tabs.png')
            });
            console.log('✅ Screenshot saved: Tabs area');
          }
        }
      }
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-auth-error.png'),
      fullPage: true 
    });
    
  } finally {
    // Keep browser open for a moment
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

// Run the test
testTarotGuidelinesWithAuth().catch(console.error);