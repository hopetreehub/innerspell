const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });
  
  let page;
  try {
    const context = await browser.newContext();
    page = await context.newPage();
    
    console.log('=== 카드 선택 Force Click 테스트 ===\n');
    
    // 타로 읽기 페이지 직접 접속
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // 질문 입력
    await page.locator('textarea').fill('테스트 질문입니다.');
    
    // 카드 섞기
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(3000);
    
    // 카드 펼치기
    await page.locator('button:has-text("카드 펼치기")').click();
    await page.waitForTimeout(2000);
    
    console.log('카드 선택 시도...');
    
    // Force click 사용
    const cardButtons = await page.locator('div[role="button"][aria-label*="카드"]').all();
    console.log(`발견된 카드: ${cardButtons.length}개`);
    
    if (cardButtons.length >= 3) {
      for (let i = 0; i < 3; i++) {
        try {
          // force: true 옵션으로 클릭
          await cardButtons[i].click({ force: true });
          console.log(`✓ 카드 ${i + 1} 선택 성공`);
          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`❌ 카드 ${i + 1} 선택 실패:`, e.message);
        }
      }
      
      await page.screenshot({ path: 'screenshots/force_click_result.png' });
      
      // 해석 버튼 상태 확인
      const interpretBtn = await page.locator('button:has-text("해석")');
      const isDisabled = await interpretBtn.isDisabled();
      console.log(`\n해석 버튼: ${isDisabled ? '비활성화' : '활성화'}`);
    }
    
    console.log('\n테스트 완료');
    
  } catch (error) {
    console.error('오류:', error.message);
  }
})();