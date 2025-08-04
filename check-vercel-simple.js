const { chromium } = require('playwright');

async function checkVercel() {
  console.log('🔍 Checking Vercel deployment...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const url = 'https://test-studio-firebase.vercel.app';
    console.log(`📱 Loading ${url}...`);
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    console.log('✅ Page loaded');
    
    // Wait a bit for content
    await page.waitForTimeout(3000);
    
    // Get navigation menu items
    const navItems = await page.locator('nav a').allTextContents();
    console.log('\n🧭 Navigation menu items found:');
    navItems.forEach((item, i) => {
      if (item.trim()) {
        console.log(`  ${i + 1}. ${item.trim()}`);
      }
    });
    
    // Check specific issues
    const hasCardDict = await page.locator('text=카드사전').count() > 0;
    const hasTarotCard = await page.locator('text=타로카드').count() > 0;
    console.log(`\n📌 카드사전 메뉴: ${hasCardDict ? '있음 (삭제 필요)' : '없음'}`);
    console.log(`📌 타로카드 메뉴: ${hasTarotCard ? '있음' : '없음 (복구 필요)'}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/vercel-current-state.png', 
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved to screenshots/vercel-current-state.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkVercel().catch(console.error);