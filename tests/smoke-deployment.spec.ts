import { test, expect } from '@playwright/test';

/**
 * Smoke tests for post-deployment validation
 * These tests run automatically after each deployment
 */
test.describe('Deployment Smoke Tests', () => {
  // Critical path tests
  test('Homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    
    // Verify critical elements
    await expect(page).toHaveTitle(/InnerSpell/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('API health check passes', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.services.database).toBe('connected');
  });

  test('Critical pages are accessible', async ({ page }) => {
    const criticalPaths = [
      { path: '/about', title: /About/ },
      { path: '/tarot', title: /Tarot/ },
      { path: '/blog', title: /Blog/ },
    ];
    
    for (const { path, title } of criticalPaths) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(title);
    }
  });

  test('No console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Ignore known non-critical errors
        const ignoredErrors = [
          'favicon.ico',
          'Failed to load resource',
          'ResizeObserver loop limit exceeded',
        ];
        
        const errorText = msg.text();
        const isIgnored = ignoredErrors.some(ignored => 
          errorText.includes(ignored)
        );
        
        if (!isIgnored) {
          errors.push(errorText);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    if (errors.length > 0) {
      console.error('Console errors found:', errors);
    }
    
    expect(errors).toHaveLength(0);
  });

  test('Navigation menu works', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop navigation
    if (await page.locator('nav a[href="/about"]').isVisible()) {
      await page.click('nav a[href="/about"]');
      await expect(page).toHaveURL(/.*\/about/);
    }
    
    // Test mobile navigation if applicable
    const hamburger = page.locator('[aria-label="Open menu"]');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.click('a[href="/tarot"]');
      await expect(page).toHaveURL(/.*\/tarot/);
    }
  });

  test('Static assets load correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if images load
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      if (src && !src.startsWith('data:')) {
        // Verify image loads without 404
        const response = await page.request.get(src);
        expect(response.status()).toBeLessThan(400);
      }
    }
  });

  test('Performance metrics are acceptable', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    // Verify performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
    expect(metrics.loadComplete).toBeLessThan(5000); // 5 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds
  });

  test('Critical API endpoints respond', async ({ request }) => {
    const endpoints = [
      '/api/health',
      '/api/robots',
      '/api/sitemap',
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('Environment variables are properly set', async ({ request }) => {
    const response = await request.get('/api/health');
    const data = await response.json();
    
    // Verify critical services are configured
    expect(data.environment_checks?.node_env).toBeTruthy();
    expect(data.environment_checks?.has_firebase_config).toBeTruthy();
    
    // Check for degraded status due to missing configs
    if (data.status === 'degraded') {
      console.warn('Deployment is degraded:', data.issues);
    }
  });
});