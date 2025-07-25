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
    
    // 2. 질문 입력
    console.log('\n2. 질문 입력...');
    const questionInput = await page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"]');
    await questionInput.fill('오늘의 운세는 어떨까요?');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tarot-test-02-question-entered.png' });
    console.log('✓ 스크린샷: tarot-test-02-question-entered.png');
    
    // 3. 카드 섞기 버튼 클릭
    console.log('\n3. 카드 섞기 버튼 클릭...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기"), button:has-text("카드를 섞어주세요")');
    await shuffleButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tarot-test-03-cards-shuffled.png' });
    console.log('✓ 스크린샷: tarot-test-03-cards-shuffled.png');
    
    // 4. 카드 뽑기 버튼 클릭
    console.log('\n4. 카드 뽑기 버튼 찾기...');
    const drawButton = await page.locator('button:has-text("카드 뽑기"), button:has-text("카드를 뽑아주세요")');
    if (await drawButton.isVisible()) {
      await drawButton.click();
      console.log('✓ 카드 뽑기 버튼 클릭');
      await page.waitForTimeout(3000); // 카드가 펼쳐질 시간 대기
      await page.screenshot({ path: 'tarot-test-04-cards-spread.png' });
      console.log('✓ 스크린샷: tarot-test-04-cards-spread.png');
    }
    
    // 5. 카드 3장 선택
    console.log('\n5. 카드 3장 선택...');
    // 카드 요소 찾기 - 다양한 선택자 시도
    const cardSelectors = [
      'div[class*="card"]:not([class*="selected"])',
      'img[alt*="card"], img[alt*="Card"]',
      'div[role="button"][class*="card"]',
      '.card-container > div'
    ];
    
    let cards = null;
    for (const selector of cardSelectors) {
      cards = await page.locator(selector).all();
      if (cards.length > 0) {
        console.log(`✓ ${selector} 선택자로 ${cards.length}개 카드 발견`);
        break;
      }
    }
    
    if (cards && cards.length >= 3) {
      for (let i = 0; i < 3; i++) {
        await cards[i].click();
        await page.waitForTimeout(1000);
        console.log(`✓ ${i + 1}번째 카드 선택`);
      }
      await page.screenshot({ path: 'tarot-test-05-cards-selected.png' });
      console.log('✓ 스크린샷: tarot-test-05-cards-selected.png');
    } else {
      console.log('⚠️ 충분한 카드를 찾을 수 없음');
    }
    
    // 6. AI 해석 보기 버튼 클릭
    console.log('\n6. AI 해석 보기 버튼 찾기...');
    const interpretButton = await page.locator('button:has-text("해석"), button:has-text("AI 해석"), button:has-text("해석 보기")');
    if (await interpretButton.isVisible()) {
      await interpretButton.click();
      console.log('✓ AI 해석 버튼 클릭');
      await page.waitForTimeout(5000); // AI 해석 로딩 대기
      await page.screenshot({ path: 'tarot-test-06-interpretation.png' });
      console.log('✓ 스크린샷: tarot-test-06-interpretation.png');
    }
    
    // 7. 공유 버튼 찾기
    console.log('\n7. 공유 버튼 찾기...');
    const shareButtonSelectors = [
      'button:has-text("공유")',
      'button[aria-label*="공유"]',
      'button[title*="공유"]',
      'svg[class*="share"] >> xpath=..',
      '[class*="share"] button'
    ];
    
    let shareButton = null;
    for (const selector of shareButtonSelectors) {
      try {
        shareButton = await page.locator(selector).first();
        if (await shareButton.isVisible()) {
          console.log(`✓ ${selector} 선택자로 공유 버튼 발견`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (shareButton) {
      await shareButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tarot-test-07-share-clicked.png' });
      console.log('✓ 스크린샷: tarot-test-07-share-clicked.png');
      
      // 공유 링크 찾기
      const linkSelectors = [
        'input[value*="shared"]',
        'input[value*="localhost"]',
        'input[readonly]',
        'div:has-text("공유 링크")'
      ];
      
      let shareLink = null;
      for (const selector of linkSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            shareLink = await element.inputValue().catch(() => element.textContent());
            if (shareLink && shareLink.includes('http')) {
              console.log(`✓ 공유 링크 발견: ${shareLink}`);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      // 8. 공유 링크로 접속 테스트
      if (shareLink) {
        console.log('\n8. 공유 링크로 접속 테스트...');
        const newPage = await context.newPage();
        await newPage.goto(shareLink, { waitUntil: 'networkidle' });
        await newPage.waitForTimeout(3000);
        await newPage.screenshot({ path: 'tarot-test-08-shared-page.png' });
        console.log('✓ 스크린샷: tarot-test-08-shared-page.png');
        
        // 공유된 내용 확인
        const hasContent = await newPage.locator('text=/오늘의 운세/').isVisible().catch(() => false);
        console.log(`✓ 공유된 질문 표시: ${hasContent ? '성공' : '실패'}`);
        
        await newPage.close();
      }
    } else {
      console.log('⚠️ 공유 버튼을 찾을 수 없음');
    }
    
    // 최종 상태 확인
    console.log('\n9. 최종 페이지 상태 확인...');
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