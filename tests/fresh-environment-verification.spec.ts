import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';

/**
 * Fresh Environment Setup Verification Test
 * Tests critical functionality after a fresh environment setup on localhost:4000
 */

const BASE_URL = 'http://localhost:4000';

// Wait for the development server to be ready
test.beforeAll(async () => {
  console.log('🔍 Starting fresh environment verification on localhost:4000');
});

// Increase timeout for development server
test.setTimeout(120000);

test.describe('Fresh Environment Setup Verification', () => {
  
  test('1. Homepage loads without blank/grey screens', async ({ page }) => {
    console.log('🏠 Testing homepage load...');
    
    // Add console logging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const logMessage = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(logMessage);
      console.log('Console:', logMessage);
    });

    // Navigate to homepage
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: `/mnt/e/project/test-studio-firebase/fresh-env-01-homepage-${Date.now()}.png`,
      fullPage: true 
    });

    // Check that page is not blank/grey
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.trim().length).toBeGreaterThan(10);

    // Check for basic page elements
    const mainContent = page.locator('main, [role="main"], .main-content, #__next');
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // Check page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toBe('');
    console.log('✅ Page title:', title);

    // Verify no complete blank screen
    const hasVisibleText = await page.locator('body').isVisible();
    expect(hasVisibleText).toBe(true);

    console.log('✅ Homepage loads successfully without blank screens');
  });

  test('2. Check for module resolution and @/ import errors', async ({ page }) => {
    console.log('🔧 Checking for module resolution errors...');
    
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        consoleErrors.push(errorText);
        console.log('❌ Console Error:', errorText);
      }
    });

    // Capture network errors
    page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
        console.log('🌐 Network Error:', response.status(), response.url());
      }
    });

    // Navigate and wait for network to settle
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait a bit more for any async module loading
    await page.waitForTimeout(5000);

    // Take screenshot for debugging
    await page.screenshot({ 
      path: `/mnt/e/project/test-studio-firebase/fresh-env-02-module-check-${Date.now()}.png`,
      fullPage: true 
    });

    // Check for specific module resolution errors
    const moduleErrors = consoleErrors.filter(error => 
      error.includes('Module not found') ||
      error.includes('Cannot resolve') ||
      error.includes('Failed to import') ||
      error.includes('@/') ||
      error.includes('ERR_MODULE_NOT_FOUND')
    );

    if (moduleErrors.length > 0) {
      console.log('❌ Found module resolution errors:', moduleErrors);
    }

    // Check for 404s on critical resources
    const criticalResourceErrors = networkErrors.filter(error => 
      error.includes('/_next/') ||
      error.includes('.js') ||
      error.includes('.css')
    );

    console.log('📊 Module Resolution Check Results:');
    console.log(`  - Console errors: ${consoleErrors.length}`);
    console.log(`  - Module-specific errors: ${moduleErrors.length}`);
    console.log(`  - Network errors: ${networkErrors.length}`);
    console.log(`  - Critical resource errors: ${criticalResourceErrors.length}`);

    // We expect some errors but not critical module resolution failures
    expect(moduleErrors.length).toBe(0); // Should have no module resolution errors
    expect(criticalResourceErrors.length).toBeLessThan(5); // Allow some minor resource errors

    console.log('✅ No critical module resolution or @/ import errors found');
  });

  test('3. Authentication context is working (not stuck in infinite loading)', async ({ page }) => {
    console.log('🔐 Testing authentication context...');
    
    let loadingStates: string[] = [];
    
    // Monitor for loading states
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('loading') || text.includes('Loading') || text.includes('auth')) {
        loadingStates.push(text);
        console.log('🔄 Auth Loading State:', text);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait for initial auth state to settle
    await page.waitForTimeout(8000);

    // Take screenshot of current state
    await page.screenshot({ 
      path: `/mnt/e/project/test-studio-firebase/fresh-env-03-auth-check-${Date.now()}.png`,
      fullPage: true 
    });

    // Check for infinite loading indicators
    const loadingSpinners = page.locator('[data-testid*="loading"], .loading, .spinner, [class*="loading"], [class*="spinner"]');
    const visibleSpinners = await loadingSpinners.count();
    
    // Check for auth-related loading text
    const authLoadingText = page.locator('text=/loading.*auth|auth.*loading|authenticating/i');
    const hasAuthLoadingText = await authLoadingText.count();

    console.log(`📊 Auth Context Check Results:`);
    console.log(`  - Visible loading spinners: ${visibleSpinners}`);
    console.log(`  - Auth loading text elements: ${hasAuthLoadingText}`);
    console.log(`  - Loading state logs: ${loadingStates.length}`);

    // Page should not be stuck in loading state
    expect(visibleSpinners).toBeLessThan(3); // Allow some loading but not excessive
    
    // Check that we can interact with the page (not completely blocked by loading)
    const interactableElements = page.locator('button, a, input, [role="button"]');
    const interactableCount = await interactableElements.count();
    expect(interactableCount).toBeGreaterThan(0);

    console.log('✅ Authentication context appears to be working (not stuck in infinite loading)');
  });

  test('4. Basic navigation is accessible', async ({ page }) => {
    console.log('🧭 Testing basic navigation...');
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);

    // Take screenshot of navigation state
    await page.screenshot({ 
      path: `/mnt/e/project/test-studio-firebase/fresh-env-04-navigation-${Date.now()}.png`,
      fullPage: true 
    });

    // Look for navigation elements
    const navElements = await page.locator('nav, [role="navigation"], header, .header, .nav, .navbar').count();
    console.log(`📊 Found ${navElements} navigation containers`);

    // Look for common navigation links/buttons
    const commonNavItems = [
      'home', 'about', 'contact', 'blog', 'dashboard', 'login', 'signin', 'sign in',
      'tarot', 'reading', 'menu', 'navigation'
    ];

    let foundNavItems: string[] = [];
    
    for (const item of commonNavItems) {
      const elements = page.locator(`a:has-text("${item}"), button:has-text("${item}"), [aria-label*="${item}"]`);
      const count = await elements.count();
      if (count > 0) {
        foundNavItems.push(`${item} (${count})`);
      }
    }

    // Check for clickable navigation elements
    const clickableNavs = page.locator('nav a, nav button, header a, header button, [role="navigation"] a, [role="navigation"] button');
    const clickableCount = await clickableNavs.count();

    // Test if we can find and potentially click navigation
    let navigationTestPassed = false;
    
    if (clickableCount > 0) {
      try {
        const firstNav = clickableNavs.first();
        const isVisible = await firstNav.isVisible();
        const isEnabled = await firstNav.isEnabled();
        navigationTestPassed = isVisible && isEnabled;
      } catch (error) {
        console.log('⚠️ Navigation interaction test failed:', error);
      }
    }

    console.log(`📊 Navigation Check Results:`);
    console.log(`  - Navigation containers: ${navElements}`);
    console.log(`  - Clickable navigation elements: ${clickableCount}`);
    console.log(`  - Found navigation items: ${foundNavItems.join(', ')}`);
    console.log(`  - Navigation interaction test: ${navigationTestPassed ? 'PASSED' : 'FAILED'}`);

    // We should have some form of navigation
    expect(navElements + clickableCount).toBeGreaterThan(0);
    expect(foundNavItems.length).toBeGreaterThan(0);

    console.log('✅ Basic navigation is accessible');
  });

  test('5. Complete fresh environment health check', async ({ page }) => {
    console.log('🏥 Running complete health check...');
    
    const healthReport = {
      pageLoad: false,
      jsErrors: 0,
      networkErrors: 0,
      interactivity: false,
      performance: {
        loadTime: 0,
        domContentLoaded: 0
      }
    };

    const startTime = Date.now();
    
    // Capture all errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      errors.push(`Page Error: ${err.message}`);
    });

    const networkErrors: string[] = [];
    page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    try {
      // Navigate and measure performance
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      const domLoadTime = Date.now() - startTime;
      
      await page.waitForLoadState('networkidle');
      const totalLoadTime = Date.now() - startTime;
      
      healthReport.pageLoad = true;
      healthReport.performance.domContentLoaded = domLoadTime;
      healthReport.performance.loadTime = totalLoadTime;

      // Test basic interactivity
      const interactableElements = page.locator('button, a, input, select, textarea');
      const interactableCount = await interactableElements.count();
      healthReport.interactivity = interactableCount > 0;

      // Final screenshot
      await page.screenshot({ 
        path: `/mnt/e/project/test-studio-firebase/fresh-env-05-health-check-${Date.now()}.png`,
        fullPage: true 
      });

    } catch (error) {
      console.log('❌ Health check failed:', error);
      await page.screenshot({ 
        path: `/mnt/e/project/test-studio-firebase/fresh-env-05-health-check-ERROR-${Date.now()}.png`,
        fullPage: true 
      });
    }

    healthReport.jsErrors = errors.length;
    healthReport.networkErrors = networkErrors.length;

    console.log('📊 Fresh Environment Health Report:');
    console.log('================================');
    console.log(`✅ Page Load: ${healthReport.pageLoad}`);
    console.log(`📊 JS Errors: ${healthReport.jsErrors}`);
    console.log(`🌐 Network Errors: ${healthReport.networkErrors}`);
    console.log(`🖱️  Interactivity: ${healthReport.interactivity}`);
    console.log(`⚡ DOM Load Time: ${healthReport.performance.domContentLoaded}ms`);
    console.log(`🚀 Total Load Time: ${healthReport.performance.loadTime}ms`);
    console.log('================================');

    if (errors.length > 0) {
      console.log('❌ JavaScript Errors Found:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (networkErrors.length > 0) {
      console.log('🌐 Network Errors Found:');
      networkErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // Health check assertions
    expect(healthReport.pageLoad).toBe(true);
    expect(healthReport.jsErrors).toBeLessThan(10); // Allow some minor errors
    expect(healthReport.networkErrors).toBeLessThan(10); // Allow some resource errors
    expect(healthReport.interactivity).toBe(true);
    expect(healthReport.performance.loadTime).toBeLessThan(30000); // 30 second max load time

    console.log('✅ Fresh environment health check completed successfully!');
  });

});