import { test, expect } from '@playwright/test';

test.describe('Card Spreading Functionality', () => {
  test('should display and spread 78 tarot cards properly', async ({ page }) => {
    // Navigate to tarot reading page
    await page.goto('/tarot/reading');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on spread selection
    const spreadSelect = page.locator('button:has-text("스프레드 선택")');
    await expect(spreadSelect).toBeVisible();
    await spreadSelect.click();
    
    // Select a spread type
    await page.locator('text=한 장 뽑기 (Single Spark)').click();
    
    // Enter a question
    const questionTextarea = page.locator('textarea[placeholder*="질문을 입력하세요"]');
    await questionTextarea.fill('카드 펼치기 테스트');
    
    // Select interpretation style
    const styleSelect = page.locator('button:has-text("해석 스타일 선택")');
    await styleSelect.click();
    await page.locator('text=전통 RWS').first().click();
    
    // Click start reading button
    const startButton = page.locator('button:has-text("타로 리딩 시작")');
    await startButton.click();
    
    // Wait for deck to be ready
    await page.waitForSelector('text=카드를 섞을 준비가 되었습니다', { timeout: 10000 });
    
    // Click shuffle button
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    
    // Wait for cards to spread
    await page.waitForSelector('.grid-cols-1 .relative img[alt*="카드"]', { timeout: 10000 });
    
    // Count the number of cards
    const cards = page.locator('.grid-cols-1 .relative img[alt*="카드"]');
    const cardCount = await cards.count();
    
    console.log(`Found ${cardCount} cards spread on the page`);
    
    // Check if we have 78 cards
    expect(cardCount).toBe(78);
    
    // Verify card spacing by checking the container
    const cardContainer = page.locator('.grid-cols-1').first();
    const containerClass = await cardContainer.getAttribute('class');
    console.log('Card container classes:', containerClass);
    
    // Check for specific card spreading styles
    const firstCard = cards.first();
    const lastCard = cards.last();
    
    // Verify cards are visible
    await expect(firstCard).toBeVisible();
    await expect(lastCard).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'card-spreading-test.png', fullPage: true });
    
    // Try to select a card
    const middleCard = cards.nth(39); // Select middle card
    await middleCard.click();
    
    // Wait for card selection to register
    await page.waitForTimeout(1000);
    
    // Check if card selection UI appears
    const confirmButton = page.locator('button:has-text("이 카드를 선택하시겠습니까?")');
    const hasConfirmDialog = await confirmButton.isVisible().catch(() => false);
    
    if (hasConfirmDialog) {
      console.log('Card selection dialog appeared successfully');
      await confirmButton.click();
    } else {
      console.log('No confirmation dialog - checking if card was directly selected');
    }
    
    // Return test results
    return {
      cardCount,
      containerClass,
      selectionWorking: hasConfirmDialog
    };
  });
  
  test('should check card overlap spacing', async ({ page }) => {
    // Navigate directly to reading page in spread state
    await page.goto('/tarot/reading');
    
    // Fast track to card spreading
    await page.locator('button:has-text("스프레드 선택")').click();
    await page.locator('text=한 장 뽑기').click();
    await page.locator('textarea').fill('Test');
    await page.locator('button:has-text("해석 스타일 선택")').click();
    await page.locator('text=전통 RWS').first().click();
    await page.locator('button:has-text("타로 리딩 시작")').click();
    await page.waitForSelector('text=카드를 섞을 준비가 되었습니다');
    await page.locator('button:has-text("카드 섞기")').click();
    
    // Wait for cards to appear
    await page.waitForSelector('.flex.space-x-\\[-60px\\]', { timeout: 10000 });
    
    // Check the card container has correct spacing class
    const spacingContainer = page.locator('.flex.space-x-\\[-60px\\]');
    const exists = await spacingContainer.count() > 0;
    
    console.log('Found container with space-x-[-60px]:', exists);
    
    // Get computed styles to verify actual spacing
    const cards = page.locator('.flex.space-x-\\[-60px\\] .relative');
    const cardCount = await cards.count();
    
    console.log(`Cards in spreading container: ${cardCount}`);
    
    // Take detailed screenshot
    await page.screenshot({ path: 'card-spacing-detail.png', fullPage: true });
    
    expect(exists).toBeTruthy();
    expect(cardCount).toBeGreaterThan(0);
  });
});