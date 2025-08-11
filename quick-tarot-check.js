const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('=== 빠른 타로 리딩 확인 ===\n');
  
  // API 응답 모니터링
  let apiCalled = false;
  page.on('response', async response => {
    if (response.url().includes('/api/generate-tarot-interpretation')) {
      apiCalled = true;
      console.log(`\n🎯 API 호출 감지!`);
      console.log(`Status: ${response.status()}`);
      if (response.status() === 403) {
        console.log('❌ CSRF 오류 발생!');
      } else if (response.status() === 200) {
        console.log('✅ API 호출 성공!');
      }
    }
  });
  
  try {
    // 1. 페이지 이동
    await page.goto('http://localhost:4000/reading');
    await page.waitForTimeout(2000);
    
    // 2. 질문 입력
    await page.fill('textarea', '테스트 질문');
    
    // 3. 카드 섞기
    await page.click('button:text("카드 섞기")');
    await page.waitForTimeout(2000);
    
    // 4. 카드 펼치기
    await page.click('button:text("카드 펼치기")');
    await page.waitForTimeout(2000);
    
    // 5. 카드 3장 선택
    const cards = await page.$$('div[role="button"][aria-label*="카드 선택"]');
    for (let i = 0; i < 3 && i < cards.length; i++) {
      await cards[i].click();
      await page.waitForTimeout(300);
    }
    
    // 6. AI 해석 버튼 확인
    await page.waitForTimeout(1000);
    const interpretButton = await page.$('button:text("AI 해석 받기")');
    
    if (interpretButton) {
      console.log('\n✅ AI 해석 버튼 발견!');
      
      // 버튼이 보이는지 확인
      const isVisible = await interpretButton.isVisible();
      const isEnabled = await interpretButton.isEnabled();
      
      console.log(`  - 표시 상태: ${isVisible ? '보임' : '안보임'}`);
      console.log(`  - 활성화 상태: ${isEnabled ? '활성화' : '비활성화'}`);
      
      if (isVisible && isEnabled) {
        console.log('\n7. 버튼 클릭...');
        await interpretButton.click();
        
        // API 응답 대기
        await page.waitForTimeout(5000);
        
        if (apiCalled) {
          console.log('\n✅ API가 호출되었습니다!');
        } else {
          console.log('\n❓ API가 호출되지 않았습니다.');
        }
      }
    } else {
      console.log('\n❌ AI 해석 버튼을 찾을 수 없습니다!');
      
      // 화면 스크린샷
      await page.screenshot({ path: 'button-not-found-check.png', fullPage: true });
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'final-state-check.png', fullPage: true });
    console.log('\n스크린샷 저장 완료');
    
  } catch (error) {
    console.error('\n오류:', error.message);
  }
  
  await page.waitForTimeout(10000);
  await browser.close();
})();