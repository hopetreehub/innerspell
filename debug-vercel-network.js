const { chromium } = require('playwright');

(async () => {
  console.log('=== Vercel 네트워크 디버깅 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  // 네트워크 요청 로깅
  const failedRequests = [];
  page.on('requestfailed', request => {
    if (request.url().includes('images/tarot')) {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
    }
  });
  
  // 응답 로깅
  page.on('response', response => {
    if (response.url().includes('images/tarot') && (response.url().includes('15-') || response.url().includes('16-') || response.url().includes('17-') || response.url().includes('18-') || response.url().includes('19-') || response.url().includes('20-') || response.url().includes('21-'))) {
      console.log(`${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    await page.goto('https://test-studio-firebase.vercel.app/tarot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // 15번 카드의 실제 HTML 확인
    const card15Data = await page.evaluate(() => {
      const cards = document.querySelectorAll('.group');
      for (const card of cards) {
        const badge = card.querySelector('.absolute.top-2.left-2');
        if (badge && badge.textContent === '15') {
          const img = card.querySelector('img');
          if (img) {
            return {
              outerHTML: img.outerHTML,
              computedStyle: {
                display: window.getComputedStyle(img).display,
                visibility: window.getComputedStyle(img).visibility,
                opacity: window.getComputedStyle(img).opacity,
                width: window.getComputedStyle(img).width,
                height: window.getComputedStyle(img).height
              },
              src: img.src,
              currentSrc: img.currentSrc,
              error: img.error,
              complete: img.complete,
              naturalWidth: img.naturalWidth
            };
          }
        }
      }
      return null;
    });
    
    console.log('\n15번 카드 img 요소 분석:');
    console.log(JSON.stringify(card15Data, null, 2));
    
    console.log('\n실패한 요청:');
    failedRequests.forEach(req => {
      console.log(`❌ ${req.url}`);
      console.log(`   실패 이유: ${req.failure?.errorText}`);
    });
    
    // 콘솔 에러 캡처
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });
    
  } catch (error) {
    console.error('오류:', error.message);
  }
  
  console.log('\n브라우저를 20초 후 닫습니다...');
  await page.waitForTimeout(20000);
  await browser.close();
})();