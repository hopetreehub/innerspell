const { chromium } = require('playwright');

(async () => {
  console.log('=== 최종 로컬 테스트 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security'] // CORS 문제 방지
  });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4000/tarot');
    
    // 이미지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 추가 대기
    
    // 15-21번 카드 이미지 상태 확인
    const results = await page.evaluate(() => {
      const results = [];
      for (let i = 15; i <= 21; i++) {
        const badge = Array.from(document.querySelectorAll('.absolute.top-2.left-2'))
          .find(el => el.textContent === i.toString().padStart(2, '0'));
        
        if (badge) {
          const card = badge.closest('.group');
          const img = card?.querySelector('img');
          if (img) {
            // 이미지가 로드될 때까지 대기
            if (!img.complete) {
              img.decode?.().catch(() => {});
            }
            
            results.push({
              number: i,
              alt: img.alt,
              src: img.src,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              complete: img.complete,
              currentSrc: img.currentSrc,
              loaded: img.naturalWidth > 0 && img.naturalHeight > 0
            });
          }
        }
      }
      return results;
    });
    
    console.log('15-21번 카드 이미지 상태:');
    results.forEach(result => {
      const status = result.loaded ? '✅' : '❌';
      console.log(`${result.number}. ${result.alt}: ${status} (${result.naturalWidth}x${result.naturalHeight}, complete: ${result.complete})`);
    });
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'final-local-test.png', 
      fullPage: false,
      clip: { x: 0, y: 300, width: 1200, height: 800 }
    });
    
    console.log('\n스크린샷 저장: final-local-test.png');
    
  } catch (error) {
    console.error('오류:', error.message);
  }
  
  console.log('\n브라우저를 30초 동안 열어둡니다. 직접 확인해보세요...');
  await page.waitForTimeout(30000);
  await browser.close();
})();