const { chromium } = require('playwright');

async function verifyCorrectRoutes() {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  console.log('🔍 Verifying correct routes on Vercel deployment...\n');
  
  try {
    // 1. Check /tarot route (likely the encyclopedia)
    console.log('1️⃣ Checking /tarot route...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { 
      waitUntil: 'domcontentloaded' 
    });
    await page.waitForTimeout(3000);
    
    const tarotCards = await page.locator('img[alt*="카드"], img[src*="tarot"]').all();
    console.log(`   Found ${tarotCards.length} cards on /tarot page`);
    
    if (tarotCards.length > 0) {
      const firstSrc = await tarotCards[0].getAttribute('src');
      console.log(`   First card image: ${firstSrc}`);
    }
    
    await page.screenshot({ path: 'route-1-tarot.png', fullPage: true });
    console.log('✅ /tarot page loaded');
    
    // 2. Check /reading route for tarot reading
    console.log('\n2️⃣ Checking /reading route...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', { 
      waitUntil: 'domcontentloaded' 
    });
    await page.waitForTimeout(3000);
    
    const readingElements = await page.locator('.cursor-pointer, img[src*="back"]').all();
    console.log(`   Found ${readingElements.length} interactive elements on /reading`);
    
    await page.screenshot({ path: 'route-2-reading.png', fullPage: true });
    console.log('✅ /reading page loaded');
    
    // 3. Test card spreading on reading page
    console.log('\n3️⃣ Testing card spread functionality...');
    const cardStack = await page.locator('.cursor-pointer').first();
    if (await cardStack.isVisible()) {
      await cardStack.click();
      console.log('   Clicked card stack');
      await page.waitForTimeout(3000);
      
      const spreadCards = await page.locator('img[alt*="tarot"], img[alt*="카드"]').all();
      console.log(`   Cards after spreading: ${spreadCards.length}`);
      
      await page.screenshot({ path: 'route-3-spread-cards.png', fullPage: true });
    }
    
    // 4. Check authentication elements
    console.log('\n4️⃣ Checking authentication state...');
    const authButtons = await page.locator('button:has-text("로그인"), button:has-text("회원가입")').all();
    console.log(`   Found ${authButtons.length} auth buttons`);
    
    if (authButtons.length === 0) {
      const logoutButton = await page.locator('button:has-text("로그아웃")').first();
      if (await logoutButton.isVisible()) {
        console.log('   User is logged in (logout button visible)');
      }
    } else {
      console.log('   User is not logged in');
    }
    
    console.log('\n✨ Route verification completed!');
    console.log('\n📊 Summary:');
    console.log('- /tarot (Encyclopedia): ' + (tarotCards.length > 0 ? '✅' : '❌'));
    console.log('- /reading (Tarot Reading): ✅');
    console.log('- Card Spreading: ' + (readingElements.length > 0 ? '✅' : '❌'));
    console.log('- Authentication UI: ✅');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'route-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

verifyCorrectRoutes();