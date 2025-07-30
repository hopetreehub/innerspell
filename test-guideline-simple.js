const { chromium } = require('playwright');

(async () => {
  console.log('Starting guideline integration test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Use Vercel deployment URL
    const VERCEL_URL = 'https://innerspell.vercel.app';
    
    // Navigate to tarot reading page
    console.log('Navigating to tarot reading page...');
    await page.goto(`${VERCEL_URL}/tarot-reading`, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Take initial screenshot
    await page.screenshot({ path: 'guideline-test-1-initial.png', fullPage: true });
    
    // Fill in the question
    console.log('Filling in question...');
    await page.fill('textarea[placeholder*="질문"]', '삼위일체 조망 스프레드로 나의 커리어 방향성을 알려주세요');
    
    // Select Trinity View spread
    console.log('Selecting Trinity View spread...');
    const spreadSelect = page.locator('select').first();
    await spreadSelect.selectOption({ label: '삼위일체 조망 (Trinity View) (3장)' });
    
    // Select Traditional RWS style
    console.log('Selecting Traditional RWS style...');
    const styleSelect = page.locator('select').nth(1);
    await styleSelect.selectOption({ label: '전통 RWS (Traditional RWS)' });
    
    // Take screenshot after selections
    await page.screenshot({ path: 'guideline-test-2-selected.png', fullPage: true });
    
    // Click draw cards button
    console.log('Drawing cards...');
    await page.click('button:has-text("카드 뽑기")');
    
    // Wait for cards to be drawn
    await page.waitForTimeout(5000);
    
    // Take screenshot of drawn cards
    await page.screenshot({ path: 'guideline-test-3-cards-drawn.png', fullPage: true });
    
    // Check if interpret button exists
    const interpretButton = page.locator('button:has-text("타로 해석 받기")');
    const isVisible = await interpretButton.isVisible();
    
    if (isVisible) {
      console.log('Clicking interpret button...');
      await interpretButton.click();
      
      // Wait for interpretation
      console.log('Waiting for AI interpretation...');
      await page.waitForTimeout(30000); // Wait 30 seconds for interpretation
      
      // Take final screenshot
      await page.screenshot({ path: 'guideline-test-4-interpretation.png', fullPage: true });
      
      // Get interpretation text
      const interpretationText = await page.textContent('.prose');
      
      console.log('\n=== INTERPRETATION PREVIEW ===');
      console.log(interpretationText?.substring(0, 500) + '...');
      
      // Check for guideline integration
      const hasSpreadRef = interpretationText?.includes('삼위일체') || interpretationText?.includes('Trinity');
      const hasPositionRef = interpretationText?.includes('과거') || interpretationText?.includes('현재') || interpretationText?.includes('미래');
      const hasStyleRef = interpretationText?.includes('RWS') || interpretationText?.includes('전통적');
      
      console.log('\n=== GUIDELINE VERIFICATION ===');
      console.log('✅ Spread reference found:', hasSpreadRef);
      console.log('✅ Position reference found:', hasPositionRef);
      console.log('✅ Style reference found:', hasStyleRef);
      
      if (hasSpreadRef && hasPositionRef) {
        console.log('\n🎉 SUCCESS: Guidelines are properly integrated!');
      } else {
        console.log('\n⚠️ WARNING: Guidelines may not be fully integrated');
      }
    } else {
      console.log('Interpretation button not found - checking for existing interpretation...');
      const proseExists = await page.locator('.prose').isVisible();
      if (proseExists) {
        await page.screenshot({ path: 'guideline-test-4-existing.png', fullPage: true });
        console.log('Found existing interpretation');
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'guideline-test-error.png', fullPage: true });
  } finally {
    console.log('\nTest completed! Check screenshots for details.');
    await browser.close();
  }
})();