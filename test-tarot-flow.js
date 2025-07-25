const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100 // 동작을 천천히 보기 위해
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('=== 타로 리딩 전체 플로우 테스트 ===\n');
    
    // 1. 타로 읽기 페이지 접속
    console.log('1. 타로 읽기 페이지 로딩...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // 콘솔 에러 캡처
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 2. 질문 입력
    console.log('2. 질문 입력 테스트...');
    const questionInput = await page.locator('textarea').first();
    if (await questionInput.isVisible()) {
      await questionInput.fill('오늘 나에게 필요한 메시지는 무엇인가요?');
      console.log('✓ 질문 입력 완료');
      await page.screenshot({ path: 'screenshots/test_01_question_entered.png' });
    }
    
    // 3. 스프레드와 스타일 선택
    console.log('\n3. 타로 스프레드 선택...');
    const spreadSelect = await page.locator('select').first();
    if (await spreadSelect.isVisible()) {
      await spreadSelect.selectOption({ index: 0 });
      console.log('✓ 스프레드 선택 완료');
    }
    
    // 4. 카드 셔플 버튼 찾기
    console.log('\n4. 카드 셔플 버튼 찾기...');
    const shuffleButtonSelectors = [
      'button:has-text("셔플")',
      'button:has-text("카드 섞기")',
      'button:has-text("섞기")',
      'button[aria-label*="shuffle"]',
      'button >> svg[class*="Shuffle"]'
    ];
    
    let shuffleButton = null;
    for (const selector of shuffleButtonSelectors) {
      try {
        const btn = await page.locator(selector).first();
        if (await btn.isVisible({ timeout: 1000 })) {
          shuffleButton = btn;
          console.log(`✓ 셔플 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }
    
    if (!shuffleButton) {
      console.log('❌ 셔플 버튼을 찾을 수 없음');
      
      // 페이지 상태 디버깅
      console.log('\n디버깅 정보:');
      const buttons = await page.locator('button').all();
      console.log(`- 전체 버튼 개수: ${buttons.length}`);
      
      for (let i = 0; i < Math.min(5, buttons.length); i++) {
        const text = await buttons[i].textContent();
        const ariaLabel = await buttons[i].getAttribute('aria-label');
        console.log(`  버튼 ${i+1}: "${text?.trim()}" (aria-label: ${ariaLabel})`);
      }
      
      // 카드 관련 요소 찾기
      const cardElements = await page.locator('[class*="card"], [data-testid*="card"]').all();
      console.log(`- 카드 관련 요소: ${cardElements.length}개`);
    }
    
    // 5. 해석 버튼 확인
    console.log('\n5. 해석 버튼 확인...');
    const interpretButton = await page.locator('button:has-text("해석")').first();
    if (await interpretButton.isVisible()) {
      console.log('✓ 해석 버튼 존재');
      const isDisabled = await interpretButton.isDisabled();
      console.log(`  상태: ${isDisabled ? '비활성화' : '활성화'}`);
    }
    
    // 6. 현재 페이지 상태 스크린샷
    await page.screenshot({ path: 'screenshots/test_02_current_state.png', fullPage: true });
    
    // 7. 콘솔 에러 출력
    if (consoleErrors.length > 0) {
      console.log('\n콘솔 에러:');
      consoleErrors.forEach(err => console.log(`- ${err}`));
    }
    
    console.log('\n=== 테스트 완료 ===');
    console.log('브라우저를 열어둔 상태입니다. 수동으로 확인해주세요.');
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ path: 'screenshots/test_error.png' });
  }
})();