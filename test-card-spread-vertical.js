const { chromium } = require('playwright');

async function testCardSpreadVertical() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 // 더 느리게 실행
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 Testing card spread VERTICAL issue...');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Page loaded, starting card spread test...');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'step-1-initial.png', fullPage: true });
    
    // 1. Click on spread dropdown (currently shows "삼위일체 조망")
    console.log('📋 Clicking spread dropdown...');
    const spreadDropdown = page.locator('div:has-text("삼위일체 조망")').first();
    await spreadDropdown.click();
    await page.waitForTimeout(1000);
    
    // Select single card spread  
    await page.locator('text=한 장 뽑기').first().click();
    console.log('🃏 Selected single card spread');
    await page.waitForTimeout(1000);
    
    // Take screenshot after spread selection
    await page.screenshot({ path: 'step-2-spread-selected.png', fullPage: true });
    
    // 2. Enter question in textarea
    console.log('✍️ Entering question...');
    const textarea = page.locator('textarea').first();
    await textarea.fill('카드 세로 표시 문제 테스트 질문');
    await page.waitForTimeout(1000);
    
    // 3. Click shuffle button (카드 섞기)
    console.log('🎲 Clicking shuffle button...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    console.log('🃏 Cards shuffling...');
    
    // Wait for shuffle animation/process
    await page.waitForTimeout(8000);
    
    // Take screenshot after shuffling
    await page.screenshot({ path: 'step-3-after-shuffle.png', fullPage: true });
    
    // 4. Look for card spread elements
    console.log('🔍 Looking for card spread containers...');
    
    // Check for different possible card spread selectors
    const possibleSelectors = [
      '.flex.space-x-\\[-60px\\]',
      '.flex.space-x-\\[-125px\\]', 
      '.grid-cols-1',
      '[role="group"]',
      '.relative img[src*="tarot"]',
      'img[alt*="카드"]',
      'img[alt*="Tarot"]'
    ];
    
    for (const selector of possibleSelectors) {
      const count = await page.locator(selector).count();
      console.log(`${selector}: ${count} elements found`);
    }
    
    // Check for any images on the page
    const allImages = await page.locator('img').count();
    console.log(`📸 Total images found: ${allImages}`);
    
    // Get all image sources to see what's being loaded
    const imageSrcs = await page.locator('img').evaluateAll(imgs => 
      imgs.map(img => ({ src: img.src, alt: img.alt, width: img.width, height: img.height }))
    );
    console.log('🖼️ Image details:', imageSrcs);
    
    // Look for any flex containers
    const flexContainers = await page.locator('.flex').count();
    console.log(`📦 Flex containers found: ${flexContainers}`);
    
    // Check for elements with card-related classes
    const cardElements = await page.locator('[class*="card"]').count();
    console.log(`🃏 Card-related elements: ${cardElements}`);
    
    // Look for any visible card backs or fronts
    const cardBacks = await page.locator('img[src*="back"]').count();
    const cardFronts = await page.locator('img[src*="tarot"], img[src*="card"]').count();
    console.log(`🎴 Card backs: ${cardBacks}, Card fronts: ${cardFronts}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'step-4-final-analysis.png', fullPage: true });
    
    // Check page HTML for debugging
    const pageContent = await page.content();
    const hasSpaceX60 = pageContent.includes('space-x-[-60px]');
    const hasSpaceX125 = pageContent.includes('space-x-[-125px]');
    
    console.log('🔍 HTML content analysis:', {
      hasSpaceX60,
      hasSpaceX125,
      contentLength: pageContent.length
    });
    
    // Return comprehensive analysis
    return {
      success: true,
      analysis: {
        totalImages: allImages,
        flexContainers: flexContainers,
        cardElements: cardElements,
        cardBacks: cardBacks,
        cardFronts: cardFronts,
        imageSrcs: imageSrcs,
        hasSpaceX60,
        hasSpaceX125
      },
      message: 'Comprehensive card spread analysis completed'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-vertical-test.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testCardSpreadVertical().then(result => {
  console.log('\n📊 Final Analysis:', JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});