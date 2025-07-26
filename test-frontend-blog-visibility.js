const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🌐 프론트엔드 블로그 가시성 테스트...\n');
  
  try {
    // 1. 홈페이지 확인
    console.log('1️⃣ 홈페이지 접속...');
    await page.goto('http://localhost:4000', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'frontend-01-homepage.png', fullPage: true });
    
    // 홈페이지에서 블로그 링크 찾기
    const blogLink = await page.$('a[href*="blog"]');
    if (blogLink) {
      console.log('✅ 홈페이지에서 블로그 링크 발견');
    } else {
      console.log('⚠️ 홈페이지에서 블로그 링크를 찾을 수 없음');
    }
    
    // 2. 블로그 페이지 직접 접속
    console.log('2️⃣ 블로그 페이지 직접 접속...');
    await page.goto('http://localhost:4000/blog');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'frontend-02-blog-page.png', fullPage: true });
    
    // 3. 블로그 글 목록 확인
    console.log('3️⃣ 블로그 글 목록 확인...');
    
    // 블로그 카드나 링크 요소 찾기
    const blogPosts = await page.$$eval('article, .blog-post, [href*="/blog/"], h2, h3', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        textContent: el.textContent?.trim().substring(0, 100) || '',
        href: el.href || '',
        className: el.className || ''
      })).filter(el => 
        el.textContent.length > 10 && 
        (el.textContent.includes('타로') || el.textContent.includes('2024') || el.href.includes('/blog/'))
      )
    );
    
    console.log(`📝 발견된 블로그 관련 요소: ${blogPosts.length}개`);
    blogPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. [${post.tagName}] ${post.textContent}`);
      if (post.href) console.log(`      링크: ${post.href}`);
    });
    
    // 4. 특정 블로그 글 확인
    console.log('4️⃣ 특정 블로그 글 확인...');
    
    // 우리가 만든 SEO 블로그 글 찾기
    const seoPost = await page.$('text="2024 무료 타로카드 점"');
    if (seoPost) {
      console.log('✅ SEO 최적화 블로그 글 발견!');
      
      // 클릭해서 상세 페이지로 이동
      await seoPost.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'frontend-03-blog-detail.png', fullPage: true });
      
      // 상세 페이지 내용 확인
      const detailContent = await page.textContent('body');
      if (detailContent.includes('AI 기술로 더욱 정확해진')) {
        console.log('✅ 블로그 상세 내용 정상 표시됨');
      } else {
        console.log('❌ 블로그 상세 내용이 제대로 표시되지 않음');
      }
    } else {
      console.log('❌ SEO 블로그 글이 프론트엔드에서 보이지 않음');
      
      // 페이지 소스에서 확인
      const pageContent = await page.textContent('body');
      if (pageContent.includes('타로')) {
        console.log('⚠️ 페이지에 타로 관련 내용은 있음');
      } else {
        console.log('❌ 페이지에 타로 관련 내용도 없음');
      }
    }
    
    // 5. API 연결 상태 확인
    console.log('5️⃣ 프론트엔드 API 연결 확인...');
    
    // 브라우저 콘솔에서 API 호출 테스트
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/blog/posts');
        const data = await response.json();
        return {
          success: true,
          status: response.status,
          postsCount: data.posts?.length || 0,
          firstPostTitle: data.posts?.[0]?.title || 'No posts'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('📡 API 테스트 결과:', apiTest);
    
    if (apiTest.success && apiTest.postsCount > 0) {
      console.log('✅ 프론트엔드에서 API 정상 호출됨');
      console.log(`📝 총 ${apiTest.postsCount}개 글, 첫 번째: "${apiTest.firstPostTitle}"`);
    } else {
      console.log('❌ 프론트엔드에서 API 호출 실패');
    }
    
    // 6. 네비게이션 메뉴 확인
    console.log('6️⃣ 네비게이션 메뉴 확인...');
    await page.goto('http://localhost:4000');
    await page.waitForLoadState('networkidle');
    
    const navLinks = await page.$$eval('nav a, header a, .nav a', links => 
      links.map(link => ({
        text: link.textContent?.trim() || '',
        href: link.href || ''
      })).filter(link => 
        link.text.includes('블로그') || 
        link.text.includes('Blog') || 
        link.href.includes('/blog')
      )
    );
    
    console.log(`🧭 네비게이션 블로그 링크: ${navLinks.length}개`);
    navLinks.forEach((link, index) => {
      console.log(`   ${index + 1}. "${link.text}" -> ${link.href}`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'frontend-error.png', fullPage: true });
  } finally {
    console.log('\n🌐 프론트엔드 테스트 완료!');
    console.log('브라우저를 열어두었습니다. 확인 후 닫아주세요.');
  }
})();