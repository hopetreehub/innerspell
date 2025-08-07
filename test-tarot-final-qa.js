const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  // Clear all cache and storage
  await context.clearCookies();
  await context.clearPermissions();

  const page = await context.newPage();

  // Enable network monitoring
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('/images/tarot/')) {
      console.log('🖼️ Requesting tarot image:', url);
    }
    route.continue();
  });

  try {
    console.log('🧪 Starting Final QA Test for Tarot Reading...');
    
    // Navigate to tarot reading page
    console.log('📍 Navigating to /reading page...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for initial load
    await page.waitForTimeout(3000);

    console.log('📸 Taking initial screenshot of deck...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-final-test-initial.png',
      fullPage: true 
    });

    // Check if cards are visible
    const cardElements = await page.locator('.card, [data-testid*="card"], .tarot-card').count();
    console.log(`🎴 Found ${cardElements} card elements`);

    // Try to find and click shuffle button
    const shuffleButton = page.locator('button:has-text("Shuffle"), button:has-text("섞기"), [data-testid="shuffle-button"]').first();
    if (await shuffleButton.isVisible({ timeout: 5000 })) {
      console.log('🔀 Clicking shuffle button...');
      await shuffleButton.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ Shuffle button not found, looking for other interaction buttons...');
    }

    // Try to find and click spread or draw button
    const spreadButton = page.locator('button:has-text("Spread"), button:has-text("펼치기"), button:has-text("Draw"), button:has-text("뽑기"), [data-testid="spread-button"]').first();
    if (await spreadButton.isVisible({ timeout: 5000 })) {
      console.log('🎯 Clicking spread/draw button...');
      await spreadButton.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('⚠️ Spread button not found, looking for clickable cards...');
    }

    // Try clicking on cards directly
    const clickableCards = page.locator('.card, [data-testid*="card"], .tarot-card').first();
    if (await clickableCards.isVisible({ timeout: 5000 })) {
      console.log('🎴 Clicking on first card...');
      await clickableCards.click();
      await page.waitForTimeout(2000);
    }

    // Take screenshot after interactions
    console.log('📸 Taking screenshot after interactions...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-final-test-after-interaction.png',
      fullPage: true 
    });

    // Check for any error messages
    const errorMessages = await page.locator('.error, [data-testid="error"], .alert-error').count();
    if (errorMessages > 0) {
      console.log(`❌ Found ${errorMessages} error messages on page`);
    }

    // Check network requests in browser dev tools
    console.log('🔍 Opening dev tools to check network requests...');
    await page.evaluate(() => {
      console.log('=== CHECKING LOADED IMAGES ===');
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (img.src.includes('tarot')) {
          console.log(`Image ${index + 1}:`, {
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            loaded: img.complete && img.naturalHeight !== 0
          });
        }
      });
    });

    // Final screenshot
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-final-test.png',
      fullPage: true 
    });

    // Check for successful image loads
    const loadedImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => img.src.includes('tarot'))
        .map(img => ({
          src: img.src,
          loaded: img.complete && img.naturalHeight !== 0,
          width: img.naturalWidth,
          height: img.naturalHeight
        }));
    });

    console.log('🖼️ Tarot Image Load Status:');
    loadedImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.loaded ? '✅' : '❌'} ${img.src} (${img.width}x${img.height})`);
    });

    console.log('✅ Final QA test completed successfully!');
    console.log('📁 Screenshots saved to qa-screenshots/ directory');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-final-test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();