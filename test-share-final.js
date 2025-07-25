const { chromium } = require('playwright');

async function testShareFinal() {
  console.log('Starting final share functionality test...');
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 800
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      permissions: ['clipboard-read', 'clipboard-write']
    });
    page = await context.newPage();
    
    // Listen to console
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('공유') || text.includes('share') || text.includes('✅') || text.includes('❌')) {
        console.log(`[Browser Log]:`, text);
      }
    });
    
    // Step 1: Navigate
    console.log('\n1. Navigating to reading page...');
    await page.goto('http://localhost:4000/reading', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    console.log('✓ Page loaded');
    
    // Step 2: Enter question
    console.log('\n2. Entering question...');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('내 미래의 길을 위한 조언이 필요합니다');
    console.log('✓ Question entered');
    
    // Step 3: Check spread - use the button/trigger instead of select directly
    console.log('\n3. Checking spread selection...');
    
    // Find the spread selector trigger button
    const spreadTrigger = await page.locator('[role="combobox"]').first();
    const currentSpreadText = await spreadTrigger.textContent();
    console.log(`Current spread: ${currentSpreadText}`);
    
    // Determine number of cards from the text (default to 3)
    let numCards = 3;
    if (currentSpreadText.includes('1장')) numCards = 1;
    else if (currentSpreadText.includes('3장')) numCards = 3;
    else if (currentSpreadText.includes('5장')) numCards = 5;
    
    console.log(`Will select ${numCards} cards`);
    
    // Step 4: Shuffle cards
    console.log('\n4. Shuffling cards...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    
    // Wait for cards
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✓ Cards shuffled');
    
    // Step 5: Select cards
    console.log(`\n5. Selecting ${numCards} cards...`);
    const cards = await page.locator('.cursor-pointer').all();
    console.log(`Found ${cards.length} cards`);
    
    for (let i = 0; i < numCards && i < cards.length; i++) {
      await cards[i].click();
      await page.waitForTimeout(1000);
      console.log(`✓ Card ${i + 1} selected`);
    }
    
    // Step 6: Get AI interpretation
    console.log('\n6. Getting AI interpretation...');
    await page.waitForTimeout(2000);
    
    // Look for the interpretation button
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    if (!await interpretButton.isVisible()) {
      console.log('❌ AI interpretation button not visible');
      await page.screenshot({ path: 'screenshots/final_no_interpret_button.png' });
      return;
    }
    
    await interpretButton.click();
    console.log('✓ Clicked AI interpretation button');
    
    // Wait for dialog
    console.log('\n7. Waiting for interpretation dialog...');
    await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
    
    // Wait for interpretation content
    await page.waitForFunction(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return false;
      const content = dialog.textContent || '';
      // Check if interpretation is loaded (not just loading state)
      return content.includes('해석') && content.length > 200;
    }, { timeout: 30000 });
    
    await page.waitForTimeout(3000); // Extra wait for animations
    console.log('✓ Interpretation dialog loaded');
    
    // Step 8: Find and click share button
    console.log('\n8. Looking for share button in dialog...');
    
    // Try multiple selectors for share button
    const shareSelectors = [
      '[role="dialog"] button:has-text("리딩 공유하기")',
      '[role="dialog"] button:has-text("리딩 공유")',
      '[role="dialog"] button:has(svg[class*="share"])',
      'button:has-text("리딩 공유"):visible'
    ];
    
    let shareButton = null;
    for (const selector of shareSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 1000 })) {
          shareButton = btn;
          console.log(`✓ Found share button with: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!shareButton) {
      console.log('❌ Share button not found');
      await page.screenshot({ path: 'screenshots/final_no_share_button.png', fullPage: true });
      
      // List all visible buttons in dialog
      const dialogButtons = await page.locator('[role="dialog"] button').all();
      console.log(`\nFound ${dialogButtons.length} buttons in dialog:`);
      for (let i = 0; i < dialogButtons.length; i++) {
        const text = await dialogButtons[i].textContent();
        console.log(`  Button ${i}: "${text.trim()}"`);
      }
      return;
    }
    
    // Click share button
    await shareButton.click();
    console.log('✓ Clicked share button');
    
    // Wait for share action
    await page.waitForTimeout(5000);
    
    // Check for toast notifications
    console.log('\n9. Checking for notifications...');
    await page.waitForTimeout(2000);
    
    const toastContainer = page.locator('[role="region"][aria-label*="Notifications"]');
    const toasts = await toastContainer.locator('li').all();
    
    if (toasts.length > 0) {
      console.log(`✓ Found ${toasts.length} notification(s):`);
      for (const toast of toasts) {
        const text = await toast.textContent();
        console.log(`  Notification: "${text.trim()}"`);
      }
    } else {
      console.log('No toast notifications found');
    }
    
    // Try to get clipboard content
    console.log('\n10. Checking clipboard...');
    try {
      const clipboardContent = await page.evaluate(async () => {
        try {
          return await navigator.clipboard.readText();
        } catch (e) {
          return null;
        }
      });
      
      if (clipboardContent) {
        console.log(`✓ Clipboard content: ${clipboardContent}`);
        
        if (clipboardContent.includes('/reading/shared/')) {
          console.log('\n✅ SUCCESS! Share link generated and copied to clipboard!');
          
          // Visit the shared link
          console.log('\n11. Visiting shared link...');
          await page.goto(clipboardContent, { waitUntil: 'networkidle' });
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'screenshots/final_shared_reading.png', fullPage: true });
          console.log('✅ Shared reading page loaded successfully!');
        }
      } else {
        console.log('❌ Could not read clipboard content');
      }
    } catch (e) {
      console.log('❌ Clipboard error:', e.message);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'screenshots/final_test_complete.png', fullPage: true });
    
    console.log('\n✅ Test completed!');
    console.log('\nBrowser will remain open. Press Ctrl+C to close.');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    if (page) {
      await page.screenshot({ path: 'screenshots/final_error.png', fullPage: true });
    }
  }
}

// Run the test
testShareFinal().catch(console.error);