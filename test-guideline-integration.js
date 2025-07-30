import { test, expect } from '@playwright/test';

test('Test Tarot Interpretation with Spread and Style Guidelines', async ({ page, browser }) => {
  console.log('Starting guideline integration test...');
  
  // Set longer timeout for this test
  test.setTimeout(180000); // 3 minutes
  
  // Use Vercel deployment URL
  const VERCEL_URL = 'https://innerspell.vercel.app';
  
  // Navigate to the site
  await page.goto(VERCEL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  
  // Navigate to tarot reading page
  await page.goto(`${VERCEL_URL}/tarot-reading`, { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ path: 'guideline-test-1-initial.png', fullPage: true });
  
  // Fill in the question
  await page.fill('textarea[placeholder*="질문"]', '삼위일체 조망 스프레드로 나의 커리어 방향성을 알려주세요');
  
  // Select a spread - Trinity View (삼위일체 조망)
  const spreadSelect = page.locator('select').first();
  await spreadSelect.selectOption({ label: '삼위일체 조망 (Trinity View) (3장)' });
  
  // Select interpretation style - Traditional RWS (전통 RWS)
  const styleSelect = page.locator('select').nth(1);
  await styleSelect.selectOption({ label: '전통 RWS (Traditional RWS)' });
  
  // Take screenshot after selections
  await page.screenshot({ path: 'guideline-test-2-selected.png', fullPage: true });
  
  // Click draw cards button
  await page.click('button:has-text("카드 뽑기")');
  
  // Wait for loading to disappear
  await page.waitForSelector('text=카드를 뽑는 중...', { state: 'hidden', timeout: 30000 });
  
  // Take screenshot of drawn cards
  await page.screenshot({ path: 'guideline-test-3-cards-drawn.png', fullPage: true });
  
  // Check if "타로 해석 받기" button is visible
  const interpretButton = page.locator('button:has-text("타로 해석 받기")');
  const isInterpretButtonVisible = await interpretButton.isVisible();
  
  if (isInterpretButtonVisible) {
    console.log('Interpret button found, clicking...');
    await interpretButton.click();
    
    // Wait for interpretation to load
    await page.waitForSelector('text=AI가 카드를 해석하는 중입니다...', { timeout: 10000 });
    await page.waitForSelector('text=AI가 카드를 해석하는 중입니다...', { state: 'hidden', timeout: 60000 });
    
    // Take screenshot of interpretation
    await page.screenshot({ path: 'guideline-test-4-interpretation.png', fullPage: true });
    
    // Check if interpretation contains spread-specific guidance
    const interpretationText = await page.textContent('.prose');
    console.log('\n=== INTERPRETATION CONTENT ===');
    console.log(interpretationText?.substring(0, 500) + '...');
    
    // Verify guideline integration
    const hasSpreadReference = interpretationText?.includes('삼위일체') || interpretationText?.includes('Trinity');
    const hasPositionReference = interpretationText?.includes('과거') || interpretationText?.includes('현재') || interpretationText?.includes('미래');
    
    console.log('\n=== GUIDELINE VERIFICATION ===');
    console.log('Has spread reference:', hasSpreadReference);
    console.log('Has position reference:', hasPositionReference);
    
    if (hasSpreadReference && hasPositionReference) {
      console.log('✅ Guidelines are being properly integrated!');
    } else {
      console.log('⚠️ Guidelines may not be fully integrated');
    }
  } else {
    console.log('Interpretation button not found - checking for existing interpretation');
    
    // Check if interpretation is already displayed
    const interpretationExists = await page.locator('.prose').isVisible();
    if (interpretationExists) {
      await page.screenshot({ path: 'guideline-test-4-existing-interpretation.png', fullPage: true });
      const interpretationText = await page.textContent('.prose');
      console.log('Existing interpretation found:', interpretationText?.substring(0, 200) + '...');
    }
  }
  
  console.log('\nTest completed! Check screenshots for visual verification.');
  
  await browser.close();
});