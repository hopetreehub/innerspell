import { test, expect } from '@playwright/test';

test.describe('Verify Infinite Loading Fix', () => {
  test('should load homepage without infinite loading', async ({ page }) => {
    console.log(`[${new Date().toISOString()}] Starting test`);
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[${new Date().toISOString()}] Console ${msg.type()}: ${msg.text()}`);
    });
    
    // Monitor for specific timeout warnings
    const timeoutWarnings: string[] = [];
    page.on('console', msg => {
      if (msg.text().toLowerCase().includes('timeout') || 
          msg.text().toLowerCase().includes('infinite') ||
          msg.text().toLowerCase().includes('loading')) {
        timeoutWarnings.push(`[${new Date().toISOString()}] ${msg.text()}`);
      }
    });
    
    // Navigate to the Vercel deployment
    console.log(`[${new Date().toISOString()}] Navigating to https://test-studio-firebase.vercel.app`);
    const startTime = Date.now();
    
    await page.goto('https://test-studio-firebase.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Initial page load completed in ${loadTime}ms`);
    
    // Wait for 10 seconds to monitor behavior
    console.log(`[${new Date().toISOString()}] Monitoring page behavior for 10 seconds...`);
    await page.waitForTimeout(10000);
    
    // Check if loading spinner is still visible
    const loadingSpinner = await page.locator('[data-testid="loading-spinner"], .loading-spinner, [class*="loading"], [class*="spinner"]').first();
    const isSpinnerVisible = await loadingSpinner.isVisible().catch(() => false);
    
    console.log(`[${new Date().toISOString()}] Loading spinner visible: ${isSpinnerVisible}`);
    
    // Take screenshot of homepage
    const screenshotTime = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `homepage-loaded-${screenshotTime}.png`,
      fullPage: true 
    });
    console.log(`[${new Date().toISOString()}] Homepage screenshot saved`);
    
    // Check for auth-related console messages
    const authMessages = await page.evaluate(() => {
      const messages: string[] = [];
      // Check for any auth-related elements or states
      const authElements = document.querySelectorAll('[data-testid*="auth"], [class*="auth"], [id*="auth"]');
      if (authElements.length > 0) {
        messages.push(`Found ${authElements.length} auth-related elements`);
      }
      return messages;
    });
    
    if (authMessages.length > 0) {
      console.log(`[${new Date().toISOString()}] Auth-related elements:`, authMessages);
    }
    
    // Navigate to /blog page
    console.log(`[${new Date().toISOString()}] Navigating to /blog page...`);
    const blogStartTime = Date.now();
    
    await page.goto('https://test-studio-firebase.vercel.app/blog', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const blogLoadTime = Date.now() - blogStartTime;
    console.log(`[${new Date().toISOString()}] Blog page load completed in ${blogLoadTime}ms`);
    
    // Wait a bit to ensure no loading issues
    await page.waitForTimeout(3000);
    
    // Check if blog page loading spinner is visible
    const blogSpinnerVisible = await loadingSpinner.isVisible().catch(() => false);
    console.log(`[${new Date().toISOString()}] Blog page loading spinner visible: ${blogSpinnerVisible}`);
    
    // Take screenshot of blog page
    await page.screenshot({ 
      path: `blog-page-loaded-${screenshotTime}.png`,
      fullPage: true 
    });
    console.log(`[${new Date().toISOString()}] Blog page screenshot saved`);
    
    // Check for blog posts
    const blogPosts = await page.locator('article, [class*="post"], [class*="blog-item"]').count();
    console.log(`[${new Date().toISOString()}] Number of blog posts found: ${blogPosts}`);
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Homepage load time: ${loadTime}ms`);
    console.log(`Blog page load time: ${blogLoadTime}ms`);
    console.log(`Loading spinner on homepage after 10s: ${isSpinnerVisible}`);
    console.log(`Loading spinner on blog page: ${blogSpinnerVisible}`);
    console.log(`Timeout warnings detected: ${timeoutWarnings.length}`);
    console.log(`Blog posts found: ${blogPosts}`);
    
    if (timeoutWarnings.length > 0) {
      console.log('\nTimeout warnings:');
      timeoutWarnings.forEach(warning => console.log(warning));
    }
    
    // Assertions
    expect(isSpinnerVisible).toBe(false);
    expect(blogSpinnerVisible).toBe(false);
    expect(loadTime).toBeLessThan(10000); // Should load in less than 10 seconds
    expect(blogLoadTime).toBeLessThan(10000);
    expect(timeoutWarnings.length).toBe(0);
  });
});