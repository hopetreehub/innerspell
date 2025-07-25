const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // 각 동작을 명확히 보기 위해
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('=== 타로 리딩 완전 테스트 ===\n');
    
    // 1. 페이지 로드
    console.log('1. 타로 읽기 페이지 접속...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/flow_01_initial.png' });
    
    // 2. 질문 입력
    console.log('2. 질문 입력...');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('내 현재 상황에서 가장 중요한 것은 무엇인가요?');
    await page.screenshot({ path: 'screenshots/flow_02_question.png' });
    
    // 3. 카드 섞기 클릭
    console.log('3. 카드 섞기 버튼 클릭...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    await page.waitForTimeout(2000); // 셔플 애니메이션 대기
    await page.screenshot({ path: 'screenshots/flow_03_shuffled.png' });
    
    // 4. 카드 선택
    console.log('4. 카드 선택 시도...');
    // 카드가 나타날 때까지 대기
    await page.waitForTimeout(1000);
    
    // 다양한 카드 선택자 시도
    const cardSelectors = [
      'img[alt*="card"]',
      '[class*="card-back"]',
      '[data-testid="card"]',
      'div[role="button"] img',
      'button img[src*="back"]'
    ];
    
    let cardsFound = false;
    for (const selector of cardSelectors) {
      const cards = await page.locator(selector).all();
      if (cards.length > 0) {
        console.log(`✓ ${cards.length}개의 카드 발견 (${selector})`);
        cardsFound = true;
        
        // 첫 번째 카드 클릭
        if (cards.length >= 1) {
          await cards[0].click();
          await page.waitForTimeout(1000);
          console.log('✓ 첫 번째 카드 선택');
          await page.screenshot({ path: 'screenshots/flow_04_card_selected.png' });
        }
        break;
      }
    }
    
    if (!cardsFound) {
      console.log('❌ 카드를 찾을 수 없음');
      // 현재 페이지의 이미지 요소 확인
      const allImages = await page.locator('img').all();
      console.log(`페이지의 전체 이미지 수: ${allImages.length}`);
    }
    
    // 5. 해석 버튼 클릭
    console.log('5. 해석 버튼 확인...');
    const interpretButton = await page.locator('button:has-text("해석")');
    if (await interpretButton.isVisible()) {
      const isDisabled = await interpretButton.isDisabled();
      console.log(`해석 버튼 상태: ${isDisabled ? '비활성화' : '활성화'}`);
      
      if (!isDisabled) {
        console.log('해석 버튼 클릭...');
        await interpretButton.click();
        await page.waitForTimeout(3000); // AI 응답 대기
        await page.screenshot({ path: 'screenshots/flow_05_interpretation.png' });
      }
    }
    
    // 6. 최종 상태 확인
    console.log('\n6. 최종 상태 확인...');
    await page.screenshot({ path: 'screenshots/flow_06_final.png', fullPage: true });
    
    console.log('\n=== 테스트 완료 ===');
    console.log('브라우저를 열어둔 상태로 유지합니다.');
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ path: 'screenshots/flow_error.png' });
  }
})();