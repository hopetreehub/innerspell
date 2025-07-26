const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔄 업데이트된 프론트엔드 블로그 테스트...\n');
  
  try {
    // 1. 블로그 페이지 접속
    console.log('1️⃣ 블로그 페이지 접속...');
    await page.goto('http://localhost:4000/blog', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    // 로딩 상태 확인
    const isLoading = await page.$('.animate-pulse');
    if (isLoading) {
      console.log('⏳ 로딩 중... 잠시 대기');
      await page.waitForTimeout(5000);
    }
    
    await page.screenshot({ path: 'updated-frontend-01-blog-page.png', fullPage: true });
    
    // 2. 실제 블로그 글 확인
    console.log('2️⃣ 블로그 글 검색...');
    
    // 우리가 만든 SEO 블로그 글 찾기
    const seoPost = await page.$('text="2024 무료 타로카드 점"');
    if (seoPost) {
      console.log('🎉 SEO 블로그 글 발견!');
      
      // 글 제목과 요약 확인
      const postCard = await seoPost.locator('..').locator('..').locator('..');
      const postInfo = await postCard.evaluate(card => ({
        title: card.querySelector('h2, h3, .title')?.textContent?.trim() || '',
        excerpt: card.querySelector('p, .excerpt')?.textContent?.trim() || '',
        category: card.querySelector('.badge, .category')?.textContent?.trim() || ''
      }));
      
      console.log('📝 글 정보:');
      console.log(`   제목: ${postInfo.title}`);
      console.log(`   요약: ${postInfo.excerpt.substring(0, 100)}...`);
      console.log(`   카테고리: ${postInfo.category}`);
      
      // 상세 페이지로 이동
      await seoPost.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'updated-frontend-02-blog-detail.png', fullPage: true });
      
      console.log('✅ 블로그 상세 페이지 접속 성공');
      
    } else {
      console.log('❌ SEO 블로그 글을 찾을 수 없음');
      
      // 페이지에서 다른 블로그 글들 확인
      const allPosts = await page.$$eval('article, .blog-card, [class*="post"]', elements => 
        elements.map(el => el.textContent?.trim().substring(0, 100) || '').filter(text => text.length > 10)
      );
      
      console.log(`📋 페이지의 다른 글들 (${allPosts.length}개):`);
      allPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post}...`);
      });
    }
    
    // 3. 콘솔에서 직접 API 호출 테스트
    console.log('3️⃣ 브라우저에서 API 직접 테스트...');
    const apiTest = await page.evaluate(async () => {
      try {
        console.log('API 호출 시작...');
        const response = await fetch('/api/blog/posts');
        const data = await response.json();
        console.log('API 응답:', data);
        
        return {
          success: true,
          status: response.status,
          postsCount: data.posts?.length || 0,
          posts: data.posts?.map(p => ({
            id: p.id,
            title: p.title,
            published: p.published,
            featured: p.featured
          })) || []
        };
      } catch (error) {
        console.error('API 오류:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('🔍 브라우저 API 테스트 결과:');
    console.log(`   성공: ${apiTest.success}`);
    console.log(`   상태: ${apiTest.status}`);
    console.log(`   글 개수: ${apiTest.postsCount}`);
    
    if (apiTest.posts && apiTest.posts.length > 0) {
      console.log('📝 발견된 글들:');
      apiTest.posts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title} (발행: ${post.published}, 추천: ${post.featured})`);
      });
    }
    
    // 4. Firebase 연결 상태 확인
    console.log('4️⃣ Firebase 연결 상태 확인...');
    const firebaseStatus = await page.evaluate(() => {
      return {
        hasFirestore: typeof window.firebase !== 'undefined' || typeof window.firestore !== 'undefined',
        userAgent: navigator.userAgent,
        location: window.location.href
      };
    });
    
    console.log('🔥 Firebase 상태:', firebaseStatus);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'updated-frontend-error.png', fullPage: true });
  } finally {
    console.log('\n🔄 업데이트된 프론트엔드 테스트 완료!');
    console.log('브라우저를 열어두었습니다. 확인 후 닫아주세요.');
  }
})();