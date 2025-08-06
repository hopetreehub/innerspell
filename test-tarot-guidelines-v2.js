const { chromium } = require('playwright');
const path = require('path');

async function testTarotGuidelinesAccess() {
  console.log('🔍 Starting Tarot Guidelines Access Test V2...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Navigate to tarot-guidelines page
    console.log('1️⃣ Navigating to /tarot-guidelines...');
    await page.goto('http://localhost:4000/tarot-guidelines', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for the page to settle
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`   Current URL after navigation: ${currentUrl}`);
    
    // Take screenshot of whatever page we're on
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-v2-1-current-page.png'),
      fullPage: true 
    });
    console.log('✅ Screenshot saved: Current page');
    
    // Check if we're on the access restricted page
    if (currentUrl.includes('/tarot-guidelines')) {
      console.log('✅ Still on /tarot-guidelines - checking for access restriction UI');
      
      // 2. Check for "관리자 전용 페이지" title
      console.log('2️⃣ Checking for "관리자 전용 페이지" title...');
      const titleExists = await page.locator('text="관리자 전용 페이지"').isVisible().catch(() => false);
      console.log(`   Title "관리자 전용 페이지" visible: ${titleExists}`);
      
      // 3. Check for Lock icon
      console.log('3️⃣ Checking for Lock icon...');
      const lockIcon = await page.locator('svg.lucide-lock, [data-lucide="lock"]').first();
      const lockIconVisible = await lockIcon.isVisible().catch(() => false);
      console.log(`   Lock icon visible: ${lockIconVisible}`);
      
      // 4. Check for "관리자 대시보드로 이동" button
      console.log('4️⃣ Checking for "관리자 대시보드로 이동" button...');
      const adminButton = await page.locator('button:has-text("관리자 대시보드로 이동")').first();
      const buttonVisible = await adminButton.isVisible().catch(() => false);
      console.log(`   Admin dashboard button visible: ${buttonVisible}`);
      
      // Take close-up screenshot if we found the elements
      if (titleExists || buttonVisible) {
        const mainCard = await page.locator('.bg-white.rounded-xl.shadow-lg').first();
        if (await mainCard.isVisible()) {
          await mainCard.screenshot({ 
            path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-v2-2-access-card.png')
          });
          console.log('✅ Screenshot saved: Access restriction card');
        }
      }
      
      // 5. Try clicking the admin dashboard button if it exists
      if (buttonVisible) {
        console.log('5️⃣ Clicking "관리자 대시보드로 이동" button...');
        await adminButton.click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Check final URL
        const finalUrl = page.url();
        console.log(`   Final URL after button click: ${finalUrl}`);
        
        // Take screenshot of admin page
        await page.screenshot({ 
          path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-v2-3-after-click.png'),
          fullPage: true 
        });
        console.log('✅ Screenshot saved: After button click');
      }
      
    } else if (currentUrl.includes('/sign-in')) {
      console.log('⚠️  Redirected to sign-in page - user not authenticated');
      console.log('   This is expected behavior for unauthenticated users');
      
    } else {
      console.log(`⚠️  Redirected to unexpected page: ${currentUrl}`);
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-v2-error.png'),
      fullPage: true 
    });
    
  } finally {
    // Keep browser open for a moment to see results
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

// Run the test
testTarotGuidelinesAccess().catch(console.error);