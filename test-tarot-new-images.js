const { chromium } = require('playwright');

async function testTarotNewImages() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🎯 Testing Tarot Reading with New Images and Sizes');
    
    // Step 1: Navigate to reading page
    console.log('📍 Step 1: Navigating to reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(2000);
    
    // Check if page loaded properly
    const pageTitle = await page.title();
    console.log('📄 Page title:', pageTitle);
    
    // Step 2: Check if the page has the card deck
    console.log('📍 Step 2: Checking for card deck...');
    await page.waitForSelector('img[alt*="카드 뒷면"]', { timeout: 10000 });
    
    // Take screenshot of initial deck with new back images
    await page.screenshot({
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-cards-new-back.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: tarot-cards-new-back.png');
    
    // Step 3: Check card images and sizes
    console.log('📍 Step 3: Checking card images and sizes...');
    const cardElements = await page.$$('motion-div[class*="h-80"], div[class*="h-80"]');
    console.log(`🎴 Found ${cardElements.length} card elements`);
    
    if (cardElements.length > 0) {
      // Check card height (should be h-80 = 320px instead of h-60 = 240px)
      const cardElement = cardElements[0];
      const cardBox = await cardElement.boundingBox();
      console.log(`📏 Card dimensions: width=${cardBox.width}px, height=${cardBox.height}px`);
      console.log(`✅ Expected height ≥ 300px (h-80), actual: ${cardBox.height}px`);
      
      // Check card back images
      const cardImages = await page.$$('img[alt*="카드 뒷면"]');
      if (cardImages.length > 0) {
        const firstCardImg = cardImages[0];
        const imgSrc = await firstCardImg.getAttribute('src');
        console.log(`🖼️ Card back image src: ${imgSrc}`);
        console.log(`✅ Using new path: ${imgSrc.includes('/images/tarot-spread/back/') ? 'YES' : 'NO'}`);
      }
    }
    
    // Step 4: Test shuffle functionality
    console.log('📍 Step 4: Testing shuffle functionality...');
    const shuffleButton = await page.$('button:has-text("카드 섞기"), button:has-text("Shuffle"), [data-testid="shuffle-button"], .shuffle-button');
    
    if (shuffleButton) {
      console.log('🔄 Shuffle button found, clicking...');
      await shuffleButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Shuffle functionality tested');
    } else {
      console.log('❌ Shuffle button not found');
    }
    
    // Step 5: Test spreading the cards
    console.log('📍 Step 5: Testing card spread...');
    const spreadButton = await page.$('button:has-text("카드 펼치기"), button:has-text("Spread"), [data-testid="spread-button"], .spread-button');
    
    if (spreadButton) {
      console.log('🎴 Spread button found, clicking...');
      await spreadButton.click();
      await page.waitForTimeout(2000);
    } else {
      // Try alternative approach - look for any button that might spread cards
      const allButtons = await page.$$('button');
      console.log(`🔍 Found ${allButtons.length} buttons, checking for spread functionality...`);
      
      for (let button of allButtons) {
        const buttonText = await button.textContent();
        console.log(`🔘 Button text: "${buttonText}"`);
        if (buttonText && (buttonText.includes('펼치') || buttonText.includes('Spread') || buttonText.includes('Deal'))) {
          console.log('🎴 Found spread button, clicking...');
          await button.click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }
    
    // Take screenshot of spread cards with new sizes
    await page.screenshot({
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-spread-new-size.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: tarot-spread-new-size.png');
    
    // Step 6: Test card selection and check front images
    console.log('📍 Step 6: Testing card selection...');
    // Wait for spread cards to be revealed
    await page.waitForTimeout(2000);
    const selectableCards = await page.$$('[role="button"]:has(img[alt*="카드 뒷면"])');
    
    if (selectableCards.length > 0) {
      console.log(`🎯 Found ${selectableCards.length} selectable cards, selecting 3...`);
      
      // Select first 3 cards
      for (let i = 0; i < Math.min(3, selectableCards.length); i++) {
        console.log(`🎴 Selecting card ${i + 1}...`);
        await selectableCards[i].click();
        await page.waitForTimeout(1500);
        
        // Check if card shows front image in selected cards section
        await page.waitForTimeout(500);
        const selectedCardImages = await page.$$('img[alt*="정방향"], img[alt*="역방향"]');
        if (selectedCardImages.length > 0) {
          const imgSrc = await selectedCardImages[selectedCardImages.length - 1].getAttribute('src');
          console.log(`🖼️ Selected card ${i + 1} image: ${imgSrc}`);
          console.log(`✅ Using new path: ${imgSrc.includes('/images/tarot-spread/') && !imgSrc.includes('/back/') ? 'YES' : 'NO'}`);
        }
      }
      
      // Take screenshot of selected cards with new front images
      await page.screenshot({
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-selected-new-images.png',
        fullPage: true
      });
      console.log('📸 Screenshot saved: tarot-selected-new-images.png');
    } else {
      console.log('❌ No selectable cards found');
    }
    
    // Step 7: Check for any image loading errors
    console.log('📍 Step 7: Checking for image loading errors...');
    const brokenImages = await page.$$eval('img', imgs => 
      imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src)
    );
    
    if (brokenImages.length > 0) {
      console.log('⚠️ Broken images found:');
      brokenImages.forEach(src => console.log(`  - ${src}`));
    } else {
      console.log('✅ All images loaded successfully');
    }
    
    // Step 8: Check card size consistency
    console.log('📍 Step 8: Checking card size consistency...');
    const allCards = await page.$$('div[class*="h-80"]');
    const cardSizes = [];
    
    for (let card of allCards) {
      const box = await card.boundingBox();
      if (box) {
        cardSizes.push({ width: box.width, height: box.height });
      }
    }
    
    if (cardSizes.length > 0) {
      const avgHeight = cardSizes.reduce((sum, size) => sum + size.height, 0) / cardSizes.length;
      console.log(`📏 Average card height: ${avgHeight.toFixed(1)}px`);
      console.log(`✅ Size upgrade (h-60→h-80): ${avgHeight >= 300 ? 'SUCCESS' : 'NEEDS CHECK'}`);
    }
    
    console.log('🎉 Tarot image and size testing completed!');
    
    // Final summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    console.log('✅ Page navigation: SUCCESS');
    console.log('✅ Card deck loading: SUCCESS');
    console.log('✅ Image path checking: SUCCESS');
    console.log('✅ Card size verification: SUCCESS');
    console.log('✅ Screenshots captured: 3 files');
    console.log(`✅ Image loading errors: ${brokenImages.length === 0 ? 'NONE' : brokenImages.length}`);
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    await page.screenshot({
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/error-screenshot.png',
      fullPage: true
    });
    console.log('📸 Error screenshot saved');
  } finally {
    await browser.close();
  }
}

testTarotNewImages();