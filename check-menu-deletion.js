const { chromium } = require('playwright');

async function checkMenuDeletion() {
  console.log('🔍 Checking menu deletion on localhost:4000...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to localhost
    await page.goto('http://localhost:4000/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    console.log('✅ Page loaded');
    
    // Wait for navigation to be visible
    await page.waitForTimeout(2000);
    
    // Get all navigation items
    const navItems = await page.locator('nav a').allTextContents();
    console.log('\n🧭 Current navigation menu items:');
    navItems.forEach((item, i) => {
      if (item.trim()) {
        console.log(`  ${i + 1}. ${item.trim()}`);
      }
    });
    
    // Check for specific menu items
    const hasCardDict = await page.locator('nav a:has-text("카드사전")').count() > 0;
    const hasTarotCard = await page.locator('nav a:has-text("타로카드")').count() > 0;
    
    console.log('\n📌 Menu status:');
    console.log(`  - 카드사전: ${hasCardDict ? '❌ 아직 있음' : '✅ 삭제됨'}`);
    console.log(`  - 타로카드: ${hasTarotCard ? '✅ 있음' : '❌ 없음'}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/menu-after-deletion.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot saved to screenshots/menu-after-deletion.png');
    
    return !hasCardDict; // Return true if successfully deleted
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

checkMenuDeletion().then(success => {
  if (success) {
    console.log('\n✅ Phase 1-1 완료: 카드사전 메뉴가 성공적으로 삭제되었습니다.');
  } else {
    console.log('\n❌ Phase 1-1 실패: 카드사전 메뉴가 아직 남아있습니다.');
  }
});