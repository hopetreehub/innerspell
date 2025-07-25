const { chromium } = require('playwright');

async function testTarotSharingFull() {
  console.log('Starting full tarot sharing test with proper flow...');
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // Slower to see all actions clearly
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
    
    // Step 1: Navigate to tarot reading page
    console.log('\n1. Navigating to tarot reading page...');
    await page.goto('http://localhost:4000/reading', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.screenshot({ path: 'screenshots/full_01_reading_page.png' });
    console.log('✓ Tarot reading page loaded');
    
    // Step 2: Enter question
    console.log('\n2. Entering question...');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('내 미래는 어떻게 될까요?');
    await page.screenshot({ path: 'screenshots/full_02_question_entered.png' });
    console.log('✓ Question entered');
    
    // Step 3: Click shuffle button
    console.log('\n3. Clicking shuffle button...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    
    // Wait for cards to appear
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for shuffle animation
    await page.screenshot({ path: 'screenshots/full_03_cards_shuffled.png' });
    console.log('✓ Cards shuffled');
    
    // Step 4: Select 3 cards with proper waiting
    console.log('\n4. Selecting 3 cards...');
    
    // Get all card elements
    const cardElements = await page.locator('.cursor-pointer').all();
    console.log(`Found ${cardElements.length} cards`);
    
    // Select exactly 3 cards
    const cardsToSelect = Math.min(3, cardElements.length);
    for (let i = 0; i < cardsToSelect; i++) {
      await cardElements[i].click();
      await page.waitForTimeout(1500); // Wait between selections
      console.log(`✓ Selected card ${i + 1}`);
      await page.screenshot({ path: `screenshots/full_04_card_${i + 1}_selected.png` });
    }
    
    // Step 5: Wait for reading to complete
    console.log('\n5. Waiting for reading to complete...');
    
    // Wait for reading result - look for various indicators
    const readingIndicators = [
      'text=/해석|의미|카드.*의미|과거|현재|미래/i',
      '.reading-result',
      'div:has-text("카드 해석")',
      'div:has-text("리딩 결과")'
    ];
    
    let readingFound = false;
    for (const indicator of readingIndicators) {
      try {
        await page.waitForSelector(indicator, { timeout: 15000 });
        readingFound = true;
        console.log(`✓ Reading result found with indicator: ${indicator}`);
        break;
      } catch (e) {
        console.log(`Indicator not found: ${indicator}`);
      }
    }
    
    if (!readingFound) {
      console.log('Waiting additional time for reading to appear...');
      await page.waitForTimeout(10000);
    }
    
    await page.screenshot({ path: 'screenshots/full_05_reading_complete.png', fullPage: true });
    console.log('✓ Reading completed');
    
    // Step 6: Look for share functionality
    console.log('\n6. Looking for share functionality...');
    
    // Scroll to bottom to ensure all elements are loaded
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Try to find share button
    const shareButtonSelectors = [
      'button:has-text("공유")',
      'button:has-text("Share")',
      'button:has-text("리딩 공유")',
      'button[aria-label*="공유"]',
      'button[aria-label*="share"]',
      'button:has(svg[class*="share"])',
      'button:has(svg path[d*="M18"])',
      '[data-testid="share-button"]',
      '.share-button',
      'a:has-text("공유")'
    ];
    
    let shareButton = null;
    for (const selector of shareButtonSelectors) {
      try {
        const buttons = await page.locator(selector).all();
        for (const button of buttons) {
          if (await button.isVisible()) {
            shareButton = button;
            console.log(`✓ Found share button with selector: ${selector}`);
            break;
          }
        }
        if (shareButton) break;
      } catch (e) {
        // Continue
      }
    }
    
    // If no share button, check all buttons
    if (!shareButton) {
      console.log('Checking all buttons on page...');
      const allButtons = await page.locator('button').all();
      console.log(`Total buttons found: ${allButtons.length}`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        if (isVisible) {
          console.log(`Button ${i}: "${text?.trim()}"`);
        }
      }
    }
    
    if (shareButton) {
      await shareButton.scrollIntoViewIfNeeded();
      await shareButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/full_06_share_clicked.png', fullPage: true });
      console.log('✓ Share button clicked');
      
      // Look for share link
      console.log('\n7. Looking for share link...');
      
      const shareLinkSelectors = [
        'input[value*="/reading/shared"]',
        'input[readonly]',
        'text=/reading\\/shared/i',
        '.share-link',
        '[data-testid="share-link"]'
      ];
      
      let shareLink = null;
      for (const selector of shareLinkSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            shareLink = await element.inputValue() || await element.textContent();
            console.log(`✓ Found share link: ${shareLink}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (shareLink) {
        await page.screenshot({ path: 'screenshots/full_07_share_link_found.png' });
        
        // Visit the shared link
        if (!shareLink.startsWith('http')) {
          shareLink = `http://localhost:4000${shareLink}`;
        }
        
        console.log(`\n8. Visiting shared link: ${shareLink}`);
        await page.goto(shareLink);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'screenshots/full_08_shared_page.png', fullPage: true });
        console.log('✓ Shared page loaded');
      } else {
        console.log('❌ Share link not found');
        await page.screenshot({ path: 'screenshots/full_07_no_share_link.png', fullPage: true });
      }
    } else {
      console.log('❌ Share functionality not found on page');
      await page.screenshot({ path: 'screenshots/full_06_no_share_button.png', fullPage: true });
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('Error during test:', error);
    try {
      if (page) {
        await page.screenshot({ path: 'screenshots/full_error_state.png', fullPage: true });
      }
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError);
    }
  } finally {
    console.log('\nPress Ctrl+C to close the browser...');
    // Keep browser open for manual inspection
    await new Promise(() => {}); // Wait indefinitely
  }
}

// Run the test
testTarotSharingFull().catch(console.error);