const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  try {
    console.log('🧪 Testing Actual Button Interactions...');
    
    await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    await page.waitForTimeout(3000);

    // Take initial screenshot
    console.log('📸 Initial state...');
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/qa-screenshots/buttons-initial.png',
      fullPage: true 
    });

    // Fill the question
    console.log('📝 Filling question...');
    await page.fill('textarea', '카드에서 무엇을 볼고 싶나요?');

    // Click the purple "카드 섞기" button
    console.log('🔀 Clicking shuffle button...');
    const shuffleBtn = page.locator('button:has-text("카드 섞기")');
    if (await shuffleBtn.isVisible({ timeout: 5000 })) {
      await shuffleBtn.click();
      await page.waitForTimeout(3000);
      
      console.log('📸 After shuffle...');
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/buttons-after-shuffle.png',
        fullPage: true 
      });
    }

    // Click the light purple "카드 뽑기" button
    console.log('🎴 Clicking draw cards button...');
    const drawBtn = page.locator('button:has-text("카드 뽑기")');
    if (await drawBtn.isVisible({ timeout: 5000 })) {
      await drawBtn.click();
      await page.waitForTimeout(5000);
      
      console.log('📸 After draw...');
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/qa-screenshots/buttons-after-draw.png',
        fullPage: true 
      });

      // Now check for any revealed cards
      const revealedCards = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const tarotImages = images.filter(img => 
          img.src.includes('tarot') || 
          img.alt.toLowerCase().includes('tarot') || 
          img.alt.includes('카드')
        );
        
        return tarotImages.map(img => ({
          src: img.src,
          alt: img.alt,
          loaded: img.complete && img.naturalHeight !== 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
          isBackCard: img.src.includes('back.png'),
          position: {
            x: img.getBoundingClientRect().x,
            y: img.getBoundingClientRect().y
          }
        }));
      });

      console.log(`🎴 Total tarot images found: ${revealedCards.length}`);
      console.log('📊 Card analysis:');
      revealedCards.forEach((card, index) => {
        console.log(`  ${index + 1}. ${card.loaded ? '✅' : '❌'} ${card.isBackCard ? '🔙 BACK' : '🎴 FACE'}`);
        console.log(`     URL: ${card.src}`);
        console.log(`     Alt: ${card.alt}`);
        console.log(`     Size: ${card.width}x${card.height}`);
        console.log(`     Position: (${card.position.x}, ${card.position.y})`);
        console.log('');
      });
    }

    console.log('✅ Button interaction test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();