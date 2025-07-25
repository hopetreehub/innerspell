const { chromium } = require('playwright');

async function manualShareTest() {
  console.log('Starting manual share test with step-by-step instructions...');
  let browser;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 0 // No slowdown for manual testing
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // Listen to console messages
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('error') || msg.text().includes('Error')) {
        console.log(`[Browser ${msg.type()}]:`, msg.text());
      }
    });
    
    // Navigate to reading page
    console.log('\n1. Navigating to http://localhost:4000/reading...');
    await page.goto('http://localhost:4000/reading', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    console.log('\n✅ Page loaded successfully!');
    console.log('\n📋 MANUAL TEST INSTRUCTIONS:');
    console.log('================================');
    console.log('1. Enter a question in the text area');
    console.log('2. Click "카드 섞기" (Shuffle Cards) button');
    console.log('3. Select cards by clicking on them (select as many as needed)');
    console.log('4. Click "AI 해석 받기" (Get AI Interpretation) button');
    console.log('5. Wait for the interpretation to complete');
    console.log('6. Look for "리딩 공유하기" (Share Reading) button');
    console.log('7. Click the share button');
    console.log('8. Check if a share link is generated');
    console.log('================================\n');
    
    console.log('The browser will stay open for manual testing.');
    console.log('Watch the console for any error messages.');
    console.log('\nPress Ctrl+C when you are done testing.\n');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
manualShareTest().catch(console.error);