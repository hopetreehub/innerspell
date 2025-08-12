const { chromium } = require('playwright');

(async () => {
  console.log('=== 페이지 소스 확인 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4000/tarot');
    await page.waitForTimeout(3000);
    
    // 15번 카드가 포함된 영역 찾기
    const card15HTML = await page.evaluate(() => {
      const cards = document.querySelectorAll('.group');
      for (const card of cards) {
        const badge = card.querySelector('.absolute.top-2.left-2');
        if (badge && badge.textContent === '15') {
          return card.innerHTML;
        }
      }
      return 'Card 15 not found';
    });
    
    console.log('15번 카드 HTML:');
    console.log(card15HTML);
    
    // img vs Image 컴포넌트 사용 확인
    const imageStats = await page.evaluate(() => {
      const allImages = document.querySelectorAll('img');
      const stats = {
        totalImages: allImages.length,
        nextImages: 0,
        regularImages: 0,
        card15to21: []
      };
      
      allImages.forEach(img => {
        if (img.src.includes('/_next/image')) {
          stats.nextImages++;
        } else {
          stats.regularImages++;
        }
        
        // 15-21번 카드 확인
        const cardNames = ['The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];
        if (cardNames.includes(img.alt)) {
          stats.card15to21.push({
            alt: img.alt,
            src: img.src,
            isNextImage: img.src.includes('/_next/image')
          });
        }
      });
      
      return stats;
    });
    
    console.log('\n이미지 통계:');
    console.log(JSON.stringify(imageStats, null, 2));
    
  } catch (error) {
    console.error('오류:', error.message);
  }
  
  await browser.close();
})();