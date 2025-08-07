const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  try {
    console.log('🧪 Testing Card Spread Functionality...');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    await page.waitForTimeout(3000);

    // Fill the question
    console.log('📝 Filling question...');
    await page.fill('textarea', '카드에서 무엇을 볼고 싶나요?');

    // Click the spread button (Trinity View)
    console.log('🎴 Clicking spread button...');
    const spreadButton = await page.locator('button:has-text("삼위일체 조망 (Trinity View) (3장)")');
    if (await spreadButton.isVisible({ timeout: 5000 })) {
      await spreadButton.click();
      await page.waitForTimeout(5000);
      
      console.log('📸 Taking screenshot after clicking spread...');
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/tarot-spread-test.png',
        fullPage: true 
      });

      // Check for spread cards
      const spreadCards = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .filter(img => img.src.includes('tarot') && !img.src.includes('back.png'))
          .map(img => ({
            src: img.src,
            alt: img.alt,
            loaded: img.complete && img.naturalHeight !== 0,
            width: img.naturalWidth,
            height: img.naturalHeight
          }));
      });

      console.log(`🎴 Individual tarot cards found: ${spreadCards.length}`);
      spreadCards.forEach((card, index) => {
        console.log(`  ${index + 1}. ${card.loaded ? '✅' : '❌'} ${card.src}`);
        console.log(`     Alt: ${card.alt}, Size: ${card.width}x${card.height}`);
      });
    }

    console.log('✅ Card spread test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();