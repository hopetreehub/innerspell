const { chromium } = require('playwright');
const fs = require('fs');

async function testTarotShareFeature() {
  console.log('타로 리딩 공유 기능 상세 테스트 시작...');
  
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
    await page.screenshot({ path: 'tarot-test-01-reading-page.png' });
    console.log('✓ 스크린샷: tarot-test-01-reading-page.png');
    
    // 2. 질문 입력 - 더 구체적인 선택자 사용
    console.log('\n2. 질문 입력 필드 찾기...');
    
    // textarea 요소 찾기
    const questionTextarea = await page.locator('textarea').first();
    if (await questionTextarea.isVisible()) {
      console.log('✓ Textarea 발견');
      await questionTextarea.click();
      await questionTextarea.fill('오늘의 운세는 어떨까요?');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tarot-test-02-question-entered.png' });
      console.log('✓ 스크린샷: tarot-test-02-question-entered.png');
    } else {
      console.log('⚠️ 질문 입력 필드를 찾을 수 없음');
      return;
    }
    
    // 3. 카드 섞기 버튼 클릭
    console.log('\n3. 카드 섞기 버튼 찾기...');
    // 페이지의 모든 버튼 확인
    const buttons = await page.locator('button').all();
    console.log(`✓ 페이지에서 ${buttons.length}개의 버튼 발견`);
    
    let shuffleButton = null;
    for (const button of buttons) {
      const text = await button.textContent();
      console.log(`  - 버튼 텍스트: "${text}"`);
      if (text && (text.includes('섞') || text.includes('시작'))) {
        shuffleButton = button;
        break;
      }
    }
    
    if (shuffleButton) {
      await shuffleButton.click();
      console.log('✓ 카드 섞기 버튼 클릭');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tarot-test-03-cards-shuffled.png' });
      console.log('✓ 스크린샷: tarot-test-03-cards-shuffled.png');
    } else {
      console.log('⚠️ 카드 섞기 버튼을 찾을 수 없음');
    }
    
    // 4. 카드 뽑기 버튼 확인
    console.log('\n4. 카드 뽑기 버튼 찾기...');
    await page.waitForTimeout(2000);
    
    const drawButtons = await page.locator('button').all();
    for (const button of drawButtons) {
      const text = await button.textContent();
      if (text && text.includes('뽑')) {
        await button.click();
        console.log('✓ 카드 뽑기 버튼 클릭');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'tarot-test-04-cards-spread.png' });
        console.log('✓ 스크린샷: tarot-test-04-cards-spread.png');
        break;
      }
    }
    
    // 5. 카드 선택
    console.log('\n5. 카드 요소 찾기...');
    await page.waitForTimeout(2000);
    
    // 이미지 요소로 카드 찾기
    const cardImages = await page.locator('img[src*="card"], img[src*="tarot"]').all();
    console.log(`✓ ${cardImages.length}개의 카드 이미지 발견`);
    
    if (cardImages.length >= 3) {
      for (let i = 0; i < 3; i++) {
        await cardImages[i].click();
        await page.waitForTimeout(1000);
        console.log(`✓ ${i + 1}번째 카드 선택`);
      }
      await page.screenshot({ path: 'tarot-test-05-cards-selected.png' });
      console.log('✓ 스크린샷: tarot-test-05-cards-selected.png');
    } else {
      // 대안: div 요소로 카드 찾기
      const cardDivs = await page.locator('div[class*="card"]').all();
      console.log(`✓ ${cardDivs.length}개의 카드 div 발견`);
      
      if (cardDivs.length >= 3) {
        for (let i = 0; i < 3; i++) {
          await cardDivs[i].click();
          await page.waitForTimeout(1000);
          console.log(`✓ ${i + 1}번째 카드 선택`);
        }
        await page.screenshot({ path: 'tarot-test-05-cards-selected.png' });
        console.log('✓ 스크린샷: tarot-test-05-cards-selected.png');
      }
    }
    
    // 6. AI 해석 버튼 찾기
    console.log('\n6. AI 해석 버튼 찾기...');
    await page.waitForTimeout(2000);
    
    const interpretButtons = await page.locator('button').all();
    for (const button of interpretButtons) {
      const text = await button.textContent();
      if (text && (text.includes('해석') || text.includes('완료'))) {
        await button.click();
        console.log(`✓ "${text}" 버튼 클릭`);
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'tarot-test-06-interpretation.png' });
        console.log('✓ 스크린샷: tarot-test-06-interpretation.png');
        break;
      }
    }
    
    // 7. 공유 버튼 찾기
    console.log('\n7. 공유 기능 찾기...');
    await page.waitForTimeout(2000);
    
    // SVG 아이콘으로 공유 버튼 찾기
    const shareIcons = await page.locator('svg').all();
    console.log(`✓ ${shareIcons.length}개의 SVG 아이콘 발견`);
    
    let shareClicked = false;
    for (const icon of shareIcons) {
      try {
        const parent = await icon.locator('..').first();
        if (await parent.getAttribute('role') === 'button' || parent.tagName() === 'button') {
          await parent.click();
          await page.waitForTimeout(1000);
          
          // 공유 링크 입력 필드가 나타났는지 확인
          const linkInput = await page.locator('input[readonly], input[value*="http"]').first();
          if (await linkInput.isVisible()) {
            shareClicked = true;
            console.log('✓ 공유 버튼 클릭 성공');
            await page.screenshot({ path: 'tarot-test-07-share-clicked.png' });
            console.log('✓ 스크린샷: tarot-test-07-share-clicked.png');
            
            const shareLink = await linkInput.inputValue();
            console.log(`✓ 공유 링크: ${shareLink}`);
            
            // 8. 공유 링크로 접속
            if (shareLink && shareLink.includes('http')) {
              console.log('\n8. 공유 링크로 접속 테스트...');
              const newPage = await context.newPage();
              await newPage.goto(shareLink, { waitUntil: 'networkidle' });
              await newPage.waitForTimeout(3000);
              await newPage.screenshot({ path: 'tarot-test-08-shared-page.png' });
              console.log('✓ 스크린샷: tarot-test-08-shared-page.png');
              
              // 공유된 내용 확인
              const sharedQuestion = await newPage.locator('text=/오늘의 운세/').isVisible().catch(() => false);
              const hasCards = await newPage.locator('img[src*="card"], img[src*="tarot"]').count() > 0;
              
              console.log(`✓ 공유된 질문 표시: ${sharedQuestion ? '성공' : '실패'}`);
              console.log(`✓ 공유된 카드 표시: ${hasCards ? '성공' : '실패'}`);
              
              await newPage.close();
            }
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!shareClicked) {
      console.log('⚠️ 공유 버튼을 찾을 수 없음');
      // 페이지의 모든 버튼 확인
      const allButtons = await page.locator('button').all();
      for (const button of allButtons) {
        const text = await button.textContent();
        console.log(`  - 버튼: "${text}"`);
      }
    }
    
    // 9. 최종 상태
    console.log('\n9. 최종 페이지 상태...');
    await page.screenshot({ path: 'tarot-test-09-final-state.png' });
    console.log('✓ 스크린샷: tarot-test-09-final-state.png');
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
    await page.screenshot({ path: 'tarot-test-error.png' });
  } finally {
    await browser.close();
    console.log('\n테스트 완료!');
  }
}

testTarotShareFeature();