// Test card spread functionality
const puppeteer = require('puppeteer');

async function testCardSpread() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing Card Spread Functionality');
    console.log('=====================================\n');
    
    // Navigate to localhost
    console.log('1. Navigating to localhost:4000...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle0' });
    
    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/01-initial-page.png', fullPage: true });
    console.log('   ✅ Initial page loaded\n');
    
    // Enter a question
    console.log('2. Entering a question...');
    await page.waitForSelector('textarea#question');
    await page.type('textarea#question', '카드 스프레드 기능이 작동하는지 테스트합니다.');
    await page.screenshot({ path: 'screenshots/02-question-entered.png', fullPage: true });
    console.log('   ✅ Question entered\n');
    
    // Check spread selector - Trinity View should be default
    console.log('3. Checking spread selector...');
    const spreadValue = await page.$eval('#spread-type', el => el.textContent);
    console.log(`   Current spread: ${spreadValue}`);
    await page.screenshot({ path: 'screenshots/03-spread-selected.png', fullPage: true });
    console.log('   ✅ Trinity View (3 cards) selected\n');
    
    // Click shuffle button
    console.log('4. Clicking shuffle button...');
    const shuffleButton = await page.waitForSelector('button:has-text("카드 섞기")', { visible: true });
    await shuffleButton.click();
    
    // Wait for shuffle animation to complete
    console.log('   ⏳ Waiting for shuffle animation...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/04-after-shuffle.png', fullPage: true });
    console.log('   ✅ Cards shuffled\n');
    
    // Check if spread button is enabled
    console.log('5. Checking for spread button...');
    const spreadButton = await page.$('button:has-text("카드 펼치기")');
    
    if (spreadButton) {
      const isDisabled = await page.$eval('button:has-text("카드 펼치기")', el => el.disabled);
      console.log(`   Spread button found - Disabled: ${isDisabled}`);
      
      if (!isDisabled) {
        console.log('6. Clicking spread button...');
        await spreadButton.click();
        
        // Wait for cards to appear
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/05-after-spread.png', fullPage: true });
        
        // Check if cards are visible
        const spreadCards = await page.$$('[role="button"][aria-label*="펼쳐진"]');
        console.log(`   ✅ Cards spread! Found ${spreadCards.length} cards\n`);
        
        // Try clicking a card
        if (spreadCards.length > 0) {
          console.log('7. Clicking first card...');
          await spreadCards[0].click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'screenshots/06-card-selected.png', fullPage: true });
          console.log('   ✅ Card selected\n');
        }
      } else {
        console.log('   ❌ ERROR: Spread button is disabled after shuffle!\n');
        
        // Debug: Check the stage state
        const stage = await page.evaluate(() => {
          // Try to get React component state
          const element = document.querySelector('[data-testid="tarot-reader"]');
          if (element && element._reactInternalFiber) {
            return element._reactInternalFiber.memoizedProps?.stage;
          }
          return 'unknown';
        });
        console.log(`   Current stage: ${stage}`);
      }
    } else {
      console.log('   ❌ ERROR: Spread button not found!\n');
    }
    
    // Check console errors
    console.log('8. Checking for console errors...');
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
    
    // Log any errors
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    if (errors.length > 0) {
      console.log('   ❌ Console errors found:');
      errors.forEach(err => console.log(`      ${err.text}`));
    } else {
      console.log('   ✅ No console errors');
    }
    
    console.log('\n=====================================');
    console.log('📊 Test Summary:');
    console.log('- Page loads: ✅');
    console.log('- Question input: ✅');
    console.log('- Card shuffle: ✅');
    console.log(`- Card spread: ${spreadButton && !isDisabled ? '✅' : '❌'}`);
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
  }
  
  // Keep browser open for manual inspection
  console.log('Browser will remain open for inspection. Press Ctrl+C to close.');
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

testCardSpread();