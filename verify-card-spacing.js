const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to reading page...');
  await page.goto('http://localhost:4000/reading');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Enter a question
  console.log('Entering question...');
  await page.fill('textarea[placeholder*="카드에게"]', '카드 간격 테스트를 위한 질문입니다');
  
  // Take a screenshot to see the current state
  await page.screenshot({ path: 'reading-page-initial.png' });
  
  // First select the spread type dropdown
  console.log('Opening spread type dropdown...');
  
  // Try different approaches to open the dropdown
  try {
    await page.click('#spread-type');
  } catch (e1) {
    console.log('Failed with #spread-type, trying button selector...');
    try {
      await page.click('button[id="spread-type"]');
    } catch (e2) {
      console.log('Failed with button#spread-type, trying aria-label...');
      try {
        await page.click('[aria-label="타로 스프레드 종류 선택"]');
      } catch (e3) {
        console.log('Failed with aria-label, trying combobox role...');
        await page.click('[role="combobox"]');
      }
    }
  }
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'dropdown-opened.png' });
  
  // Wait for dropdown options to appear and select Trinity View
  console.log('Selecting Trinity View spread...');
  await page.waitForSelector('text=삼위일체 조망 (Trinity View)', { timeout: 5000 });
  await page.click('text=삼위일체 조망 (Trinity View)');
  
  // Wait a moment for the selection to register
  await page.waitForTimeout(500);
  
  // Select an interpretation style
  console.log('Opening interpretation style dropdown...');
  await page.click('#interpretation-method');
  await page.waitForTimeout(500);
  
  // Click the first available interpretation option
  const interpretationOptions = await page.$$('[role="option"]');
  if (interpretationOptions.length > 0) {
    await interpretationOptions[0].click();
  }
  
  await page.waitForTimeout(500);
  
  // Look for the start/shuffle button
  console.log('Looking for start button...');
  
  // Try different possible button texts
  const buttonSelectors = [
    'text=리딩 시작',
    'text=카드 뽑기',
    'text=시작하기', 
    'button:has-text("시작")',
    'button:has-text("뽑기")',
    '.start-reading',
    '.shuffle-cards'
  ];
  
  let buttonClicked = false;
  for (const selector of buttonSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 2000 });
      console.log(`Found button with selector: ${selector}`);
      await page.click(selector);
      buttonClicked = true;
      break;
    } catch (e) {
      // Continue to next selector
    }
  }
  
  if (!buttonClicked) {
    console.log('Could not find start button, trying to look for any button in the reading area...');
    const allButtons = await page.$$('button');
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`Button ${i}: "${buttonText}"`);
    }
    
    // Try clicking the first visible button in the reading area
    const readingButtons = await page.$$('.space-y-6 button, .min-h-\\[400px\\] button');
    if (readingButtons.length > 0) {
      console.log('Clicking first button in reading area...');
      await readingButtons[0].click();
      buttonClicked = true;
    }
  }
  
  if (buttonClicked) {
    // Wait for cards to appear or next state
    await page.waitForTimeout(3000);
    
    // Look for cards or next button
    const hasCards = await page.$('.tarot-card');
    if (!hasCards) {
      // Maybe need to click another button to reveal cards
      console.log('No cards found, looking for reveal/spread button...');
      const revealButtons = [
        'text=카드 펼치기',
        'text=펼치기',
        'text=reveal',
        'button:has-text("카드")',
        'button:has-text("펼")'
      ];
      
      for (const selector of revealButtons) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          console.log(`Found reveal button: ${selector}`);
          await page.click(selector);
          break;
        } catch (e) {
          // Continue
        }
      }
    }
  }
  
  // Wait for cards to appear
  await page.waitForSelector('.tarot-card', { timeout: 5000 });
  await page.waitForTimeout(1000); // Wait for animation to complete
  
  // Take full screenshot
  await page.screenshot({ 
    path: 'card-spacing-full-1.png',
    fullPage: false 
  });
  
  // Get card container for close-up
  const spreadContainer = await page.$('.spread-container');
  if (spreadContainer) {
    await spreadContainer.screenshot({ 
      path: 'card-spacing-spread-1.png' 
    });
  }
  
  // Open DevTools and inspect the cards
  console.log('\nInspecting card styles...');
  
  // Get all card elements
  const cards = await page.$$('.tarot-card');
  console.log(`Found ${cards.length} cards`);
  
  // Check computed styles for each card
  for (let i = 0; i < cards.length; i++) {
    const styles = await cards[i].evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        width: computed.width,
        marginLeft: computed.marginLeft,
        transform: computed.transform,
        position: computed.position,
        left: computed.left
      };
    });
    console.log(`\nCard ${i + 1} styles:`, styles);
    
    // Get bounding box for position info
    const box = await cards[i].boundingBox();
    console.log(`Card ${i + 1} position: x=${box.x}, width=${box.width}`);
    
    if (i > 0) {
      const prevBox = await cards[i-1].boundingBox();
      const visibleWidth = box.x - prevBox.x;
      console.log(`Visible width of card ${i}: ${visibleWidth}px`);
    }
  }
  
  // Measure actual spacing between cards
  if (cards.length >= 2) {
    const card1Box = await cards[0].boundingBox();
    const card2Box = await cards[1].boundingBox();
    const actualSpacing = card2Box.x - card1Box.x;
    console.log(`\nActual spacing between card 1 and 2: ${actualSpacing}px`);
    console.log(`Card width: ${card1Box.width}px`);
    console.log(`Overlap amount: ${card1Box.width - actualSpacing}px`);
  }
  
  // Take a zoomed screenshot focusing on the overlap
  await page.evaluate(() => {
    const container = document.querySelector('.spread-container');
    if (container) {
      container.style.zoom = '1.5';
    }
  });
  
  await page.waitForTimeout(500);
  
  if (spreadContainer) {
    await spreadContainer.screenshot({ 
      path: 'card-spacing-zoomed-1.png' 
    });
  }
  
  // Keep browser open for manual inspection
  console.log('\nKeeping browser open for manual inspection...');
  console.log('You can use DevTools to further inspect the elements.');
  
  // Wait for 30 seconds before closing
  await page.waitForTimeout(30000);
  
  await browser.close();
})();