const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== AI 해석 버튼 수정 검증 ===\n');
  
  try {
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(2000);
    
    // 빠른 테스트 진행
    await page.fill('textarea', '오늘의 운세는?');
    await page.click('button:text("카드 섞기")');
    await page.waitForTimeout(2000);
    await page.click('button:text("카드 펼치기")');
    await page.waitForTimeout(2000);
    
    // 카드 3장 선택
    const cards = await page.$$('div[role="button"][aria-label*="카드 선택"]');
    for (let i = 0; i < 3; i++) {
      await cards[i].click();
      await page.waitForTimeout(500);
    }
    
    // 버튼 확인
    const button = await page.$('button:text("AI 해석 받기")');
    if (button && await button.isVisible()) {
      console.log('✅ AI 해석 버튼이 정상적으로 표시됩니다!');
      console.log('✅ 문제가 해결되었습니다!');
      
      // 스크린샷
      await page.screenshot({ path: 'success-button-visible.png' });
      console.log('\n스크린샷: success-button-visible.png');
    } else {
      console.log('❌ 버튼이 여전히 보이지 않습니다.');
    }
    
  } catch (error) {
    console.error('오류:', error.message);
  }
  
  console.log('\n10초 후 브라우저가 닫힙니다...');
  await page.waitForTimeout(10000);
  await browser.close();
})();