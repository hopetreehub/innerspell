/**
 * Final Push Notification QA Test
 * Complete test of the admin notification functionality
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:4000';
const SCREENSHOT_DIR = './admin-notifications-final-screenshots';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createScreenshotDir() {
  const fs = require('fs').promises;
  try {
    await fs.access(SCREENSHOT_DIR);
  } catch {
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  }
}

async function testAdminNotifications() {
  console.log('🔔 Starting Final Admin Notification Test...');
  console.log('📍 Target:', BASE_URL);
  
  await createScreenshotDir();
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--enable-notifications',
      '--allow-insecure-localhost',
      '--disable-web-security',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    permissions: ['notifications']
  });

  const page = await context.newPage();

  // Enhanced console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('notification') || text.includes('push') || text.includes('알림') || text.includes('admin')) {
      console.log(`🔔 [${msg.type()}]`, text);
    }
  });

  try {
    console.log('📱 Step 1: Navigate to admin page...');
    await page.goto(`${BASE_URL}/admin`, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    await delay(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-initial-admin-access.png`, fullPage: true });

    console.log('🔐 Step 2: Use development admin login...');
    
    // Look for the admin login button in development mode
    const adminLoginButton = page.locator('text=🔐 관리자로 로그인');
    if (await adminLoginButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found development admin login button');
      await adminLoginButton.click();
      await delay(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/02-after-admin-login.png`, fullPage: true });
    } else {
      console.log('❌ Admin login button not found, trying direct auth...');
      
      // Mock admin state directly
      await page.evaluate(() => {
        const mockUser = {
          uid: 'dev-admin-uid',
          email: 'admin@innerspell.com',
          role: 'admin',
          displayName: 'Development Admin'
        };
        
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        window.__FIREBASE_AUTH_STATE__ = { user: mockUser, loading: false };
      });
      
      await page.reload({ waitUntil: 'domcontentloaded' });
      await delay(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/02-mock-admin-auth.png`, fullPage: true });
    }

    console.log('📊 Step 3: Verify admin dashboard access...');
    
    // Wait for admin dashboard to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check for admin dashboard indicators
    const pageText = await page.textContent('body');
    const isAdminDashboard = pageText.includes('관리자') || pageText.includes('대시보드') || pageText.includes('admin');
    console.log('Is admin dashboard:', isAdminDashboard);
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-admin-dashboard-check.png`, fullPage: true });

    console.log('🔔 Step 4: Find notifications tab...');
    
    // Look for notifications tab with multiple strategies
    const notificationSelectors = [
      'text=알림 설정',
      'text=알림',
      '[data-value="notifications"]',
      'button:has-text("알림")',
      '[role="tab"]:has-text("알림")',
      '.lucide-bell',
      '[data-lucide="bell"]'
    ];
    
    let notificationTabFound = false;
    for (const selector of notificationSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found notifications tab: ${selector}`);
          await element.click();
          await delay(2000);
          notificationTabFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-notifications-tab-search.png`, fullPage: true });
    
    if (notificationTabFound) {
      console.log('🎯 Notifications tab activated!');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/05-notifications-tab-active.png`, fullPage: true });
    } else {
      console.log('⚠️  Notifications tab not found, showing available tabs...');
      const availableTabs = await page.locator('[role="tab"], .tab, button').allTextContents();
      console.log('Available tabs:', availableTabs.filter(tab => tab.trim() !== '').slice(0, 10));
    }

    console.log('🔔 Step 5: Test push notification components...');
    
    // Look for push notification related components
    const pushComponentSelectors = [
      'text=푸시 알림',
      'text=Push Notification',
      'text=테스트 알림',
      '.push-notification',
      '[data-testid*="push"]',
      '[data-testid*="notification"]'
    ];
    
    let pushComponentFound = false;
    for (const selector of pushComponentSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found push component: ${selector}`);
          pushComponentFound = true;
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-push-component-search.png`, fullPage: true });
    
    if (pushComponentFound) {
      console.log('🎯 Testing push notification toggle...');
      
      // Test toggle functionality
      const toggle = page.locator('input[type="checkbox"], button[role="switch"], [data-state]').first();
      if (await toggle.isVisible({ timeout: 3000 })) {
        console.log('🔄 Found toggle, testing...');
        await toggle.click();
        await delay(1000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/07-toggle-test.png`, fullPage: true });
      }
      
      // Test notification button
      const testButton = page.locator('text=테스트 알림, button:has-text("테스트"), button:has-text("보내기")').first();
      if (await testButton.isVisible({ timeout: 3000 })) {
        console.log('📨 Found test notification button, clicking...');
        await testButton.click();
        await delay(2000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/08-test-notification.png`, fullPage: true });
      }
    }

    console.log('🔍 Step 6: Browser API verification...');
    
    // Test browser notification APIs comprehensively
    const apiTest = await page.evaluate(async () => {
      const results = {
        notificationSupport: 'Notification' in window,
        serviceWorkerSupport: 'serviceWorker' in navigator,
        pushManagerSupport: 'PushManager' in window,
        currentPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unknown'
      };
      
      try {
        // Request notification permission
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          results.permissionRequested = permission;
          
          // Try to create a test notification
          if (permission === 'granted') {
            const notification = new Notification('InnerSpell QA Test', {
              body: 'Push notification system is working correctly!',
              icon: '/favicon.ico',
              tag: 'qa-test'
            });
            
            results.testNotificationCreated = true;
            
            // Close after 3 seconds
            setTimeout(() => notification.close(), 3000);
          }
        }
        
        // Test service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          results.serviceWorkerRegistered = !!registration;
          if (registration) {
            results.serviceWorkerState = registration.active?.state || 'unknown';
          }
        }
        
      } catch (error) {
        results.error = error.message;
      }
      
      return results;
    });
    
    console.log('🔔 Browser API Test Results:', apiTest);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/09-api-test-complete.png`, fullPage: true });

    console.log('📊 Step 7: Final verification and summary...');
    
    // Get final page state
    const finalState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasNotificationText: document.body.textContent.includes('알림') || document.body.textContent.includes('notification'),
        pushManagerAvailable: 'PushManager' in window,
        notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unknown'
      };
    });
    
    console.log('📋 Final State:', finalState);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/10-final-verification.png`, fullPage: true });

    // Test summary
    console.log('\n📊 QA TEST SUMMARY:');
    console.log('✅ Browser Notification Support:', apiTest.notificationSupport);
    console.log('✅ Service Worker Support:', apiTest.serviceWorkerSupport);
    console.log('✅ Push Manager Support:', apiTest.pushManagerSupport);
    console.log('✅ Notification Permission:', apiTest.permissionRequested || apiTest.currentPermission);
    console.log('✅ Test Notification Created:', apiTest.testNotificationCreated || false);
    console.log('✅ Service Worker Registered:', apiTest.serviceWorkerRegistered || false);
    console.log('✅ Admin Dashboard Accessed:', isAdminDashboard);
    console.log('✅ Notifications Tab Found:', notificationTabFound);
    console.log('✅ Push Component Found:', pushComponentFound);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/error-final.png`, fullPage: true });
  }

  await browser.close();
  console.log('\n🎉 Admin notifications QA test completed!');
  console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
}

testAdminNotifications().catch(console.error);