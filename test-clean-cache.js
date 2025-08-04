const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧹 캐시 클리어 후 최종 테스트\n');
    
    // 페이지 로드 (새로운 캐시로)
    await page.goto('http://localhost:4000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('✅ 페이지 로드 완료');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 제목: "${title}"`);
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(5000);
    
    // 특징 섹션 확인
    const features = await page.$$eval('.grid .group', cards => {
      return cards.map(card => {
        const title = card.querySelector('h3')?.textContent;
        const img = card.querySelector('img');
        return {
          title: title,
          hasImage: !!img,
          imageSrc: img?.src || 'none',
          imageLoaded: img?.complete || false,
          imageNaturalWidth: img?.naturalWidth || 0
        };
      });
    });
    
    console.log('\n🎯 특징 섹션 상태:');
    features.forEach((feature, i) => {
      console.log(`  ${i+1}. ${feature.title}`);
      console.log(`     이미지: ${feature.hasImage ? '있음' : '없음'}`);
      if (feature.hasImage) {
        console.log(`     경로: ${feature.imageSrc}`);
        console.log(`     로드됨: ${feature.imageLoaded ? '✅' : '❌'}`);
        console.log(`     크기: ${feature.imageNaturalWidth}px`);
      }
    });
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'clean-cache-final.png', 
      fullPage: true 
    });
    
    console.log('\n📊 최종 결과: clean-cache-final.png 저장');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
  } finally {
    await browser.close();
  }
})();