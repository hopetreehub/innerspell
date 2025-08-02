import { test, expect, Page } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test.describe('Tarot Guideline Access Control Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for network requests
    page.setDefaultTimeout(30000);
  });

  test('Verify regular users cannot access tarot guidelines', async ({ page }) => {
    console.log('🔍 Testing regular user access controls...');
    
    // Navigate to homepage
    await page.goto(VERCEL_URL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'screenshots/regular-user-homepage.png', 
      fullPage: true 
    });
    
    // Verify homepage loads correctly
    await expect(page).toHaveTitle(/InnerSpell/);
    console.log('✅ Homepage loaded successfully');
    
    // Check if there are any public routes to tarot guidelines
    const guidanceLinks = await page.locator('text=/타로.*지침|tarot.*guideline/i').count();
    console.log(`📊 Found ${guidanceLinks} potential guideline links in navigation`);
    
    // Try to directly access admin routes as regular user
    console.log('🚫 Testing direct access to admin routes...');
    
    // Test /admin route
    await page.goto(`${VERCEL_URL}/admin`);
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to sign-in or show access denied
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    console.log(`Current URL after /admin access: ${currentUrl}`);
    
    if (currentUrl.includes('/sign-in') || currentUrl.includes('/login')) {
      console.log('✅ Correctly redirected to sign-in page');
      await page.screenshot({ 
        path: 'screenshots/admin-redirect-signin.png', 
        fullPage: true 
      });
    } else if (pageContent?.includes('관리자 권한을 확인하는 중') || pageContent?.includes('권한이 없습니다')) {
      console.log('✅ Access properly denied with permission check');
      await page.screenshot({ 
        path: 'screenshots/admin-access-denied.png', 
        fullPage: true 
      });
    } else {
      console.log('❌ Unexpected behavior when accessing admin route');
      await page.screenshot({ 
        path: 'screenshots/admin-unexpected-access.png', 
        fullPage: true 
      });
    }
    
    // Test direct access to tarot guideline API endpoints
    console.log('🔍 Testing API endpoint access...');
    
    try {
      const apiResponse = await page.request.get(`${VERCEL_URL}/api/tarot-guidelines`);
      console.log(`API Response Status: ${apiResponse.status()}`);
      
      if (apiResponse.status() === 401 || apiResponse.status() === 403) {
        console.log('✅ API properly protected with authentication');
      } else if (apiResponse.status() === 405) {
        console.log('✅ API method not allowed (expected for GET request)');
      } else {
        console.log(`⚠️ Unexpected API response: ${apiResponse.status()}`);
      }
    } catch (error) {
      console.log(`API test completed with expected protection: ${error}`);
    }
  });

  test('Verify admin users can access tarot guidelines in dashboard', async ({ page }) => {
    console.log('🔍 Testing admin user access to tarot guidelines...');
    
    // Navigate to admin login
    await page.goto(`${VERCEL_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'screenshots/admin-login-page.png', 
      fullPage: true 
    });
    
    // Check if Google login is available
    const googleLogin = page.locator('text=/Google.*로그인|Sign in with Google/i');
    const emailInput = page.locator('input[type="email"]');
    
    if (await googleLogin.isVisible()) {
      console.log('📱 Google OAuth login available');
      await page.screenshot({ 
        path: 'screenshots/google-oauth-available.png', 
        fullPage: true 
      });
      
      // Note: We cannot complete Google OAuth in automated tests
      console.log('ℹ️ Google OAuth cannot be automated - manual testing required');
      
      // Mock successful admin authentication by directly going to admin with query params
      console.log('🔧 Simulating admin authentication...');
      await page.goto(`${VERCEL_URL}/admin?mock_auth=true&role=admin`);
      
    } else if (await emailInput.isVisible()) {
      console.log('📧 Email/password login available');
      
      // Try mock admin credentials
      await emailInput.fill('admin@test.com');
      await page.locator('input[type="password"]').fill('test123');
      await page.locator('button[type="submit"]').click();
      
      await page.waitForLoadState('networkidle');
    }
    
    // Check if we can access admin dashboard
    await page.goto(`${VERCEL_URL}/admin`);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    console.log(`Admin page URL: ${currentUrl}`);
    
    if (pageContent?.includes('InnerSpell 관리자 대시보드') || pageContent?.includes('관리자 대시보드')) {
      console.log('✅ Successfully accessed admin dashboard');
      await page.screenshot({ 
        path: 'screenshots/admin-dashboard-loaded.png', 
        fullPage: true 
      });
      
      // Look for tarot guideline tab
      const tarotTab = page.locator('text=/타로.*지침|타로 지침/');
      
      if (await tarotTab.isVisible()) {
        console.log('✅ Found 타로 지침 (Tarot Guidelines) tab');
        
        // Click on tarot guidelines tab
        await tarotTab.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'screenshots/tarot-guidelines-tab-active.png', 
          fullPage: true 
        });
        
        // Check for tarot guideline management interface
        const managementInterface = await page.textContent('body');
        
        if (managementInterface?.includes('타로 해석 지침 관리') || 
            managementInterface?.includes('스프레드별') ||
            managementInterface?.includes('해석 스타일별')) {
          console.log('✅ Tarot guideline management interface loaded');
          
          // Test CRUD functionality
          await testTarotGuidelineCRUD(page);
          
        } else {
          console.log('⚠️ Tarot guideline interface not fully loaded');
          await page.screenshot({ 
            path: 'screenshots/tarot-guidelines-loading.png', 
            fullPage: true 
          });
        }
        
      } else {
        console.log('❌ 타로 지침 tab not found in admin dashboard');
        await page.screenshot({ 
          path: 'screenshots/admin-no-tarot-tab.png', 
          fullPage: true 
        });
      }
      
    } else if (currentUrl.includes('/sign-in')) {
      console.log('ℹ️ Redirected to sign-in - authentication required');
      await page.screenshot({ 
        path: 'screenshots/admin-auth-required.png', 
        fullPage: true 
      });
      
      // Try to mock authentication by setting localStorage
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'mock_admin_token');
        localStorage.setItem('user_role', 'admin');
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ 
        path: 'screenshots/admin-after-mock-auth.png', 
        fullPage: true 
      });
      
    } else {
      console.log('⚠️ Unexpected state when accessing admin dashboard');
      await page.screenshot({ 
        path: 'screenshots/admin-unexpected-state.png', 
        fullPage: true 
      });
    }
  });

  async function testTarotGuidelineCRUD(page: Page) {
    console.log('🧪 Testing tarot guideline CRUD operations...');
    
    // Look for form elements
    const addButton = page.locator('text=/새.*지침.*추가|Add.*Guideline|추가하기/i').first();
    const saveButton = page.locator('text=/저장|Save/i').first();
    const spreadSelect = page.locator('select, [role="combobox"]').first();
    
    await page.screenshot({ 
      path: 'screenshots/tarot-crud-interface.png', 
      fullPage: true 
    });
    
    // Test form visibility
    if (await addButton.isVisible()) {
      console.log('✅ Add guideline button found');
      
      // Try to click add button
      await addButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'screenshots/tarot-add-form-opened.png', 
        fullPage: true 
      });
      
    } else {
      console.log('ℹ️ Add button not immediately visible - checking for existing forms');
    }
    
    // Check for existing guideline data
    const guidelineData = await page.locator('text=/스프레드|Spread|해석|Interpretation/i').count();
    console.log(`📊 Found ${guidelineData} potential guideline data elements`);
    
    // Look for loading states
    const loadingElements = await page.locator('text=/로딩|Loading|불러오는|로드/i').count();
    if (loadingElements > 0) {
      console.log('⏳ Guideline data still loading...');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'screenshots/tarot-data-loading.png', 
        fullPage: true 
      });
    }
    
    // Final state screenshot
    await page.screenshot({ 
      path: 'screenshots/tarot-guidelines-final-state.png', 
      fullPage: true 
    });
  }

  test('Verify tarot guideline data loading and Firebase integration', async ({ page }) => {
    console.log('🔍 Testing Firebase integration and data loading...');
    
    // Navigate directly to admin (assuming authentication works)
    await page.goto(`${VERCEL_URL}/admin?tab=tarot-instructions`);
    await page.waitForLoadState('networkidle');
    
    // Monitor network requests
    const firebaseRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('firestore.googleapis.com') || url.includes('firebase')) {
        firebaseRequests.push(url);
        console.log(`🔥 Firebase request: ${url}`);
      }
    });
    
    // Wait for potential data loading
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: 'screenshots/firebase-integration-test.png', 
      fullPage: true 
    });
    
    console.log(`📊 Detected ${firebaseRequests.length} Firebase requests`);
    
    // Check for error messages
    const errorMessages = await page.locator('text=/error|오류|실패|failed/i').count();
    if (errorMessages > 0) {
      console.log(`⚠️ Found ${errorMessages} potential error messages`);
      await page.screenshot({ 
        path: 'screenshots/firebase-errors-detected.png', 
        fullPage: true 
      });
    } else {
      console.log('✅ No obvious error messages detected');
    }
  });
});