const { chromium } = require('playwright');

async function testCompleteShareFlow() {
  console.log('Starting complete share flow test...');
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      permissions: ['clipboard-read', 'clipboard-write'] // Allow clipboard access
    });
    page = await context.newPage();
    
    // Listen to console for debugging
    page.on('console', msg => {
      if (msg.text().includes('✅') || msg.text().includes('❌') || msg.text().includes('공유')) {
        console.log(`[Browser]:`, msg.text());
      }
    });
    
    // Step 1: Navigate to reading page
    console.log('\n1. Navigating to tarot reading page...');
    await page.goto('http://localhost:4000/reading', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.screenshot({ path: 'screenshots/share_01_page_loaded.png' });
    console.log('✓ Page loaded');
    
    // Step 2: Enter question
    console.log('\n2. Entering question...');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('What guidance do I need for my future path?');
    await page.screenshot({ path: 'screenshots/share_02_question_entered.png' });
    console.log('✓ Question entered');
    
    // Step 3: Check current spread selection
    console.log('\n3. Checking spread selection...');
    const spreadSelect = await page.locator('select').first();
    const selectedSpread = await spreadSelect.inputValue();
    console.log(`Current spread: ${selectedSpread}`);
    
    // Get number of cards needed from the select option text
    const selectedOption = await page.locator(`option[value="${selectedSpread}"]`).textContent();
    console.log(`Selected spread info: ${selectedOption}`);
    
    // Extract number of cards (looking for patterns like "3장" or "(3)")
    let numCardsNeeded = 3; // Default to 3
    const match = selectedOption.match(/(\d+)장/);
    if (match) {
      numCardsNeeded = parseInt(match[1]);
    }
    console.log(`Need to select ${numCardsNeeded} cards`);
    
    // Step 4: Click shuffle button
    console.log('\n4. Clicking shuffle button...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    
    // Wait for cards to appear
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/share_03_cards_shuffled.png' });
    console.log('✓ Cards shuffled');
    
    // Step 5: Select the required number of cards
    console.log(`\n5. Selecting ${numCardsNeeded} cards...`);
    const cards = await page.locator('.cursor-pointer').all();
    console.log(`Found ${cards.length} cards available`);
    
    for (let i = 0; i < numCardsNeeded && i < cards.length; i++) {
      await cards[i].click();
      await page.waitForTimeout(1500);
      console.log(`✓ Selected card ${i + 1}`);
    }
    await page.screenshot({ path: 'screenshots/share_04_cards_selected.png' });
    
    // Step 6: Click AI interpretation button
    console.log('\n6. Looking for AI interpretation button...');
    await page.waitForTimeout(2000); // Wait for UI to update
    
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")');
    if (await interpretButton.isVisible()) {
      console.log('✓ Found AI interpretation button');
      await interpretButton.click();
      console.log('✓ Clicked AI interpretation button');
      
      // Wait for interpretation dialog
      console.log('\n7. Waiting for interpretation...');
      await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
      
      // Wait for the interpretation text to appear
      await page.waitForFunction(() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return false;
        const content = dialog.textContent || '';
        return content.length > 100; // Wait for substantial content
      }, { timeout: 30000 });
      
      await page.waitForTimeout(3000); // Additional wait for full load
      await page.screenshot({ path: 'screenshots/share_05_interpretation_ready.png' });
      console.log('✓ Interpretation ready');
      
      // Step 8: Look for share button in dialog
      console.log('\n8. Looking for share button...');
      const shareButton = await page.locator('[role="dialog"] button:has-text("리딩 공유")');
      
      if (await shareButton.isVisible()) {
        console.log('✓ Found share button');
        await shareButton.click();
        console.log('✓ Clicked share button');
        
        // Wait for share action to complete
        await page.waitForTimeout(5000);
        
        // Check for toast notification
        const toastRegion = page.locator('[role="region"][aria-label*="Notifications"]');
        const toasts = await toastRegion.locator('li').all();
        
        if (toasts.length > 0) {
          console.log(`\n✓ Found ${toasts.length} toast notification(s)`);
          for (const toast of toasts) {
            const toastText = await toast.textContent();
            console.log(`Toast message: ${toastText}`);
          }
        }
        
        // Try to read clipboard
        try {
          const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
          if (clipboardText && clipboardText.includes('/reading/shared/')) {
            console.log(`\n✅ Share link copied to clipboard: ${clipboardText}`);
            
            // Visit the shared link
            console.log('\n9. Visiting shared link...');
            await page.goto(clipboardText, { waitUntil: 'networkidle' });
            await page.screenshot({ path: 'screenshots/share_06_shared_page.png', fullPage: true });
            console.log('✅ Successfully accessed shared reading!');
          } else {
            console.log('❌ No share link found in clipboard');
          }
        } catch (e) {
          console.log('Could not read clipboard:', e.message);
        }
        
        await page.screenshot({ path: 'screenshots/share_07_final_state.png', fullPage: true });
      } else {
        console.log('❌ Share button not found in dialog');
        await page.screenshot({ path: 'screenshots/share_error_no_button.png', fullPage: true });
      }
    } else {
      console.log('❌ AI interpretation button not found');
      await page.screenshot({ path: 'screenshots/share_error_no_interpret.png', fullPage: true });
    }
    
    console.log('\n✅ Test completed!');
    console.log('\nBrowser will remain open. Press Ctrl+C to close.');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('Error during test:', error);
    if (page) {
      await page.screenshot({ path: 'screenshots/share_error_exception.png', fullPage: true });
    }
  }
}

// Run the test
testCompleteShareFlow().catch(console.error);