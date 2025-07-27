/**
 * Push Notification QA Test Script - Local Development
 * Tests push notification functionality in admin dashboard using Playwright on localhost:4000
 */

const { chromium } = require('playwright');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:4000';
const SCREENSHOT_DIR = './push-notification-local-screenshots';
const TEST_ADMIN_EMAIL = 'admin@example.com';
const TEST_ADMIN_PASSWORD = 'test123';

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

async function testPushNotificationsLocal() {
  console.log('🔔 Starting Local Push Notification QA Test...');
  console.log(`📍 Testing on: ${BASE_URL}`);
  
  await createScreenshotDir();
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--allow-running-insecure-content',
      '--disable-blink-features=AutomationControlled',
      '--enable-notifications', // Enable notifications
      '--allow-insecure-localhost',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    permissions: ['notifications'], // Grant notification permissions
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    acceptDownloads: true,
    colorScheme: 'light'
  });

  const page = await context.newPage();

  // Log console messages for debugging
  page.on('console', msg => {
    const msgType = msg.type();
    if (msgType === 'error') {
      console.log('❌ Console Error:', msg.text());
    } else if (msg.text().includes('notification') || msg.text().includes('push') || msg.text().includes('service worker')) {
      console.log('🔔 Push/SW Log:', msg.text());
    } else if (msg.text().includes('admin') || msg.text().includes('auth')) {
      console.log('🔐 Auth Log:', msg.text());
    }
  });

  try {
    console.log('📱 Step 1: Navigating to homepage...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-homepage.png`, fullPage: true });
    console.log('✅ Homepage loaded successfully');

    console.log('🔐 Step 2: Navigating to admin dashboard directly...');
    // Try going directly to admin page first
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-admin-direct.png`, fullPage: true });

    // Check if we're redirected to sign-in
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/sign-in')) {
      console.log('🔐 Redirected to sign-in page, attempting login...');
      
      // Wait for sign-in form
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.screenshot({ path: `${SCREENSHOT_DIR}/03-signin-page.png`, fullPage: true });
      
      // Fill login form
      await page.fill('input[type="email"]', TEST_ADMIN_EMAIL);
      await page.fill('input[type="password"]', TEST_ADMIN_PASSWORD);
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait for login process
      await delay(3000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/04-after-login.png`, fullPage: true });
      
      // Check if login was successful
      const newUrl = page.url();
      if (!newUrl.includes('/admin')) {
        console.log('⚠️  Login might have failed, trying mock authentication...');
        
        // Mock admin authentication
        await page.evaluate(() => {
          // Mock user in localStorage
          const mockUser = {
            uid: 'mock-admin-uid',
            email: 'admin@example.com',
            role: 'admin',
            displayName: 'Test Admin'
          };
          localStorage.setItem('auth_user', JSON.stringify(mockUser));
          
          // Mock Firebase auth state
          window.__FIREBASE_AUTH_STATE__ = {
            user: mockUser,
            loading: false
          };
        });
        
        await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: `${SCREENSHOT_DIR}/05-mock-auth.png`, fullPage: true });
      }
    } else {
      console.log('⚠️  Already on admin page or different behavior, continuing...');
    }

    console.log('📊 Step 3: Looking for admin dashboard...');
    
    // Wait for page to load and check if we have admin access
    await page.waitForSelector('h1, [role="main"], body', { timeout: 10000 });
    
    const pageTitle = await page.locator('h1').first().textContent().catch(() => '');
    console.log('Page title:', pageTitle);
    
    // Look for admin elements
    const adminElements = await page.locator('text=/관리자|admin|dashboard/i').count();
    console.log('Found admin elements:', adminElements);
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-admin-dashboard.png`, fullPage: true });

    console.log('🔔 Step 4: Looking for Notifications tab...');
    
    // Look for various possible selectors for notifications tab
    const notificationSelectors = [
      'text=알림 설정',
      'text=알림',
      '[data-testid*="notification"]',
      '[aria-label*="notification"]',
      '.lucide-bell',
      '[data-lucide="bell"]',
      'text=Notifications',
      'button:has-text("알림")',
      'tab:has-text("알림")'
    ];
    
    let notificationTab = null;
    for (const selector of notificationSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          notificationTab = element;
          console.log(`✅ Found notifications tab with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (notificationTab) {
      console.log('🎯 Clicking on notifications tab...');
      await notificationTab.click();
      await delay(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/07-notifications-tab-active.png`, fullPage: true });
    } else {
      console.log('❌ Notifications tab not found. Available elements:');
      
      // Debug: Show all clickable elements
      const allButtons = await page.locator('button, [role="tab"], .tab').allTextContents();
      console.log('All buttons/tabs:', allButtons);
      
      const allText = await page.locator('body').textContent();
      const hasNotificationText = allText.includes('알림') || allText.includes('notification');
      console.log('Page contains notification text:', hasNotificationText);
      
      // Try to find any tabs
      const tabs = await page.locator('[role="tab"], [data-value], .tabs button').allTextContents();
      console.log('Found tabs:', tabs);
      
      // If we find notifications in the available tabs, try to click it
      if (tabs.some(tab => tab.includes('알림'))) {
        const notifTab = page.locator('[role="tab"]:has-text("알림"), [data-value*="notification"], .tabs button:has-text("알림")').first();
        await notifTab.click();
        await delay(2000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/07-found-notifications-tab.png`, fullPage: true });
      }
    }

    console.log('🔔 Step 5: Looking for push notification toggle component...');
    
    // Look for push notification related elements
    const pushNotificationSelectors = [
      'text=푸시 알림',
      'text=Push Notification',
      '[data-testid*="push"]',
      '.push-notification',
      'text=테스트 알림',
      'text=notification',
      'input[type="checkbox"]',
      'button[role="switch"]',
      '[aria-label*="알림"]'
    ];
    
    let pushComponent = null;
    for (const selector of pushNotificationSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          pushComponent = element;
          console.log(`✅ Found push notification component with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-push-notification-search.png`, fullPage: true });
    
    if (pushComponent) {
      console.log('🎯 Found push notification component!');
      
      // Look for toggle switch
      const toggle = page.locator('input[type="checkbox"], button[role="switch"], [data-state]').first();
      if (await toggle.isVisible()) {
        console.log('🔄 Testing notification toggle...');
        
        // Get initial state
        const initialState = await toggle.isChecked().catch(() => false);
        console.log('Initial toggle state:', initialState);
        
        // Click toggle
        await toggle.click();
        await delay(1000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/09-toggle-clicked.png`, fullPage: true });
        
        // Check if notification permission dialog appeared
        console.log('📋 Checking for permission dialog...');
        await delay(2000);
        
        // Check new state
        const newState = await toggle.isChecked().catch(() => false);
        console.log('New toggle state:', newState);
        
      } else {
        console.log('❌ Toggle switch not found');
      }
      
      // Look for test notification button
      const testButton = page.locator('text=테스트 알림, text=test notification, button:has-text("테스트"), button:has-text("알림")').first();
      if (await testButton.isVisible()) {
        console.log('📨 Found test notification button, clicking...');
        await testButton.click();
        await delay(3000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/10-test-button-clicked.png`, fullPage: true });
        console.log('✅ Test notification button clicked!');
      } else {
        console.log('❌ Test notification button not found');
      }
      
    } else {
      console.log('❌ Push notification component not found');
    }

    console.log('🔍 Step 6: Browser notification support check...');
    
    // Check browser support for notifications
    const notificationSupport = await page.evaluate(() => {
      return {
        notificationSupported: 'Notification' in window,
        serviceWorkerSupported: 'serviceWorker' in navigator,
        pushManagerSupported: 'PushManager' in window,
        notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unknown',
        userAgent: navigator.userAgent
      };
    });
    
    console.log('🔧 Browser Support Check:', notificationSupport);
    
    // Test service worker registration
    const swInfo = await page.evaluate(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        return {
          serviceWorkerRegistered: !!registration,
          swState: registration ? registration.active?.state : 'none',
          swScope: registration ? registration.scope : 'none'
        };
      } catch (error) {
        return {
          error: error.message,
          serviceWorkerRegistered: false
        };
      }
    });
    
    console.log('🔧 Service Worker Info:', swInfo);

    console.log('📝 Step 7: Final verification...');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/11-final-state.png`, fullPage: true });
    
    // Test manual notification request
    console.log('🔔 Testing manual notification permission...');
    const permissionResult = await page.evaluate(async () => {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          return { success: true, permission };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
      return { success: false, error: 'Notifications not supported' };
    });
    
    console.log('🔔 Permission result:', permissionResult);
    
    await page.screenshot({ path: `${SCREENSHOT_DIR}/12-permission-test.png`, fullPage: true });

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/error-final.png`, fullPage: true });
  }

  await browser.close();
  console.log('✅ Local push notification test completed!');
  console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
}

// Run the test
testPushNotificationsLocal().catch(console.error);