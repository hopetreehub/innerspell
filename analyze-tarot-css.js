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
    
    // Analyze CSS issues
    const cssAnalysis = await page.evaluate(() => {
      const results = {
        mainImage: null,
        galleryImages: []
      };
      
      // Find main image
      const mainImg = document.querySelector('img[alt="바보"]');
      if (mainImg) {
        const container = mainImg.parentElement;
        const rect = mainImg.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(mainImg);
        const containerStyle = window.getComputedStyle(container);
        
        results.mainImage = {
          image: {
            naturalSize: `${mainImg.naturalWidth}x${mainImg.naturalHeight}`,
            displaySize: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            aspectRatio: (mainImg.naturalWidth / mainImg.naturalHeight).toFixed(2),
            objectFit: computedStyle.objectFit,
            objectPosition: computedStyle.objectPosition
          },
          container: {
            className: container.className,
            size: `${Math.round(containerRect.width)}x${Math.round(containerRect.height)}`,
            overflow: containerStyle.overflow,
            position: containerStyle.position
          },
          issue: rect.height < mainImg.naturalHeight ? 'Image is cropped vertically' : 'No cropping'
        };
      }
      
      // Find gallery images
      const relatedTitle = Array.from(document.querySelectorAll('h2, h3, h4')).find(
        el => el.textContent.includes('같은 수트의 다른 카드들')
      );
      
      if (relatedTitle) {
        const cardSection = relatedTitle.closest('[class*="card"]');
        const images = cardSection?.querySelectorAll('img') || [];
        
        images.forEach((img, index) => {
          const container = img.parentElement;
          const rect = img.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(img);
          const containerStyle = window.getComputedStyle(container);
          
          results.galleryImages.push({
            index: index + 1,
            image: {
              naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
              displaySize: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
              aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
              objectFit: computedStyle.objectFit,
              objectPosition: computedStyle.objectPosition
            },
            container: {
              className: container.className,
              size: `${Math.round(containerRect.width)}x${Math.round(containerRect.height)}`,
              overflow: containerStyle.overflow,
              aspectRatio: containerStyle.aspectRatio
            },
            issue: rect.height < img.naturalHeight ? 'Image is cropped' : 'No cropping'
          });
        });
      }
      
      return results;
    });
    
    console.log('CSS Analysis:');
    console.log(JSON.stringify(cssAnalysis, null, 2));
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tarot-image-ratio-issue.png',
      fullPage: false 
    });
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();