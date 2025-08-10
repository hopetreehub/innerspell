const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 타로 히스토리 페이지로 이동
    console.log('타로 히스토리 페이지로 이동 중...');
    await page.goto('http://localhost:4000/tarot/history');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('페이지 제목:', title);
    
    // 로그인 메시지 확인
    const loginMessage = await page.locator('text=/로그인이 필요합니다/i').isVisible();
    console.log('로그인 메시지 표시 여부:', loginMessage);
    
    // 페이지 내용 확인
    const pageContent = await page.locator('body').textContent();
    console.log('\n페이지 주요 내용:');
    console.log('- 타로 카드 히스토리 텍스트 존재:', pageContent.includes('타로 카드 히스토리'));
    console.log('- 로그인 필요 메시지 존재:', pageContent.includes('로그인이 필요합니다'));
    console.log('- 로그인 버튼 존재:', pageContent.includes('로그인'));
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'tarot-history-page.png', fullPage: true });
    console.log('\n스크린샷 저장 완료: tarot-history-page.png');
    
    // 로그인 버튼 확인
    const loginButton = await page.locator('a:has-text("로그인")').isVisible();
    console.log('로그인 버튼 표시 여부:', loginButton);
    
    if (loginButton) {
      const loginHref = await page.locator('a:has-text("로그인")').getAttribute('href');
      console.log('로그인 버튼 링크:', loginHref);
    }
    
  } catch (error) {
    console.error('에러 발생:', error.message);
    await page.screenshot({ path: 'tarot-history-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();