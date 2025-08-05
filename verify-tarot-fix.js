const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Opening tarot card page to verify fix...');
    await page.goto('http://localhost:4000/tarot/major-00-fool', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // Verify the fix
    const verification = await page.evaluate(() => {
      const mainImg = document.querySelector('img[alt="바보"]');
      const galleryImages = document.querySelectorAll('img[alt*="세계"], img[alt*="죽음"]');
      
      const results = {
        mainImage: null,
        galleryImages: []
      };
      
      if (mainImg) {
        const rect = mainImg.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(mainImg);
        
        results.mainImage = {
          naturalSize: `${mainImg.naturalWidth}x${mainImg.naturalHeight}`,
          displaySize: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          objectFit: computedStyle.objectFit,
          isFullyVisible: mainImg.naturalHeight <= rect.height && mainImg.naturalWidth <= rect.width,
          aspectRatioPreserved: Math.abs((mainImg.naturalWidth / mainImg.naturalHeight) - (rect.width / rect.height)) < 0.1
        };
      }
      
      galleryImages.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(img);
        
        results.galleryImages.push({
          naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
          displaySize: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          objectFit: computedStyle.objectFit,
          isFullyVisible: img.naturalHeight <= rect.height && img.naturalWidth <= rect.width
        });
      });
      
      return results;
    });
    
    console.log('Verification Results:');
    console.log(JSON.stringify(verification, null, 2));
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tarot-image-ratio-issue.png',
      fullPage: false 
    });
    
    console.log('Screenshot saved to tarot-image-ratio-issue.png');
    
    // Keep browser open for observation
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();