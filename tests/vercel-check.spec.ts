import { test, expect } from '@playwright/test';

test.describe('Vercel Deployment Check', () => {
  const vercelUrl = 'https://test-studio-firebase-jcxnmfrz0-johns-projects-bf5e60f3.vercel.app';

  test('should load Vercel deployment homepage', async ({ page }) => {
    await page.goto(vercelUrl);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'vercel-homepage-screenshot.png',
      fullPage: true 
    });
    
    // Basic checks
    expect(page.url()).toBe(vercelUrl + '/');
    
    // Check if page has loaded successfully (no error page)
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Check if there's any content on the page
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
    
    console.log('Vercel deployment is accessible and loaded successfully');
  });

  test('should check navigation and key features', async ({ page }) => {
    await page.goto(vercelUrl);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of main page
    await page.screenshot({ 
      path: 'vercel-main-features-screenshot.png',
      fullPage: true 
    });
    
    // Check for common navigation elements
    const navigation = await page.locator('nav, header, [role="navigation"]').first();
    if (await navigation.isVisible()) {
      console.log('Navigation element found');
    }
    
    // Check for any interactive elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    
    console.log(`Found ${buttons} buttons and ${links} links on the page`);
    
    // Test if any forms are present and functional
    const forms = await page.locator('form').count();
    if (forms > 0) {
      console.log(`Found ${forms} forms on the page`);
      await page.screenshot({ 
        path: 'vercel-forms-screenshot.png',
        fullPage: true 
      });
    }
  });

  test('should check API endpoints if available', async ({ page }) => {
    // Check if health endpoint exists
    try {
      const healthResponse = await page.request.get(`${vercelUrl}/api/health`);
      console.log('Health endpoint status:', healthResponse.status());
      
      if (healthResponse.ok()) {
        const healthData = await healthResponse.text();
        console.log('Health endpoint response:', healthData);
      }
    } catch (error) {
      console.log('Health endpoint not available or error:', error);
    }
    
    // Check for other common API endpoints
    const commonEndpoints = ['/api/auth', '/api/user', '/api/data'];
    
    for (const endpoint of commonEndpoints) {
      try {
        const response = await page.request.get(`${vercelUrl}${endpoint}`);
        console.log(`${endpoint} status:`, response.status());
      } catch (error) {
        console.log(`${endpoint} not available`);
      }
    }
  });
});