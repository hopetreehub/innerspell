const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🎯 최종 프론트엔드 블로그 표시 테스트...\n');
  
  try {
    // 1. 블로그 페이지 접속
    console.log('1️⃣ 블로그 페이지 접속...');
    await page.goto('http://localhost:4000/blog', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    // 5초 대기 후 다시 확인 (로딩 완료 대기)
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'final-frontend-01-blog-page.png', fullPage: true });
    
    // 2. 테스트 블로그 글 찾기
    console.log('2️⃣ 테스트 블로그 글 검색...');
    
    const testPost = await page.$('text="프론트엔드 테스트용 블로그 글"');
    if (testPost) {
      console.log('🎉 테스트 블로그 글 발견!');
      
      // 클릭해서 상세 페이지로 이동
      await testPost.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'final-frontend-02-blog-detail.png', fullPage: true });
      
      console.log('✅ 블로그 상세 페이지 접속 성공');
      
      // 뒤로 가기
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
    } else {
      console.log('❌ 테스트 블로그 글을 찾을 수 없음');
      
      // 페이지 내용 확인
      const pageContent = await page.textContent('body');
      if (pageContent.includes('프론트엔드')) {
        console.log('⚠️ 페이지에 "프론트엔드" 텍스트는 있음');
      } else {
        console.log('❌ 페이지에 관련 텍스트도 없음');
      }
      
      // HTML 구조 확인
      const articles = await page.$$eval('article, .card, [class*="post"], h1, h2, h3', elements => 
        elements.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 50) || '',
          classes: el.className
        })).filter(el => el.text.length > 5)
      );
      
      console.log(`📋 페이지 요소들 (${articles.length}개):`);
      articles.slice(0, 10).forEach((article, index) => {
        console.log(`   ${index + 1}. [${article.tag}] ${article.text}... (${article.classes})`);
      });
    }
    
    // 3. API 상태 재확인
    console.log('3️⃣ API 상태 재확인...');
    const apiCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/blog/posts');
        const data = await response.json();
        
        return {
          success: true,
          status: response.status,
          postsCount: data.posts?.length || 0,
          firstPostTitle: data.posts?.[0]?.title || 'No title',
          firstPostPublished: data.posts?.[0]?.published || false
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('📡 API 확인 결과:', apiCheck);
    
    if (apiCheck.success && apiCheck.postsCount > 0) {
      console.log('✅ API에서 블로그 글 확인됨');
      console.log(`📝 첫 번째 글: "${apiCheck.firstPostTitle}" (발행됨: ${apiCheck.firstPostPublished})`);
    } else {
      console.log('❌ API에서 블로그 글을 찾을 수 없음');
    }
    
    // 4. 콘솔 오류 확인
    console.log('4️⃣ 브라우저 콘솔 오류 확인...');
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 페이지 새로고침해서 오류 캐치
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length > 0) {
      console.log('🔴 브라우저 콘솔 오류들:');
      consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ 브라우저 콘솔 오류 없음');
    }
    
    await page.screenshot({ path: 'final-frontend-03-after-reload.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await page.screenshot({ path: 'final-frontend-error.png', fullPage: true });
  } finally {
    console.log('\n🎯 최종 프론트엔드 테스트 완료!');
    console.log('브라우저를 확인해주세요.');
    
    // 5초 후 자동 종료
    setTimeout(() => {
      browser.close();
    }, 5000);
  }
})();