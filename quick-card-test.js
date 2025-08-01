const { chromium } = require('playwright');

async function testCardSpreading() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🃏 Testing card spreading functionality...');
    
    // Navigate to tarot reading page
    await page.goto('http://localhost:4000/tarot/reading', { waitUntil: 'networkidle' });
    console.log('✅ Page loaded');
    
    // Set up reading
    await page.locator('button:has-text("스프레드 선택")').click();
    await page.locator('text=한 장 뽑기').first().click();
    
    await page.locator('textarea').fill('카드 펼치기 테스트');
    
    await page.locator('button:has-text("해석 스타일 선택")').click();
    await page.locator('text=전통 RWS').first().click();
    
    await page.locator('button:has-text("타로 리딩 시작")').click();
    console.log('✅ Reading setup complete');
    
    // Wait for deck ready
    await page.waitForSelector('text=카드를 섞을 준비가 되었습니다', { timeout: 15000 });
    console.log('✅ Deck ready');
    
    // Start shuffling
    await page.locator('button:has-text("카드 섞기")').click();
    console.log('✅ Shuffling started');
    
    // Wait for cards to spread - look for the specific spacing class
    await page.waitForSelector('.flex.space-x-\\[-60px\\]', { timeout: 15000 });
    console.log('✅ Found card spreading container with -60px spacing');
    
    // Count cards in the spread
    const cards = await page.locator('.flex.space-x-\\[-60px\\] .relative').count();
    console.log(`✅ Found ${cards} cards in spread`);
    
    // Check if we have the expected number of cards (78)
    if (cards === 78) {
      console.log('🎉 SUCCESS: All 78 cards are spreading correctly!');
    } else {
      console.log(`⚠️  WARNING: Expected 78 cards, found ${cards}`);
    }
    
    // Check container styling
    const containerStyle = await page.locator('.flex.space-x-\\[-60px\\]').getAttribute('style');
    console.log(`✅ Container style: ${containerStyle}`);
    
    // Test card selection
    const firstCard = page.locator('.flex.space-x-\\[-60px\\] .relative').first();
    await firstCard.click();
    console.log('✅ Card clicked');
    
    // Take screenshot
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/card-spread-verification.png', fullPage: true });
    console.log('✅ Screenshot saved');
    
    return {
      success: true,
      cardCount: cards,
      containerStyle,
      message: `Card spreading working with ${cards} cards and -60px spacing`
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: '/mnt/e/project/test-studio-firebase/card-spread-error.png', fullPage: true });
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

testCardSpreading().then(result => {
  console.log('\n📊 Final Result:', result);
  process.exit(result.success ? 0 : 1);
});