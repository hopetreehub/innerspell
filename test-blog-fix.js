const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔧 블로그 수정 사항 테스트...\n');
  
  try {
    // 1. 콘솔 로그 캐치
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('🎯 브라우저 로그:', msg.text());
      } else if (msg.type() === 'error') {
        console.log('🔴 브라우저 에러:', msg.text());
      }
    });
    
    // 2. 블로그 페이지 접속
    console.log('1️⃣ 블로그 페이지 접속...');
    await page.goto('http://localhost:4000/blog');
    
    // 3. 로딩 완료 대기 (더 길게)
    console.log('2️⃣ 로딩 완료 대기...');
    await page.waitForTimeout(8000);
    
    // 4. 스크린샷
    await page.screenshot({ path: 'test-blog-fix-result.png', fullPage: true });
    
    // 5. 콘텐츠 확인
    const content = await page.textContent('body');
    const hasTestPost = content.includes('프론트엔드 테스트용 블로그 글');
    
    console.log(`3️⃣ 테스트 블로그 글 발견: ${hasTestPost ? '✅ 성공!' : '❌ 실패'}`);
    
    if (hasTestPost) {
      console.log('🎉 블로그 렌더링 수정 완료!');
    } else {
      console.log('⚠️ 여전히 문제가 있음');
      
      // 페이지 상태 확인
      const elements = await page.$$eval('[class*="animate-pulse"], .h-64', els => 
        els.map(el => ({ 
          className: el.className, 
          visible: el.style.display !== 'none' 
        }))
      );
      
      console.log('📋 로딩 스켈레톤 요소들:', elements.length);
    }
    
    // 6. 5초 후 종료
    setTimeout(() => {
      browser.close();
    }, 5000);
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
    await page.screenshot({ path: 'test-blog-fix-error.png', fullPage: true });
    await browser.close();
  }
})();