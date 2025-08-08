const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('=== 블로그 페이지 포스트 확인 ===\n');
    
    // 블로그 페이지 접속
    await page.goto('http://localhost:4000/blog', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 스크린샷
    await page.screenshot({ 
      path: 'blog-page-posts.png',
      fullPage: true 
    });
    console.log('블로그 페이지 스크린샷: blog-page-posts.png\n');
    
    // 포스트 목록 확인
    const posts = await page.locator('article, .blog-post, [class*="post"], [class*="card"]').all();
    console.log(`총 포스트 수: ${posts.length}개\n`);
    
    // 각 포스트 정보 추출
    console.log('=== 블로그 페이지 포스트 목록 ===');
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // 제목 찾기
      const title = await post.locator('h2, h3, [class*="title"]').first().textContent().catch(() => '제목 없음');
      
      // 카테고리 찾기
      const category = await post.locator('[class*="category"], [class*="badge"]').first().textContent().catch(() => '');
      
      // 날짜 찾기
      const date = await post.locator('time, [class*="date"]').first().textContent().catch(() => '');
      
      // 요약 찾기
      const excerpt = await post.locator('p, [class*="excerpt"], [class*="description"]').first().textContent().catch(() => '');
      
      console.log(`\n포스트 ${i + 1}:`);
      console.log(`- 제목: ${title}`);
      console.log(`- 카테고리: ${category}`);
      console.log(`- 날짜: ${date}`);
      console.log(`- 요약: ${excerpt.substring(0, 50)}...`);
    }
    
    // API로 포스트 데이터 가져오기
    console.log('\n\n=== API 포스트 데이터 ===');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/blog/posts?published=true');
        const data = await response.json();
        return data;
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (apiResponse.posts) {
      console.log(`API 포스트 수: ${apiResponse.posts.length}개\n`);
      apiResponse.posts.forEach((post, index) => {
        console.log(`포스트 ${index + 1}:`);
        console.log(`- ID: ${post.id}`);
        console.log(`- 제목: ${post.title}`);
        console.log(`- 카테고리: ${post.category}`);
        console.log(`- 게시일: ${post.publishedAt}`);
        console.log(`- 상태: ${post.published ? '게시됨' : '미게시'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
})();