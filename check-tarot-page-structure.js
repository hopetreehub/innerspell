const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('타로카드 상세 페이지 접속 중...');
    
    // The Fool 카드 페이지로 이동
    await page.goto('http://localhost:4000/tarot/major-00-fool', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(5000);
    
    // 페이지 HTML 구조 확인
    console.log('\n페이지 제목 확인...');
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    
    // 모든 이미지 태그 찾기
    console.log('\n모든 이미지 태그 확인...');
    const allImages = await page.locator('img').all();
    console.log(`총 이미지 수: ${allImages.length}`);
    
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      console.log(`이미지 ${i + 1}: src="${src}", alt="${alt}"`);
    }
    
    // 메인 컨텐츠 영역 확인
    console.log('\n메인 컨텐츠 구조 확인...');
    const mainContent = await page.locator('main').innerHTML();
    console.log('Main 태그 내용 길이:', mainContent.length);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'tarot-image-fixed.png',
      fullPage: true 
    });
    console.log('\n스크린샷 저장: tarot-image-fixed.png');
    
    // 관련 카드 섹션 찾기
    console.log('\n관련 카드 섹션 확인...');
    const relatedSection = await page.locator('text="관련 카드"').first();
    if (await relatedSection.isVisible()) {
      console.log('관련 카드 섹션 발견!');
      
      // 관련 카드 섹션으로 스크롤
      await relatedSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      // 관련 카드 링크들 확인
      const relatedLinks = await page.locator('a[href^="/tarot/"]').all();
      console.log(`관련 카드 링크 수: ${relatedLinks.length}`);
      
      // 관련 카드 섹션 스크린샷
      await page.screenshot({ 
        path: 'tarot-related-cards-section.png',
        fullPage: false 
      });
      console.log('관련 카드 섹션 스크린샷 저장: tarot-related-cards-section.png');
    }
    
    console.log('\n✅ 페이지 구조 확인 완료!');
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'tarot-error.png' });
  }
  
  // 브라우저를 열어둔 상태로 대기
  console.log('\n브라우저를 닫으려면 Ctrl+C를 누르세요...');
  await new Promise(() => {}); // 무한 대기
})();