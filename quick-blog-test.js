const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log('블로그 페이지 접속 중...');
    await page.goto('http://localhost:4000/blog', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    // 페이지 로드 후 잠시 대기
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'blog-quick-test.png',
      fullPage: true 
    });
    console.log('스크린샷 저장: blog-quick-test.png');
    
    // 페이지 URL과 제목 확인
    console.log('현재 URL:', page.url());
    console.log('페이지 제목:', await page.title());
    
    // 페이지에 있는 링크들 확인
    const links = await page.locator('a').allTextContents();
    console.log('페이지 링크들:', links.slice(0, 10)); // 처음 10개만 출력

  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ 
      path: 'blog-error-test.png',
      fullPage: true 
    });
  }

  await browser.close();
})();