const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4000/tarot/major-00-fool', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Get the rendered HTML for the main image container
    const mainImageHTML = await page.evaluate(() => {
      const mainImg = document.querySelector('img[alt="바보"]');
      if (!mainImg) return 'Main image not found';
      
      let container = mainImg.parentElement;
      let depth = 0;
      let structure = '';
      
      // Traverse up to find the card container
      while (container && depth < 5) {
        structure += `${'  '.repeat(depth)}${container.tagName}.${container.className}\n`;
        
        if (container.className.includes('h-96')) {
          structure += `  >>> FOUND h-96 class at depth ${depth}\n`;
        }
        
        container = container.parentElement;
        depth++;
      }
      
      // Get the actual rendered styles
      const img = document.querySelector('img[alt="바보"]');
      const imgStyles = window.getComputedStyle(img);
      
      return {
        structure,
        imageStyles: {
          objectFit: imgStyles.objectFit,
          objectPosition: imgStyles.objectPosition,
          width: imgStyles.width,
          height: imgStyles.height,
          position: imgStyles.position
        },
        imageClasses: img.className,
        parentClasses: img.parentElement.className
      };
    });
    
    console.log('Main Image HTML Structure:');
    console.log(mainImageHTML);
    
    // Check if there's any global CSS overriding object-fit
    const globalStyles = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch (e) {
            return [];
          }
        })
        .filter(rule => rule.selectorText && rule.selectorText.includes('img'))
        .map(rule => ({
          selector: rule.selectorText,
          styles: rule.style.cssText
        }));
      
      return styles;
    });
    
    console.log('\nGlobal IMG Styles:');
    console.log(globalStyles);
    
    await browser.close();
    
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
  }
})();