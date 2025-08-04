const { chromium } = require('playwright');

async function checkVercel() {
  console.log('🔍 Checking Vercel deployment...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Try common Vercel URL patterns
    const urls = [
      'https://innerspell.vercel.app',
      'https://test-studio-firebase.vercel.app',
      'https://nextn.vercel.app'
    ];
    
    let workingUrl = null;
    
    for (const url of urls) {
      try {
        console.log(`\n📱 Trying ${url}...`);
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: 15000 
        });
        
        if (response && response.status() === 200) {
          workingUrl = url;
          console.log(`✅ Found working deployment at ${url}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Failed to load ${url}`);
      }
    }
    
    if (!workingUrl) {
      console.log('❌ No working Vercel deployment found');
      return;
    }
    
    // Analyze the working deployment
    console.log('\n📊 Analyzing deployment...');
    await page.goto(workingUrl, { waitUntil: 'networkidle' });
    
    // Get navigation menu items
    const navItems = await page.locator('nav a').allTextContents();
    console.log('\n🧭 Navigation menu items:');
    navItems.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
    
    // Check for specific menu items
    const hasCardDict = navItems.some(item => item.includes('카드사전'));
    const hasTarotCard = navItems.some(item => item.includes('타로카드'));
    console.log(`\n📌 카드사전 메뉴: ${hasCardDict ? '있음' : '없음'}`);
    console.log(`📌 타로카드 메뉴: ${hasTarotCard ? '있음' : '없음'}`);
    
    // Check tarot cards page
    if (hasTarotCard) {
      console.log('\n🃏 Checking 타로카드 page...');
      await page.click('text=타로카드');
      await page.waitForTimeout(2000);
      
      const cardsCount = await page.locator('[class*="card"]').count();
      console.log(`  - Cards found: ${cardsCount}`);
      
      if (cardsCount > 0) {
        // Try clicking first card
        const firstCard = page.locator('[class*="card"]').first();
        await firstCard.click();
        await page.waitForTimeout(2000);
        
        const isDetailPage = page.url().includes('/tarot/cards/');
        console.log(`  - Card detail page works: ${isDetailPage ? '✅' : '❌'}`);
      }
    }
    
    // Check login state
    console.log('\n🔐 Checking authentication...');
    const hasLogin = await page.locator('text=로그인').count() > 0;
    const hasSignup = await page.locator('text=회원가입').count() > 0;
    console.log(`  - Login button: ${hasLogin ? '있음' : '없음'}`);
    console.log(`  - Signup button: ${hasSignup ? '있음' : '없음'}`);
    
    // Take screenshots
    await page.screenshot({ 
      path: 'screenshots/vercel-homepage.png', 
      fullPage: true 
    });
    console.log('\n📸 Screenshots saved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkVercel().catch(console.error);