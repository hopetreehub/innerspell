const { chromium } = require('playwright');

(async () => {
  console.log('=== 콘솔 에러 디버깅 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  // 콘솔 메시지 캡처
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ 콘솔 에러:', msg.text());
    }
  });
  
  // 페이지 에러 캡처
  page.on('pageerror', error => {
    console.log('❌ 페이지 에러:', error.message);
  });
  
  // 실패한 요청 캡처
  page.on('requestfailed', request => {
    console.log('❌ 요청 실패:', request.url(), '-', request.failure()?.errorText);
  });
  
  try {
    console.log('타로 페이지 로딩...');
    await page.goto('http://localhost:4000/tarot', { waitUntil: 'domcontentloaded' });
    
    // 개발자 도구에서 15번 카드의 img 요소 확인
    const card15Info = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img[alt="The Devil"]');
      if (imgs.length > 0) {
        const img = imgs[0];
        return {
          src: img.src,
          currentSrc: img.currentSrc,
          srcset: img.srcset,
          loading: img.loading,
          decoding: img.decoding,
          style: img.getAttribute('style'),
          className: img.className,
          parentHTML: img.parentElement?.outerHTML
        };
      }
      return null;
    });
    
    console.log('\n15번 카드 img 요소 정보:');
    console.log(JSON.stringify(card15Info, null, 2));
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n테스트 중 오류:', error.message);
  }
  
  await browser.close();
})();