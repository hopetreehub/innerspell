const { chromium } = require('playwright');

async function testTarotShareComplete() {
  console.log('타로 리딩 공유 기능 완전 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. 타로 리딩 페이지 접속
    console.log('\n1. 타로 리딩 페이지 접속...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'final-test-01-reading-page.png' });
    console.log('✓ 스크린샷: final-test-01-reading-page.png');
    
    // 2. 질문 입력
    console.log('\n2. 질문 입력...');
    const questionTextarea = await page.locator('textarea').first();
    await questionTextarea.click();
    await questionTextarea.fill('오늘의 운세는 어떨까요?');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'final-test-02-question.png' });
    console.log('✓ 질문 입력 완료');
    
    // 3. 카드 섞기
    console.log('\n3. 카드 섞기...');
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'final-test-03-shuffled.png' });
    console.log('✓ 카드 섞기 완료');
    
    // 4. 카드 펼치기
    console.log('\n4. 카드 펼치기...');
    await page.locator('button:has-text("카드 펼치기")').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'final-test-04-spread.png' });
    console.log('✓ 카드 펼치기 완료');
    
    // 5. 카드 3장 선택
    console.log('\n5. 카드 3장 선택...');
    const cardContainers = await page.locator('div[class*="relative"]:has(img[alt*="카드"])').all();
    console.log(`✓ ${cardContainers.length}개의 카드 발견`);
    
    if (cardContainers.length >= 3) {
      for (let i = 0; i < 3; i++) {
        await cardContainers[i].click({ force: true });
        await page.waitForTimeout(1000);
        console.log(`✓ ${i + 1}번째 카드 선택`);
      }
      await page.screenshot({ path: 'final-test-05-selected.png' });
      console.log('✓ 카드 선택 완료');
    }
    
    // 6. AI 해석 받기
    console.log('\n6. AI 해석 받기...');
    await page.waitForTimeout(1000);
    
    // "AI 해석 받기" 버튼 찾기
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    await interpretButton.click();
    console.log('✓ AI 해석 버튼 클릭');
    
    // AI 해석 모달이 나타날 때까지 대기
    console.log('✓ AI 해석 모달 대기 중...');
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await page.waitForTimeout(5000); // AI 해석 로딩 대기
    
    await page.screenshot({ path: 'final-test-06-interpretation-modal.png' });
    console.log('✓ AI 해석 모달 표시됨');
    
    // 7. 공유 버튼 찾기 (모달 내부)
    console.log('\n7. 공유 버튼 찾기...');
    
    // 모달 내부의 "리딩 공유하기" 버튼 찾기
    const shareButton = await page.locator('[role="dialog"] button:has-text("리딩 공유")').first();
    if (await shareButton.isVisible()) {
      console.log('✓ 공유 버튼 발견');
      await shareButton.click();
      console.log('✓ 공유 버튼 클릭');
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'final-test-07-share-clicked.png' });
      
      // 토스트 메시지 확인
      const toastMessage = await page.locator('text=/공유 링크 생성됨|클립보드에 복사/').isVisible();
      if (toastMessage) {
        console.log('✓ 공유 링크 생성 확인');
        
        // 클립보드에서 링크 가져오기
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        console.log(`✓ 공유 링크: ${clipboardText}`);
        
        // 8. 공유 링크로 접속
        if (clipboardText && clipboardText.includes('http')) {
          console.log('\n8. 공유 링크 접속 테스트...');
          const newPage = await context.newPage();
          await newPage.goto(clipboardText, { waitUntil: 'networkidle' });
          await newPage.waitForTimeout(3000);
          await newPage.screenshot({ path: 'final-test-08-shared-page.png' });
          console.log('✓ 공유 페이지 스크린샷 완료');
          
          // 공유된 내용 확인
          const hasQuestion = await newPage.locator('text=/오늘의 운세/').isVisible().catch(() => false);
          const hasCards = await newPage.locator('img[src*="card"], img[src*="tarot"]').count() > 0;
          const hasInterpretation = await newPage.locator('[class*="prose"]').isVisible().catch(() => false);
          
          console.log('\n공유 페이지 검증 결과:');
          console.log(`✓ 질문 표시: ${hasQuestion ? '성공' : '실패'}`);
          console.log(`✓ 카드 표시: ${hasCards ? '성공' : '실패'}`);
          console.log(`✓ 해석 표시: ${hasInterpretation ? '성공' : '실패'}`);
          
          await newPage.close();
        }
      }
    } else {
      console.log('⚠️ 모달 내부에서 공유 버튼을 찾을 수 없음');
      
      // 모달 닫고 다시 시도
      const closeButton = await page.locator('[role="dialog"] button:has-text("닫기")').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(1000);
        
        // 페이지의 공유 버튼 찾기
        const pageShareButton = await page.locator('button:has-text("리딩 공유")').first();
        if (await pageShareButton.isVisible()) {
          console.log('✓ 페이지에서 공유 버튼 발견');
          await pageShareButton.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'final-test-07-share-clicked-alt.png' });
        }
      }
    }
    
    // 9. 최종 상태
    console.log('\n9. 최종 상태 확인...');
    await page.screenshot({ path: 'final-test-09-final.png' });
    console.log('✓ 최종 스크린샷 완료');
    
  } catch (error) {
    console.error('\n테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'final-test-error.png' });
  } finally {
    console.log('\n브라우저 닫기 전 5초 대기...');
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('\n테스트 완료!');
  }
}

testTarotShareComplete();