const { chromium } = require('playwright');

async function testCardSpread() {
  console.log('🎯 Starting comprehensive card spread test...');
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Navigate to the app
    console.log('📍 Navigating to localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    await page.screenshot({ path: 'card-spread-test-01-home.png', fullPage: true });

    // Navigate to reading page
    console.log('📍 Going to reading page...');
    const readingLink = await page.locator('a[href="/reading"]').first();
    await readingLink.click();
    await page.waitForURL('**/reading');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'card-spread-test-02-reading-page.png', fullPage: true });

    // Fill in question
    console.log('✍️ Entering question...');
    const questionTextarea = await page.locator('textarea#question');
    await questionTextarea.fill('Please show me the card spread functionality');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'card-spread-test-03-question-entered.png', fullPage: true });

    // Click shuffle
    console.log('🔀 Clicking shuffle...');
    const cardDeck = await page.locator('div[aria-label*="카드 덱"]').first();
    await cardDeck.click();
    await page.waitForTimeout(3000); // Wait for shuffle animation
    
    await page.screenshot({ path: 'card-spread-test-04-shuffled.png', fullPage: true });

    // Click spread cards
    console.log('🃏 Spreading cards...');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")');
    await spreadButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'card-spread-test-05-cards-spread.png', fullPage: true });

    // Analyze the card spread container
    console.log('🔍 Analyzing card spread...');
    const spreadContainer = await page.locator('div[role="group"][aria-labelledby="spread-instruction"]');
    const containerBounds = await spreadContainer.boundingBox();
    console.log('Spread container bounds:', containerBounds);

    // Check for cards in the spread
    const spreadCards = await page.locator('div[role="button"][aria-label*="펼쳐진"]').all();
    console.log(`Found ${spreadCards.length} cards in spread`);

    // Test hovering over different cards
    if (spreadCards.length > 0) {
      console.log('🖱️ Testing card hover interactions...');
      
      // Hover over first card
      await spreadCards[0].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'card-spread-test-06-hover-first-card.png', fullPage: true });
      
      // Try to hover over a middle card (if exists)
      if (spreadCards.length > 10) {
        await spreadCards[10].hover();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'card-spread-test-07-hover-middle-card.png', fullPage: true });
      }
      
      // Try to hover over last card
      await spreadCards[spreadCards.length - 1].hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'card-spread-test-08-hover-last-card.png', fullPage: true });

      // Try clicking cards
      console.log('👆 Testing card selection...');
      
      // Click first card
      await spreadCards[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'card-spread-test-09-first-card-selected.png', fullPage: true });
      
      // Check if card was selected
      const selectedCards = await page.locator('text=/선택된 카드.*1\\/[0-9]+/').count();
      console.log(`Selected cards indicator shows: ${selectedCards > 0 ? 'YES' : 'NO'}`);
      
      // Try to click a card that's partially hidden
      if (spreadCards.length > 5) {
        console.log('👆 Trying to click a partially hidden card...');
        await spreadCards[5].click({ force: true });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'card-spread-test-10-hidden-card-click-attempt.png', fullPage: true });
      }
    }

    // Analyze card positions
    console.log('\n📊 Card Position Analysis:');
    for (let i = 0; i < Math.min(5, spreadCards.length); i++) {
      const card = spreadCards[i];
      const bounds = await card.boundingBox();
      console.log(`Card ${i + 1}: x=${bounds.x}, width=${bounds.width}, right=${bounds.x + bounds.width}`);
    }

    // Calculate overlap
    if (spreadCards.length >= 2) {
      const card1Bounds = await spreadCards[0].boundingBox();
      const card2Bounds = await spreadCards[1].boundingBox();
      const spacing = card2Bounds.x - card1Bounds.x;
      const overlap = card1Bounds.width - spacing;
      const overlapPercentage = (overlap / card1Bounds.width) * 100;
      
      console.log('\n📐 Card Spacing Analysis:');
      console.log(`Card width: ${card1Bounds.width}px`);
      console.log(`Spacing between cards: ${spacing}px`);
      console.log(`Overlap amount: ${overlap}px`);
      console.log(`Overlap percentage: ${overlapPercentage.toFixed(1)}%`);
      
      if (overlapPercentage > 70) {
        console.log('⚠️ WARNING: Cards are overlapping by more than 70%!');
      }
    }

    // Final state
    await page.screenshot({ path: 'card-spread-test-11-final-state.png', fullPage: true });

    console.log('\n✅ Test completed!');
    console.log('📸 Screenshots saved with prefix: card-spread-test-');

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'card-spread-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testCardSpread().catch(console.error);