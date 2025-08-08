const { chromium } = require('playwright');

(async () => {
  console.log("🔍 이미지 크기 확인 중...");
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // back.png 이미지 직접 로드
    await page.goto('http://localhost:4000/images/tarot-spread/back/back.png');
    await page.waitForTimeout(1000);
    
    const imageInfo = await page.evaluate(() => {
      const img = document.querySelector('img');
      if (!img) return null;
      
      return {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.width,
        displayHeight: img.height,
        aspectRatio: (img.naturalHeight / img.naturalWidth).toFixed(3)
      };
    });
    
    console.log("\n📐 back.png 이미지 정보:");
    console.log(`실제 크기: ${imageInfo.naturalWidth}x${imageInfo.naturalHeight}px`);
    console.log(`비율: ${imageInfo.aspectRatio} (약 1:${imageInfo.aspectRatio})`);
    
    // 카드 한 장 확인
    await page.goto('http://localhost:4000/images/tarot-spread/00-TheFool.png');
    await page.waitForTimeout(1000);
    
    const cardInfo = await page.evaluate(() => {
      const img = document.querySelector('img');
      if (!img) return null;
      
      return {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        aspectRatio: (img.naturalHeight / img.naturalWidth).toFixed(3)
      };
    });
    
    console.log("\n📐 카드 이미지 정보 (The Fool):");
    console.log(`실제 크기: ${cardInfo.naturalWidth}x${cardInfo.naturalHeight}px`);
    console.log(`비율: ${cardInfo.aspectRatio}`);
    
  } catch (error) {
    console.error("오류:", error);
  } finally {
    await browser.close();
  }
})();