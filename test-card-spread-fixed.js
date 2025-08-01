const { chromium } = require('playwright');

async function testCardSpreadingFixed() {
  const browser = await chromium.launch({ 
    headless: false,  // 시각적 확인 위해 headless를 false로
    slowMo: 1000  // 느리게 실행하여 각 단계 확인
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🃏 Testing card spreading after auth fix...');
    
    // Navigate to tarot reading page
    console.log('📍 Navigating to tarot reading page...');
    await page.goto('http://localhost:4000/tarot/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to fully load and auth to resolve
    console.log('⏳ Waiting for page to load and auth to resolve...');
    await page.waitForTimeout(3000);
    
    // Check if we're past the loading screen
    const spinner = await page.locator('div:has-text("로딩")').count();
    console.log(`🔍 Spinner count: ${spinner}`);
    
    // Take screenshot to see current state
    await page.screenshot({ path: 'auth-status-check.png', fullPage: true });
    console.log('📸 Screenshot taken: auth-status-check.png');
    
    // Look for any visible elements on the page
    const visibleElements = await page.locator('*').count();
    console.log(`👀 Total visible elements: ${visibleElements}`);
    
    // Check for specific tarot reading elements
    const hasSpreadSelect = await page.locator('text=스프레드').count();
    const hasReadingButton = await page.locator('text=타로').count();
    
    console.log(`🎯 Elements found:`, {
      spreadSelect: hasSpreadSelect,
      readingElements: hasReadingButton
    });
    
    if (hasSpreadSelect > 0) {
      console.log('✅ Found tarot reading interface!');
      
      // Continue with test
      console.log('🎲 Setting up reading...');
      
      const spreadButton = page.locator('button:has-text("스프레드")').first();
      await spreadButton.click();
      console.log('📋 Spread selection clicked');
      
      await page.waitForTimeout(1000);
      
      const singleCard = page.locator('text=한 장').first();
      await singleCard.click();
      console.log('🃏 Single card selected');
      
      await page.locator('textarea').fill('카드 펼치기 세로 문제 테스트');
      console.log('✍️ Question entered');
      
      const styleButton = page.locator('button:has-text("해석 스타일")').first();
      await styleButton.click();
      console.log('🎨 Style selection clicked');
      
      await page.waitForTimeout(1000);
      
      const traditionalStyle = page.locator('text=전통').first();
      await traditionalStyle.click();
      console.log('📚 Traditional style selected');
      
      const startButton = page.locator('button:has-text("시작")').first();
      await startButton.click();
      console.log('🚀 Reading started');
      
      // Wait for deck ready
      await page.waitForTimeout(5000);
      console.log('⏳ Waiting for deck to be ready...');
      
      // Look for shuffle button
      const shuffleButton = page.locator('button:has-text("섞기")').first();
      if (await shuffleButton.count() > 0) {
        await shuffleButton.click();
        console.log('🎲 Cards shuffled');
        
        // Wait for cards to spread and take screenshot
        await page.waitForTimeout(8000);
        console.log('⏳ Waiting for cards to spread...');
        
        // Check for the card spreading container
        const cardContainer = await page.locator('.flex.space-x-\\[-60px\\]').count();
        console.log(`🃏 Card spreading containers found: ${cardContainer}`);
        
        // Check for individual cards
        const cardCount = await page.locator('.flex.space-x-\\[-60px\\] .relative').count();
        console.log(`🎴 Individual cards found: ${cardCount}`);
        
        // Take final screenshot
        await page.screenshot({ path: 'card-spread-result.png', fullPage: true });
        console.log('📸 Final screenshot taken: card-spread-result.png');
        
        return {
          success: true,
          cardCount,
          hasSpreadContainer: cardContainer > 0,
          message: `Cards are spreading with ${cardCount} cards visible`
        };
      } else {
        console.log('❌ Shuffle button not found');
        return { success: false, error: 'Shuffle button not found' };
      }
      
    } else {
      console.log('❌ Tarot reading interface not found');
      return { success: false, error: 'Tarot reading interface not accessible' };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testCardSpreadingFixed().then(result => {
  console.log('\n📊 Final Test Result:', result);
  process.exit(result.success ? 0 : 1);
});