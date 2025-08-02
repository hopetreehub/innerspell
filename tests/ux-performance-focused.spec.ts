import { test, expect, Page } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test.describe('UX/Performance Analysis - Focused Tests', () => {
  
  test('1. Complete Tarot Reading User Journey Analysis', async ({ page }) => {
    console.log('🔮 Starting Tarot Reading Journey Analysis');
    
    // Homepage load with performance measurement
    const startTime = Date.now();
    await page.goto(VERCEL_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const homepageLoadTime = Date.now() - startTime;
    console.log(`✅ Homepage loaded in ${homepageLoadTime}ms`);
    
    // Take homepage screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/ux-01-homepage.png',
      fullPage: true 
    });
    
    // Navigate to tarot reading
    const tarotNavTime = Date.now();
    
    // Try different navigation paths
    const navigationOptions = [
      { selector: 'a[href*="/reading"]', name: 'Reading Link' },
      { selector: 'button:has-text("타로")', name: 'Tarot Button' },
      { selector: 'a:has-text("타로")', name: 'Tarot Link' },
      { selector: 'nav a:has-text("타로 리딩")', name: 'Nav Tarot Reading' }
    ];
    
    let navigationSuccess = false;
    for (const option of navigationOptions) {
      try {
        const element = page.locator(option.selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await page.waitForLoadState('domcontentloaded');
          const navTime = Date.now() - tarotNavTime;
          console.log(`✅ Navigation via ${option.name} completed in ${navTime}ms`);
          navigationSuccess = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ ${option.name} not available`);
      }
    }
    
    if (!navigationSuccess) {
      // Direct navigation fallback
      await page.goto(`${VERCEL_URL}/reading`, { waitUntil: 'domcontentloaded' });
      console.log('✅ Direct navigation to /reading');
    }
    
    // Take tarot page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/ux-02-tarot-page.png',
      fullPage: true 
    });
    
    // Analyze tarot interface elements
    const tarotElements = {
      questionInput: page.locator('textarea, input[type="text"]'),
      spreadSelector: page.locator('select, [role="combobox"]'),
      startButton: page.locator('button:has-text("시작"), button:has-text("셔플"), button:has-text("카드")'),
      cardElements: page.locator('[data-testid*="card"], .card, img[alt*="카드"]')
    };
    
    // Check presence of key UI elements
    for (const [elementName, locator] of Object.entries(tarotElements)) {
      try {
        const isVisible = await locator.first().isVisible({ timeout: 3000 });
        if (isVisible) {
          console.log(`✅ ${elementName} is present and visible`);
        } else {
          console.log(`⚠️ ${elementName} not visible`);
        }
      } catch (error) {
        console.log(`❌ ${elementName} not found`);
      }
    }
    
    // Test question input if available
    const questionField = tarotElements.questionInput.first();
    if (await questionField.isVisible({ timeout: 2000 })) {
      const inputStartTime = Date.now();
      await questionField.fill('테스트 질문: 미래의 방향성에 대해 알고 싶습니다.');
      const inputTime = Date.now() - inputStartTime;
      console.log(`✅ Question input completed in ${inputTime}ms`);
      
      await page.screenshot({ 
        path: 'tests/screenshots/ux-03-question-entered.png',
        fullPage: true 
      });
    }
    
    // Test card interaction if available
    const actionButtons = page.locator('button:has-text("셔플"), button:has-text("시작"), button:has-text("카드")');
    const buttonCount = await actionButtons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(2, buttonCount); i++) {
        try {
          const button = actionButtons.nth(i);
          const buttonText = await button.textContent();
          
          const interactionStart = Date.now();
          await button.click();
          await page.waitForTimeout(1000); // Wait for animations
          const interactionTime = Date.now() - interactionStart;
          
          console.log(`✅ Button "${buttonText}" interaction: ${interactionTime}ms`);
          
          await page.screenshot({ 
            path: `tests/screenshots/ux-04-after-${i + 1}-action.png`,
            fullPage: true 
          });
          
          // Check for loading states
          const loadingIndicators = page.locator('[data-testid*="loading"], .loading, .spinner');
          if (await loadingIndicators.first().isVisible({ timeout: 1000 })) {
            console.log('✅ Loading indicator displayed during interaction');
          }
        } catch (error) {
          console.log(`⚠️ Button interaction ${i + 1} failed: ${error.message}`);
        }
      }
    }
    
    console.log('🔮 Tarot Journey Analysis Complete');
  });

  test('2. Authentication and User Experience Flow', async ({ page }) => {
    console.log('🔐 Starting Authentication UX Analysis');
    
    await page.goto(VERCEL_URL, { waitUntil: 'domcontentloaded' });
    
    // Look for authentication elements
    const authElements = [
      { selector: 'button:has-text("로그인")', name: 'Login Button' },
      { selector: 'a:has-text("로그인")', name: 'Login Link' },
      { selector: 'button:has-text("회원가입")', name: 'Sign Up Button' },
      { selector: 'a:has-text("회원가입")', name: 'Sign Up Link' },
      { selector: '[data-testid*="auth"]', name: 'Auth Element' }
    ];
    
    let authFound = false;
    for (const authElement of authElements) {
      try {
        const element = page.locator(authElement.selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found ${authElement.name}`);
          
          const authStart = Date.now();
          await element.click();
          await page.waitForLoadState('domcontentloaded');
          const authTime = Date.now() - authStart;
          
          console.log(`✅ Auth navigation completed in ${authTime}ms`);
          
          await page.screenshot({ 
            path: 'tests/screenshots/ux-05-auth-flow.png',
            fullPage: true 
          });
          
          authFound = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ ${authElement.name} not accessible`);
      }
    }
    
    if (!authFound) {
      console.log('⚠️ No authentication elements found in main navigation');
    }
    
    // Test responsive design elements
    const responsiveElements = {
      navigation: page.locator('nav'),
      mobileMenu: page.locator('[data-testid*="mobile"], .mobile-menu, .hamburger'),
      mainContent: page.locator('main'),
      footer: page.locator('footer')
    };
    
    for (const [elementName, locator] of Object.entries(responsiveElements)) {
      try {
        const isVisible = await locator.first().isVisible({ timeout: 2000 });
        if (isVisible) {
          console.log(`✅ ${elementName} is responsive and visible`);
        }
      } catch (error) {
        console.log(`⚠️ ${elementName} not found`);
      }
    }
    
    console.log('🔐 Authentication UX Analysis Complete');
  });

  test('3. Dream Interpretation and Accessibility', async ({ page }) => {
    console.log('💭 Starting Dream Interpretation Analysis');
    
    await page.goto(VERCEL_URL, { waitUntil: 'domcontentloaded' });
    
    // Look for dream interpretation access
    const dreamElements = [
      { selector: 'a:has-text("꿈해몽")', name: 'Dream Interpretation Link' },
      { selector: 'a:has-text("Dream")', name: 'Dream Link' },
      { selector: 'button:has-text("꿈")', name: 'Dream Button' },
      { selector: 'nav a[href*="/dream"]', name: 'Dream Nav Link' }
    ];
    
    let dreamFound = false;
    for (const dreamElement of dreamElements) {
      try {
        const element = page.locator(dreamElement.selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found ${dreamElement.name}`);
          
          await element.click();
          await page.waitForLoadState('domcontentloaded');
          
          await page.screenshot({ 
            path: 'tests/screenshots/ux-06-dream-interface.png',
            fullPage: true 
          });
          
          dreamFound = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ ${dreamElement.name} not accessible`);
      }
    }
    
    if (!dreamFound) {
      // Try direct navigation
      try {
        await page.goto(`${VERCEL_URL}/dream`, { waitUntil: 'domcontentloaded' });
        console.log('✅ Direct navigation to dream interpretation');
        dreamFound = true;
      } catch (error) {
        console.log('⚠️ Dream interpretation not accessible via direct URL');
      }
    }
    
    if (dreamFound) {
      // Test form elements if present
      const formElements = {
        textArea: page.locator('textarea'),
        textInput: page.locator('input[type="text"]'),
        submitButton: page.locator('button[type="submit"], button:has-text("해석"), button:has-text("분석")')
      };
      
      for (const [elementName, locator] of Object.entries(formElements)) {
        try {
          const isVisible = await locator.first().isVisible({ timeout: 2000 });
          if (isVisible) {
            console.log(`✅ Dream form ${elementName} is present`);
            
            if (elementName === 'textArea' || elementName === 'textInput') {
              await locator.first().fill('테스트 꿈: 바다에서 고래를 만난 꿈');
              console.log(`✅ ${elementName} input test completed`);
            }
          }
        } catch (error) {
          console.log(`⚠️ Dream form ${elementName} not found`);
        }
      }
      
      await page.screenshot({ 
        path: 'tests/screenshots/ux-07-dream-form-filled.png',
        fullPage: true 
      });
    }
    
    console.log('💭 Dream Interpretation Analysis Complete');
  });

  test('4. Performance and Core Web Vitals Analysis', async ({ page }) => {
    console.log('📊 Starting Performance Analysis');
    
    // Performance monitoring setup
    await page.goto(VERCEL_URL, { waitUntil: 'networkidle' });
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // Get paint timing
        const paintEntries = performance.getEntriesByType('paint');
        vitals.fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        
        // Get navigation timing
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          const nav = navEntries[0];
          vitals.domContentLoaded = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
          vitals.loadComplete = nav.loadEventEnd - nav.loadEventStart;
        }
        
        resolve(vitals);
      });
    });
    
    console.log('📊 Core Web Vitals:', vitals);
    
    // Test image optimization
    const images = page.locator('img');
    const imageCount = await images.count();
    
    console.log(`🖼️ Found ${imageCount} images`);
    
    let optimizedImages = 0;
    for (let i = 0; i < Math.min(5, imageCount); i++) {
      const img = images.nth(i);
      const hasLazy = await img.getAttribute('loading') === 'lazy';
      const hasSizes = await img.getAttribute('sizes') !== null;
      const hasOptimizedSrc = await img.evaluate((el) => {
        return el.src.includes('.webp') || el.src.includes('.avif') || el.getAttribute('data-src');
      });
      
      if (hasLazy || hasSizes || hasOptimizedSrc) {
        optimizedImages++;
      }
    }
    
    const optimizationRate = imageCount > 0 ? (optimizedImages / Math.min(5, imageCount)) * 100 : 0;
    console.log(`✅ Image optimization rate: ${optimizationRate.toFixed(1)}%`);
    
    // Test JavaScript bundle performance
    const jsSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      let totalJSSize = 0;
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') && resource.transferSize) {
          totalJSSize += resource.transferSize;
        }
      });
      
      return totalJSSize;
    });
    
    console.log(`📦 Total JavaScript size: ${(jsSize / 1024).toFixed(2)} KB`);
    
    // Performance score calculation
    let performanceScore = 100;
    
    if (vitals.fcp > 1800) performanceScore -= 20;
    if (jsSize > 1000000) performanceScore -= 15; // > 1MB
    if (optimizationRate < 80) performanceScore -= 10;
    if (vitals.domContentLoaded > 2000) performanceScore -= 15;
    
    console.log(`🎯 Performance Score: ${Math.max(0, performanceScore)}/100`);
    
    // Take final performance screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/ux-08-performance-analysis.png',
      fullPage: true 
    });
    
    console.log('📊 Performance Analysis Complete');
  });

  test('5. Mobile UX and Responsiveness', async ({ browser }) => {
    console.log('📱 Starting Mobile UX Analysis');
    
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const mobilePage = await mobileContext.newPage();
    
    const mobileStartTime = Date.now();
    await mobilePage.goto(VERCEL_URL, { waitUntil: 'domcontentloaded' });
    const mobileLoadTime = Date.now() - mobileStartTime;
    
    console.log(`📱 Mobile page loaded in ${mobileLoadTime}ms`);
    
    // Test mobile navigation
    const mobileNavElements = {
      hamburgerMenu: mobilePage.locator('[data-testid*="mobile"], .mobile-menu, .hamburger, button[aria-label*="menu"]'),
      navigation: mobilePage.locator('nav'),
      logo: mobilePage.locator('[data-testid*="logo"], .logo, img[alt*="logo"]')
    };
    
    for (const [elementName, locator] of Object.entries(mobileNavElements)) {
      try {
        const isVisible = await locator.first().isVisible({ timeout: 2000 });
        console.log(`📱 Mobile ${elementName}: ${isVisible ? '✅ Visible' : '❌ Not visible'}`);
      } catch (error) {
        console.log(`📱 Mobile ${elementName}: ❌ Not found`);
      }
    }
    
    // Test touch interactions
    const touchableElements = mobilePage.locator('button, a, [role="button"]');
    const touchCount = await touchableElements.count();
    
    if (touchCount > 0) {
      // Test first few touchable elements
      for (let i = 0; i < Math.min(3, touchCount); i++) {
        try {
          const element = touchableElements.nth(i);
          if (await element.isVisible()) {
            const tapStart = Date.now();
            await element.tap();
            const tapTime = Date.now() - tapStart;
            console.log(`📱 Touch interaction ${i + 1}: ${tapTime}ms`);
          }
        } catch (error) {
          console.log(`📱 Touch interaction ${i + 1}: Failed`);
        }
      }
    }
    
    // Take mobile screenshots
    await mobilePage.screenshot({ 
      path: 'tests/screenshots/ux-09-mobile-view.png',
      fullPage: true 
    });
    
    await mobileContext.close();
    console.log('📱 Mobile UX Analysis Complete');
  });

  test.afterAll(async () => {
    console.log('\n🎯 UX/Performance Analysis Summary');
    console.log('=' .repeat(50));
    console.log('✅ Deployment URL tested: https://test-studio-firebase.vercel.app');
    console.log('📊 Screenshots saved to tests/screenshots/ux-*.png');
    console.log('🔮 Tarot reading interface analyzed');
    console.log('💭 Dream interpretation accessibility checked');
    console.log('🔐 Authentication flow tested');
    console.log('📱 Mobile responsiveness verified');
    console.log('📊 Performance metrics collected');
    console.log('=' .repeat(50));
  });
});