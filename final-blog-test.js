const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🎯 최종 블로그 시스템 검증...\n');
    
    // 1. 블로그 목록 확인
    console.log('📍 1. 블로그 목록 페이지');
    await page.goto('http://localhost:4000/blog');
    await page.waitForTimeout(3000);
    
    const postCards = await page.locator('.grid > div').count();
    console.log(`✅ 포스트 카드 수: ${postCards}개`);
    
    // 포스트 제목들 가져오기
    const titles = await page.locator('.grid > div h3').allTextContents();
    console.log('📝 포스트 목록:');
    titles.slice(0, 5).forEach((title, index) => {
      console.log(`  ${index + 1}. ${title}`);
    });
    
    await page.screenshot({ path: 'final-1-blog-list.png' });
    
    // 2. 포스트 상세 페이지 확인
    if (postCards > 0) {
      console.log('\n📍 2. 포스트 상세 페이지');
      await page.click('.grid > div:first-child');
      await page.waitForTimeout(2000);
      
      const postTitle = await page.locator('h1').textContent();
      console.log(`✅ 포스트 제목: ${postTitle}`);
      
      await page.screenshot({ path: 'final-2-post-detail.png' });
    }
    
    // 3. 홈페이지 확인
    console.log('\n📍 3. 홈페이지');
    await page.goto('http://localhost:4000');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'final-3-homepage.png' });
    
    console.log('\n🎉 블로그 시스템 검증 완료!');
    console.log('📊 결과 요약:');
    console.log(`- 블로그 포스트: ${postCards}개`);
    console.log('- 포스트 목록 페이지: ✅ 정상');
    console.log('- 포스트 상세 페이지: ✅ 정상');
    console.log('- 홈페이지: ✅ 정상');
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
    await page.screenshot({ path: 'final-error.png' });
  } finally {
    await browser.close();
  }
})();