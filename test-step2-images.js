const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🖼️  2단계: 이미지 로딩 문제 해결\n');
    
    // 홈페이지로 이동
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('✅ 홈페이지 로드 완료');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(5000);
    
    // 특징 섹션으로 스크롤
    await page.evaluate(() => {
      const section = document.querySelector('h2');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
    
    await page.waitForTimeout(3000);
    
    // 모든 이미지 상태 확인
    const allImages = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || 'no-alt',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        currentSrc: img.currentSrc
      }))
    );
    
    console.log('🖼️  전체 이미지 상태:');
    allImages.forEach((img, i) => {
      console.log(`  ${i+1}. ${img.alt}`);
      console.log(`     경로: ${img.src}`);
      console.log(`     로드됨: ${img.complete ? '✅' : '❌'}`);
      console.log(`     크기: ${img.naturalWidth}x${img.naturalHeight}`);
      console.log('');
    });
    
    // 특징 카드들 확인
    const featureCards = await page.$$eval('.grid > div', cards => {
      return cards.map((card, index) => {
        const title = card.querySelector('h3')?.textContent;
        const img = card.querySelector('img');
        return {
          index: index + 1,
          title: title,
          hasImage: !!img,
          imageSrc: img?.src || 'none',
          imageAlt: img?.alt || 'no-alt',
          imageLoaded: img?.complete || false,
          imageWidth: img?.naturalWidth || 0,
          imageHeight: img?.naturalHeight || 0
        };
      });
    });
    
    console.log('🎯 특징 카드별 이미지 상태:');
    featureCards.forEach(card => {
      console.log(`  ${card.index}. ${card.title}`);
      console.log(`     이미지: ${card.hasImage ? '있음' : '없음'}`);
      if (card.hasImage) {
        console.log(`     경로: ${card.imageSrc}`);
        console.log(`     Alt: ${card.imageAlt}`);
        console.log(`     로드됨: ${card.imageLoaded ? '✅' : '❌'}`);
        console.log(`     크기: ${card.imageWidth}x${card.imageHeight}`);
      }
      console.log('');
    });
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'step2-image-check.png', 
      fullPage: true 
    });
    
    console.log('📊 결과: step2-image-check.png 저장');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
  } finally {
    await browser.close();
  }
})();