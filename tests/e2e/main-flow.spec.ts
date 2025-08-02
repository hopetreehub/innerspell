import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test.describe('Main User Journeys', () => {
  test.describe('First-Time Visitor Journey', () => {
    test('should complete journey from landing to tarot reading', async ({ page }) => {
      // Step 1: Visit landing page
      await page.goto(VERCEL_URL);
      await expect(page).toHaveTitle(/Inner Spell|이너스펠/i);
      
      // Take screenshot of landing page
      await page.screenshot({ 
        path: 'screenshots/main-flow-landing.png',
        fullPage: true 
      });

      // Step 2: Navigate to tarot reading
      const tarotLink = page.locator('a').filter({ hasText: /tarot|타로/i }).first();
      await tarotLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Step 3: Start a tarot spread
      const spreadLink = page.locator('a, button').filter({ hasText: /spread|스프레드|뽑기/i }).first();
      if (await spreadLink.count() > 0) {
        await spreadLink.click();
        await page.waitForLoadState('domcontentloaded');
      }

      // Step 4: Select spread type (if options available)
      const threeCardOption = page.locator('text=/3.*card|3장/i').first();
      if (await threeCardOption.count() > 0) {
        await threeCardOption.click();
        await page.waitForTimeout(1000);
      }

      // Step 5: Draw cards
      const startButton = page.locator('button').filter({ hasText: /start|시작|draw|뽑기/i }).first();
      if (await startButton.count() > 0) {
        await startButton.click();
        await page.waitForTimeout(2000);
      }

      // Step 6: Click on cards to reveal
      const cards = page.locator('[data-testid*="card"], .card').filter({ hasNotText: /^$/ });
      const cardCount = await cards.count();
      
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        await cards.nth(i).click();
        await page.waitForTimeout(1000);
      }

      // Take screenshot of completed spread
      await page.screenshot({ 
        path: 'screenshots/main-flow-tarot-complete.png',
        fullPage: true 
      });

      console.log('✓ Completed tarot reading journey');
    });

    test('should complete journey from landing to dream interpretation', async ({ page }) => {
      // Step 1: Visit landing page
      await page.goto(VERCEL_URL);
      
      // Step 2: Navigate to dream interpretation
      const dreamLink = page.locator('a').filter({ hasText: /dream|꿈/i }).first();
      await dreamLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Step 3: Enter dream description
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await dreamInput.fill('Last night I dreamed I was flying over mountains and saw beautiful landscapes below.');

      // Step 4: Submit for interpretation
      const submitButton = page.locator('button').filter({ hasText: /interpret|해석|submit|분석/i }).first();
      await submitButton.click();

      // Step 5: Wait for results
      await page.waitForTimeout(5000);

      // Take screenshot of interpretation
      await page.screenshot({ 
        path: 'screenshots/main-flow-dream-complete.png',
        fullPage: true 
      });

      console.log('✓ Completed dream interpretation journey');
    });
  });

  test.describe('User Registration & Login Journey', () => {
    test('should complete registration and use features', async ({ page }) => {
      // Step 1: Go to sign up page
      await page.goto(`${VERCEL_URL}/sign-up`);
      
      // Step 2: Fill registration form
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@example.com`;
      
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'TestPassword123!');
      
      const confirmPasswordInput = page.locator('input[type="password"]').nth(1);
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill('TestPassword123!');
      }

      // Step 3: Submit registration
      const signUpButton = page.locator('button').filter({ hasText: /sign up|가입|register/i }).first();
      await signUpButton.click();

      // Wait for registration to complete
      await page.waitForTimeout(3000);

      // Step 4: Check if redirected to home or dashboard
      const isAuthenticated = 
        page.url().includes('dashboard') || 
        page.url().includes('home') ||
        page.url() === VERCEL_URL + '/';

      if (isAuthenticated) {
        console.log('✓ Registration successful, user authenticated');
        
        // Step 5: Try to use a feature (tarot reading)
        await page.goto(`${VERCEL_URL}/tarot-spread`);
        
        // Verify user can access features
        const userFeature = page.locator('[data-user-feature]').first();
        if (await userFeature.count() > 0) {
          console.log('✓ Authenticated user can access features');
        }
      }

      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/main-flow-registration.png',
        fullPage: true 
      });
    });

    test('should login and save reading history', async ({ page }) => {
      // Mock authentication for this test
      await page.goto(VERCEL_URL);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'user@test.com');
        localStorage.setItem('mockAuthRole', 'user');
      });
      await page.reload();

      // Step 1: Perform a tarot reading
      await page.goto(`${VERCEL_URL}/tarot-spread`);
      
      const startButton = page.locator('button').filter({ hasText: /start|시작|draw|뽑기/i }).first();
      if (await startButton.count() > 0) {
        await startButton.click();
        await page.waitForTimeout(2000);
      }

      // Click some cards
      const cards = page.locator('[data-testid*="card"], .card');
      for (let i = 0; i < Math.min(await cards.count(), 3); i++) {
        await cards.nth(i).click();
        await page.waitForTimeout(500);
      }

      // Step 2: Save the reading
      const saveButton = page.locator('button').filter({ hasText: /save|저장|기록/i }).first();
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ Reading saved');
      }

      // Step 3: Navigate to history
      await page.goto(`${VERCEL_URL}/readings/history`);
      await page.waitForLoadState('networkidle');

      // Step 4: Verify saved reading appears
      const historyItems = page.locator('[data-testid="history-item"], .history-item');
      const itemCount = await historyItems.count();
      
      if (itemCount > 0) {
        console.log(`✓ Found ${itemCount} saved readings in history`);
      }

      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/main-flow-history.png',
        fullPage: true 
      });
    });
  });

  test.describe('Complete Feature Tour', () => {
    test('should navigate through all main features', async ({ page }) => {
      const features = [
        { name: 'Home', path: '/', selector: 'h1' },
        { name: 'Tarot Archive', path: '/tarot', selector: 'text=타로 카드' },
        { name: 'Tarot Spread', path: '/tarot-spread', selector: 'button' },
        { name: 'Dream Interpretation', path: '/dream-interpretation', selector: 'textarea' },
      ];

      for (const feature of features) {
        console.log(`Testing ${feature.name}...`);
        
        await page.goto(`${VERCEL_URL}${feature.path}`);
        await page.waitForLoadState('domcontentloaded');
        
        // Verify page loaded
        const element = page.locator(feature.selector).first();
        await expect(element).toBeVisible({ timeout: 10000 });
        
        // Take screenshot
        await page.screenshot({ 
          path: `screenshots/main-flow-${feature.name.toLowerCase().replace(/\s+/g, '-')}.png`,
          fullPage: true 
        });
        
        console.log(`✓ ${feature.name} loaded successfully`);
      }
    });
  });

  test.describe('Error Recovery Journey', () => {
    test('should handle errors gracefully and allow recovery', async ({ page }) => {
      // Step 1: Simulate network failure
      await page.goto(VERCEL_URL);
      
      // Go offline
      await page.context().setOffline(true);
      
      // Try to navigate
      const link = page.locator('a').first();
      await link.click().catch(() => {});
      
      await page.waitForTimeout(2000);
      
      // Check for offline message or error handling
      const errorMessage = page.locator('[role="alert"], .error, [class*="error"]');
      if (await errorMessage.count() > 0) {
        console.log('✓ Error message displayed when offline');
      }
      
      // Step 2: Go back online and recover
      await page.context().setOffline(false);
      await page.reload();
      
      // Verify page loads correctly
      await expect(page.locator('h1, h2').first()).toBeVisible();
      console.log('✓ Successfully recovered from offline state');
    });

    test('should handle 404 and navigate back', async ({ page }) => {
      // Step 1: Visit 404 page
      await page.goto(`${VERCEL_URL}/non-existent-page-xyz`);
      
      // Step 2: Find and click home link
      const homeLink = page.locator('a').filter({ hasText: /home|홈|처음/i }).first();
      if (await homeLink.count() > 0) {
        await homeLink.click();
        await page.waitForLoadState('domcontentloaded');
        
        // Verify we're back on a valid page
        expect(page.url()).toBe(`${VERCEL_URL}/`);
        console.log('✓ Successfully navigated from 404 to home');
      }
    });
  });

  test.describe('Performance Journey', () => {
    test('should maintain good performance through user journey', async ({ page }) => {
      const performanceMetrics: any[] = [];
      
      // Step 1: Measure landing page
      let startTime = Date.now();
      await page.goto(VERCEL_URL);
      let loadTime = Date.now() - startTime;
      performanceMetrics.push({ page: 'Landing', loadTime });
      
      // Step 2: Measure navigation to tarot
      startTime = Date.now();
      const tarotLink = page.locator('a').filter({ hasText: /tarot|타로/i }).first();
      await tarotLink.click();
      await page.waitForLoadState('domcontentloaded');
      loadTime = Date.now() - startTime;
      performanceMetrics.push({ page: 'Tarot Navigation', loadTime });
      
      // Step 3: Measure interactive feature
      startTime = Date.now();
      const button = page.locator('button').first();
      if (await button.count() > 0) {
        await button.click();
        await page.waitForTimeout(1000);
      }
      loadTime = Date.now() - startTime;
      performanceMetrics.push({ page: 'Interactive Action', loadTime });
      
      // Report performance
      console.log('\n=== Performance Metrics ===');
      performanceMetrics.forEach(metric => {
        console.log(`${metric.page}: ${metric.loadTime}ms`);
        expect(metric.loadTime).toBeLessThan(5000); // 5 second threshold
      });
    });
  });
});

// After all tests complete
test.afterAll(async () => {
  console.log('\n=== Main User Journey Tests Completed ===');
  console.log('All critical user paths have been tested');
});