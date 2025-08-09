const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('포트 4000 서버 블로그 페이지 접속 중...');
    
    // 블로그 페이지 접속
    await page.goto('http://localhost:4000/blog', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 스크린샷 촬영
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `blog-page-verification-${timestamp}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`스크린샷 저장 완료: ${screenshotPath}`);
    
    // 블로그 포스트 요소 확인
    const blogPosts = await page.locator('article, .blog-post, [class*="post"], [class*="card"]').count();
    console.log(`발견된 블로그 포스트 수: ${blogPosts}`);
    
    // 블로그 제목 확인
    const pageTitle = await page.title();
    console.log(`페이지 제목: ${pageTitle}`);
    
    // 페이지 콘텐츠 확인
    const hasContent = await page.locator('main, #main, .main-content, [role="main"]').count() > 0;
    console.log(`메인 콘텐츠 존재 여부: ${hasContent}`);
    
    // 블로그 관련 텍스트 확인
    const blogTexts = await page.locator('text=/blog/i, text=/post/i, text=/article/i').count();
    console.log(`블로그 관련 텍스트 발견: ${blogTexts}개`);
    
    // 30초 대기 (화면 확인용)
    console.log('화면 확인을 위해 30초 대기 중...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('에러 발생:', error.message);
    
    // 에러 시 스크린샷
    await page.screenshot({ 
      path: `blog-error-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('브라우저 종료');
  }
})();