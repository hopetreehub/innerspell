const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  try {
    console.log('Testing AI Tarot Interpretation on Vercel...\n');
    
    // Go directly to reading page
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForTimeout(3000);
    
    // Enter question
    await page.locator('textarea[placeholder*="카드에게 무엇을 묻고 싶나요"]').fill('나의 미래는 어떻게 될까요?');
    
    // Click shuffle
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(2000);
    
    // Click spread
    await page.locator('button:has-text("카드 펼치기")').click();
    await page.waitForTimeout(3000);
    
    // Try to click on the card spread area multiple times
    console.log('Attempting to select cards...');
    const spreadArea = await page.locator('div:has-text("펼쳐진 카드")').locator('..');
    
    // Click in three different positions within the spread area
    const box = await spreadArea.boundingBox();
    if (box) {
      // Click left card
      await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.5);
      await page.waitForTimeout(1000);
      
      // Click middle card  
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
      await page.waitForTimeout(1000);
      
      // Click right card
      await page.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.5);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'ai-status-1-after-clicks.png', fullPage: true });
    
    // Check if cards were selected
    const pageText = await page.evaluate(() => document.body.innerText);
    const selectionMatch = pageText.match(/(\d)\/3 선택됨/);
    if (selectionMatch) {
      console.log(`Cards selected: ${selectionMatch[1]}/3`);
    }
    
    // Look for any interpretation button that might have appeared
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && (text.includes('해석') || text.includes('AI'))) {
        console.log(`Found button: "${text}"`);
        const isDisabled = await button.isDisabled();
        if (!isDisabled && !text.includes('카드')) {
          console.log('Clicking interpretation button...');
          await button.click();
          break;
        }
      }
    }
    
    // Wait for response
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'ai-status-2-final.png', fullPage: true });
    
    // Check final state
    const finalText = await page.evaluate(() => document.body.innerText);
    
    console.log('\n=== FINAL ANALYSIS ===');
    
    if (finalText.includes('AI 해석 생성 중')) {
      console.log('✅ AI interpretation is being generated');
    } else if (finalText.includes('error') || finalText.includes('오류')) {
      console.log('❌ ERROR found in page');
      const errorLines = finalText.split('\n').filter(line => 
        line.toLowerCase().includes('error') || line.includes('오류')
      );
      errorLines.forEach(line => console.log(`  - ${line}`));
    } else if (finalText.includes('과거') && finalText.includes('현재') && finalText.includes('미래')) {
      console.log('✅ Found interpretation with past/present/future structure');
    } else {
      console.log('⚠️  No clear AI interpretation found');
      console.log('Page appears to be in card selection state');
    }
    
    // Check console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: 'ai-status-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();