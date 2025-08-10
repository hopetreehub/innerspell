const { chromium } = require('playwright');

async function finalDOMCheck() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 }
    });
    
    const page = await context.newPage();
    
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(2000);
    
    // Trigger the spread
    await page.locator('textarea').fill('Final overlap test');
    await page.locator('button').filter({ hasText: /섞는 중/i }).click();
    await page.waitForTimeout(2000);
    await page.locator('button').filter({ hasText: /펼치기/i }).click();
    await page.waitForTimeout(5000);
    
    console.log('🔍 Examining DOM structure of overlapping cards...');
    
    // Get all image elements that look like cards
    const cardImages = await page.locator('img').all();
    
    for (let i = 0; i < cardImages.length; i++) {
      const img = cardImages[i];
      const src = await img.getAttribute('src');
      
      if (src && src.includes('card')) {
        console.log(`\n--- Card Image ${i + 1} ---`);
        console.log(`Src: ${src}`);
        
        const styles = await img.evaluate(el => ({
          inline: {
            marginLeft: el.style.marginLeft,
            zIndex: el.style.zIndex,
            transform: el.style.transform,
            position: el.style.position
          },
          computed: (() => {
            const computed = window.getComputedStyle(el);
            return {
              marginLeft: computed.marginLeft,
              zIndex: computed.zIndex,
              position: computed.position,
              transform: computed.transform
            };
          })(),
          parent: {
            className: el.parentElement?.className || '',
            tagName: el.parentElement?.tagName || ''
          }
        }));
        
        const bounds = await img.boundingBox();
        
        console.log(`Inline styles:`, styles.inline);
        console.log(`Computed styles:`, styles.computed);
        console.log(`Parent: ${styles.parent.tagName}.${styles.parent.className}`);
        if (bounds) {
          console.log(`Bounds: x=${Math.round(bounds.x)}, y=${Math.round(bounds.y)}, w=${Math.round(bounds.width)}, h=${Math.round(bounds.height)}`);
        }
        
        // Check for margin-left specifically
        if (styles.inline.marginLeft === '-145px') {
          console.log(`✅ Found correct overlap margin: ${styles.inline.marginLeft}`);
        } else if (styles.computed.marginLeft !== '0px') {
          console.log(`ℹ️ Has computed margin: ${styles.computed.marginLeft}`);
        }
      }
    }
    
    // Also check for any elements with the specific margin
    console.log('\n🎯 Searching for elements with -145px margin...');
    const elementsWithMargin = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const results = [];
      
      for (let el of allElements) {
        if (el.style.marginLeft === '-145px') {
          results.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            src: el.src || '',
            marginLeft: el.style.marginLeft,
            zIndex: el.style.zIndex
          });
        }
      }
      
      return results;
    });
    
    if (elementsWithMargin.length > 0) {
      console.log(`✅ Found ${elementsWithMargin.length} elements with -145px margin:`);
      elementsWithMargin.forEach((el, i) => {
        console.log(`  ${i + 1}. ${el.tagName}.${el.className} - margin: ${el.marginLeft}, z-index: ${el.zIndex}`);
        if (el.src) console.log(`     src: ${el.src.substring(el.src.length - 30)}`);
      });
    } else {
      console.log('❌ No elements found with -145px margin');
    }
    
    console.log('\n✅ DOM analysis complete');
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

finalDOMCheck().catch(console.error);