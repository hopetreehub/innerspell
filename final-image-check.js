const { chromium } = require('playwright');

(async () => {
  console.log('=== PM: 최종 이미지 검증 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  const prodUrl = 'https://test-studio-firebase.vercel.app';
  
  try {
    // 타로 카드 백과사전만 집중 검사
    console.log('타로 카드 백과사전 페이지 검사...');
    await page.goto(`${prodUrl}/tarot`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || 'no-alt',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }))
    );
    
    console.log(`\n총 이미지 수: ${images.length}`);
    
    let successCount = 0;
    let failedImages = [];
    
    images.forEach(img => {
      if (img.naturalWidth > 0) {
        successCount++;
      } else {
        failedImages.push(img);
        console.log(`❌ 실패: ${img.alt} - ${img.src}`);
      }
    });
    
    console.log(`\n✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${failedImages.length}개`);
    
    // 15-21번 카드 특별 확인
    console.log('\n15-21번 메이저 아르카나 카드 확인:');
    const majorCards = ['The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];
    
    majorCards.forEach((cardName, index) => {
      const cardNum = 15 + index;
      const found = images.find(img => img.alt.includes(cardName));
      if (found) {
        console.log(`${cardNum}. ${cardName}: ${found.naturalWidth > 0 ? '✅' : '❌'}`);
      }
    });
    
    await page.screenshot({ path: 'final-tarot-cards-check.png', fullPage: true });
    
    if (failedImages.length === 0) {
      console.log('\n🎉 모든 타로 카드 이미지가 정상적으로 표시됩니다!');
    } else {
      console.log('\n⚠️ 일부 이미지가 여전히 로드되지 않습니다.');
    }
    
  } catch (error) {
    console.error('\n❌ 검사 중 오류:', error.message);
  }
  
  console.log('\n브라우저를 10초 후 닫습니다...');
  await page.waitForTimeout(10000);
  await browser.close();
})();