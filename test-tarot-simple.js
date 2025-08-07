const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    args: ['--disable-web-security', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  try {
    console.log('🧪 Testing Tarot Reading Page...');
    
    // Navigate with more lenient settings
    console.log('📍 Navigating to reading page...');
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });

    // Wait for page to load
    await page.waitForTimeout(5000);

    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-final-test-initial.png',
      fullPage: true 
    });

    // Look for any images
    const allImages = await page.locator('img').count();
    console.log(`🖼️ Total images found: ${allImages}`);

    // Check specifically for tarot images
    const tarotImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => img.src.includes('tarot') || img.alt.includes('tarot') || img.alt.includes('카드'))
        .map(img => ({
          src: img.src,
          alt: img.alt,
          loaded: img.complete && img.naturalHeight !== 0,
          width: img.naturalWidth,
          height: img.naturalHeight
        }));
    });

    console.log(`🎴 Tarot images found: ${tarotImages.length}`);
    tarotImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.loaded ? '✅' : '❌'} ${img.src}`);
      console.log(`     Alt: ${img.alt}, Size: ${img.width}x${img.height}`);
    });

    // Check for interactive elements
    const buttons = await page.locator('button').count();
    console.log(`🔘 Buttons found: ${buttons}`);

    // Try to interact with any visible buttons
    const interactiveButtons = await page.locator('button:visible').all();
    for (let i = 0; i < Math.min(interactiveButtons.length, 3); i++) {
      try {
        const buttonText = await interactiveButtons[i].textContent();
        console.log(`🔄 Clicking button: "${buttonText}"`);
        await interactiveButtons[i].click();
        await page.waitForTimeout(2000);
        
        // Take screenshot after each interaction
        await page.screenshot({ 
          path: `/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-after-click-${i + 1}.png`,
          fullPage: true 
        });
        
      } catch (err) {
        console.log(`⚠️ Could not click button ${i + 1}: ${err.message}`);
      }
    }

    // Final screenshot
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-final-test.png',
      fullPage: true 
    });

    // Check network requests for image errors
    const networkLogs = [];
    page.on('response', response => {
      if (response.url().includes('tarot') && response.url().includes('.png')) {
        networkLogs.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });

    console.log('🌐 Network logs for tarot images:');
    networkLogs.forEach(log => {
      console.log(`  ${log.ok ? '✅' : '❌'} ${log.status} ${log.url}`);
    });

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    try {
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-error.png',
        fullPage: true 
      });
    } catch (e) {
      console.log('Could not take error screenshot');
    }
  } finally {
    await browser.close();
  }
})();