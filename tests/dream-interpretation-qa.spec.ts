import { test, expect } from '@playwright/test';

test.describe('Dream Interpretation Page QA Tests', () => {
  const baseURL = 'https://test-studio-firebase.vercel.app';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the dream interpretation page
    await page.goto(`${baseURL}/dream-interpretation`);
  });

  test('Page Loading and Initial State', async ({ page }) => {
    // Test 1: Page loads successfully
    await expect(page).toHaveTitle(/Dream Interpretation/i);
    
    // Take screenshot of initial page load
    await page.screenshot({ 
      path: 'dream-interpretation-initial-load.png',
      fullPage: true 
    });

    // Test 2: Check for main UI elements
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    
    // Test 3: Check for form elements
    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await expect(textarea.first()).toBeVisible();
    }
    
    // Test 4: Check for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("해석"), button:has-text("분석")');
    if (await submitButton.count() > 0) {
      await expect(submitButton.first()).toBeVisible();
    }
  });

  test('Form Interaction and Input Testing', async ({ page }) => {
    // Test 5: Find and interact with dream input field
    const dreamInput = page.locator('textarea, input[type="text"]').first();
    
    if (await dreamInput.count() > 0) {
      // Test input functionality
      const testDream = "I dreamed about flying over a beautiful landscape with golden mountains and crystal clear lakes.";
      await dreamInput.fill(testDream);
      
      // Verify input was entered
      await expect(dreamInput).toHaveValue(testDream);
      
      // Take screenshot after input
      await page.screenshot({ 
        path: 'dream-interpretation-with-input.png',
        fullPage: true 
      });
    }
  });

  test('Form Submission and Response', async ({ page }) => {
    // Test 6: Submit form and check response
    const dreamInput = page.locator('textarea, input[type="text"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("해석"), button:has-text("분석")').first();
    
    if (await dreamInput.count() > 0 && await submitButton.count() > 0) {
      // Fill in dream description
      await dreamInput.fill("I had a vivid dream about walking through a mystical forest with glowing trees and talking animals.");
      
      // Submit the form
      await submitButton.click();
      
      // Wait for potential response (up to 10 seconds)
      await page.waitForTimeout(3000);
      
      // Take screenshot after submission
      await page.screenshot({ 
        path: 'dream-interpretation-after-submit.png',
        fullPage: true 
      });
      
      // Check for any error messages or loading states
      const errorMessages = page.locator('.error, [class*="error"], .alert-danger');
      const loadingIndicators = page.locator('.loading, [class*="loading"], .spinner');
      const results = page.locator('.result, [class*="result"], .interpretation');
      
      console.log('Error messages found:', await errorMessages.count());
      console.log('Loading indicators found:', await loadingIndicators.count());
      console.log('Result sections found:', await results.count());
    }
  });

  test('JavaScript Console Errors Check', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Listen for network failures
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    // Reload page to catch any initial errors
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Report any errors found
    if (consoleErrors.length > 0) {
      console.log('Console Errors Found:', consoleErrors);
    }
    
    if (networkErrors.length > 0) {
      console.log('Network Errors Found:', networkErrors);
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'dream-interpretation-final-state.png',
      fullPage: true 
    });
  });

  test('Mobile Responsiveness Test', async ({ page }) => {
    // Test 7: Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'dream-interpretation-mobile.png',
      fullPage: true 
    });
    
    // Check if elements are still accessible on mobile
    const heading = page.locator('h1, h2').first();
    if (await heading.count() > 0) {
      await expect(heading).toBeVisible();
    }
  });

  test('Accessibility and Performance Check', async ({ page }) => {
    // Test 8: Check for basic accessibility
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      if (!alt) {
        console.log(`Image ${i + 1} missing alt attribute`);
      }
    }
    
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count();
    console.log(`H1 headings found: ${h1Count}`);
    
    // Performance check - measure page load
    const startTime = Date.now();
    await page.reload();
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
  });
});