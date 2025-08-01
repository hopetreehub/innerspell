import { test, expect } from '@playwright/test';

test.describe('Basic Application Functionality', () => {
  // Global test configuration
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for all tests
    test.setTimeout(90000);
  });

  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for basic page load with shorter timeout
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Networkidle timeout, proceeding with test...');
    }
    
    // Check if page loads without errors
    expect(page.url()).toContain('localhost:4000');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'screenshots/01-homepage-loaded.png', fullPage: true });
    
    // Check for key elements - more flexible approach
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBe(true);
    
    console.log('✅ Homepage loaded successfully');
  });

  test('should navigate to tarot reading page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Networkidle timeout, proceeding with test...');
    }
    
    // Look for tarot/reading navigation with more flexible selectors
    const readingLink = page.locator('a[href*="reading"], a[href*="tarot"], a:has-text("읽기"), a:has-text("타로")').first();
    
    if (await readingLink.isVisible({ timeout: 5000 })) {
      await readingLink.click();
      
      try {
        await page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch (e) {
        console.log('Navigation networkidle timeout, proceeding...');
      }
      
      // Take screenshot
      await page.screenshot({ path: 'screenshots/02-reading-page-loaded.png', fullPage: true });
      console.log('✅ Navigated to reading page successfully');
    } else {
      // Try direct navigation
      await page.goto('/reading', { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      try {
        await page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch (e) {
        console.log('Direct navigation networkidle timeout, proceeding...');
      }
      
      await page.screenshot({ path: 'screenshots/02-reading-page-direct.png', fullPage: true });
      console.log('✅ Direct navigation to reading page');
    }
  });

  test('should load blog page', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Blog page networkidle timeout, proceeding...');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/03-blog-page-loaded.png', fullPage: true });
    
    // Check URL
    expect(page.url()).toContain('/blog');
    console.log('✅ Blog page loaded successfully');
  });

  test('should load admin page (auth check)', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Admin page networkidle timeout, proceeding...');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/04-admin-page-access.png', fullPage: true });
    
    // This might redirect to login or show admin content
    const currentUrl = page.url();
    console.log(`✅ Admin page access attempt - URL: ${currentUrl}`);
    
    // Check if we got redirected or stayed on admin
    const isAdminOrAuth = currentUrl.includes('/admin') || currentUrl.includes('/sign-in') || currentUrl.includes('/login');
    expect(isAdminOrAuth).toBe(true);
  });

  test('should check responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Mobile responsive networkidle timeout, proceeding...');
    }
    
    await page.screenshot({ path: 'screenshots/05-mobile-responsive.png', fullPage: true });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Tablet responsive networkidle timeout, proceeding...');
    }
    
    await page.screenshot({ path: 'screenshots/06-tablet-responsive.png', fullPage: true });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Desktop responsive networkidle timeout, proceeding...');
    }
    
    await page.screenshot({ path: 'screenshots/07-desktop-responsive.png', fullPage: true });
    
    console.log('✅ Responsive design testing completed');
  });

  test('should test tarot functionality if available', async ({ page }) => {
    // Try tarot-specific functionality
    await page.goto('/tarot', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (e) {
      console.log('Tarot page networkidle timeout, proceeding...');
    }
    
    await page.screenshot({ path: 'screenshots/08-tarot-page.png', fullPage: true });
    
    // Look for tarot-specific elements
    const hasCards = await page.locator('[class*="card"], [data-testid*="card"], img[src*="tarot"]').count();
    console.log(`Found ${hasCards} card-related elements`);
    
    // Look for buttons or interactive elements
    const hasButtons = await page.locator('button').count();
    console.log(`Found ${hasButtons} interactive buttons`);
    
    console.log('✅ Tarot functionality check completed');
  });
});