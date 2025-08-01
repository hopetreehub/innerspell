const { chromium } = require('playwright');

async function verifyCardImplementation() {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  
  console.log('🎴 Verifying card spacing and image implementation...\n');
  
  try {
    // 1. Go to reading page
    console.log('1️⃣ Loading tarot reading page...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot-reading', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    // 2. Check for card stack
    console.log('\n2️⃣ Looking for card stack...');
    const cardStack = await page.locator('.cursor-pointer, [role="button"]').first();
    if (await cardStack.isVisible()) {
      console.log('✅ Card stack found');
      
      // Get card stack position before clicking
      const stackBounds = await cardStack.boundingBox();
      console.log(`   Stack position: x=${stackBounds.x}, y=${stackBounds.y}`);
      
      // Click to spread cards
      console.log('\n3️⃣ Clicking to spread cards...');
      await cardStack.click();
      await page.waitForTimeout(3000);
      
      // Check spread cards
      const spreadCards = await page.locator('img[alt*="tarot"], img[alt*="카드"]').all();
      console.log(`✅ Found ${spreadCards.length} cards after spreading`);
      
      // Verify spacing between cards
      if (spreadCards.length >= 2) {
        const card1Bounds = await spreadCards[0].boundingBox();
        const card2Bounds = await spreadCards[1].boundingBox();
        const spacing = card2Bounds.x - card1Bounds.x - card1Bounds.width;
        console.log(`   Card spacing: ${spacing}px (expected: -125px overlap)`);
        console.log(`   Card 1 x: ${card1Bounds.x}, width: ${card1Bounds.width}`);
        console.log(`   Card 2 x: ${card2Bounds.x}`);
      }
      
      await page.screenshot({ path: 'verify-card-spread-spacing.png', fullPage: true });
    } else {
      console.log('⚠️ Card stack not found, checking for already spread cards...');
      const existingCards = await page.locator('img[alt*="tarot"], img[alt*="카드"]').all();
      console.log(`   Found ${existingCards.length} cards`);
    }
    
    // 4. Check card back images
    console.log('\n4️⃣ Checking card back images...');
    const cardBacks = await page.locator('img[src*="back"]').all();
    if (cardBacks.length > 0) {
      const backSrc = await cardBacks[0].getAttribute('src');
      console.log(`✅ Card back image found: ${backSrc}`);
      console.log(`   Total card backs: ${cardBacks.length}`);
    }
    
    // 5. Navigate to encyclopedia
    console.log('\n5️⃣ Checking encyclopedia images...');
    await page.goto('https://test-studio-firebase.vercel.app/tarot-encyclopedia', { 
      waitUntil: 'networkidle' 
    });
    await page.waitForTimeout(3000);
    
    const encyclopediaCards = await page.locator('img[alt*="카드"]').all();
    console.log(`✅ Encyclopedia has ${encyclopediaCards.length} cards`);
    
    if (encyclopediaCards.length > 0) {
      const firstCardSrc = await encyclopediaCards[0].getAttribute('src');
      console.log(`   First card source: ${firstCardSrc}`);
      
      // Check if using correct image set
      if (firstCardSrc.includes('tarot-spread')) {
        console.log('⚠️ Encyclopedia using spread images (PNG)');
      } else if (firstCardSrc.includes('/tarot/')) {
        console.log('✅ Encyclopedia using correct original images (JPG)');
      }
    }
    
    await page.screenshot({ path: 'verify-encyclopedia-images.png', fullPage: true });
    
    // 6. Check loading states
    console.log('\n6️⃣ Checking for loading states...');
    const loadingElements = await page.locator('text=로딩, text=Loading').all();
    if (loadingElements.length > 0) {
      console.log(`⚠️ Found ${loadingElements.length} loading elements`);
    } else {
      console.log('✅ No stuck loading states found');
    }
    
    console.log('\n✨ Card implementation verification completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'verify-card-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

verifyCardImplementation();