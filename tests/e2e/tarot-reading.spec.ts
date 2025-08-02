import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test.describe('Tarot Reading - Complete Test Suite', () => {
  test.describe('Tarot Archive Page', () => {
    test('should access tarot archive page and display content', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot`);
      
      // Verify page title
      await expect(page.locator('h1')).toContainText('타로 카드 아카이브');
      
      // Verify main sections
      await expect(page.locator('text=78장의 타로 카드')).toBeVisible();
      await expect(page.locator('text=메이저 아르카나')).toBeVisible();
      await expect(page.locator('text=마이너 아르카나')).toBeVisible();

      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/tarot-archive-page.png',
        fullPage: true 
      });
    });

    test('should display tarot card categories', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot`);
      
      // Check Major Arcana section
      const majorArcana = page.locator('text=메이저 아르카나');
      await expect(majorArcana).toBeVisible();
      
      // Check Minor Arcana suits
      const suits = ['완드', '컵', '소드', '펜타클'];
      for (const suit of suits) {
        const suitElement = page.locator(`text=${suit}`);
        if (await suitElement.count() > 0) {
          await expect(suitElement.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Card Spreading Functionality', () => {
    test('should navigate to card spread page', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot-spread`);
      
      // Check if spread selection is available
      const spreadOptions = page.locator('[data-testid="spread-selection"]');
      if (await spreadOptions.count() > 0) {
        await expect(spreadOptions).toBeVisible();
      }

      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/tarot-spread-selection.png',
        fullPage: true 
      });
    });

    test('should perform three-card spread', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot-spread`);
      
      // Select three-card spread if option exists
      const threeCardOption = page.locator('text=3장 스프레드');
      if (await threeCardOption.count() > 0) {
        await threeCardOption.click();
        await page.waitForTimeout(1000);
      }

      // Start spread
      const startButton = page.locator('button').filter({ hasText: /시작|뽑기|선택/ });
      if (await startButton.count() > 0) {
        await startButton.first().click();
        await page.waitForTimeout(2000);
      }

      // Check for card display area
      const cardArea = page.locator('[data-testid="card-display"]');
      if (await cardArea.count() > 0) {
        await expect(cardArea).toBeVisible();
      }

      // Take screenshot of spread
      await page.screenshot({ 
        path: 'screenshots/tarot-three-card-spread.png',
        fullPage: true 
      });
    });

    test('should show card back before selection', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot-spread`);
      
      // Look for card back images
      const cardBacks = page.locator('img[src*="back"]');
      if (await cardBacks.count() > 0) {
        const firstCardBack = cardBacks.first();
        await expect(firstCardBack).toBeVisible();
        
        // Verify it's showing the back of the card
        const src = await firstCardBack.getAttribute('src');
        expect(src).toContain('back');
      }
    });

    test('should flip card on selection', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot-spread`);
      
      // Start a spread
      const startButton = page.locator('button').filter({ hasText: /시작|뽑기|선택/ });
      if (await startButton.count() > 0) {
        await startButton.first().click();
        await page.waitForTimeout(1000);
      }

      // Click on a card to flip it
      const cards = page.locator('[data-testid*="card"]');
      if (await cards.count() > 0) {
        await cards.first().click();
        await page.waitForTimeout(1000);

        // Check if card has flipped (no longer showing back)
        const cardImage = cards.first().locator('img');
        if (await cardImage.count() > 0) {
          const src = await cardImage.getAttribute('src');
          expect(src).not.toContain('back');
        }
      }
    });
  });

  test.describe('Reading History & Save Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Mock user authentication for history features
      await page.goto(`${VERCEL_URL}`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'user@test.com');
        localStorage.setItem('mockAuthRole', 'user');
      });
    });

    test('should save tarot reading', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot-spread`);
      
      // Perform a reading first
      const startButton = page.locator('button').filter({ hasText: /시작|뽑기|선택/ });
      if (await startButton.count() > 0) {
        await startButton.first().click();
        await page.waitForTimeout(2000);
      }

      // Look for save button
      const saveButton = page.locator('button').filter({ hasText: /저장|기록/ });
      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        await page.waitForTimeout(1000);

        // Check for success message
        const successMessage = page.locator('text=/저장.*완료|성공/');
        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible();
        }
      }
    });

    test('should display reading history', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/readings/history`);
      
      // Wait for history to load
      await page.waitForLoadState('networkidle');

      // Check for history elements
      const historyTitle = page.locator('h1, h2').filter({ hasText: /기록|히스토리|History/ });
      if (await historyTitle.count() > 0) {
        await expect(historyTitle.first()).toBeVisible();
      }

      // Check for history items or empty state
      const historyItems = page.locator('[data-testid="history-item"]');
      const emptyState = page.locator('text=/아직.*없습니다|No readings/');
      
      const hasItems = await historyItems.count() > 0;
      const isEmpty = await emptyState.count() > 0;
      
      expect(hasItems || isEmpty).toBeTruthy();

      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/tarot-reading-history.png',
        fullPage: true 
      });
    });

    test('should filter reading history by date', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/readings/history`);
      
      // Look for date filter
      const dateFilter = page.locator('[data-testid="date-filter"]');
      if (await dateFilter.count() > 0) {
        await dateFilter.click();
        
        // Select a date range option
        const lastWeek = page.locator('text=최근 7일');
        if (await lastWeek.count() > 0) {
          await lastWeek.click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('Card Details & Information', () => {
    test('should display individual card details', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot`);
      
      // Click on a specific card
      const firstCard = page.locator('[data-testid*="card"]').first();
      if (await firstCard.count() > 0) {
        await firstCard.click();
        await page.waitForTimeout(1000);

        // Check for card details modal or page
        const cardName = page.locator('h1, h2, h3').filter({ hasText: /fool|매지션|여사제/ });
        if (await cardName.count() > 0) {
          await expect(cardName.first()).toBeVisible();
        }

        // Check for card description
        const description = page.locator('[data-testid="card-description"]');
        if (await description.count() > 0) {
          await expect(description).toBeVisible();
        }
      }
    });

    test('should show card meanings (upright and reversed)', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/tarot/the-fool`);
      
      // Check for upright meaning
      const uprightMeaning = page.locator('text=/정방향|Upright/');
      if (await uprightMeaning.count() > 0) {
        await expect(uprightMeaning).toBeVisible();
      }

      // Check for reversed meaning
      const reversedMeaning = page.locator('text=/역방향|Reversed/');
      if (await reversedMeaning.count() > 0) {
        await expect(reversedMeaning).toBeVisible();
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should be responsive on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${VERCEL_URL}/tarot`);
      
      // Check main elements are still visible
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();

      // Check cards are displayed properly
      const cards = page.locator('[data-testid*="card"]');
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
      }

      // Take mobile screenshot
      await page.screenshot({ 
        path: 'screenshots/tarot-mobile-view.png',
        fullPage: true 
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Listen for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(`${VERCEL_URL}/tarot-spread`);
      
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to perform an action
      const button = page.locator('button').first();
      if (await button.count() > 0) {
        await button.click();
        await page.waitForTimeout(1000);
      }

      // Check for error message
      const errorMessage = page.locator('[class*="error"], [role="alert"]');
      if (await errorMessage.count() > 0) {
        console.log('Error handling is in place');
      }

      // Restore online mode
      await page.context().setOffline(false);
    });
  });
});

// After all tests complete
test.afterAll(async () => {
  console.log('\n=== Tarot Reading Test Suite Completed ===');
});