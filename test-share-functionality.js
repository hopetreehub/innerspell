const { chromium } = require('playwright');
const path = require('path');

async function testShareFunctionality() {
  console.log('🔗 타로 리딩 공유 기능 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 메시지 캡처
    page.on('console', msg => {
      console.log(`[CONSOLE] ${msg.text()}`);
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
      console.log(`[ERROR] ${error.message}`);
    });
    
    console.log('📍 /reading 페이지로 이동...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    // 1. 질문 입력
    console.log('📝 질문 입력...');
    const questionInput = page.locator('textarea[placeholder*="카드에게"]');
    await questionInput.fill('오늘의 운세는 어떤가요?');
    
    // 스크린샷
    await page.screenshot({ 
      path: path.join(__dirname, 'share-test-01-question.png'),
      fullPage: true 
    });
    
    // 2. 카드 섞기
    console.log('🔀 카드 섞기...');
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(2000); // 섞는 애니메이션 대기
    }
    
    // 3. 카드 펼치기
    console.log('🎴 카드 펼치기...');
    const dealButton = page.locator('button:has-text("카드 펼치기")');
    if (await dealButton.isVisible()) {
      await dealButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 스크린샷
    await page.screenshot({ 
      path: path.join(__dirname, 'share-test-02-cards-dealt.png'),
      fullPage: true 
    });
    
    // 4. 카드 선택 (첫 번째 카드들 클릭)
    console.log('👆 카드 선택...');
    const cards = page.locator('[class*="card"], img[src*="tarot"]');
    const cardCount = await cards.count();
    console.log(`🎴 감지된 카드 수: ${cardCount}`);
    
    if (cardCount > 0) {
      // 처음 몇 장의 카드 클릭
      for (let i = 0; i < Math.min(3, cardCount); i++) {
        try {
          await cards.nth(i).click();
          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`  카드 ${i + 1} 클릭 실패: ${e.message}`);
        }
      }
    }
    
    // 5. 해석 생성 버튼 찾기
    console.log('🔮 해석 생성 버튼 찾기...');
    const interpretButtons = await page.locator('button').allTextContents();
    console.log('🔘 현재 버튼들:', interpretButtons.slice(0, 10)); // 처음 10개만
    
    const interpretButton = page.locator('button:has-text("해석"), button:has-text("생성"), button:has-text("읽기")').first();
    if (await interpretButton.isVisible()) {
      console.log('🎯 해석 버튼 클릭...');
      await interpretButton.click();
      await page.waitForTimeout(3000); // 해석 생성 대기
    }
    
    // 스크린샷
    await page.screenshot({ 
      path: path.join(__dirname, 'share-test-03-interpretation.png'),
      fullPage: true 
    });
    
    // 6. 저장/공유 버튴 찾기
    console.log('💾 저장/공유 버튼 찾기...');
    const allButtons = await page.locator('button').allTextContents();
    console.log('🔘 모든 버튼 텍스트:', allButtons);
    
    const saveButton = page.locator('button:has-text("저장"), button[aria-label*="저장"]').first();
    const shareButton = page.locator('button:has-text("공유"), button[aria-label*="공유"]').first();
    
    const saveExists = await saveButton.isVisible().catch(() => false);
    const shareExists = await shareButton.isVisible().catch(() => false);
    
    console.log(`💾 저장 버튼 존재: ${saveExists}`);
    console.log(`🔗 공유 버튼 존재: ${shareExists}`);
    
    if (shareExists) {
      console.log('🎉 공유 버튼 클릭 테스트...');
      await shareButton.click();
      await page.waitForTimeout(2000);
    }
    
    if (saveExists) {
      console.log('💾 저장 버튼 클릭 테스트...');
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: path.join(__dirname, 'share-test-04-final.png'),
      fullPage: true 
    });
    
    // 7. 로그인 상태 확인
    const bodyText = await page.locator('body').textContent();
    const needsLogin = bodyText.includes('로그인') || bodyText.includes('회원가입');
    console.log(`🔐 로그인 필요 여부: ${needsLogin}`);
    
    console.log('✅ 공유 기능 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 공유 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testShareFunctionality();