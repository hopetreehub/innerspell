const { chromium } = require('playwright');

async function debugShareFunctionality() {
  console.log('Starting debug test for share functionality...');
  let browser;
  let page;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000,
      devtools: true // Open devtools
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
    
    // Listen to console messages
    page.on('console', msg => {
      console.log(`[Browser Console ${msg.type()}]:`, msg.text());
    });
    
    // Listen to page errors
    page.on('pageerror', err => {
      console.error('[Page Error]:', err.toString());
    });
    
    // Navigate to reading page
    console.log('\n1. Navigating to tarot reading page...');
    await page.goto('http://localhost:4000/reading', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    
    // Enter question
    console.log('\n2. Entering question...');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('What does my future hold?');
    
    // Click shuffle
    console.log('\n3. Clicking shuffle button...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    
    // Wait for cards
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Select one card (simplified for debugging)
    console.log('\n4. Selecting card...');
    const card = await page.locator('.cursor-pointer').first();
    await card.click();
    
    // Click AI interpretation button
    console.log('\n5. Clicking AI interpretation button...');
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")');
    await interpretButton.click();
    
    // Wait for interpretation
    console.log('\n6. Waiting for interpretation...');
    await page.waitForTimeout(10000); // Give plenty of time
    
    // Take screenshot of current state
    await page.screenshot({ path: 'screenshots/debug_01_after_interpretation.png', fullPage: true });
    
    // Try to find share button in different locations
    console.log('\n7. Looking for share button...');
    
    // First check if dialog is open
    const dialog = await page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      console.log('✓ Dialog is visible');
      
      // Look for share button in dialog
      const shareInDialog = await page.locator('[role="dialog"] button:has-text("리딩 공유")');
      if (await shareInDialog.isVisible()) {
        console.log('✓ Found share button in dialog');
        await shareInDialog.click();
        console.log('✓ Clicked share button');
        
        // Wait for response
        await page.waitForTimeout(5000);
        
        // Check clipboard
        try {
          const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
          console.log('Clipboard content:', clipboardText);
        } catch (e) {
          console.log('Could not read clipboard:', e.message);
        }
        
        // Check for toast notifications
        const toasts = await page.locator('[role="region"][aria-label*="Notifications"]').all();
        console.log(`Found ${toasts.length} toast notifications`);
        
        await page.screenshot({ path: 'screenshots/debug_02_after_share_click.png', fullPage: true });
      }
    } else {
      console.log('Dialog not visible, checking main page...');
      
      // Close any dialogs first
      const closeButtons = await page.locator('button:has-text("닫기")').all();
      for (const btn of closeButtons) {
        if (await btn.isVisible()) {
          await btn.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Look for share button on main page
      const shareOnPage = await page.locator('button:has-text("리딩 공유")');
      if (await shareOnPage.isVisible()) {
        console.log('✓ Found share button on page');
        await shareOnPage.click();
        console.log('✓ Clicked share button');
        
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'screenshots/debug_03_share_on_page.png', fullPage: true });
      }
    }
    
    // Check browser console for errors
    console.log('\n8. Checking for JavaScript errors...');
    const logs = await page.evaluate(() => {
      const errors = [];
      // This won't capture past errors, only future ones
      return errors;
    });
    
    console.log('\n✅ Debug test completed!');
    console.log('\nPress Ctrl+C to close the browser...');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('Error during test:', error);
    if (page) {
      await page.screenshot({ path: 'screenshots/debug_error.png', fullPage: true });
    }
  }
}

// Run the test
debugShareFunctionality().catch(console.error);