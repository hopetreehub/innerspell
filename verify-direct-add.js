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
    console.log('🎯 직접 추가한 포스트 확인...\n');
    
    // 1. 블로그 페이지 확인
    console.log('📍 1. 블로그 페이지 확인');
    await page.goto('http://localhost:4000/blog');
    await page.waitForTimeout(2000);
    
    // 포스트 수 확인
    const postCount = await page.locator('.grid > div').count();
    console.log(`✅ 블로그 페이지 포스트 수: ${postCount}개`);
    
    // 직접 추가한 포스트 확인
    const directPost = await page.locator('text="직접 추가 테스트 포스트"').isVisible();
    console.log(`✅ "직접 추가 테스트 포스트" 표시: ${directPost}`);
    
    await page.screenshot({ path: 'verify-1-blog-page.png' });
    
    // 2. 관리자 페이지 확인
    console.log('\n📍 2. 관리자 페이지 확인');
    await page.goto('http://localhost:4000/admin');
    await page.waitForTimeout(2000);
    
    // 블로그 관리 탭 클릭
    await page.click('button:has-text("블로그 관리")');
    await page.waitForTimeout(2000);
    
    // 포스트 통계 확인
    const totalPosts = await page.locator('text="전체 포스트"').locator('..').locator('..').locator('div.text-2xl').textContent();
    const publishedPosts = await page.locator('text="게시됨"').locator('..').locator('..').locator('div.text-2xl').textContent();
    console.log(`✅ 관리자 패널 - 전체 포스트: ${totalPosts}개`);
    console.log(`✅ 관리자 패널 - 게시된 포스트: ${publishedPosts}개`);
    
    await page.screenshot({ path: 'verify-2-admin-page.png' });
    
    console.log('\n🎉 확인 완료!');
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await browser.close();
  }
})();