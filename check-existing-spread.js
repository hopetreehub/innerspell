const { chromium } = require('playwright');

async function checkExistingSpread() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 }
    });
    
    const page = await context.newPage();
    
    console.log('🔗 Navigating to reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(3000);
    
    console.log('🔍 Searching for elements with -145px margin...');
    const elementsWithMargin = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const results = [];
      
      for (let el of allElements) {
        // Check inline style
        if (el.style.marginLeft === '-145px') {
          results.push({
            type: 'inline',
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            src: el.src || '',
            marginLeft: el.style.marginLeft,
            zIndex: el.style.zIndex,
            innerHTML: el.innerHTML.substring(0, 100)
          });
        }
        
        // Check computed style
        const computed = window.getComputedStyle(el);
        if (computed.marginLeft === '-145px') {
          results.push({
            type: 'computed',
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            src: el.src || '',
            marginLeft: computed.marginLeft,
            zIndex: computed.zIndex,
            innerHTML: el.innerHTML.substring(0, 100)
          });
        }
      }
      
      return results;
    });
    
    if (elementsWithMargin.length > 0) {
      console.log(`✅ Found ${elementsWithMargin.length} elements with -145px margin:`);
      elementsWithMargin.forEach((el, i) => {
        console.log(`\n${i + 1}. ${el.tagName}${el.className ? '.' + el.className : ''}${el.id ? '#' + el.id : ''}`);
        console.log(`   Type: ${el.type} style`);
        console.log(`   Margin: ${el.marginLeft}, Z-index: ${el.zIndex}`);
        if (el.src) console.log(`   Src: ...${el.src.substring(el.src.length - 30)}`);
        if (el.innerHTML && !el.innerHTML.includes('<')) {
          console.log(`   Content: ${el.innerHTML}`);
        }
      });
    } else {
      console.log('ℹ️ No elements currently have -145px margin (they may be applied dynamically)');
    }
    
    console.log('\n🎴 Checking for overlapping visual cards...');
    
    // Look for card images in the spread area
    const cardImages = await page.locator('img[src*="card"]').all();
    console.log(`Found ${cardImages.length} card images`);
    
    if (cardImages.length > 1) {
      const positions = [];
      
      for (let i = 0; i < Math.min(cardImages.length, 5); i++) {
        const bounds = await cardImages[i].boundingBox();
        if (bounds) {
          positions.push({
            index: i,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            right: bounds.x + bounds.width
          });
        }
      }
      
      console.log('\nCard positions:');
      positions.forEach(pos => {
        console.log(`Card ${pos.index + 1}: x=${Math.round(pos.x)}, y=${Math.round(pos.y)}, right=${Math.round(pos.right)}`);
      });
      
      // Check for horizontal overlap
      let hasOverlap = false;
      for (let i = 0; i < positions.length - 1; i++) {
        const current = positions[i];
        const next = positions[i + 1];
        
        const gap = next.x - current.right;
        const overlap = -gap;
        
        console.log(`\nGap between card ${current.index + 1} and ${next.index + 1}: ${Math.round(gap)}px`);
        if (gap < 0) {
          console.log(`✅ Overlap detected: ${Math.round(overlap)}px`);
          const visibleWidth = current.width + gap;
          console.log(`   Visible width of card ${current.index + 1}: ${Math.round(visibleWidth)}px`);
          hasOverlap = true;
          
          if (Math.abs(visibleWidth - 15) <= 10) {
            console.log(`   ✅ Perfect! ~15px visible as expected`);
          }
        }
      }
      
      if (hasOverlap) {
        console.log('\n🎉 SUCCESS: Visual overlap animation is working!');
      } else {
        console.log('\n❌ No visual overlap detected');
      }
    }
    
    // Take a final screenshot
    await page.screenshot({ 
      path: './final-verification.png',
      fullPage: true 
    });
    
    console.log('\n📸 Final screenshot saved: final-verification.png');
    console.log('🔍 Browser staying open for 20 seconds...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

checkExistingSpread().catch(console.error);