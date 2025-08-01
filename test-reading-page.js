const { chromium } = require('playwright');

async function testReadingPage() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🎯 Testing CORRECT reading page at /reading...');
    
    // Navigate to correct reading page
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'reading-page-check.png', fullPage: true });
    console.log('📸 Screenshot taken: reading-page-check.png');
    
    // Check for 404
    const has404 = await page.locator('text=404').count();
    console.log(`🔍 404 error count: ${has404}`);
    
    if (has404 > 0) {
      console.log('❌ Still getting 404 error');
      return { success: false, error: '404 error on /reading page' };
    }
    
    // Look for tarot reading elements
    const hasSpreadButton = await page.locator('button:has-text("스프레드")').count();
    const hasQuestionArea = await page.locator('textarea').count();
    const hasStartButton = await page.locator('button:has-text("시작")').count();
    
    console.log(`🎯 Reading interface elements:`, {
      spreadButton: hasSpreadButton,
      questionArea: hasQuestionArea,
      startButton: hasStartButton
    });
    
    if (hasSpreadButton > 0 && hasQuestionArea > 0) {
      console.log('✅ Found proper tarot reading interface!');
      
      // Continue with the card spreading test
      console.log('🎲 Testing card spreading...');
      
      // Select spread
      await page.locator('button:has-text("스프레드")').first().click();
      await page.waitForTimeout(1000);
      await page.locator('text=한 장').first().click();
      console.log('📋 Spread selected');
      
      // Enter question
      await page.locator('textarea').fill('세로 카드 문제 테스트');
      console.log('✍️ Question entered');
      
      // Select interpretation style
      await page.locator('button:has-text("해석 스타일")').first().click();
      await page.waitForTimeout(1000);
      await page.locator('text=전통').first().click();
      console.log('🎨 Style selected');
      
      // Start reading
      await page.locator('button:has-text("시작")').first().click();
      console.log('🚀 Reading started');
      
      // Wait for deck ready
      await page.waitForTimeout(5000);
      
      // Look for shuffle button
      const shuffleCount = await page.locator('button:has-text("섞기")').count();
      console.log(`🎲 Shuffle buttons found: ${shuffleCount}`);
      
      if (shuffleCount > 0) {
        await page.locator('button:has-text("섞기")').first().click();
        console.log('🃏 Cards shuffled');
        
        // Wait for cards to spread
        await page.waitForTimeout(8000);
        
        // Check for card spreading
        const cardSpreadContainer = await page.locator('.flex.space-x-\\[-60px\\]').count();
        const cardCount = await page.locator('.flex.space-x-\\[-60px\\] .relative').count();
        
        console.log(`🃏 Card spread analysis:`, {
          spreadContainers: cardSpreadContainer,
          totalCards: cardCount
        });
        
        // Take detailed screenshot
        await page.screenshot({ path: 'card-spread-analysis.png', fullPage: true });
        console.log('📸 Card spread screenshot taken');
        
        if (cardSpreadContainer > 0) {
          console.log('✅ Found card spreading container!');
          
          // Check for vertical display issues
          const cardElements = await page.locator('.flex.space-x-\\[-60px\\] .relative').all();
          
          if (cardElements.length > 0) {
            // Check the first few cards' positions and styles
            for (let i = 0; i < Math.min(5, cardElements.length); i++) {
              const card = cardElements[i];
              const boundingBox = await card.boundingBox();
              console.log(`Card ${i + 1} position:`, boundingBox);
            }
            
            return {
              success: true,
              foundSpreadContainer: true,
              cardCount: cardElements.length,
              message: `Found ${cardElements.length} cards in spread container`
            };
          } else {
            return {
              success: false,
              error: 'Found spread container but no cards inside'
            };
          }
        } else {
          return {
            success: false,
            error: 'Card spread container not found'
          };
        }
      } else {
        return {
          success: false,
          error: 'Shuffle button not found'
        };
      }
    } else {
      return {
        success: false,
        error: 'Tarot reading interface elements not found'
      };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-error-reading.png', fullPage: true });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testReadingPage().then(result => {
  console.log('\n📊 Final Result:', result);
  process.exit(result.success ? 0 : 1);
});