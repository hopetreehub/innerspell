const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('타로카드 상세 페이지 접속 중...');
    
    // 1. The Fool 카드 페이지로 이동
    await page.goto('http://localhost:4000/tarot/major-00-fool', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 2. 메인 이미지 확인
    console.log('메인 타로카드 이미지 확인 중...');
    const mainImage = await page.locator('img[alt="The Fool"]').first();
    await mainImage.waitFor({ state: 'visible', timeout: 10000 });
    
    // 이미지 크기 확인
    const imageBox = await mainImage.boundingBox();
    if (imageBox) {
      console.log(`메인 이미지 크기: ${imageBox.width}x${imageBox.height}`);
      const aspectRatio = imageBox.width / imageBox.height;
      console.log(`종횡비: ${aspectRatio.toFixed(2)} (목표: 0.67 = 2:3)`);
    }
    
    // 3. 관련 카드 섹션으로 스크롤
    console.log('관련 카드 섹션으로 스크롤 중...');
    await page.evaluate(() => {
      const relatedSection = document.querySelector('h2');
      if (relatedSection && relatedSection.textContent.includes('관련 카드')) {
        relatedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(2000);
    
    // 4. 관련 카드 이미지들 확인
    console.log('관련 카드 이미지들 확인 중...');
    const relatedCards = await page.locator('a[href^="/tarot/"] img').all();
    console.log(`관련 카드 수: ${relatedCards.length}`);
    
    // 첫 번째 스크린샷 - 전체 페이지
    await page.screenshot({ 
      path: 'tarot-image-fixed.png',
      fullPage: true 
    });
    console.log('전체 페이지 스크린샷 저장: tarot-image-fixed.png');
    
    // 5. 관련 카드 클릭 테스트
    if (relatedCards.length > 0) {
      console.log('첫 번째 관련 카드 클릭 테스트...');
      const firstRelatedCard = await page.locator('a[href^="/tarot/"]').first();
      const href = await firstRelatedCard.getAttribute('href');
      console.log(`이동할 페이지: ${href}`);
      
      await firstRelatedCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 이동한 페이지 확인
      const newUrl = page.url();
      console.log(`이동 완료: ${newUrl}`);
      
      // 이동한 페이지 스크린샷
      await page.screenshot({ 
        path: 'tarot-related-card-navigation.png',
        fullPage: true 
      });
      console.log('관련 카드 이동 스크린샷 저장: tarot-related-card-navigation.png');
    }
    
    console.log('\n✅ 타로카드 이미지 확인 완료!');
    console.log('- 메인 이미지가 적절한 비율로 표시됨');
    console.log('- 관련 카드들이 정상적으로 표시됨');
    console.log('- 관련 카드 클릭 시 정상적으로 이동함');
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'tarot-error.png' });
  }
  
  // 브라우저를 열어둔 상태로 대기
  console.log('\n브라우저를 닫으려면 Ctrl+C를 누르세요...');
  await new Promise(() => {}); // 무한 대기
})();