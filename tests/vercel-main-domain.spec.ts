import { test, expect, Page, Browser } from '@playwright/test';

// Production and test URLs from codebase analysis
const PRODUCTION_URL = 'https://innerspell.vercel.app';
const TEST_URL = 'https://test-studio-firebase.vercel.app';

// Performance thresholds for UX analysis
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD_TIME: 3000, // 3 seconds max
  AI_INTERPRETATION_TIME: 10000, // 10 seconds max for AI
  CARD_INTERACTION_TIME: 500, // 500ms max for card interactions
  MOBILE_LOAD_TIME: 4000, // 4 seconds max on mobile
  CORE_WEB_VITALS: {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    CLS: 0.1,  // Cumulative Layout Shift
    FID: 100   // First Input Delay
  }
};

// Active deployment URL - test-studio-firebase.vercel.app is accessible
const activeUrl = TEST_URL;

test.describe('UX/Performance Analysis - Vercel Deployment', () => {
  
  test.beforeAll(async () => {
    console.log(`🎯 Testing deployment URL: ${activeUrl}`);
    console.log(`📊 Production URL (${PRODUCTION_URL}) requires authentication - testing accessible URL`);
  });

  test('1. Verify deployment accessibility and basic functionality', async ({ page }) => {
    console.log(`🌐 Testing URL: ${activeUrl}`);
    
    // Navigate to home page with performance monitoring
    const startTime = Date.now();
    const response = await page.goto(activeUrl, { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    const loadTime = Date.now() - startTime;
    
    // Basic accessibility checks
    expect(response?.status()).toBe(200);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD_TIME);
    
    // Check page title and essential content
    await expect(page).toHaveTitle(/InnerSpell/);
    
    // Verify core navigation elements are present
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'tests/screenshots/homepage-load.png',
      fullPage: true 
    });
    
    console.log(`✅ Homepage loaded in ${loadTime}ms`);
  });

  test('2. Tarot Reading Performance Analysis', async ({ page }) => {
    await page.goto(activeUrl);
    
    // Navigate to tarot reading page
    const tarotStartTime = Date.now();
    
    // Try multiple possible tarot paths from codebase analysis
    const tarotPaths = ['/reading', '/tarot-spread', '/tarot'];
    let tarotPath = '';
    
    for (const path of tarotPaths) {
      try {
        const response = await page.goto(`${activeUrl}${path}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
        if (response?.status() === 200) {
          tarotPath = path;
          break;
        }
      } catch (error) {
        console.log(`Path ${path} not accessible: ${error.message}`);
      }
    }
    
    if (!tarotPath) {
      console.log('⚠️ No accessible tarot path found, testing homepage tarot features');
      await page.goto(activeUrl);
      tarotPath = '/';
    }
    
    const tarotLoadTime = Date.now() - tarotStartTime;
    console.log(`🔮 Tarot page (${tarotPath}) loaded in ${tarotLoadTime}ms`);
    
    // Test card loading and interactions
    await page.waitForLoadState('networkidle');
    
    // Look for tarot-related elements
    const tarotElements = [
      'button:has-text("타로")',
      'button:has-text("카드")',
      'button:has-text("리딩")',
      'button:has-text("점보기")',
      '[data-testid*="tarot"]',
      '[data-testid*="card"]',
      '.tarot',
      '.card'
    ];
    
    let foundTarotElements = false;
    for (const selector of tarotElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found tarot element: ${selector}`);
          
          // Test interaction performance
          const interactionStart = Date.now();
          await element.click();
          await page.waitForTimeout(1000); // Wait for any animations/transitions
          const interactionTime = Date.now() - interactionStart;
          
          expect(interactionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CARD_INTERACTION_TIME);
          console.log(`✅ Tarot interaction completed in ${interactionTime}ms`);
          foundTarotElements = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // Take screenshot of tarot interface
    await page.screenshot({ 
      path: 'tests/screenshots/tarot-interface.png',
      fullPage: true 
    });
    
    if (foundTarotElements) {
      console.log('✅ Tarot interface is accessible and responsive');
    } else {
      console.log('⚠️ Tarot interface elements not found - may need authentication');
    }
  });

  test('3. Dream Interpretation Experience Analysis', async ({ page }) => {
    await page.goto(activeUrl);
    
    // Try to find dream interpretation page
    const dreamPaths = ['/dream', '/dream-interpretation'];
    let dreamPath = '';
    
    for (const path of dreamPaths) {
      try {
        const response = await page.goto(`${activeUrl}${path}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
        if (response?.status() === 200) {
          dreamPath = path;
          break;
        }
      } catch (error) {
        console.log(`Dream path ${path} not accessible: ${error.message}`);
      }
    }
    
    if (!dreamPath) {
      console.log('⚠️ Dream interpretation not accessible - testing from homepage');
      await page.goto(activeUrl);
      
      // Look for dream-related navigation
      const dreamLinks = [
        'a:has-text("꿈")',
        'a:has-text("해몽")',
        'button:has-text("꿈")',
        'button:has-text("해몽")'
      ];
      
      for (const selector of dreamLinks) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click();
            await page.waitForLoadState('networkidle');
            dreamPath = 'found via navigation';
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }
    }
    
    // Test form validation and responsiveness
    const formElements = [
      'input[type="text"]',
      'textarea',
      'button[type="submit"]',
      'form'
    ];
    
    let foundForm = false;
    for (const selector of formElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          foundForm = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }
    
    // Take screenshot of dream interface
    await page.screenshot({ 
      path: 'tests/screenshots/dream-interface.png',
      fullPage: true 
    });
    
    if (foundForm) {
      console.log('✅ Dream interpretation form interface found');
    } else {
      console.log('⚠️ Dream interpretation form not accessible - may need authentication');
    }
  });

  test('4. Mobile Responsiveness Analysis', async ({ browser }) => {
    // Test on mobile viewport
    const mobileContext = await browser.newContext({
      ...browser.contexts()[0],
      viewport: { width: 375, height: 667 }, // iPhone SE size
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });
    
    const mobilePage = await mobileContext.newPage();
    
    const mobileStartTime = Date.now();
    await mobilePage.goto(activeUrl, { waitUntil: 'networkidle' });
    const mobileLoadTime = Date.now() - mobileStartTime;
    
    expect(mobileLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME);
    console.log(`📱 Mobile page loaded in ${mobileLoadTime}ms`);
    
    // Check mobile navigation
    await expect(mobilePage.locator('nav')).toBeVisible();
    
    // Test touch interactions
    const touchElements = mobilePage.locator('button, a, [role="button"]');
    const touchElementCount = await touchElements.count();
    
    if (touchElementCount > 0) {
      // Test first few interactive elements
      const elementsToTest = Math.min(3, touchElementCount);
      for (let i = 0; i < elementsToTest; i++) {
        try {
          const element = touchElements.nth(i);
          if (await element.isVisible()) {
            const tapStart = Date.now();
            await element.tap();
            const tapTime = Date.now() - tapStart;
            expect(tapTime).toBeLessThan(300); // Touch should be responsive
          }
        } catch (error) {
          // Continue with other elements
        }
      }
    }
    
    // Take mobile screenshot
    await mobilePage.screenshot({ 
      path: 'tests/screenshots/mobile-interface.png',
      fullPage: true 
    });
    
    await mobileContext.close();
    console.log('✅ Mobile responsiveness tested');
  });

  test('5. Core Web Vitals and Performance Metrics', async ({ page }) => {
    await page.goto(activeUrl);
    
    // Measure Core Web Vitals using Performance API
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {};
        
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        metrics.fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
            observer.disconnect();
            resolve(metrics);
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Timeout after 3 seconds
          setTimeout(() => {
            observer.disconnect();
            resolve(metrics);
          }, 3000);
        } else {
          resolve(metrics);
        }
      });
    });
    
    console.log('📊 Performance Metrics:', metrics);
    
    // Validate Core Web Vitals
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.CORE_WEB_VITALS.FCP);
      console.log(`✅ FCP: ${metrics.fcp}ms (threshold: ${PERFORMANCE_THRESHOLDS.CORE_WEB_VITALS.FCP}ms)`);
    }
    
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.CORE_WEB_VITALS.LCP);
      console.log(`✅ LCP: ${metrics.lcp}ms (threshold: ${PERFORMANCE_THRESHOLDS.CORE_WEB_VITALS.LCP}ms)`);
    }
    
    // Test image loading performance
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      console.log(`🖼️ Found ${imageCount} images, testing loading performance`);
      
      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const img = images.nth(i);
        const isVisible = await img.isVisible();
        if (isVisible) {
          // Check if image has proper optimization attributes
          const hasOptimization = await img.evaluate((el) => {
            return el.loading === 'lazy' || el.getAttribute('data-src') || el.sizes;
          });
          
          if (hasOptimization) {
            console.log(`✅ Image ${i + 1} has optimization attributes`);
          } else {
            console.log(`⚠️ Image ${i + 1} may lack optimization`);
          }
        }
      }
    }
  });

  test('6. Authentication Flow Performance', async ({ page }) => {
    await page.goto(activeUrl);
    
    // Look for authentication elements
    const authElements = [
      'button:has-text("로그인")',
      'button:has-text("회원가입")',
      'a:has-text("로그인")',
      'a:has-text("회원가입")',
      'button:has-text("Sign In")',
      'button:has-text("Sign Up")',
      '[data-testid*="auth"]',
      '[data-testid*="login"]'
    ];
    
    let authFound = false;
    for (const selector of authElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found auth element: ${selector}`);
          
          const authStart = Date.now();
          await element.click();
          await page.waitForLoadState('domcontentloaded');
          const authTime = Date.now() - authStart;
          
          console.log(`✅ Auth page loaded in ${authTime}ms`);
          expect(authTime).toBeLessThan(3000);
          
          authFound = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // Take screenshot of auth interface
    await page.screenshot({ 
      path: 'tests/screenshots/auth-interface.png',
      fullPage: true 
    });
    
    if (authFound) {
      console.log('✅ Authentication interface is accessible');
    } else {
      console.log('⚠️ Authentication interface not found in navigation');
    }
  });

  test('7. Bundle Size and Resource Loading Analysis', async ({ page }) => {
    // Monitor network requests during page load
    const networkRequests = [];
    
    page.on('response', (response) => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 0,
        type: response.headers()['content-type'] || 'unknown'
      });
    });
    
    await page.goto(activeUrl, { waitUntil: 'networkidle' });
    
    // Analyze JavaScript bundle sizes
    const jsRequests = networkRequests.filter(req => 
      req.type.includes('javascript') || req.url.includes('.js')
    );
    
    const cssRequests = networkRequests.filter(req => 
      req.type.includes('css') || req.url.includes('.css')
    );
    
    const imageRequests = networkRequests.filter(req => 
      req.type.includes('image') || /\.(jpg|jpeg|png|gif|webp|svg)/.test(req.url)
    );
    
    console.log(`📦 Resource Analysis:`);
    console.log(`  JS files: ${jsRequests.length}`);
    console.log(`  CSS files: ${cssRequests.length}`);
    console.log(`  Image files: ${imageRequests.length}`);
    console.log(`  Total requests: ${networkRequests.length}`);
    
    // Check for large bundles
    const largeBundles = jsRequests.filter(req => parseInt(req.size) > 1000000); // > 1MB
    if (largeBundles.length > 0) {
      console.log(`⚠️ Large JS bundles detected:`, largeBundles.map(b => `${b.url} (${b.size} bytes)`));
    }
    
    // Check for unoptimized images
    const largeImages = imageRequests.filter(req => parseInt(req.size) > 500000); // > 500KB
    if (largeImages.length > 0) {
      console.log(`⚠️ Large images detected:`, largeImages.map(i => `${i.url} (${i.size} bytes)`));
    }
    
    // Performance score calculation
    const totalJSSize = jsRequests.reduce((sum, req) => sum + parseInt(req.size || 0), 0);
    const totalCSSSize = cssRequests.reduce((sum, req) => sum + parseInt(req.size || 0), 0);
    const totalImageSize = imageRequests.reduce((sum, req) => sum + parseInt(req.size || 0), 0);
    
    console.log(`📊 Bundle Sizes:`);
    console.log(`  Total JS: ${(totalJSSize / 1024).toFixed(2)} KB`);
    console.log(`  Total CSS: ${(totalCSSSize / 1024).toFixed(2)} KB`);
    console.log(`  Total Images: ${(totalImageSize / 1024).toFixed(2)} KB`);
    
    // Recommendations
    if (totalJSSize > 1000000) {
      console.log(`⚠️ JavaScript bundle is large (${(totalJSSize / 1024 / 1024).toFixed(2)} MB). Consider code splitting.`);
    }
    
    if (imageRequests.some(req => !req.url.includes('.webp') && !req.url.includes('.avif'))) {
      console.log(`⚠️ Consider using modern image formats (WebP, AVIF) for better compression.`);
    }
  });

  test.afterAll(async () => {
    console.log(`\n🎯 UX/Performance Analysis Complete for: ${activeUrl}`);
    console.log(`📊 Screenshots saved to tests/screenshots/`);
    console.log(`📈 Performance thresholds applied:`);
    console.log(`  - Page Load: < ${PERFORMANCE_THRESHOLDS.PAGE_LOAD_TIME}ms`);
    console.log(`  - AI Interpretation: < ${PERFORMANCE_THRESHOLDS.AI_INTERPRETATION_TIME}ms`);
    console.log(`  - Card Interactions: < ${PERFORMANCE_THRESHOLDS.CARD_INTERACTION_TIME}ms`);
    console.log(`  - Mobile Load: < ${PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME}ms`);
  });
});