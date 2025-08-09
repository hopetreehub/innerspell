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
    await page.waitForTimeout(5000);
    
    console.log('현재 URL:', page.url());
    console.log('페이지 제목:', await page.title());
    
    // 페이지의 모든 텍스트 확인
    const bodyText = await page.locator('body').textContent();
    console.log('\n=== 페이지 전체 텍스트 ===');
    console.log(bodyText.substring(0, 1000) + '...');
    
    // 모든 링크 확인
    const allLinks = await page.locator('a').allTextContents();
    console.log('\n=== 모든 링크 텍스트 ===');
    console.log(allLinks);
    
    // "읽기" 또는 "더보기" 같은 버튼 찾기
    const readButtons = await page.locator('a:has-text("읽기"), a:has-text("더보기"), a:has-text("read"), a:has-text("more")').count();
    console.log(`\n읽기/더보기 버튼 개수: ${readButtons}`);
    
    // 블로그 포스트 카드나 항목 찾기
    const blogPosts = await page.locator('[class*="post"], [class*="article"], [class*="blog"]').count();
    console.log(`블로그 포스트 요소 개수: ${blogPosts}`);
    
    // 특정 블로그 관련 텍스트 확인
    const hasNoPostsMessage = await page.locator('text=포스트가 없습니다').isVisible();
    console.log(`"포스트가 없습니다" 메시지 표시: ${hasNoPostsMessage}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'detailed-blog-test.png',
      fullPage: true 
    });
    console.log('상세 스크린샷 저장: detailed-blog-test.png');

  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ 
      path: 'detailed-blog-error.png',
      fullPage: true 
    });
  }

  await browser.close();
})();