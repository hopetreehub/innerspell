const { chromium } = require('playwright');

async function debugCardSelection() {
  console.log('🔍 카드 선택 디버그 테스트');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    args: ['--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // 상태 변화 모니터링
  page.on('console', msg => {
    if (msg.text().includes('카드 선택') || msg.text().includes('상태') || msg.text().includes('stage')) {
      console.log(`🔍 [브라우저] ${msg.text()}`);
    }
  });
  
  try {
    console.log('1️⃣ 페이지 접속');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    console.log('2️⃣ 질문 입력');
    await page.fill('textarea', '카드 선택 테스트');
    
    console.log('3️⃣ 카드 섞기');
    await page.click('button:has-text("카드 섞기")');
    await page.waitForTimeout(4000);
    
    console.log('4️⃣ 카드 펼치기');
    await page.click('button:has-text("카드 펼치기")');
    await page.waitForTimeout(2000);
    
    // 현재 상태 확인
    console.log('5️⃣ 카드 선택 전 상태 확인');
    const beforeState = await page.evaluate(() => {
      // React 컴포넌트 상태 확인
      const stageElement = document.querySelector('[data-stage]');
      const selectedCardsElement = document.querySelector('[data-selected-count]');
      const spreadCardsElement = document.querySelector('[role="group"][aria-labelledby]');
      
      return {
        stage: stageElement ? stageElement.getAttribute('data-stage') : 'unknown',
        selectedCount: selectedCardsElement ? selectedCardsElement.getAttribute('data-selected-count') : 'unknown',
        spreadCardsCount: spreadCardsElement ? spreadCardsElement.children.length : 0,
        availableCards: document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]').length
      };
    });
    
    console.log('선택 전 상태:', beforeState);
    
    console.log('6️⃣ 카드 하나씩 선택하며 상태 확인');
    
    for (let i = 0; i < 3; i++) {
      console.log(`\n--- ${i + 1}번째 카드 선택 ---`);
      
      const cardClicked = await page.evaluate((index) => {
        const cards = document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]');
        if (cards[index]) {
          console.log(`🎯 카드 선택 시도:`, {
            cardIndex: index,
            cardLabel: cards[index].getAttribute('aria-label'),
            cardId: cards[index].getAttribute('aria-label'),
          });
          
          cards[index].click();
          return true;
        }
        return false;
      }, i);
      
      if (cardClicked) {
        console.log(`카드 ${i + 1} 클릭됨`);
        await page.waitForTimeout(1000);
        
        // 선택 후 상태 확인
        const afterState = await page.evaluate(() => {
          const selectedCards = document.querySelectorAll('[aria-label*="선택된 카드"]');
          const stageIndicator = document.querySelector('h3');
          const interpretButton = document.querySelector('button:has-text("AI 해석 받기"), button[aria-label*="AI 해석"]');
          
          return {
            selectedCardsCount: selectedCards.length,
            stageText: stageIndicator ? stageIndicator.textContent : 'unknown',
            hasInterpretButton: !!interpretButton,
            interpretButtonVisible: interpretButton ? getComputedStyle(interpretButton).display !== 'none' : false,
            interpretButtonText: interpretButton ? interpretButton.textContent : 'none'
          };
        });
        
        console.log(`선택 후 상태:`, afterState);
        
        // 선택된 카드 개수가 3개가 되었는지 확인
        if (afterState.selectedCardsCount === 3) {
          console.log('✅ 3장 선택 완료! AI 해석 버튼 확인 중...');
          
          // AI 해석 버튼이 나타날 때까지 대기
          try {
            await page.waitForSelector('button:has-text("AI 해석")', { timeout: 3000 });
            console.log('✅ AI 해석 버튼 발견됨');
            break;
          } catch (e) {
            console.log('⚠️ AI 해석 버튼이 나타나지 않음, 계속 진행...');
          }
        }
      } else {
        console.log(`❌ 카드 ${i + 1} 클릭 실패`);
      }
    }
    
    // 최종 상태 확인
    console.log('\n7️⃣ 최종 상태 확인');
    const finalState = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent.trim(),
        visible: getComputedStyle(btn).display !== 'none',
        disabled: btn.disabled
      }));
      
      return {
        allButtons: buttons.filter(btn => btn.text.includes('해석') || btn.text.includes('AI')),
        selectedCardsTitle: document.querySelector('h3')?.textContent,
        cardSections: Array.from(document.querySelectorAll('[class*="Card"], [class*="card"]')).length
      };
    });
    
    console.log('최종 상태:', finalState);
    
    await page.screenshot({ path: 'debug-final-state.png', fullPage: true });
    
    console.log('\n🔍 브라우저를 30초간 유지하여 수동 확인할 수 있습니다.');
    setTimeout(() => browser.close(), 30000);
    
  } catch (error) {
    console.error('❌ 디버그 테스트 오류:', error.message);
    await page.screenshot({ path: 'debug-error.png' });
    setTimeout(() => browser.close(), 5000);
  }
}

debugCardSelection().catch(console.error);