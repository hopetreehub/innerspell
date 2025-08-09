const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📍 블로그 관리 기능 상태 확인...\n');

    // 1. 관리자 페이지에서 블로그 관리 탭 확인
    console.log('1️⃣ 관리자 대시보드 접속...');
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');
    
    // 블로그 관리 탭 클릭
    console.log('2️⃣ 블로그 관리 탭 클릭...');
    const blogTab = page.locator('button:has-text("블로그 관리")');
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'blog-management-01-tab.png' });
      console.log('✅ 블로그 관리 탭 접근 성공\n');
      
      // 블로그 포스트 목록 확인
      const posts = await page.locator('table tbody tr').count();
      console.log(`📊 현재 등록된 블로그 포스트: ${posts}개\n`);
      
      // 새 포스트 작성 버튼 확인
      const newPostBtn = page.locator('button:has-text("새 포스트 작성")');
      if (await newPostBtn.isVisible()) {
        console.log('✅ 새 포스트 작성 버튼 확인됨');
      }
    } else {
      console.log('❌ 블로그 관리 탭을 찾을 수 없습니다');
    }

    // 2. 프론트엔드 블로그 페이지 확인
    console.log('\n3️⃣ 프론트엔드 블로그 페이지 확인...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'blog-management-02-frontend.png' });
    
    const frontendPosts = await page.locator('article').count();
    console.log(`📊 프론트엔드에 표시된 포스트: ${frontendPosts}개`);

    // 3. API 엔드포인트 확인
    console.log('\n4️⃣ 블로그 API 엔드포인트 확인...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:4000/api/blog/posts');
        const data = await response.json();
        return { success: true, posts: data.posts?.length || 0 };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (apiResponse.success) {
      console.log(`✅ API 응답 성공 - 포스트 개수: ${apiResponse.posts}개`);
    } else {
      console.log(`❌ API 에러: ${apiResponse.error}`);
    }

    console.log('\n🎯 블로그 관리 기능 점검 완료!');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    await page.screenshot({ path: 'blog-management-error.png' });
  } finally {
    await browser.close();
  }
})();