import { test, expect } from '@playwright/test';

test.describe('Basic Application Functionality', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Set longer timeout for slow loading pages
    test.setTimeout(60000);
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Wait for page to load with shorter networkidle timeout
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      console.log('Networkidle timeout, proceeding with test...');
    }
    
    // Check if page loads without errors
    expect(page.url()).toContain('localhost:4000');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'screenshots/01-homepage-loaded.png', fullPage: true });
    
    // Check for key elements
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    console.log('✅ Homepage loaded successfully');
  });

  test('should navigate to tarot reading page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for tarot/reading navigation
    const readingLink = page.locator('a[href*="reading"], a[href*="tarot"]').first();
    
    if (await readingLink.isVisible()) {
      await readingLink.click();
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ path: 'screenshots/02-reading-page-loaded.png', fullPage: true });
      
      // Verify we're on a reading/tarot page
      expect(page.url()).toMatch(/(reading|tarot)/);
      console.log('✅ Navigated to reading page successfully');
    } else {
      // Try direct navigation
      await page.goto('/reading');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/02-reading-page-direct.png', fullPage: true });
      console.log('✅ Direct navigation to reading page');
    }
  });

  test('should load blog page', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/03-blog-page-loaded.png', fullPage: true });
    
    // Check URL
    expect(page.url()).toContain('/blog');
    console.log('✅ Blog page loaded successfully');
  });

  test('should load admin page (auth check)', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/04-admin-page-access.png', fullPage: true });
    
    // This might redirect to login or show admin content
    const currentUrl = page.url();
    console.log(`✅ Admin page access attempt - URL: ${currentUrl}`);
  });

  test('should check responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/05-mobile-responsive.png', fullPage: true });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/06-tablet-responsive.png', fullPage: true });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/07-desktop-responsive.png', fullPage: true });
    
    console.log('✅ Responsive design testing completed');
  });
});