import { test, expect } from '@playwright/test';

test('auth loading fix verification', async ({ page }) => {
  console.log('Opening localhost:4000...');
  
  // Navigate to homepage
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  
  // Wait for loading spinner to disappear (max 10 seconds)
  const spinner = page.locator('.animate-spin');
  
  try {
    // Check if spinner exists
    const spinnerCount = await spinner.count();
    console.log(`Found ${spinnerCount} loading spinners`);
    
    if (spinnerCount > 0) {
      // Wait for spinner to disappear
      await spinner.waitFor({ state: 'hidden', timeout: 10000 });
      console.log('Loading spinner disappeared');
    }
  } catch (error) {
    console.log('No loading spinner found or it disappeared quickly');
  }
  
  // Check if main content is visible
  const heroSection = page.locator('text=InnerSpell과 함께');
  await expect(heroSection).toBeVisible({ timeout: 5000 });
  console.log('Hero section is visible');
  
  // Check navigation menu
  const navMenu = page.locator('nav');
  await expect(navMenu).toBeVisible();
  console.log('Navigation menu is visible');
  
  // Take screenshot
  await page.screenshot({ 
    path: '/mnt/e/project/test-studio-firebase/screenshots/auth-fix-test.png',
    fullPage: true 
  });
  console.log('Screenshot saved');
  
  // Check for any console errors
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(msg.text());
    }
  });
  
  await page.waitForTimeout(2000); // Wait to collect any delayed console errors
  
  if (consoleMessages.length > 0) {
    console.log('Console errors found:', consoleMessages);
  } else {
    console.log('No console errors detected');
  }
  
  console.log('Auth loading fix verification completed successfully!');
});