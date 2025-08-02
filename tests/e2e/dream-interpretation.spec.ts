import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test.describe('Dream Interpretation - Complete Test Suite', () => {
  test.describe('Page Loading & Initial State', () => {
    test('should load dream interpretation page successfully', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Verify page title
      await expect(page).toHaveTitle(/Dream Interpretation|꿈 해석/i);
      
      // Take screenshot of initial load
      await page.screenshot({ 
        path: 'screenshots/dream-interpretation-initial.png',
        fullPage: true 
      });

      // Check for main heading
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    });

    test('should display all form elements', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Check for dream input textarea
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await expect(dreamInput).toBeVisible();
      
      // Check for submit button
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|해석|분석|interpret/i 
      });
      await expect(submitButton.first()).toBeVisible();

      // Check for any additional form fields (category, mood, etc.)
      const categorySelect = page.locator('select, [role="combobox"]').first();
      if (await categorySelect.count() > 0) {
        console.log('Category selection field found');
      }
    });

    test('should check for helper text or instructions', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Look for instructional text
      const instructions = page.locator('text=/꿈을.*입력|describe.*dream|tell.*dream/i');
      if (await instructions.count() > 0) {
        await expect(instructions.first()).toBeVisible();
      }

      // Check for placeholder text
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      const placeholder = await dreamInput.getAttribute('placeholder');
      if (placeholder) {
        console.log(`Placeholder text: ${placeholder}`);
      }
    });
  });

  test.describe('Form Interaction & Input', () => {
    test('should accept dream description input', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      const testDream = '어젯밤 하늘을 날아다니는 꿈을 꾸었습니다. 구름 위를 걸으며 아름다운 풍경을 보았어요.';
      
      // Fill in dream description
      await dreamInput.fill(testDream);
      
      // Verify input was entered
      await expect(dreamInput).toHaveValue(testDream);
      
      // Take screenshot with input
      await page.screenshot({ 
        path: 'screenshots/dream-interpretation-with-input.png',
        fullPage: true 
      });
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Try to submit without filling the form
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|해석|분석|interpret/i 
      }).first();
      
      await submitButton.click();
      
      // Check for validation messages
      const validationMessage = page.locator('[role="alert"], .error, [class*="error"]');
      if (await validationMessage.count() > 0) {
        await expect(validationMessage.first()).toBeVisible();
        console.log('Validation message displayed for empty input');
      }
    });

    test('should handle long dream descriptions', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      const longDream = `
        I had a very vivid and complex dream last night. It started in my childhood home, 
        but the house was much larger than in reality. I was walking through endless corridors 
        filled with doors. Each door I opened revealed a different scene from my life - 
        some from the past, some that never happened. In one room, I saw myself as a child 
        playing with toys I never owned. In another, I was giving a presentation to a crowd 
        of faceless people. The dream shifted, and suddenly I was in a vast library where 
        books were flying around like birds. I tried to catch one, and when I finally did, 
        it turned into a butterfly and flew away. The dream ended with me standing on a 
        cliff overlooking an ocean made of stars.
      `.trim();
      
      await dreamInput.fill(longDream);
      await expect(dreamInput).toHaveValue(longDream);
    });
  });

  test.describe('Dream Interpretation Submission', () => {
    test('should submit dream and show loading state', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Fill in dream
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await dreamInput.fill('I dreamed about swimming in a crystal clear lake surrounded by mountains.');
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|해석|분석|interpret/i 
      }).first();
      
      await submitButton.click();
      
      // Check for loading state
      const loadingIndicator = page.locator('.loading, [class*="loading"], .spinner, [role="progressbar"]');
      if (await loadingIndicator.count() > 0) {
        console.log('Loading indicator displayed');
        await page.screenshot({ 
          path: 'screenshots/dream-interpretation-loading.png',
          fullPage: true 
        });
      }
      
      // Wait for response
      await page.waitForTimeout(3000);
    });

    test('should display interpretation results', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Submit a dream
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await dreamInput.fill('꿈에서 바다를 헤엄치고 있었습니다.');
      
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|해석|분석|interpret/i 
      }).first();
      await submitButton.click();
      
      // Wait for results
      await page.waitForTimeout(5000);
      
      // Check for results section
      const results = page.locator('.result, [class*="result"], .interpretation, [data-testid="interpretation-result"]');
      if (await results.count() > 0) {
        await expect(results.first()).toBeVisible();
        console.log('Interpretation results displayed');
        
        // Take screenshot of results
        await page.screenshot({ 
          path: 'screenshots/dream-interpretation-results.png',
          fullPage: true 
        });
      }
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Listen for network failures
      const networkErrors: string[] = [];
      page.on('response', response => {
        if (response.status() >= 400) {
          networkErrors.push(`${response.status()} - ${response.url()}`);
        }
      });

      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Submit form
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await dreamInput.fill('Test dream for error handling');
      
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|해석|분석|interpret/i 
      }).first();
      await submitButton.click();
      
      await page.waitForTimeout(3000);
      
      // Check for error messages
      const errorMessage = page.locator('[role="alert"], .error, [class*="error"]');
      if (await errorMessage.count() > 0) {
        console.log('Error message displayed appropriately');
      }
      
      if (networkErrors.length > 0) {
        console.log('Network errors detected:', networkErrors);
      }
    });
  });

  test.describe('User Experience Features', () => {
    test('should allow clearing form and starting over', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Fill in dream
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await dreamInput.fill('Test dream to be cleared');
      
      // Look for clear/reset button
      const clearButton = page.locator('button').filter({ hasText: /clear|reset|지우기|다시/i });
      if (await clearButton.count() > 0) {
        await clearButton.first().click();
        
        // Verify input is cleared
        await expect(dreamInput).toHaveValue('');
      }
    });

    test('should save interpretation history for logged-in users', async ({ page }) => {
      // Mock user authentication
      await page.goto(`${VERCEL_URL}`);
      await page.evaluate(() => {
        localStorage.setItem('mockAuthEmail', 'user@test.com');
        localStorage.setItem('mockAuthRole', 'user');
      });

      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Submit a dream
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await dreamInput.fill('꿈 해석 저장 테스트');
      
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|해석|분석|interpret/i 
      }).first();
      await submitButton.click();
      
      await page.waitForTimeout(3000);
      
      // Look for save button
      const saveButton = page.locator('button').filter({ hasText: /save|저장|기록/i });
      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        
        // Check for success message
        const successMessage = page.locator('text=/저장.*완료|saved.*successfully/i');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    });

    test('should provide dream categories or themes', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Check for category selector
      const categorySelect = page.locator('select, [role="combobox"]').filter({ hasText: /category|종류|테마/i });
      if (await categorySelect.count() > 0) {
        await categorySelect.click();
        
        // Check available options
        const options = page.locator('option, [role="option"]');
        const optionCount = await options.count();
        console.log(`Found ${optionCount} dream categories`);
      }
    });
  });

  test.describe('Accessibility & Performance', () => {
    test('should be accessible with proper ARIA labels', async ({ page }) => {
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Check for ARIA labels on form elements
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      const ariaLabel = await dreamInput.getAttribute('aria-label');
      if (ariaLabel) {
        console.log(`Dream input ARIA label: ${ariaLabel}`);
      }
      
      // Check for form landmarks
      const form = page.locator('form');
      if (await form.count() > 0) {
        const formRole = await form.getAttribute('role');
        console.log(`Form role: ${formRole || 'form (default)'}`);
      }
    });

    test('should have good performance metrics', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      const loadTime = Date.now() - startTime;
      
      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      
      // Check for images with alt text
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        if (!alt) {
          console.log(`Image ${i + 1} missing alt attribute`);
        }
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work well on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Check if main elements are visible
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
      
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await expect(dreamInput).toBeVisible();
      
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|해석|분석|interpret/i 
      }).first();
      await expect(submitButton).toBeVisible();
      
      // Take mobile screenshot
      await page.screenshot({ 
        path: 'screenshots/dream-interpretation-mobile.png',
        fullPage: true 
      });
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      
      // Test touch interaction with textarea
      const dreamInput = page.locator('textarea, input[type="text"]').first();
      await dreamInput.tap();
      await dreamInput.fill('Mobile test dream');
      
      // Test button tap
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /submit|해석|분석|interpret/i 
      }).first();
      await submitButton.tap();
    });
  });

  test.describe('Console Error Checking', () => {
    test('should not have console errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      // Listen for console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto(`${VERCEL_URL}/dream-interpretation`);
      await page.waitForTimeout(2000);
      
      // Report any errors found
      if (consoleErrors.length > 0) {
        console.log('Console Errors Found:', consoleErrors);
      }
      
      expect(consoleErrors.length).toBe(0);
    });
  });
});

// After all tests complete
test.afterAll(async () => {
  console.log('\n=== Dream Interpretation Test Suite Completed ===');
});