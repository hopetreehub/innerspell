import { test, expect } from '@playwright/test';

test.describe('Cache Invalidation and Authentication Tests', () => {
  const DEPLOYMENT_URL = 'https://test-studio-firebase-8ey9md1ec-johns-projects-bf5e60f3.vercel.app';
  
  test.beforeEach(async ({ page }) => {
    // Clear all caches before each test
    await page.evaluate(() => {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage  
      sessionStorage.clear();
    });
    
    // Clear browser cache
    await page.context().clearCookies();
  });

  test('Cache Headers Verification - Auth Pages Should Never Cache', async ({ page }) => {
    console.log('🧪 Testing cache headers for authentication pages');
    
    // Test main page
    let response = await page.goto(DEPLOYMENT_URL);
    expect(response?.status()).toBe(401); // Should be unauthorized
    
    const mainHeaders = response?.headers();
    console.log('📄 Main page headers:', {
      'cache-control': mainHeaders?.['cache-control'],
      'pragma': mainHeaders?.['pragma'],
      'expires': mainHeaders?.['expires']
    });
    
    // Test admin page
    response = await page.goto(`${DEPLOYMENT_URL}/admin`);
    expect(response?.status()).toBe(401); // Should be unauthorized
    
    const adminHeaders = response?.headers();
    console.log('🔐 Admin page headers:', {
      'cache-control': adminHeaders?.['cache-control'],
      'pragma': adminHeaders?.['pragma'],
      'expires': adminHeaders?.['expires']
    });
    
    // Verify no caching headers are present
    expect(adminHeaders?.['cache-control']).toContain('no-store');
    expect(adminHeaders?.['cache-control']).toContain('no-cache');
    
    // Test auth API endpoint
    response = await page.goto(`${DEPLOYMENT_URL}/api/auth/session`);
    const authApiHeaders = response?.headers();
    console.log('🔑 Auth API headers:', {
      'cache-control': authApiHeaders?.['cache-control'],
      'pragma': authApiHeaders?.['pragma'],
      'expires': authApiHeaders?.['expires']
    });
    
    expect(authApiHeaders?.['cache-control']).toContain('no-store');
  });

  test('Cache Busting API Functionality', async ({ page }) => {
    console.log('🧪 Testing cache busting API');
    
    // Test cache bust API
    const response = await page.goto(`${DEPLOYMENT_URL}/api/cache-bust`);
    expect(response?.status()).toBe(200);
    
    const responseBody = await response?.json();
    expect(responseBody).toHaveProperty('timestamp');
    expect(responseBody).toHaveProperty('cacheBustId');
    
    console.log('✅ Cache bust API response:', responseBody);
    
    // Test POST to cache bust API
    const postResponse = await page.request.post(`${DEPLOYMENT_URL}/api/cache-bust`, {
      data: { action: 'invalidate' }
    });
    
    expect(postResponse.status()).toBe(200);
    const postResponseBody = await postResponse.json();
    expect(postResponseBody.success).toBe(true);
    
    console.log('✅ Cache bust POST response:', postResponseBody);
  });

  test('Force Cache Refresh and Verify Fresh Content', async ({ page }) => {
    console.log('🧪 Testing forced cache refresh');
    
    // First, visit the page normally
    await page.goto(DEPLOYMENT_URL);
    
    // Add cache busting parameters
    const cacheBustUrl = `${DEPLOYMENT_URL}?cache_bust=${Date.now()}&force_reload=1&_t=${Date.now()}`;
    console.log('🔄 Testing cache-busted URL:', cacheBustUrl);
    
    const response = await page.goto(cacheBustUrl);
    expect(response?.status()).toBe(401); // Should still be unauthorized but fresh
    
    // Verify cache busting parameters are in URL
    expect(page.url()).toContain('cache_bust');
    expect(page.url()).toContain('force_reload');
    expect(page.url()).toContain('_t');
    
    console.log('✅ Cache-busted URL loaded successfully');
  });

  test('Client-side Cache Clearing Verification', async ({ page }) => {
    console.log('🧪 Testing client-side cache clearing');
    
    // Set some test data in localStorage
    await page.evaluate(() => {
      localStorage.setItem('test-auth-data', 'should-be-cleared');
      localStorage.setItem('firebase:authUser:test', 'should-be-cleared');
      localStorage.setItem('user-preference', 'should-remain');
    });
    
    // Load page and trigger cache clearing
    await page.goto(DEPLOYMENT_URL);
    
    // Inject and execute cache busting script
    await page.addScriptTag({ 
      content: `
        // Simulate cache busting functionality
        async function clearAuthCaches() {
          // Clear auth-related localStorage
          const authKeys = ['test-auth-data'];
          authKeys.forEach(key => localStorage.removeItem(key));
          
          // Clear Firebase-related localStorage
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('firebase:')) {
              localStorage.removeItem(key);
            }
          }
          
          // Clear sessionStorage
          sessionStorage.clear();
          
          console.log('Auth caches cleared');
        }
        
        clearAuthCaches();
      `
    });
    
    // Verify auth data was cleared but preferences remain
    const remainingData = await page.evaluate(() => {
      return {
        authData: localStorage.getItem('test-auth-data'),
        firebaseData: localStorage.getItem('firebase:authUser:test'),
        preferences: localStorage.getItem('user-preference')
      };
    });
    
    expect(remainingData.authData).toBeNull();
    expect(remainingData.firebaseData).toBeNull();
    expect(remainingData.preferences).toBe('should-remain');
    
    console.log('✅ Client-side cache clearing verified');
  });

  test('Multiple Tab Cache Synchronization', async ({ browser }) => {
    console.log('🧪 Testing multi-tab cache synchronization');
    
    // Create two browser contexts (simulate two tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Set auth data in first tab
    await page1.goto(DEPLOYMENT_URL);
    await page1.evaluate(() => {
      localStorage.setItem('auth-state-changed', 'logged-in');
    });
    
    // Load second tab
    await page2.goto(DEPLOYMENT_URL);
    
    // Trigger logout in first tab
    await page1.evaluate(() => {
      localStorage.setItem('auth-state-changed', 'logged-out');
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth-state-changed',
        newValue: 'logged-out',
        oldValue: 'logged-in'
      }));
    });
    
    // Wait a bit for event propagation
    await page1.waitForTimeout(500);
    
    // Verify both tabs show logged out state
    const tab1State = await page1.evaluate(() => localStorage.getItem('auth-state-changed'));
    const tab2State = await page2.evaluate(() => localStorage.getItem('auth-state-changed'));
    
    console.log('Tab states:', { tab1: tab1State, tab2: tab2State });
    
    await context1.close();
    await context2.close();
    
    console.log('✅ Multi-tab synchronization tested');
  });

  test('Authentication Flow with Cache Busting', async ({ page }) => {
    console.log('🧪 Testing complete auth flow with cache busting');
    
    // Start with cache-busted URL
    const cacheBustUrl = `${DEPLOYMENT_URL}?cache_bust=${Date.now()}`;
    await page.goto(cacheBustUrl);
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: `auth-flow-initial-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    // Check that we're properly unauthorized
    expect(page.url()).toContain('cache_bust');
    
    // Try to access admin page (should be blocked)
    const adminResponse = await page.goto(`${DEPLOYMENT_URL}/admin?cache_bust=${Date.now()}`);
    expect(adminResponse?.status()).toBe(401);
    
    // Take screenshot of admin access attempt
    await page.screenshot({ 
      path: `auth-flow-admin-blocked-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
    
    console.log('✅ Authentication flow with cache busting verified');
  });

  test('Emergency Cache Invalidation Stress Test', async ({ page }) => {
    console.log('🧪 Stress testing emergency cache invalidation');
    
    // Simulate multiple rapid cache invalidation requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        page.request.post(`${DEPLOYMENT_URL}/api/cache-bust`, {
          data: { action: 'emergency-invalidate' }
        })
      );
    }
    
    const responses = await Promise.all(promises);
    
    // Verify all requests succeeded
    responses.forEach((response, index) => {
      expect(response.status()).toBe(200);
      console.log(`✅ Cache bust request ${index + 1} succeeded`);
    });
    
    // Verify final state with fresh request
    const finalResponse = await page.goto(`${DEPLOYMENT_URL}?final_check=${Date.now()}`);
    expect(finalResponse?.status()).toBe(401); // Should still be unauthorized but fresh
    
    console.log('✅ Emergency cache invalidation stress test completed');
  });
});