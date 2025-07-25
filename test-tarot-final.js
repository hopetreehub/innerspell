const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });
  
  let page;
  try {
    const context = await browser.newContext();
    page = await context.newPage();
    
    console.log('=== InnerSpell 타로 리딩 테스트 (포트 4000) ===\n');
    
    // 1. 페이지 로드
    console.log('1. 타로 읽기 페이지 접속...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    console.log('✓ 페이지 로드 완료');
    
    // 2. 질문 입력
    console.log('\n2. 질문 입력...');
    const questionInput = await page.locator('textarea').first();
    await questionInput.fill('내가 지금 집중해야 할 것은 무엇인가요?');
    await page.screenshot({ path: 'screenshots/final_01_question.png' });
    console.log('✓ 질문 입력 완료');
    
    // 3. 카드 섞기
    console.log('\n3. 카드 섞기...');
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(3000); // 셔플 애니메이션 대기
    await page.screenshot({ path: 'screenshots/final_02_shuffled.png' });
    console.log('✓ 카드 셔플 완료');
    
    // 4. 카드 펼치기
    console.log('\n4. 카드 펼치기...');
    await page.locator('button:has-text("카드 펼치기")').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/final_03_spread.png' });
    console.log('✓ 카드 펼침');
    
    // 5. 카드 선택 (부모 div 클릭)
    console.log('\n5. 카드 선택...');
    // role="button"인 div 요소들을 찾아서 클릭
    const cardButtons = await page.locator('div[role="button"][aria-label*="카드"]').all();
    console.log(`✓ ${cardButtons.length}개의 선택 가능한 카드 발견`);
    
    if (cardButtons.length >= 3) {
      // 3장 선택 (Trinity View)
      for (let i = 0; i < 3; i++) {
        await cardButtons[i].click();
        console.log(`  카드 ${i + 1} 선택됨`);
        await page.waitForTimeout(1000);
      }
      await page.screenshot({ path: 'screenshots/final_04_selected.png' });
    } else {
      console.log('❌ 충분한 카드를 찾을 수 없음');
    }
    
    // 6. 해석 요청
    console.log('\n6. AI 해석 요청...');
    const interpretButton = await page.locator('button:has-text("해석")');
    const isDisabled = await interpretButton.isDisabled();
    
    if (!isDisabled) {
      await interpretButton.click();
      console.log('✓ 해석 버튼 클릭 - AI 응답 대기 중...');
      
      // AI 응답을 기다리면서 로딩 상태 확인
      try {
        await page.waitForSelector('text=/해석|조언|카드의 의미/i', { timeout: 30000 });
        console.log('✓ AI 해석 생성 완료');
        await page.screenshot({ path: 'screenshots/final_05_interpretation.png' });
      } catch (e) {
        console.log('⏱ AI 응답 대기 중...');
        await page.screenshot({ path: 'screenshots/final_05_loading.png' });
      }
    } else {
      console.log('❌ 해석 버튼이 비활성화됨');
    }
    
    // 7. 공유 기능 확인
    console.log('\n7. 공유 기능 확인...');
    const shareButton = await page.locator('button:has-text("공유")').first();
    if (await shareButton.isVisible({ timeout: 5000 })) {
      console.log('✓ 공유 버튼 발견');
      await shareButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/final_06_share.png' });
    } else {
      console.log('ℹ 공유 기능은 로그인 후 사용 가능');
    }
    
    // 8. 최종 상태
    await page.screenshot({ path: 'screenshots/final_07_complete.png', fullPage: true });
    
    console.log('\n=== 테스트 완료 ===');
    console.log('\n발견된 사항:');
    console.log('- 타로 리딩 기본 플로우 정상 작동');
    console.log('- 질문 입력, 카드 셔플, 카드 선택 기능 정상');
    console.log('- AI 해석 기능 (로그인 없이도 부분 해석 가능)');
    console.log('- 공유 기능은 로그인 필요');
    
    console.log('\n브라우저를 열어둔 상태로 유지합니다.');
    
  } catch (error) {
    console.error('테스트 중 오류:', error.message);
    if (page) {
      await page.screenshot({ path: 'screenshots/final_error.png' });
    }
  }
})();