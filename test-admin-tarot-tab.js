const { chromium } = require('playwright');
const path = require('path');

async function testAdminTarotTab() {
  console.log('🔍 Testing Admin Page Tarot Guidelines Tab...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. Go directly to admin page with tarot-guidelines tab
    console.log('1️⃣ Going to /admin?tab=tarot-guidelines...');
    await page.goto('http://localhost:4000/admin?tab=tarot-guidelines', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'admin-tarot-tab-1.png'),
      fullPage: true 
    });
    console.log('✅ Screenshot saved: Admin page');
    
    // Check page content
    const pageTitle = await page.title();
    console.log(`   Page title: ${pageTitle}`);
    
    // Look for tab buttons
    console.log('2️⃣ Looking for tabs...');
    const tabButtons = await page.$$('button');
    console.log(`   Found ${tabButtons.length} buttons`);
    
    // Look specifically for "타로 지침" tab
    const tarotTabExists = await page.locator('button:has-text("타로 지침")').count() > 0;
    console.log(`   "타로 지침" tab exists: ${tarotTabExists}`);
    
    if (tarotTabExists) {
      // Check if it's the active tab
      const tarotTab = await page.locator('button:has-text("타로 지침")').first();
      const tabClasses = await tarotTab.getAttribute('class');
      console.log(`   Tab classes: ${tabClasses}`);
      
      // Take close-up of tabs area
      try {
        const tabsParent = await tarotTab.locator('..').first();
        await tabsParent.screenshot({ 
          path: path.join(__dirname, 'test-screenshots', 'admin-tarot-tab-2-tabs.png')
        });
        console.log('✅ Screenshot saved: Tabs area');
      } catch (e) {
        console.log('   Could not capture tabs area');
      }
    }
    
    // Look for any tarot-related content
    const hasTarotContent = await page.locator('text=/타로.*지침|지침.*관리/').count() > 0;
    console.log(`   Has tarot guidelines content: ${hasTarotContent}`);
    
    // Check if we're on sign-in page
    if (currentUrl.includes('/sign-in')) {
      console.log('⚠️  Redirected to sign-in - not authenticated');
      
      // Look for the redirect parameter
      const urlParams = new URL(currentUrl).searchParams;
      const redirect = urlParams.get('redirect');
      console.log(`   Redirect parameter: ${redirect}`);
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'test-screenshots', 'admin-tarot-tab-error.png'),
      fullPage: true 
    });
    
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

testAdminTarotTab().catch(console.error);