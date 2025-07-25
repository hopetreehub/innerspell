const { chromium } = require('playwright');

async function testTarotShareFeature() {
  console.log('타로 리딩 공유 기능 최종 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800 
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
    await page.screenshot({ path: 'share-test-01-reading-page.png' });
    console.log('✓ 스크린샷: share-test-01-reading-page.png');
    
    // 2. 질문 입력
    console.log('\n2. 질문 입력...');
    const questionTextarea = await page.locator('textarea').first();
    await questionTextarea.click();
    await questionTextarea.fill('오늘의 운세는 어떨까요?');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'share-test-02-question-entered.png' });
    console.log('✓ 스크린샷: share-test-02-question-entered.png');
    
    // 3. 카드 섞기
    console.log('\n3. 카드 섞기...');
    await page.locator('button:has-text("카드 섞기")').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'share-test-03-cards-shuffled.png' });
    console.log('✓ 스크린샷: share-test-03-cards-shuffled.png');
    
    // 4. 카드 펼치기
    console.log('\n4. 카드 펼치기...');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")');
    if (await spreadButton.isVisible()) {
      await spreadButton.click();
      console.log('✓ 카드 펼치기 버튼 클릭');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'share-test-04-cards-spread.png' });
      console.log('✓ 스크린샷: share-test-04-cards-spread.png');
    }
    
    // 5. 카드 3장 선택 - 카드의 컨테이너를 클릭
    console.log('\n5. 카드 3장 선택...');
    await page.waitForTimeout(2000);
    
    // 카드 컨테이너 찾기
    const cardContainers = await page.locator('div[class*="relative"]:has(img[alt*="카드"])').all();
    console.log(`✓ ${cardContainers.length}개의 카드 컨테이너 발견`);
    
    if (cardContainers.length >= 3) {
      // 처음 3장의 카드 선택
      for (let i = 0; i < 3; i++) {
        try {
          await cardContainers[i].click({ force: true });
          await page.waitForTimeout(1500);
          console.log(`✓ ${i + 1}번째 카드 선택`);
        } catch (e) {
          console.log(`⚠️ ${i + 1}번째 카드 선택 실패: ${e.message}`);
        }
      }
      await page.screenshot({ path: 'share-test-05-cards-selected.png' });
      console.log('✓ 스크린샷: share-test-05-cards-selected.png');
    } else {
      console.log('⚠️ 충분한 카드를 찾을 수 없음');
    }
    
    // 6. AI 해석 보기
    console.log('\n6. AI 해석 보기...');
    await page.waitForTimeout(2000);
    
    // 선택 완료 또는 해석 보기 버튼 찾기
    const interpretButton = await page.locator('button').filter({ hasText: /선택 완료|해석|AI/ }).first();
    if (await interpretButton.isVisible()) {
      const buttonText = await interpretButton.textContent();
      console.log(`✓ "${buttonText}" 버튼 발견`);
      await interpretButton.click();
      await page.waitForTimeout(5000); // AI 해석 로딩 대기
      await page.screenshot({ path: 'share-test-06-interpretation.png' });
      console.log('✓ 스크린샷: share-test-06-interpretation.png');
    }
    
    // 7. 공유 버튼 찾기 및 클릭
    console.log('\n7. 공유 기능 테스트...');
    await page.waitForTimeout(2000);
    
    // 공유 버튼 찾기 - 다양한 방법 시도
    let shareButton = null;
    
    // 방법 1: SVG 아이콘의 부모 버튼
    const svgButtons = await page.locator('button:has(svg)').all();
    console.log(`✓ ${svgButtons.length}개의 SVG 버튼 발견`);
    
    for (const button of svgButtons) {
      // 버튼을 클릭해보고 공유 모달이나 입력 필드가 나타나는지 확인
      try {
        await button.click();
        await page.waitForTimeout(1000);
        
        // 공유 링크 입력 필드 확인
        const linkInput = await page.locator('input[value*="http"], input[readonly]').first();
        if (await linkInput.isVisible()) {
          shareButton = button;
          console.log('✓ 공유 버튼 발견 및 클릭');
          await page.screenshot({ path: 'share-test-07-share-modal.png' });
          console.log('✓ 스크린샷: share-test-07-share-modal.png');
          
          // 공유 링크 가져오기
          const shareLink = await linkInput.inputValue();
          console.log(`✓ 공유 링크: ${shareLink}`);
          
          // 8. 공유 링크로 접속
          if (shareLink && shareLink.includes('http')) {
            console.log('\n8. 공유 링크 접속 테스트...');
            const newPage = await context.newPage();
            await newPage.goto(shareLink, { waitUntil: 'networkidle' });
            await newPage.waitForTimeout(3000);
            await newPage.screenshot({ path: 'share-test-08-shared-page.png' });
            console.log('✓ 스크린샷: share-test-08-shared-page.png');
            
            // 공유된 내용 확인
            const hasQuestion = await newPage.locator('text=/오늘의 운세/').isVisible().catch(() => false);
            const hasCards = await newPage.locator('img[src*="card"], img[src*="tarot"]').count() > 0;
            const hasInterpretation = await newPage.locator('text=/해석/').isVisible().catch(() => false);
            
            console.log('\n공유 페이지 검증:');
            console.log(`✓ 질문 표시: ${hasQuestion ? '성공' : '실패'}`);
            console.log(`✓ 카드 표시: ${hasCards ? '성공' : '실패'}`);
            console.log(`✓ 해석 표시: ${hasInterpretation ? '성공' : '실패'}`);
            
            await newPage.close();
          }
          break;
        } else {
          // 클릭 취소 (다른 버튼으로 시도)
          await page.keyboard.press('Escape');
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!shareButton) {
      console.log('⚠️ 공유 버튼을 찾을 수 없음');
      // 페이지의 모든 버튼 리스트
      const allButtons = await page.locator('button').all();
      console.log('\n페이지의 모든 버튼:');
      for (const button of allButtons) {
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        if (isVisible && text) {
          console.log(`  - "${text.trim()}"`);
        }
      }
    }
    
    // 9. 최종 상태
    console.log('\n9. 최종 상태 스크린샷...');
    await page.screenshot({ path: 'share-test-09-final.png' });
    console.log('✓ 스크린샷: share-test-09-final.png');
    
  } catch (error) {
    console.error('\n테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'share-test-error.png' });
    console.log('✓ 오류 스크린샷: share-test-error.png');
  } finally {
    await browser.close();
    console.log('\n테스트 완료!');
  }
}

testTarotShareFeature();