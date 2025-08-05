const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Opening tarot card detail page...');
    await page.goto('http://localhost:4000/tarot/major-00-fool', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for images to load
    await page.waitForTimeout(3000);
    
    // Open developer tools equivalent - we'll inspect elements programmatically
    console.log('Inspecting main card image...');
    
    // Get main image info - using the correct selector based on the component
    const mainImageInfo = await page.evaluate(() => {
      // The main image is inside a div with relative aspect-[2/3] class
      const mainImgContainer = document.querySelector('.aspect-\\[2\\/3\\]');
      const mainImg = mainImgContainer?.querySelector('img');
      if (!mainImg) return null;
      
      const rect = mainImg.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(mainImg);
      const containerRect = mainImgContainer?.getBoundingClientRect();
      const containerStyle = mainImgContainer ? window.getComputedStyle(mainImgContainer) : null;
      
      return {
        src: mainImg.src,
        naturalWidth: mainImg.naturalWidth,
        naturalHeight: mainImg.naturalHeight,
        displayWidth: rect.width,
        displayHeight: rect.height,
        aspectRatio: mainImg.naturalWidth / mainImg.naturalHeight,
        styles: {
          width: computedStyle.width,
          height: computedStyle.height,
          objectFit: computedStyle.objectFit,
          objectPosition: computedStyle.objectPosition,
          maxWidth: computedStyle.maxWidth,
          maxHeight: computedStyle.maxHeight
        },
        container: containerRect ? {
          width: containerRect.width,
          height: containerRect.height,
          styles: {
            width: containerStyle.width,
            height: containerStyle.height,
            overflow: containerStyle.overflow,
            aspectRatio: containerStyle.aspectRatio
          }
        } : null
      };
    });
    
    console.log('Main Image Info:', JSON.stringify(mainImageInfo, null, 2));
    
    // Get bottom images info - related cards section
    const bottomImagesInfo = await page.evaluate(() => {
      // Related cards are in a grid with aspect-[2/3] divs
      const relatedSection = Array.from(document.querySelectorAll('h2, h3, h4')).find(
        el => el.textContent?.includes('같은 수트의 다른 카드들')
      );
      
      if (!relatedSection) return [];
      
      const cardGrid = relatedSection.closest('.card-content')?.querySelector('.grid');
      if (!cardGrid) return [];
      
      const imageContainers = cardGrid.querySelectorAll('.aspect-\\[2\\/3\\]');
      return Array.from(imageContainers).map((container, index) => {
        const img = container.querySelector('img');
        if (!img) return null;
        
        const rect = img.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(img);
        const containerRect = container.getBoundingClientRect();
        const containerStyle = window.getComputedStyle(container);
        
        return {
          index: index + 1,
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: rect.width,
          displayHeight: rect.height,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          styles: {
            width: computedStyle.width,
            height: computedStyle.height,
            objectFit: computedStyle.objectFit,
            objectPosition: computedStyle.objectPosition
          },
          container: {
            width: containerRect.width,
            height: containerRect.height,
            styles: {
              width: containerStyle.width,
              height: containerStyle.height,
              overflow: containerStyle.overflow,
              aspectRatio: containerStyle.aspectRatio
            }
          }
        };
      }).filter(Boolean);
    });
    
    console.log('Bottom Images Info:', JSON.stringify(bottomImagesInfo, null, 2));
    
    // Highlight problematic areas
    await page.evaluate(() => {
      // Highlight main image container
      const mainContainer = document.querySelector('.aspect-\\[2\\/3\\]');
      if (mainContainer) {
        mainContainer.style.border = '3px solid red';
        mainContainer.style.position = 'relative';
        
        const label = document.createElement('div');
        label.textContent = 'Main Image Container';
        label.style.cssText = 'position: absolute; top: -25px; left: 0; background: red; color: white; padding: 2px 8px; font-size: 12px; z-index: 1000;';
        mainContainer.appendChild(label);
        
        // Also add info about the image size
        const img = mainContainer.querySelector('img');
        if (img) {
          const info = document.createElement('div');
          info.textContent = `Natural: ${img.naturalWidth}x${img.naturalHeight}, Display: ${img.getBoundingClientRect().width.toFixed(0)}x${img.getBoundingClientRect().height.toFixed(0)}`;
          info.style.cssText = 'position: absolute; bottom: -25px; left: 0; background: red; color: white; padding: 2px 8px; font-size: 11px; z-index: 1000;';
          mainContainer.appendChild(info);
        }
      }
      
      // Highlight bottom image containers
      const relatedSection = Array.from(document.querySelectorAll('h2, h3, h4')).find(
        el => el.textContent?.includes('같은 수트의 다른 카드들')
      );
      
      if (relatedSection) {
        const cardGrid = relatedSection.closest('.card-content')?.querySelector('.grid');
        if (cardGrid) {
          const imageContainers = cardGrid.querySelectorAll('.aspect-\\[2\\/3\\]');
          imageContainers.forEach((container, index) => {
            container.style.border = '3px solid blue';
            container.style.position = 'relative';
            
            const label = document.createElement('div');
            label.textContent = `Gallery Image ${index + 1}`;
            label.style.cssText = 'position: absolute; top: -25px; left: 0; background: blue; color: white; padding: 2px 8px; font-size: 12px; z-index: 1000;';
            container.appendChild(label);
            
            // Also add info about the image size
            const img = container.querySelector('img');
            if (img) {
              const info = document.createElement('div');
              info.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
              info.style.cssText = 'position: absolute; bottom: -25px; left: 0; background: blue; color: white; padding: 2px 8px; font-size: 11px; z-index: 1000;';
              container.appendChild(info);
            }
          });
        }
      }
    });
    
    // Scroll to show all images
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot
    const screenshotPath = path.join(__dirname, 'tarot-image-ratio-issue.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Save detailed analysis
    const analysis = {
      timestamp: new Date().toISOString(),
      mainImage: mainImageInfo,
      galleryImages: bottomImagesInfo,
      analysis: {
        mainImageIssue: mainImageInfo ? `Image aspect ratio: ${mainImageInfo.aspectRatio.toFixed(2)}, Display: ${mainImageInfo.displayWidth}x${mainImageInfo.displayHeight}, Natural: ${mainImageInfo.naturalWidth}x${mainImageInfo.naturalHeight}` : 'No main image found',
        galleryImagesIssue: bottomImagesInfo.map(img => 
          `Image ${img.index}: Aspect ratio: ${img.aspectRatio.toFixed(2)}, Display: ${img.displayWidth}x${img.displayHeight}, Natural: ${img.naturalWidth}x${img.naturalHeight}`
        )
      }
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'tarot-image-analysis.json'),
      JSON.stringify(analysis, null, 2)
    );
    
    console.log('Analysis saved to tarot-image-analysis.json');
    
    // Keep browser open for 10 seconds to observe
    console.log('Keeping browser open for observation...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();