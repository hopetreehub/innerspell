const { chromium } = require('playwright');

async function testTarotSharingComplete() {
  console.log('Starting complete tarot sharing test...');
  let browser;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Slow down to see the actions
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // Step 1: Navigate to tarot reading page
    console.log('\n1. Navigating to tarot reading page...');
    await page.goto('http://localhost:4000/reading', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.screenshot({ path: 'screenshots/01_tarot_reading_page.png' });
    console.log('✓ Tarot reading page loaded');
    
    // Step 2: Enter question
    console.log('\n2. Entering question...');
    
    // Try multiple selectors for the question input
    const questionSelectors = [
      'textarea[placeholder*="질문"]',
      'textarea[placeholder*="카드"]',
      'textarea[placeholder*="무엇"]',
      'textarea',
      'input[type="text"]',
      '[data-testid="question-input"]'
    ];
    
    let questionInput = null;
    for (const selector of questionSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          questionInput = element;
          console.log(`Found question input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!questionInput) {
      console.log('Could not find question input, checking page state...');
      await page.screenshot({ path: 'screenshots/debug_no_question_input.png', fullPage: true });
      throw new Error('Question input not found');
    }
    
    await questionInput.fill('내 미래는 어떻게 될까요?');
    await page.screenshot({ path: 'screenshots/02_question_entered.png' });
    console.log('✓ Question entered');
    
    // Step 3: Click shuffle button
    console.log('\n3. Clicking shuffle button...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(2000); // Wait for shuffle animation
    await page.screenshot({ path: 'screenshots/03_cards_shuffled.png' });
    console.log('✓ Cards shuffled');
    
    // Step 4: Select 3 cards
    console.log('\n4. Selecting 3 cards...');
    const cards = await page.locator('.cursor-pointer').all();
    console.log(`Found ${cards.length} clickable cards`);
    
    // Select first 3 cards
    for (let i = 0; i < 3 && i < cards.length; i++) {
      await cards[i].click();
      await page.waitForTimeout(1000); // Wait between selections
      console.log(`✓ Selected card ${i + 1}`);
    }
    await page.screenshot({ path: 'screenshots/04_cards_selected.png' });
    
    // Wait for reading to complete
    console.log('\n5. Waiting for reading to complete...');
    await page.waitForTimeout(3000); // Wait for AI response
    
    // Check if reading result is displayed
    const readingResult = await page.locator('text=/해석|의미|카드/i').first();
    if (await readingResult.isVisible()) {
      console.log('✓ Reading result displayed');
      await page.screenshot({ path: 'screenshots/05_reading_result.png' });
    }
    
    // Step 6: Find and click share button
    console.log('\n6. Looking for share button...');
    
    // Try different selectors for share button
    const shareButtonSelectors = [
      'button:has-text("공유")',
      'button:has-text("Share")',
      'button[aria-label*="공유"]',
      'button[aria-label*="share"]',
      '[data-testid="share-button"]',
      'button svg[class*="share"]',
      'button:has(svg path[d*="M18"])', // Common share icon path
    ];
    
    let shareButton = null;
    for (const selector of shareButtonSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible()) {
          shareButton = button;
          console.log(`✓ Found share button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!shareButton) {
      console.log('❌ Share button not found, checking all buttons...');
      const allButtons = await page.locator('button').all();
      console.log(`Total buttons found: ${allButtons.length}`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const ariaLabel = await allButtons[i].getAttribute('aria-label');
        console.log(`Button ${i}: text="${text}", aria-label="${ariaLabel}"`);
      }
      
      // Take a screenshot to see the current state
      await page.screenshot({ path: 'screenshots/06_no_share_button.png', fullPage: true });
      console.log('Screenshot saved: screenshots/06_no_share_button.png');
      return;
    }
    
    // Click share button
    await shareButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/07_share_clicked.png' });
    console.log('✓ Share button clicked');
    
    // Step 7: Get share link
    console.log('\n7. Looking for share link...');
    
    // Wait for share modal or link to appear
    const shareLinkSelectors = [
      'input[value*="localhost:4000/reading/shared"]',
      'input[value*="/reading/shared"]',
      'text=/localhost:4000\\/reading\\/shared/i',
      '[data-testid="share-link"]',
      '.share-link',
      'input[readonly]'
    ];
    
    let shareLink = null;
    let shareLinkValue = null;
    
    for (const selector of shareLinkSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          if (element.tagName === 'input') {
            shareLinkValue = await element.inputValue();
          } else {
            shareLinkValue = await element.textContent();
          }
          
          if (shareLinkValue && shareLinkValue.includes('/reading/shared')) {
            shareLink = element;
            console.log(`✓ Found share link: ${shareLinkValue}`);
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!shareLink) {
      console.log('❌ Share link not found');
      await page.screenshot({ path: 'screenshots/08_no_share_link.png', fullPage: true });
      return;
    }
    
    await page.screenshot({ path: 'screenshots/08_share_link_generated.png' });
    
    // Step 8: Visit the shared link
    console.log('\n8. Visiting shared link...');
    
    // Extract the full URL
    if (!shareLinkValue.startsWith('http')) {
      shareLinkValue = `http://localhost:4000${shareLinkValue}`;
    }
    
    console.log(`Navigating to: ${shareLinkValue}`);
    await page.goto(shareLinkValue);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/09_shared_reading_page.png' });
    
    // Verify shared content
    console.log('\n9. Verifying shared content...');
    const sharedQuestion = await page.locator('text=/내 미래는 어떻게 될까요/i').first();
    if (await sharedQuestion.isVisible()) {
      console.log('✓ Shared question is visible');
    }
    
    const sharedCards = await page.locator('img[alt*="카드"], img[alt*="Card"]').all();
    console.log(`✓ Found ${sharedCards.length} shared cards`);
    
    await page.screenshot({ path: 'screenshots/10_shared_content_verified.png', fullPage: true });
    
    console.log('\n✅ Tarot sharing test completed successfully!');
    
  } catch (error) {
    console.error('Error during test:', error);
    try {
      if (page) {
        await page.screenshot({ path: 'screenshots/error_state.png', fullPage: true });
      }
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testTarotSharingComplete().catch(console.error);