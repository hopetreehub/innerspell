const { chromium } = require('playwright');
const path = require('path');

async function testTarotGuidelinesAccess() {
  console.log('🔍 Starting Tarot Guidelines Access Test...');
  
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
    
    // Wait for the page to fully load
    await page.waitForTimeout(2000);
    
    // Take screenshot of access restriction page
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-1-access-restricted.png'),
      fullPage: true 
    });
    console.log('✅ Screenshot saved: Access restricted page');
    
    // 2. Check for "관리자 전용 페이지" title
    console.log('2️⃣ Checking for "관리자 전용 페이지" title...');
    const titleText = await page.textContent('h1');
    console.log(`   Found title: "${titleText}"`);
    
    // 3. Check for Lock icon
    console.log('3️⃣ Checking for Lock icon...');
    const lockIcon = await page.locator('[data-lucide="lock"], svg[class*="lucide-lock"]').first();
    const lockIconVisible = await lockIcon.isVisible();
    console.log(`   Lock icon visible: ${lockIconVisible}`);
    
    // 4. Check for "관리자 대시보드로 이동" button
    console.log('4️⃣ Checking for "관리자 대시보드로 이동" button...');
    const adminButton = await page.locator('text="관리자 대시보드로 이동"').first();
    const buttonVisible = await adminButton.isVisible();
    console.log(`   Admin dashboard button visible: ${buttonVisible}`);
    
    // Take close-up screenshot of the main content
    const mainContent = await page.locator('main').first();
    await mainContent.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-2-main-content.png')
    });
    console.log('✅ Screenshot saved: Main content close-up');
    
    // 5. Click the admin dashboard button
    console.log('5️⃣ Clicking "관리자 대시보드로 이동" button...');
    await adminButton.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 6. Check if we're redirected to /admin?tab=tarot-guidelines
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    const isCorrectUrl = currentUrl.includes('/admin') && currentUrl.includes('tab=tarot-guidelines');
    console.log(`   Redirected to admin with correct tab: ${isCorrectUrl}`);
    
    // Take screenshot of admin page
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-3-admin-redirect.png'),
      fullPage: true 
    });
    console.log('✅ Screenshot saved: Admin dashboard redirect');
    
    // 7. Check if "타로 지침" tab is active
    console.log('6️⃣ Checking if "타로 지침" tab is active...');
    const tarotTab = await page.locator('button:has-text("타로 지침")').first();
    if (await tarotTab.isVisible()) {
      const tabClasses = await tarotTab.getAttribute('class');
      const isActive = tabClasses && (tabClasses.includes('active') || tabClasses.includes('selected') || tabClasses.includes('border-b-2'));
      console.log(`   Tarot guidelines tab visible: true`);
      console.log(`   Tab classes: ${tabClasses}`);
      console.log(`   Tab appears active: ${isActive}`);
      
      // Take close-up of tabs
      const tabsContainer = await page.locator('[role="tablist"], .tabs-container, div:has(> button:has-text("타로 지침"))').first();
      if (await tabsContainer.isVisible()) {
        await tabsContainer.screenshot({ 
          path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-4-tabs.png')
        });
        console.log('✅ Screenshot saved: Tabs close-up');
      }
    }
    
    // 7. Check if tarot guidelines management is displayed
    console.log('7️⃣ Checking for tarot guidelines management content...');
    await page.waitForTimeout(1000);
    
    // Look for tarot guidelines content
    const guidelinesContent = await page.locator('text=/타로.*지침|지침.*관리|가이드라인/i').first();
    const contentVisible = await guidelinesContent.isVisible().catch(() => false);
    console.log(`   Tarot guidelines content visible: ${contentVisible}`);
    
    // Final screenshot of the full admin page state
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-5-final-state.png'),
      fullPage: true 
    });
    console.log('✅ Screenshot saved: Final admin page state');
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'tarot-guidelines-error.png'),
      fullPage: true 
    });
    
  } finally {
    await browser.close();
  }
}

// Run the test
testTarotGuidelinesAccess().catch(console.error);