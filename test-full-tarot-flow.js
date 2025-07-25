const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('=== 타로 리딩 전체 플로우 테스트 (포트 4000) ===\n');
    
    // 1. 페이지 로드
    console.log('1. 타로 읽기 페이지 접속...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/full_01_reading_page.png' });
    console.log('✓ 페이지 로드 완료');
    
    // 2. 질문 입력
    console.log('\n2. 질문 입력...');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('오늘 나의 운세는 어떤가요?');
    await page.screenshot({ path: 'screenshots/full_02_question_entered.png' });
    console.log('✓ 질문 입력 완료');
    
    // 3. 카드 섞기
    console.log('\n3. 카드 섞기...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")');
    await shuffleButton.click();
    console.log('✓ 셔플 버튼 클릭');
    
    // 셔플 애니메이션 대기
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/full_03_cards_shuffled.png' });
    console.log('✓ 카드 셔플 완료');
    
    // 4. 카드 펼치기
    console.log('\n4. 카드 펼치기...');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")');
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      console.log('✓ 카드 펼치기 버튼 클릭');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/full_04_cards_spread.png' });
    } else {
      console.log('❌ 카드 펼치기 버튼을 찾을 수 없음');
    }
    
    // 5. 카드 선택
    console.log('\n5. 카드 선택...');
    // 카드가 나타날 때까지 대기
    await page.waitForTimeout(1000);
    
    // 카드 찾기 - 다양한 선택자 시도
    const cardSelectors = [
      'img[alt*="뒷면"]',
      'img[src*="back.png"]',
      '[role="button"] img',
      'div.cursor-pointer img',
      '.card-container img'
    ];
    
    let selectedCount = 0;
    for (const selector of cardSelectors) {
      const cards = await page.locator(selector).all();
      if (cards.length > 0) {
        console.log(`✓ ${cards.length}개의 카드 발견`);
        
        // 스프레드에 따라 필요한 수만큼 카드 선택
        const cardsToSelect = Math.min(3, cards.length); // 3장 선택
        
        for (let i = 0; i < cardsToSelect; i++) {
          await cards[i].click();
          selectedCount++;
          console.log(`  카드 ${selectedCount} 선택됨`);
          await page.waitForTimeout(1000);
        }
        
        await page.screenshot({ path: 'screenshots/full_05_cards_selected.png' });
        break;
      }
    }
    
    if (selectedCount === 0) {
      console.log('❌ 선택 가능한 카드를 찾을 수 없음');
    }
    
    // 6. 해석 요청
    console.log('\n6. 해석 요청...');
    const interpretButton = await page.locator('button:has-text("해석")');
    if (await interpretButton.isVisible()) {
      const isDisabled = await interpretButton.isDisabled();
      console.log(`해석 버튼 상태: ${isDisabled ? '비활성화' : '활성화'}`);
      
      if (!isDisabled) {
        await interpretButton.click();
        console.log('✓ 해석 버튼 클릭');
        
        // AI 응답 대기
        console.log('AI 해석 생성 중...');
        await page.waitForTimeout(10000); // 10초 대기
        
        await page.screenshot({ path: 'screenshots/full_06_interpretation.png' });
        
        // 해석 결과 확인
        const interpretation = await page.locator('text=/해석|조언|Interpretation/i').first();
        if (await interpretation.isVisible()) {
          console.log('✓ 해석 결과 표시됨');
        }
      }
    }
    
    // 7. 공유 기능 확인
    console.log('\n7. 공유 기능 확인...');
    const shareButton = await page.locator('button:has-text("공유")');
    if (await shareButton.isVisible()) {
      console.log('✓ 공유 버튼 발견');
      await shareButton.click();
      await page.waitForTimeout(2000);
      
      // 공유 링크 또는 모달 확인
      const shareModal = await page.locator('[role="dialog"], .modal, .share-modal').first();
      if (await shareModal.isVisible()) {
        console.log('✓ 공유 모달/다이얼로그 표시됨');
        await page.screenshot({ path: 'screenshots/full_07_share_modal.png' });
      }
    } else {
      console.log('❌ 공유 버튼을 찾을 수 없음 (로그인 필요할 수 있음)');
    }
    
    // 8. 최종 상태
    console.log('\n8. 최종 페이지 상태 캡처...');
    await page.screenshot({ path: 'screenshots/full_08_final_state.png', fullPage: true });
    
    console.log('\n=== 테스트 완료 ===');
    console.log('브라우저를 열어둔 상태로 유지합니다.');
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ path: 'screenshots/full_error.png' });
  }
})();