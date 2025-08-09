const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📍 블로그 데이터 마이그레이션 확인...\n');

    // 1. 프론트엔드 블로그 페이지 확인
    console.log('1️⃣ 블로그 페이지 접속...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'blog-data-01-frontend.png' });
    
    const blogPosts = await page.locator('article').count();
    console.log(`✅ 블로그 페이지에 표시된 포스트: ${blogPosts}개`);
    
    if (blogPosts > 0) {
      // 첫 번째 포스트 제목 확인
      const firstTitle = await page.locator('article h2').first().textContent();
      console.log(`   첫 번째 포스트: "${firstTitle}"`);
    }

    // 2. API 응답 확인
    console.log('\n2️⃣ API 엔드포인트 확인...');
    const apiResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:4000/api/blog/posts');
      const data = await response.json();
      return data;
    });
    
    console.log(`✅ API 응답 - 포스트 개수: ${apiResponse.posts?.length || 0}개`);
    if (apiResponse.posts?.length > 0) {
      console.log(`   카테고리 분포:`);
      const categories = {};
      apiResponse.posts.forEach(post => {
        categories[post.category] = (categories[post.category] || 0) + 1;
      });
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`   - ${cat}: ${count}개`);
      });
    }

    // 3. 관리자 대시보드 확인
    console.log('\n3️⃣ 관리자 대시보드 블로그 관리 탭...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 블로그 관리 탭 클릭
    const blogTab = page.locator('button:has-text("블로그 관리")');
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'blog-data-02-admin.png' });
      
      // 테이블에 표시된 포스트 수 확인
      const adminPosts = await page.locator('table tbody tr').count();
      console.log(`✅ 관리자 대시보드에 표시된 포스트: ${adminPosts}개`);
    }

    console.log('\n🎯 블로그 데이터 마이그레이션 확인 완료!');
    console.log('📊 요약:');
    console.log(`   - 프론트엔드: ${blogPosts}개 포스트`);
    console.log(`   - API 응답: ${apiResponse.posts?.length || 0}개 포스트`);
    console.log(`   - 예상: 12개 포스트`);

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    await page.screenshot({ path: 'blog-data-error.png' });
  } finally {
    await browser.close();
  }
})();