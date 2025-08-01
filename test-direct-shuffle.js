const { chromium } = require('playwright');

async function testDirectShuffle() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 3000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 Testing DIRECT shuffle with current settings...');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Page loaded, ready to shuffle...');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'before-shuffle.png', fullPage: true });
    
    // Find and click the shuffle button directly
    console.log('🎲 Looking for shuffle button...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")').first();
    
    const shuffleCount = await shuffleButton.count();
    console.log(`🃏 Found ${shuffleCount} shuffle buttons`);
    
    if (shuffleCount > 0) {
      console.log('🎲 Clicking shuffle button...');
      await shuffleButton.click();
      
      // Wait for shuffle animation and card spreading
      console.log('⏳ Waiting for cards to spread...');
      await page.waitForTimeout(10000); // 10 seconds to ensure completion
      
      // Take screenshot after shuffle
      await page.screenshot({ path: 'after-shuffle.png', fullPage: true });
      
      // Comprehensive analysis of card elements
      console.log('🔍 Analyzing card spread...');
      
      // Check for different card container patterns
      const containerChecks = {
        'space-x-[-60px]': await page.locator('.flex.space-x-\\[-60px\\]').count(),
        'space-x-[-125px]': await page.locator('.flex.space-x-\\[-125px\\]').count(),
        'grid-cols': await page.locator('[class*="grid-cols"]').count(),
        'card-relative': await page.locator('.relative img').count(),
        'tarot-images': await page.locator('img[src*="tarot"], img[alt*="카드"]').count(),
        'flex-containers': await page.locator('.flex').count(),
        'motion-divs': await page.locator('div[style*="transform"]').count()
      };
      
      console.log('📊 Container analysis:', containerChecks);
      
      // Get all images and their properties
      const imageDetails = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
          offsetTop: img.offsetTop,
          offsetLeft: img.offsetLeft,
          className: img.className,
          style: img.style.cssText
        }));
      });
      
      console.log('🖼️ Image analysis:', imageDetails);
      
      // Check for specific card spread patterns
      const cardSpreadElements = await page.evaluate(() => {
        // Look for elements with card-related patterns
        const elements = document.querySelectorAll('.flex, [class*="space-x"], [class*="grid"]');
        return Array.from(elements).map(el => ({
          tagName: el.tagName,
          className: el.className,
          childrenCount: el.children.length,
          innerHTML: el.innerHTML.length > 200 ? el.innerHTML.substring(0, 200) + '...' : el.innerHTML
        }));
      });
      
      console.log('🃏 Card spread elements:', cardSpreadElements.slice(0, 5)); // First 5 elements
      
      // Take final detailed screenshot
      await page.screenshot({ path: 'final-card-analysis.png', fullPage: true });
      
      return {
        success: true,
        analysis: {
          containerChecks,
          imageCount: imageDetails.length,
          imageDetails: imageDetails.slice(0, 10), // First 10 images
          cardSpreadElementsCount: cardSpreadElements.length
        },
        message: 'Direct shuffle test completed successfully'
      };
      
    } else {
      console.log('❌ No shuffle button found');
      return { success: false, error: 'Shuffle button not found' };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'shuffle-error.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testDirectShuffle().then(result => {
  console.log('\n📊 Direct Shuffle Test Result:');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});