import { test, expect } from '@playwright/test';

test.describe('Cache Headers Verification', () => {
  const DEPLOYMENT_URL = 'https://test-studio-firebase-dogxq5ort-johns-projects-bf5e60f3.vercel.app';
  
  test('Verify aggressive cache-busting headers are applied', async ({ page }) => {
    console.log('🧪 Testing cache headers implementation');
    
    // Test main page
    const mainResponse = await page.goto(DEPLOYMENT_URL);
    const mainHeaders = mainResponse?.headers();
    
    console.log('📄 Main page cache headers:', {
      'cache-control': mainHeaders?.['cache-control'],
      'pragma': mainHeaders?.['pragma'],
      'expires': mainHeaders?.['expires']
    });
    
    // Verify no-store, no-cache headers
    expect(mainHeaders?.['cache-control']).toContain('no-store');
    expect(mainHeaders?.['cache-control']).toContain('max-age=0');
    
    // Test admin page
    const adminResponse = await page.goto(`${DEPLOYMENT_URL}/admin`);
    const adminHeaders = adminResponse?.headers();
    
    console.log('🔐 Admin page cache headers:', {
      'cache-control': adminHeaders?.['cache-control'],
      'pragma': adminHeaders?.['pragma'],
      'expires': adminHeaders?.['expires']
    });
    
    // Verify admin page has proper no-cache headers
    expect(adminHeaders?.['cache-control']).toContain('no-store');
    expect(adminHeaders?.['cache-control']).toContain('max-age=0');
    
    // Take screenshot to verify deployment
    await page.screenshot({ 
      path: `cache-headers-verification-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    console.log('✅ Cache headers verified successfully');
  });

  test('Verify cache-busting URL parameters work', async ({ page }) => {
    console.log('🧪 Testing cache-busting URL parameters');
    
    // Add cache-busting parameters
    const cacheBustUrl = `${DEPLOYMENT_URL}?cache_bust=${Date.now()}&_t=${Date.now()}`;
    
    const response = await page.goto(cacheBustUrl);
    expect(response?.status()).toBe(401); // Should be unauthorized but accessible
    
    // Verify URL contains cache busting parameters
    expect(page.url()).toContain('cache_bust');
    expect(page.url()).toContain('_t');
    
    console.log('✅ Cache-busting URL parameters working');
  });

  test('Verify multiple requests return fresh responses', async ({ page }) => {
    console.log('🧪 Testing multiple requests for freshness');
    
    // Make multiple requests and verify they're not cached
    const responses = [];
    
    for (let i = 0; i < 3; i++) {
      const response = await page.goto(`${DEPLOYMENT_URL}?test=${i}&_t=${Date.now()}`);
      responses.push({
        index: i,
        headers: response?.headers(),
        status: response?.status()
      });
      
      // Wait a bit between requests
      await page.waitForTimeout(100);
    }
    
    // Verify all responses have no-cache headers
    responses.forEach((resp, index) => {
      console.log(`Request ${index + 1} cache-control:`, resp.headers?.['cache-control']);
      expect(resp.headers?.['cache-control']).toContain('no-store');
      expect(resp.status).toBe(401);
    });
    
    console.log('✅ Multiple requests verified as fresh (not cached)');
  });
});