const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    devtools: true // Enable DevTools
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
    
    // Analyze the main card image
    const mainImageAnalysis = await page.evaluate(() => {
      // Find all images on the page
      const allImages = Array.from(document.querySelectorAll('img'));
      console.log(`Found ${allImages.length} images on page`);
      
      // Find the main card image (likely the largest one)
      const imageInfo = allImages.map(img => {
        const rect = img.getBoundingClientRect();
        const parent = img.parentElement;
        const grandParent = parent?.parentElement;
        
        return {
          src: img.src,
          alt: img.alt,
          naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
          displaySize: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          isVisible: rect.width > 0 && rect.height > 0,
          parent: {
            tagName: parent?.tagName,
            className: parent?.className,
            styles: parent ? window.getComputedStyle(parent) : null
          },
          grandParent: {
            tagName: grandParent?.tagName,
            className: grandParent?.className
          },
          computedStyles: window.getComputedStyle(img),
          rect: rect
        };
      });
      
      // Sort by display area to find main image
      imageInfo.sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));
      
      return {
        totalImages: allImages.length,
        images: imageInfo
      };
    });
    
    console.log('Image Analysis:', JSON.stringify(mainImageAnalysis, null, 2));
    
    // Visual debugging - highlight and measure images
    await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      
      images.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        const isMainImage = rect.width * rect.height > 50000; // Large images
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: ${rect.top}px;
          left: ${rect.left}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          border: 3px solid ${isMainImage ? 'red' : 'blue'};
          pointer-events: none;
          z-index: 10000;
        `;
        document.body.appendChild(overlay);
        
        // Add size label
        const label = document.createElement('div');
        label.textContent = `Image ${index + 1}: ${img.naturalWidth}x${img.naturalHeight} → ${Math.round(rect.width)}x${Math.round(rect.height)}`;
        label.style.cssText = `
          position: fixed;
          top: ${rect.top - 25}px;
          left: ${rect.left}px;
          background: ${isMainImage ? 'red' : 'blue'};
          color: white;
          padding: 2px 8px;
          font-size: 12px;
          z-index: 10001;
          white-space: nowrap;
        `;
        document.body.appendChild(label);
        
        // Check if image is cropped
        const aspectRatioNatural = img.naturalWidth / img.naturalHeight;
        const aspectRatioDisplay = rect.width / rect.height;
        const aspectRatioDiff = Math.abs(aspectRatioNatural - aspectRatioDisplay);
        
        if (aspectRatioDiff > 0.1) {
          const warning = document.createElement('div');
          warning.textContent = `⚠️ CROPPED! Natural AR: ${aspectRatioNatural.toFixed(2)}, Display AR: ${aspectRatioDisplay.toFixed(2)}`;
          warning.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 5}px;
            left: ${rect.left}px;
            background: orange;
            color: black;
            padding: 2px 8px;
            font-size: 11px;
            z-index: 10001;
            white-space: nowrap;
            font-weight: bold;
          `;
          document.body.appendChild(warning);
        }
        
        // Show object-fit value
        const objectFit = window.getComputedStyle(img).objectFit;
        if (objectFit && objectFit !== 'fill') {
          const fitLabel = document.createElement('div');
          fitLabel.textContent = `object-fit: ${objectFit}`;
          fitLabel.style.cssText = `
            position: fixed;
            top: ${rect.top + 30}px;
            left: ${rect.left}px;
            background: purple;
            color: white;
            padding: 2px 8px;
            font-size: 11px;
            z-index: 10001;
          `;
          document.body.appendChild(fitLabel);
        }
      });
      
      // Also check for containers with aspect-ratio
      const aspectContainers = document.querySelectorAll('[class*="aspect-"]');
      aspectContainers.forEach((container, index) => {
        const rect = container.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(container);
        
        const containerInfo = document.createElement('div');
        containerInfo.textContent = `Container: ${container.className} | ${Math.round(rect.width)}x${Math.round(rect.height)}`;
        containerInfo.style.cssText = `
          position: fixed;
          top: ${rect.bottom - 20}px;
          left: ${rect.left}px;
          background: green;
          color: white;
          padding: 2px 8px;
          font-size: 10px;
          z-index: 10001;
          white-space: nowrap;
        `;
        document.body.appendChild(containerInfo);
      });
    });
    
    // Take screenshot
    await page.waitForTimeout(2000);
    const screenshotPath = path.join(__dirname, 'tarot-image-ratio-issue.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Save detailed analysis
    const detailedAnalysis = {
      ...mainImageAnalysis,
      recommendation: "Check if images are using object-fit: contain/cover and if containers have fixed aspect ratios that don't match image aspect ratios"
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'tarot-image-detailed-analysis.json'),
      JSON.stringify(detailedAnalysis, null, 2)
    );
    
    console.log('Detailed analysis saved to tarot-image-detailed-analysis.json');
    
    // Keep browser open for manual inspection
    console.log('Browser will remain open for manual inspection. Press Ctrl+C to close.');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();