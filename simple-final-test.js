const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 2000 });
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('1. 블로그 페이지 접속...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: 'FINAL-SUCCESS-blog-list.png', 
      fullPage: true 
    });
    console.log('✅ 스크린샷 저장: FINAL-SUCCESS-blog-list.png');

    const postTitles = await page.locator('h3').allTextContents();
    console.log('포스트 제목들:', postTitles);

    if (postTitles.some(title => title.includes('발행된'))) {
      console.log('✅ 성공! 게시된 포스트가 표시됩니다!');
      
      const readButton = page.locator('text=읽기').first();
      if (await readButton.count() > 0) {
        await readButton.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'FINAL-SUCCESS-post-details.png', 
          fullPage: true 
        });
        console.log('✅ 스크린샷 저장: FINAL-SUCCESS-post-details.png');
      }
    }

  } catch (error) {
    console.error('오류:', error);
    await page.screenshot({ 
      path: 'final-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('테스트 완료!');
  }
})();