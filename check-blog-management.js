const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('=== 관리자 대시보드 블로그 관리 검토 ===\n');
    
    // 관리자 대시보드 접속
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // 블로그 관리 탭 클릭
    const blogTab = await page.locator('button[role="tab"]:has-text("블로그 관리")').first();
    if (await blogTab.isVisible()) {
      console.log('블로그 관리 탭 클릭...');
      await blogTab.click();
      await page.waitForTimeout(3000);
    }
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'blog-management-overview.png',
      fullPage: true 
    });
    console.log('스크린샷 저장: blog-management-overview.png\n');
    
    // 하위 탭 확인
    console.log('=== 하위 탭 구성 ===');
    const subTabs = await page.locator('[role="tablist"] button[role="tab"]').allTextContents();
    subTabs.forEach((tab, index) => {
      console.log(`${index + 1}. ${tab}`);
    });
    
    // 포스트 목록 확인
    console.log('\n=== 포스트 목록 확인 ===');
    const postCount = await page.locator('table tbody tr').count();
    console.log(`총 포스트 수: ${postCount}개`);
    
    if (postCount > 0) {
      // 첫 번째 포스트 정보
      const firstPost = await page.locator('table tbody tr').first();
      const title = await firstPost.locator('td').nth(0).textContent();
      const category = await firstPost.locator('td').nth(1).textContent();
      const date = await firstPost.locator('td').nth(2).textContent();
      const status = await firstPost.locator('td').nth(3).textContent();
      
      console.log('\n첫 번째 포스트:');
      console.log(`- 제목: ${title}`);
      console.log(`- 카테고리: ${category}`);
      console.log(`- 작성일: ${date}`);
      console.log(`- 상태: ${status}`);
    }
    
    // 새 포스트 버튼 확인
    const newPostBtn = await page.locator('button:has-text("새 포스트")').first();
    if (await newPostBtn.isVisible()) {
      console.log('\n새 포스트 버튼 클릭...');
      await newPostBtn.click();
      await page.waitForTimeout(2000);
      
      // 다이얼로그 스크린샷
      await page.screenshot({ 
        path: 'blog-new-post-dialog.png',
        fullPage: true 
      });
      console.log('새 포스트 다이얼로그 스크린샷: blog-new-post-dialog.png');
      
      // 다이얼로그 필드 확인
      console.log('\n=== 포스트 작성 필드 ===');
      const fields = [
        { label: '제목', selector: 'input#title' },
        { label: '요약', selector: 'textarea#excerpt' },
        { label: '카테고리', selector: '[id="category"]' },
        { label: '태그', selector: 'input#tags' },
        { label: '본문', selector: 'textarea#content' }
      ];
      
      for (const field of fields) {
        const exists = await page.locator(field.selector).isVisible();
        console.log(`- ${field.label}: ${exists ? '✓' : '✗'}`);
      }
      
      // 다이얼로그 닫기
      const closeBtn = await page.locator('button:has-text("취소")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // 카테고리/태그 관리 탭
    console.log('\n카테고리/태그 관리 탭 클릭...');
    const categoryTab = await page.locator('button[role="tab"]:has-text("카테고리/태그 관리")').first();
    if (await categoryTab.isVisible()) {
      await categoryTab.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'blog-category-management.png',
        fullPage: true 
      });
      console.log('카테고리 관리 스크린샷: blog-category-management.png');
    }
    
    // 통계 탭
    console.log('\n통계 탭 클릭...');
    const analyticsTab = await page.locator('button[role="tab"]:has-text("통계")').first();
    if (await analyticsTab.isVisible()) {
      await analyticsTab.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'blog-analytics.png',
        fullPage: true 
      });
      console.log('블로그 통계 스크린샷: blog-analytics.png');
      
      // 통계 값 확인
      const statsCards = await page.locator('.grid > div').all();
      console.log('\n=== 블로그 통계 ===');
      for (let i = 0; i < Math.min(3, statsCards.length); i++) {
        const card = statsCards[i];
        const title = await card.locator('h3').textContent().catch(() => '');
        const value = await card.locator('.text-3xl').textContent().catch(() => '');
        console.log(`${title}: ${value}`);
      }
    }
    
    console.log('\n검토 완료!');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
})();