const { chromium } = require('playwright');

async function testBlogPages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  try {
    // 1. 로컬 환경 테스트
    console.log('=== 로컬 환경 테스트 (http://localhost:4000/blog) ===');
    const localPage = await context.newPage();
    
    try {
      await localPage.goto('http://localhost:4000/blog', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // 스크린샷 촬영
      await localPage.screenshot({ 
        path: 'screenshots/blog-local-page.png',
        fullPage: true 
      });
      
      console.log('✅ 로컬 블로그 페이지 접속 성공');
      
      // 블로그 포스트 확인
      const posts = await localPage.$$('.blog-post, article, [class*="post"]');
      console.log(`- 블로그 포스트 개수: ${posts.length}`);
      
      // 페이지 제목 확인
      const title = await localPage.title();
      console.log(`- 페이지 제목: ${title}`);
      
    } catch (error) {
      console.log('❌ 로컬 블로그 페이지 접속 실패:', error.message);
      await localPage.screenshot({ 
        path: 'screenshots/blog-local-error.png',
        fullPage: true 
      });
    }
    
    // 2. Vercel 환경 테스트
    console.log('\n=== Vercel 환경 테스트 (https://test-studio-firebase.vercel.app/blog) ===');
    const vercelPage = await context.newPage();
    
    try {
      await vercelPage.goto('https://test-studio-firebase.vercel.app/blog', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // 스크린샷 촬영
      await vercelPage.screenshot({ 
        path: 'screenshots/blog-vercel-page.png',
        fullPage: true 
      });
      
      console.log('✅ Vercel 블로그 페이지 접속 성공');
      
      // 블로그 포스트 확인
      const posts = await vercelPage.$$('.blog-post, article, [class*="post"]');
      console.log(`- 블로그 포스트 개수: ${posts.length}`);
      
      // 페이지 제목 확인
      const title = await vercelPage.title();
      console.log(`- 페이지 제목: ${title}`);
      
      // 블로그 내용 샘플 확인
      const firstPost = posts[0];
      if (firstPost) {
        const postTitle = await firstPost.$eval('h2, h3, [class*="title"]', el => el.textContent).catch(() => 'N/A');
        console.log(`- 첫 번째 포스트 제목: ${postTitle}`);
      }
      
    } catch (error) {
      console.log('❌ Vercel 블로그 페이지 접속 실패:', error.message);
      await vercelPage.screenshot({ 
        path: 'screenshots/blog-vercel-error.png',
        fullPage: true 
      });
    }
    
    // 3분 대기
    console.log('\n브라우저를 3분간 열어둡니다...');
    await new Promise(resolve => setTimeout(resolve, 180000));
    
  } finally {
    await browser.close();
  }
}

testBlogPages().catch(console.error);