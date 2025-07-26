const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('최종 블로그 확인 테스트...\n');
  
  try {
    // 1. 블로그 페이지 접속
    console.log('1. 블로그 페이지 접속...');
    await page.goto('http://localhost:4000/blog');
    
    // 2. 충분한 로딩 시간 대기
    console.log('2. 컨텐츠 로딩 대기...');
    await page.waitForTimeout(10000);
    
    // 3. 스크린샷
    await page.screenshot({ path: 'final-blog-with-posts.png', fullPage: true });
    
    // 4. 블로그 글 제목들 확인
    const blogTitles = await page.$$eval('h3, h2, h1', elements => 
      elements.map(el => el.textContent?.trim()).filter(text => 
        text && 
        text.length > 10 && 
        !text.includes('InnerSpell') && 
        !text.includes('블로그') &&
        (text.includes('타로') || text.includes('꿈') || text.includes('AI') || text.includes('영적') || text.includes('2025'))
      )
    );
    
    console.log(`3. 발견된 블로그 글 제목들 (${blogTitles.length}개):`);
    blogTitles.forEach((title, index) => {
      console.log(`   ${index + 1}. ${title}`);
    });
    
    // 5. API에서 실제 데이터 확인
    const apiData = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/blog/posts');
        const data = await response.json();
        return {
          success: true,
          count: data.posts?.length || 0,
          titles: data.posts?.map(post => post.title) || []
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log(`\n4. API 데이터 확인:`);
    console.log(`   API 성공: ${apiData.success}`);
    console.log(`   총 글 개수: ${apiData.count}`);
    
    if (apiData.success && apiData.titles) {
      console.log('   API 블로그 글 제목들:');
      apiData.titles.forEach((title, index) => {
        console.log(`     ${index + 1}. ${title}`);
      });
    }
    
    // 6. 결과 분석
    const blogDisplayed = blogTitles.length > 0;
    const apiWorking = apiData.success && apiData.count > 0;
    
    console.log(`\n5. 최종 결과:`);
    console.log(`   프론트엔드 블로그 표시: ${blogDisplayed ? '성공' : '실패'}`);
    console.log(`   API 데이터 제공: ${apiWorking ? '성공' : '실패'}`);
    
    if (apiWorking && blogDisplayed) {
      console.log('   상태: 완전 성공 - 블로그 시스템이 정상 작동합니다!');
    } else if (apiWorking && !blogDisplayed) {
      console.log('   상태: 부분 성공 - API는 작동하지만 프론트엔드 렌더링 문제 있음');
    } else {
      console.log('   상태: 문제 있음 - 추가 디버깅 필요');
    }
    
    setTimeout(() => {
      browser.close();
    }, 5000);
    
  } catch (error) {
    console.error('테스트 오류:', error);
    await page.screenshot({ path: 'final-blog-error.png', fullPage: true });
    await browser.close();
  }
})();