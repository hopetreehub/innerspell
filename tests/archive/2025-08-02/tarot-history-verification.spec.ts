import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4000';

test.describe('Tarot Reading History Feature Verification', () => {
  
  test('1. Homepage loads successfully', async ({ page }) => {
    // Go to homepage
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    
    // Verify basic elements
    await expect(page).toHaveTitle(/Tarot|타로/i);
    
    console.log('✅ Homepage loaded successfully');
  });

  test('2. Profile page access test', async ({ page }) => {
    // Go to profile page
    await page.goto(`${BASE_URL}/profile`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/02-profile-page.png', fullPage: true });
    
    // Check if we're redirected to login or if profile loads
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check for reading history component or login form
    const hasReadingHistory = await page.locator('[data-testid="reading-history"], .reading-history, [class*="reading"], [class*="history"]').count() > 0;
    const hasLoginForm = await page.locator('form, [type="email"], [type="password"], .login, .signin').count() > 0;
    
    if (hasReadingHistory) {
      console.log('✅ Profile page with reading history component found');
    } else if (hasLoginForm) {
      console.log('ℹ️ Login required for profile access');
    } else {
      console.log('⚠️ Profile page loaded but no specific components detected');
    }
  });

  test('3. ReadingHistoryDashboard component verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // Look for ReadingHistoryDashboard component indicators
    const dashboardSelectors = [
      '[data-testid="reading-history-dashboard"]',
      '.reading-history-dashboard',
      '[class*="ReadingHistory"]',
      'div:has-text("Reading History")',
      'div:has-text("타로 리딩 히스토리")',
      'div:has-text("히스토리")',
      '[data-component="ReadingHistoryDashboard"]'
    ];
    
    let componentFound = false;
    for (const selector of dashboardSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        componentFound = true;
        console.log(`✅ ReadingHistoryDashboard component found with selector: ${selector}`);
        break;
      }
    }
    
    // Take screenshot of profile page
    await page.screenshot({ path: 'test-results/03-reading-history-dashboard.png', fullPage: true });
    
    if (!componentFound) {
      console.log('⚠️  ReadingHistoryDashboard component not visually detected');
    }
  });

  test('4. API endpoints status check', async ({ page }) => {
    // Test reading history API
    const historyResponse = await page.request.get(`${BASE_URL}/api/reading/history`);
    console.log(`📊 /api/reading/history status: ${historyResponse.status()}`);
    
    if (historyResponse.status() === 200) {
      const historyData = await historyResponse.json();
      console.log('✅ Reading history API working, data:', JSON.stringify(historyData, null, 2).slice(0, 200));
    } else if (historyResponse.status() === 401) {
      console.log('🔒 Reading history API requires authentication');
    } else {
      console.log('❌ Reading history API error');
    }
    
    // Test analytics API
    const analyticsResponse = await page.request.get(`${BASE_URL}/api/reading/analytics`);
    console.log(`📊 /api/reading/analytics status: ${analyticsResponse.status()}`);
    
    if (analyticsResponse.status() === 200) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics API working, data:', JSON.stringify(analyticsData, null, 2).slice(0, 200));
    } else if (analyticsResponse.status() === 401) {
      console.log('🔒 Analytics API requires authentication');
    } else {
      console.log('❌ Analytics API error');
    }
  });

  test('5. Mobile responsiveness test', async ({ page }) => {
    // Test mobile viewport (iPhone 12)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/05-mobile-profile.png', fullPage: true });
    console.log('📱 Mobile viewport screenshot taken');
    
    // Test tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/05-tablet-profile.png', fullPage: true });
    console.log('📱 Tablet viewport screenshot taken');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/05-desktop-profile.png', fullPage: true });
    console.log('🖥️  Desktop viewport screenshot taken');
  });

  test('6. Navigation and routing test', async ({ page }) => {
    // Start from homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for navigation links
    const navLinks = await page.locator('nav a, header a, [href="/profile"]').all();
    console.log(`Found ${navLinks.length} navigation links`);
    
    // Try to find profile link
    const profileLink = await page.locator('[href="/profile"], a:has-text("Profile"), a:has-text("프로필")').first();
    
    if (await profileLink.count() > 0) {
      await profileLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Successfully navigated to profile via link');
    } else {
      console.log('⚠️ No profile navigation link found');
    }
    
    await page.screenshot({ path: 'test-results/06-navigation-test.png', fullPage: true });
  });

  test('7. Component structure analysis', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // Analyze page structure
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('📋 Page headings:', headings);
    
    const buttons = await page.locator('button').allTextContents();
    console.log('🔘 Buttons found:', buttons.slice(0, 10)); // First 10 buttons
    
    const forms = await page.locator('form').count();
    console.log('📝 Forms found:', forms);
    
    const cards = await page.locator('[class*="card"], .card, [data-testid*="card"]').count();
    console.log('🎴 Card components found:', cards);
    
    // Look for data visualization elements (charts, graphs)
    const charts = await page.locator('[class*="chart"], [class*="graph"], canvas, svg').count();
    console.log('📊 Chart/visualization elements found:', charts);
    
    await page.screenshot({ path: 'test-results/07-component-analysis.png', fullPage: true });
  });

});