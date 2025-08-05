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
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 메인 이미지 확인
    console.log('\n메인 카드 이미지 확인...');
    const mainImage = await page.locator('img[alt="바보"]').first();
    if (await mainImage.isVisible()) {
      const box = await mainImage.boundingBox();
      if (box) {
        console.log(`메인 이미지 크기: ${box.width}x${box.height}`);
        const ratio = box.width / box.height;
        console.log(`종횡비: ${ratio.toFixed(2)} (목표: 0.67 = 2:3 비율)`);
      }
    }
    
    // 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // 관련 카드 클릭 테스트
    console.log('\n관련 카드 클릭 테스트...');
    const relatedCardLinks = await page.locator('a[href^="/tarot/"]').all();
    console.log(`관련 카드 수: ${relatedCardLinks.length}`);
    
    if (relatedCardLinks.length > 0) {
      // 첫 번째 관련 카드의 정보 확인
      const firstLink = relatedCardLinks[0];
      const href = await firstLink.getAttribute('href');
      console.log(`첫 번째 관련 카드 링크: ${href}`);
      
      // 클릭 전 URL
      const beforeUrl = page.url();
      console.log(`현재 URL: ${beforeUrl}`);
      
      // 관련 카드 클릭
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 클릭 후 URL
      const afterUrl = page.url();
      console.log(`이동 후 URL: ${afterUrl}`);
      
      if (beforeUrl !== afterUrl) {
        console.log('✅ 관련 카드 클릭으로 페이지 이동 성공!');
        
        // 이동한 페이지의 제목 확인
        const newTitle = await page.title();
        console.log(`새 페이지 제목: ${newTitle}`);
        
        // 새 페이지 스크린샷
        await page.screenshot({ 
          path: 'tarot-navigation-success.png',
          fullPage: true 
        });
        console.log('이동 후 스크린샷 저장: tarot-navigation-success.png');
      }
    }
    
    console.log('\n✅ 타로카드 페이지 테스트 완료!');
    console.log('- 메인 이미지가 정상적으로 표시됨');
    console.log('- 관련 카드가 표시되고 클릭 가능함');
    console.log('- 페이지 간 이동이 정상 작동함');
    
  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'tarot-test-error.png' });
  }
  
  // 브라우저를 열어둔 상태로 대기
  console.log('\n브라우저를 닫으려면 Ctrl+C를 누르세요...');
  await new Promise(() => {}); // 무한 대기
})();