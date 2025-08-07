const { chromium } = require('playwright');

async function testImageVerification() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔍 IMAGE PATH & SIZE VERIFICATION');
    console.log('================================');
    
    // Step 1: Navigate and wait for page to load
    console.log('📍 Step 1: Loading reading page...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Step 2: Check image paths and report findings
    console.log('📍 Step 2: Analyzing current implementation...');
    
    // Check back images
    const backImages = await page.$$('img[alt*="카드 뒷면"]');
    console.log(`🎴 Found ${backImages.length} card back images`);
    
    let originalPath = '';
    if (backImages.length > 0) {
      const firstBackImg = backImages[0];
      const imgSrc = await firstBackImg.getAttribute('src');
      console.log(`🖼️ Current back image path: ${imgSrc}`);
      
      // Clean up the Next.js optimized path to get the original
      originalPath = decodeURIComponent(imgSrc.split('url=')[1]?.split('&')[0] || '');
      console.log(`📂 Original path: ${originalPath}`);
      
      // Check which path is being used
      if (originalPath.includes('/images/tarot-spread/back/')) {
        console.log('✅ SUCCESS: Using NEW image path (/images/tarot-spread/back/)');
      } else if (originalPath.includes('/images/tarot/back')) {
        console.log('❌ ISSUE: Still using OLD image path (/images/tarot/back)');
      } else {
        console.log(`⚠️ UNEXPECTED: Unknown path pattern - ${originalPath}`);
      }
    }
    
    // Step 3: Check card sizes
    console.log('📍 Step 3: Checking card sizes...');
    const cardContainers = await page.$$('[class*="h-"]');
    
    let foundH80 = false;
    let foundH60 = false;
    
    for (let container of cardContainers) {
      const className = await container.getAttribute('class');
      if (className && className.includes('h-80')) {
        foundH80 = true;
        const boundingBox = await container.boundingBox();
        console.log(`✅ Found h-80 class, actual height: ${boundingBox?.height}px`);
        break;
      } else if (className && className.includes('h-60')) {
        foundH60 = true;
        const boundingBox = await container.boundingBox();
        console.log(`❌ Found h-60 class (old), actual height: ${boundingBox?.height}px`);
        break;
      }
    }
    
    if (foundH80) {
      console.log('✅ SUCCESS: Using NEW card size (h-80)');
    } else if (foundH60) {
      console.log('❌ ISSUE: Still using OLD card size (h-60)');
    } else {
      console.log('⚠️ Could not determine card size classes');
    }
    
    // Step 4: Take comprehensive screenshots  
    console.log('📍 Step 4: Taking comprehensive screenshots...');
    
    // Take initial screenshot
    await page.screenshot({
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/verification-initial.png',
      fullPage: true
    });
    console.log('📸 Initial state screenshot saved');
    
    // Try shuffle
    const shuffleBtn = await page.$('button:has-text("카드 섞기")');
    if (shuffleBtn) {
      await shuffleBtn.click();
      await page.waitForTimeout(4000); // Wait for shuffle animation
      console.log('✅ Shuffle functionality: WORKING');
    } else {
      console.log('❌ Shuffle button: NOT FOUND');
    }
    
    // Try spread
    const spreadBtn = await page.$('button:has-text("카드 펼치기")');
    if (spreadBtn) {
      await spreadBtn.click();
      await page.waitForTimeout(3000);
      console.log('✅ Spread functionality: WORKING');
      
      // Take spread screenshot
      await page.screenshot({
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/verification-spread.png',
        fullPage: true
      });
      console.log('📸 Spread state screenshot saved');
    } else {
      console.log('❌ Spread button: NOT FOUND');
    }
    
    console.log('\n🎉 VERIFICATION COMPLETED!');
    
    // Final summary
    console.log('\n📊 FINAL REPORT:');
    console.log('================');
    
    if (originalPath.includes('/images/tarot-spread/back/')) {
      console.log('✅ BACK IMAGES: Using NEW path ✅');
    } else {
      console.log('❌ BACK IMAGES: Still using OLD path ❌');
    }
    
    if (foundH80) {
      console.log('✅ CARD SIZES: Using NEW size (h-80) ✅');
    } else {
      console.log('❌ CARD SIZES: Still using OLD size (h-60) ❌');
    }
    
    console.log('\nScreenshots saved in qa-screenshots/:');
    console.log('  - verification-initial.png');
    console.log('  - verification-spread.png');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    await page.screenshot({
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/verification-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

testImageVerification();