const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔄 이미지 문제 해결 확인\n');
    
    // 강제 새로고침으로 캐시 무시
    await page.goto('http://localhost:4000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 강제 새로고침 (Ctrl+F5 효과)
    await page.reload({ waitUntil: 'networkidle' });
    
    console.log('✅ 페이지 로드 완료');
    
    // 특징 섹션으로 스크롤
    await page.evaluate(() => {
      const section = document.querySelector('h2');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
    
    await page.waitForTimeout(3000);
    
    // 이미지 상태 확인
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }))
    );
    
    console.log('\n📸 이미지 상태:');
    images.forEach((img, i) => {
      console.log(`  ${i+1}. ${img.src}`);
      console.log(`     로드됨: ${img.complete ? '✅' : '❌'}`);
      console.log(`     크기: ${img.naturalWidth}x${img.naturalHeight}`);
    });
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'image-fix-result.png', 
      fullPage: true 
    });
    
    console.log('\n📊 결과: image-fix-result.png 저장');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
  } finally {
    await browser.close();
  }
})();