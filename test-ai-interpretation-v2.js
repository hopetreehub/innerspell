const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to main page...');
    await page.goto('https://test-studio-firebase.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step1-main-page.png' });

    console.log('2. Going to tarot reading page...');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step2-reading-page.png' });

    console.log('3. Looking for question input...');
    // Try multiple selectors
    const selectors = [
      'input[type="text"]',
      'textarea',
      'input[placeholder*="질문"]',
      'textarea[placeholder*="질문"]',
      'input[name*="question"]',
      'textarea[name*="question"]',
      '[class*="question"] input',
      '[class*="question"] textarea'
    ];
    
    let questionInput = null;
    for (const selector of selectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        questionInput = element;
        console.log(`Found input with selector: ${selector}`);
        break;
      }
    }
    
    if (questionInput) {
      await questionInput.fill('나의 미래는 어떻게 될까요?');
      console.log('Question entered successfully');
    } else {
      console.log('Could not find question input field');
    }
    await page.screenshot({ path: 'step3-question-entered.png' });

    console.log('4. Looking for spread selection...');
    // Try to find Trinity/3-card spread option
    const spreadSelectors = [
      'button:has-text("Trinity")',
      'button:has-text("트리니티")',
      'button:has-text("3장")',
      'button:has-text("3 cards")',
      '[class*="spread"] button',
      'label:has-text("Trinity")',
      'label:has-text("3")'
    ];
    
    for (const selector of spreadSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        await element.click();
        console.log(`Clicked spread selector: ${selector}`);
        break;
      }
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'step4-spread-selected.png' });

    console.log('5. Looking for card shuffle/draw button...');
    const shuffleSelectors = [
      'button:has-text("카드 섞기")',
      'button:has-text("Shuffle")',
      'button:has-text("뽑기")',
      'button:has-text("Draw")',
      'button:has-text("시작")',
      'button:has-text("Start")'
    ];
    
    for (const selector of shuffleSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        await element.click();
        console.log(`Clicked shuffle button: ${selector}`);
        await page.waitForTimeout(2000);
        break;
      }
    }
    await page.screenshot({ path: 'step5-cards-shown.png' });

    console.log('6. Selecting cards...');
    // Try to find and click cards
    const cardSelectors = [
      '.card:not(.selected)',
      '[class*="card"]:not([class*="selected"])',
      'img[alt*="card"]',
      'img[alt*="카드"]',
      'div[role="button"]',
      'button[class*="card"]'
    ];
    
    let cardsClicked = 0;
    for (const selector of cardSelectors) {
      const cards = await page.locator(selector).all();
      for (const card of cards) {
        if (cardsClicked < 3) {
          await card.click();
          cardsClicked++;
          await page.waitForTimeout(500);
        }
      }
      if (cardsClicked >= 3) break;
    }
    console.log(`Selected ${cardsClicked} cards`);
    await page.screenshot({ path: 'step6-cards-selected.png' });

    console.log('7. Looking for interpretation button...');
    const interpretSelectors = [
      'button:has-text("해석")',
      'button:has-text("Interpret")',
      'button:has-text("AI 해석")',
      'button:has-text("읽기")',
      'button:has-text("Read")',
      'button[class*="interpret"]',
      'button[class*="submit"]'
    ];
    
    let interpretClicked = false;
    for (const selector of interpretSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        await element.click();
        console.log(`Clicked interpret button: ${selector}`);
        interpretClicked = true;
        break;
      }
    }
    
    if (!interpretClicked) {
      console.log('Could not find interpretation button');
    }
    
    console.log('8. Waiting for AI response...');
    await page.waitForTimeout(5000);
    
    // Check for loading indicators
    const loadingVisible = await page.locator('[class*="loading"], [class*="spinner"], [class*="progress"]').count() > 0;
    if (loadingVisible) {
      console.log('Loading indicator detected, waiting longer...');
      await page.waitForTimeout(15000);
    }
    
    await page.screenshot({ path: 'step7-final-result.png', fullPage: true });

    // Look for any interpretation content
    const interpretationSelectors = [
      '[class*="interpretation"]',
      '[class*="result"]',
      '[class*="해석"]',
      '[class*="reading"]',
      'div[class*="text"]',
      'p',
      'section'
    ];
    
    let interpretationFound = false;
    for (const selector of interpretationSelectors) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        const text = await element.textContent();
        if (text && text.length > 100) {
          console.log('\n=== Interpretation Content Found ===');
          console.log(`Selector: ${selector}`);
          console.log(`Length: ${text.length} characters`);
          console.log(`Preview: ${text.substring(0, 300)}...`);
          
          // Check content type
          if (text.includes('기본 해석') || text.includes('mock') || text.includes('example') || text.includes('테스트')) {
            console.log('⚠️  WARNING: This appears to be a mock/test interpretation');
          } else if (text.includes('error') || text.includes('오류') || text.includes('실패')) {
            console.log('❌ ERROR: Found error message in interpretation');
          } else if (text.length > 500) {
            console.log('✅ SUCCESS: This appears to be a real AI interpretation!');
          }
          interpretationFound = true;
          break;
        }
      }
      if (interpretationFound) break;
    }
    
    if (!interpretationFound) {
      console.log('❌ No interpretation content found');
    }

    // Check for error messages
    const errorText = await page.locator('text=/error|오류|실패|failed/i').allTextContents();
    if (errorText.length > 0) {
      console.log('\n=== Error Messages Found ===');
      errorText.forEach(err => console.log(err));
    }

    console.log('\n✅ Test completed. Check screenshots for visual confirmation.');

  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();