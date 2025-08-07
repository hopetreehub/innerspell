const { chromium } = require('playwright');

async function testImagePaths() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔍 Testing Tarot Image Paths and Sizes');
    
    // Step 1: Navigate and wait for page to load
    console.log('📍 Step 1: Loading reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    // Step 2: Check image paths in the initial deck
    console.log('📍 Step 2: Checking card back image paths...');
    const backImages = await page.$$('img[alt*="카드 뒷면"]');
    console.log(`🎴 Found ${backImages.length} card back images`);
    
    for (let i = 0; i < Math.min(3, backImages.length); i++) {
      const imgSrc = await backImages[i].getAttribute('src');
      console.log(`🖼️ Back image ${i + 1}: ${imgSrc}`);
      
      // Check if it's using the new path
      if (imgSrc.includes('/images/tarot-spread/back/')) {
        console.log(`✅ Using NEW path: /images/tarot-spread/back/`);
      } else if (imgSrc.includes('/images/tarot/back')) {
        console.log(`❌ Using OLD path: /images/tarot/back`);
      } else {
        console.log(`⚠️ Unexpected path: ${imgSrc}`);
      }
    }
    
    // Step 3: Check card sizes
    console.log('📍 Step 3: Checking card sizes...');
    const cardElements = await page.$$('[class*="h-60"], [class*="h-80"]');
    console.log(`📏 Found ${cardElements.length} cards with height classes`);
    
    for (let i = 0; i < Math.min(3, cardElements.length); i++) {
      const className = await cardElements[i].getAttribute('class');
      const boundingBox = await cardElements[i].boundingBox();
      
      console.log(`📐 Card ${i + 1}:`);
      console.log(`   - Class: ${className.includes('h-80') ? 'h-80 ✅' : className.includes('h-60') ? 'h-60 ❌' : 'Unknown'}`);
      console.log(`   - Actual height: ${boundingBox?.height}px`);
      console.log(`   - Expected: ≥320px for h-80 class`);
    }
    
    // Step 4: Take detailed screenshots
    console.log('📍 Step 4: Taking detailed screenshots...');
    
    // Initial state screenshot
    await page.screenshot({
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/detailed-initial-state.png',
      fullPage: true
    });
    console.log('📸 Screenshot 1: Initial state saved');
    
    // Click shuffle button
    console.log('📍 Step 5: Testing shuffle...');
    const shuffleBtn = await page.$('button:has-text("카드 섞기")');
    if (shuffleBtn) {
      await shuffleBtn.click();
      await page.waitForTimeout(3000);
      console.log('✅ Shuffle completed');
    }
    
    // Click spread button
    console.log('📍 Step 6: Testing spread...');
    const spreadBtn = await page.$('button:has-text("카드 펼치기")');
    if (spreadBtn) {
      await spreadBtn.click();
      await page.waitForTimeout(2000);
      console.log('✅ Spread completed');
      
      // Take spread screenshot
      await page.screenshot({
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/detailed-after-spread.png',
        fullPage: true
      });
      console.log('📸 Screenshot 2: After spread saved');
      
      // Check if any cards are showing front images now
      console.log('📍 Step 7: Checking for front images after spread...');
      const allImages = await page.$$('img');
      console.log(`🖼️ Total images on page: ${allImages.length}`);
      
      const frontImages = [];
      for (let img of allImages) {
        const imgSrc = await img.getAttribute('src');
        const imgAlt = await img.getAttribute('alt');
        
        if (imgSrc && !imgSrc.includes('/back') && imgSrc.includes('/images/')) {
          frontImages.push({ src: imgSrc, alt: imgAlt });
        }
      }
      
      console.log(`🃏 Found ${frontImages.length} potential front card images:`);
      frontImages.slice(0, 5).forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.src}`);
        console.log(`      Alt: ${img.alt}`);
        const isNewPath = img.src.includes('/images/tarot-spread/') && !img.src.includes('/back/');
        console.log(`      New path: ${isNewPath ? '✅' : '❌'}`);
      });
    }
    
    console.log('🎉 Image path and size analysis completed!');
    
    // Summary
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log('====================');
    console.log(`✅ Total card back images found: ${backImages.length}`);
    console.log(`📏 Total cards with size classes found: ${cardElements.length}`);
    console.log(`🃏 Total front images found: ${frontImages.length || 0}`);
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/detailed-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

testImagePaths();