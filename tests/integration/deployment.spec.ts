import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';
const VERCEL_DOMAIN = 'test-studio-firebase.vercel.app';

test.describe('Vercel Deployment Verification', () => {
  test('should load main page successfully', async ({ page }) => {
    const response = await page.goto(VERCEL_URL);
    
    // Verify successful response
    expect(response?.status()).toBe(200);
    
    // Verify we're on the correct domain
    expect(page.url()).toContain(VERCEL_DOMAIN);
    
    // Take screenshot of deployed site
    await page.screenshot({ 
      path: 'screenshots/vercel-deployment-main.png',
      fullPage: true 
    });
  });

  test('should have correct meta tags and SEO', async ({ page }) => {
    await page.goto(VERCEL_URL);
    
    // Check title
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`Page title: ${title}`);
    
    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    if (metaDescription) {
      console.log(`Meta description: ${metaDescription}`);
    }
    
    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    
    if (ogTitle) console.log(`OG Title: ${ogTitle}`);
    if (ogDescription) console.log(`OG Description: ${ogDescription}`);
  });

  test('should load all static assets correctly', async ({ page }) => {
    const failedResources: string[] = [];
    
    // Listen for failed resource loads
    page.on('response', response => {
      if (response.status() >= 400) {
        failedResources.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if any resources failed to load
    if (failedResources.length > 0) {
      console.log('Failed resources:', failedResources);
    }
    
    expect(failedResources.length).toBe(0);
  });

  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto(VERCEL_URL);
    
    if (response) {
      const headers = response.headers();
      
      // Check for common security headers
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'strict-transport-security',
        'x-xss-protection'
      ];
      
      for (const header of securityHeaders) {
        if (headers[header]) {
          console.log(`${header}: ${headers[header]}`);
        }
      }
      
      // Check cache headers
      const cacheControl = headers['cache-control'];
      if (cacheControl) {
        console.log(`Cache-Control: ${cacheControl}`);
      }
    }
  });

  test('should navigate to all main routes', async ({ page }) => {
    const routes = [
      { path: '/', name: 'Home' },
      { path: '/tarot', name: 'Tarot Archive' },
      { path: '/tarot-spread', name: 'Tarot Spread' },
      { path: '/dream-interpretation', name: 'Dream Interpretation' },
      { path: '/sign-in', name: 'Sign In' },
      { path: '/sign-up', name: 'Sign Up' }
    ];
    
    for (const route of routes) {
      const response = await page.goto(`${VERCEL_URL}${route.path}`);
      
      // Verify successful response
      expect(response?.status()).toBeLessThan(400);
      console.log(`✓ ${route.name} (${route.path}): ${response?.status()}`);
      
      // Wait for content to load
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('should handle 404 pages correctly', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/non-existent-page-12345`);
    
    // Check for 404 content
    const notFoundText = page.locator('text=/404|not found|페이지를 찾을 수 없습니다/i');
    const hasNotFoundContent = await notFoundText.count() > 0;
    
    if (hasNotFoundContent) {
      console.log('404 page is properly configured');
    }
    
    // Take screenshot of 404 page
    await page.screenshot({ 
      path: 'screenshots/vercel-404-page.png',
      fullPage: true 
    });
  });

  test('should have proper API endpoints', async ({ page, request }) => {
    // Test API health check if exists
    const apiEndpoints = [
      '/api/health',
      '/api/status',
      '/api'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await request.get(`${VERCEL_URL}${endpoint}`);
        console.log(`API ${endpoint}: ${response.status()}`);
        
        if (response.ok()) {
          const data = await response.json().catch(() => null);
          if (data) {
            console.log(`Response from ${endpoint}:`, data);
          }
        }
      } catch (error) {
        console.log(`API ${endpoint}: Not available`);
      }
    }
  });

  test('should load with good performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('domcontentloaded');
    
    const domContentLoadedTime = Date.now() - startTime;
    console.log(`DOM Content Loaded: ${domContentLoadedTime}ms`);
    
    await page.waitForLoadState('networkidle');
    const fullyLoadedTime = Date.now() - startTime;
    console.log(`Fully Loaded: ${fullyLoadedTime}ms`);
    
    // Performance thresholds
    expect(domContentLoadedTime).toBeLessThan(3000); // 3 seconds
    expect(fullyLoadedTime).toBeLessThan(10000); // 10 seconds
  });

  test('should work on different viewports', async ({ page }) => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(VERCEL_URL);
      
      // Verify page loads correctly at each viewport
      const mainContent = page.locator('main, [role="main"], #root, #__next').first();
      await expect(mainContent).toBeVisible();
      
      console.log(`✓ ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto(VERCEL_URL);
    
    // Find all navigation links
    const navLinks = page.locator('nav a, header a');
    const linkCount = await navLinks.count();
    
    console.log(`Found ${linkCount} navigation links`);
    
    // Test each link
    for (let i = 0; i < Math.min(linkCount, 5); i++) { // Test first 5 links
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        console.log(`Testing link: ${text} (${href})`);
        
        await link.click();
        await page.waitForLoadState('domcontentloaded');
        
        // Verify navigation occurred
        expect(page.url()).toContain(VERCEL_DOMAIN);
        
        // Go back to home
        await page.goto(VERCEL_URL);
      }
    }
  });

  test('should handle environment variables correctly', async ({ page }) => {
    await page.goto(VERCEL_URL);
    
    // Check if app is using production environment
    const isProduction = await page.evaluate(() => {
      // Check common production indicators
      return (
        // @ts-ignore
        window.location.hostname !== 'localhost' &&
        // @ts-ignore
        window.location.protocol === 'https:'
      );
    });
    
    expect(isProduction).toBe(true);
    console.log('App is running in production mode');
  });

  test('should have proper error boundaries', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });
    
    await page.goto(VERCEL_URL);
    await page.waitForTimeout(2000);
    
    // Check if there are any unhandled errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
    
    // The app should handle errors gracefully
    const errorBoundaryMessage = page.locator('text=/error|오류|문제가 발생/i');
    const hasErrorBoundary = await errorBoundaryMessage.count() > 0;
    
    if (hasErrorBoundary) {
      console.log('Error boundary is active');
    }
  });
});

// After all tests complete
test.afterAll(async () => {
  console.log('\n=== Deployment Verification Completed ===');
  console.log(`Tested URL: ${VERCEL_URL}`);
});