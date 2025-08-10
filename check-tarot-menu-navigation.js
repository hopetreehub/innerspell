const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== 타로 메뉴 네비게이션 확인 ===\n');
    
    // 1. 홈페이지 접속
    console.log('1. 홈페이지 접속...');
    await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 2. 타로카드 메뉴 클릭
    console.log('\n2. 타로카드 메뉴 확인...');
    const tarotMenu = await page.locator('text=타로카드').isVisible();
    console.log('타로카드 메뉴 존재:', tarotMenu);
    
    if (tarotMenu) {
      await page.click('text=타로카드');
      await page.waitForTimeout(2000);
      
      // 현재 URL 확인
      console.log('현재 URL:', page.url());
      
      // 페이지 내용 확인
      const pageContent = await page.locator('body').textContent();
      console.log('\n페이지 내용:');
      console.log('- "타로 카드 히스토리" 존재:', pageContent.includes('타로 카드 히스토리'));
      console.log('- "나의 타로 리딩 기록" 존재:', pageContent.includes('나의 타로 리딩 기록'));
      
      // 스크린샷
      await page.screenshot({ path: 'tarot-page-current.png', fullPage: true });
      console.log('\n타로 페이지 스크린샷: tarot-page-current.png');
    }
    
    // 3. 직접 URL로 다시 시도
    console.log('\n3. 직접 URL 접근 시도...');
    await page.goto('http://localhost:4000/tarot/history', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const finalUrl = page.url();
    const finalContent = await page.locator('body').textContent();
    
    console.log('\n최종 상태:');
    console.log('- URL:', finalUrl);
    console.log('- 404 에러:', finalContent.includes('404'));
    console.log('- 타로 관련 내용:', finalContent.includes('타로'));
    
    // 최종 스크린샷
    await page.screenshot({ path: 'tarot-history-final-state.png', fullPage: true });
    console.log('\n최종 스크린샷: tarot-history-final-state.png');
    
  } catch (error) {
    console.error('\n에러 발생:', error.message);
    await page.screenshot({ path: 'navigation-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();