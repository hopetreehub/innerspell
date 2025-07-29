const { chromium } = require('playwright');

async function testTarotCompleteFlow() {
  let browser;
  try {
    console.log('Starting browser...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // 1. Reading 페이지 접속
    console.log('Step 1: Navigating to reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/flow-01-reading-page.png' });
    
    // 2. 질문 입력
    console.log('Step 2: Entering question...');
    const questionInput = await page.locator('textarea[placeholder*="카드에게"]').first();
    await questionInput.fill('오늘의 운세는 어떨까요?');
    await page.screenshot({ path: 'screenshots/flow-02-question-entered.png' });
    
    // 3. 카드 섞기 버튼 클릭
    console.log('Step 3: Clicking shuffle button...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    await page.waitForTimeout(3000); // 섞기 애니메이션 대기
    await page.screenshot({ path: 'screenshots/flow-03-cards-shuffled.png' });
    
    // 4. 카드 펼치기 버튼 클릭
    console.log('Step 4: Clicking spread cards button...');
    const spreadButton = await page.locator('button:has-text("카드 펼치기")').first();
    await spreadButton.click();
    await page.waitForTimeout(2000); // 펼치기 애니메이션 대기
    await page.screenshot({ path: 'screenshots/flow-04-cards-spread.png' });
    
    // 5. 카드 3장 선택
    console.log('Step 5: Selecting 3 cards...');
    const cards = await page.locator('[data-card-id], .card, [class*="card"]').all();
    console.log(`Found ${cards.length} cards to select from`);
    
    // 카드 선택 (최대 3장)
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      console.log(`Selecting card ${i + 1}...`);
      await cards[i].click();
      await page.waitForTimeout(1000); // 각 선택 후 대기
      await page.screenshot({ path: `screenshots/flow-05-${i+1}-card-selected.png` });
    }
    
    // 6. 선택 완료 또는 해석 버튼 찾아서 클릭
    console.log('Step 6: Looking for interpretation button...');
    
    const interpretButtons = [
      'button:has-text("해석")',
      'button:has-text("AI 해석")',
      'button:has-text("리딩 시작")',
      'button:has-text("완료")',
      'button:has-text("선택 완료")'
    ];
    
    let interpretButton = null;
    for (const selector of interpretButtons) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible()) {
          interpretButton = button;
          console.log(`Found interpret button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (interpretButton) {
      await interpretButton.click();
      console.log('Interpretation button clicked');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/flow-06-interpret-clicked.png' });
      
      // 7. AI 응답 대기
      console.log('Step 7: Waiting for AI response...');
      try {
        await page.waitForSelector('text=/해석|타로|운세|카드/', { timeout: 30000 });
        await page.waitForTimeout(5000); // AI 응답 완료 대기
        await page.screenshot({ path: 'screenshots/flow-07-ai-response.png' });
        
        // 8. 저장 버튼 찾기
        console.log('Step 8: Looking for save button...');
        
        // 페이지를 아래로 스크롤해서 저장 버튼 찾기
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        const saveButtonSelectors = [
          'button:has-text("저장")',
          'button:has-text("Save")',
          'button:has-text("보관")',
          'button:has-text("저장하기")',
          'button[class*="save"]',
          'button[title*="저장"]',
          '[role="button"]:has-text("저장")'
        ];
        
        let saveButton = null;
        for (const selector of saveButtonSelectors) {
          try {
            const button = await page.locator(selector).first();
            if (await button.isVisible()) {
              saveButton = button;
              console.log(`Found save button with selector: ${selector}`);
              break;
            }
          } catch (e) {
            // Continue
          }
        }
        
        if (saveButton) {
          console.log('SAVE BUTTON FOUND! Clicking...');
          await saveButton.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'screenshots/flow-08-save-clicked.png' });
          
          // 저장 확인
          const saveConfirmed = await page.locator('text=/저장.*완료|저장.*성공|saved/i').first().isVisible().catch(() => false);
          
          if (saveConfirmed) {
            console.log('✅ SAVE CONFIRMED!');
          } else {
            console.log('⚠️ Save button clicked but no confirmation message');
          }
          
          // 대시보드에서 저장된 내용 확인
          console.log('Step 9: Checking saved content in dashboard...');
          await page.goto('http://localhost:4000/dashboard');
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'screenshots/flow-09-dashboard-check.png' });
          
        } else {
          console.log('❌ SAVE BUTTON NOT FOUND!');
          
          // 전체 페이지 스크린샷으로 현재 상태 확인
          await page.screenshot({ path: 'screenshots/flow-error-no-save-button.png', fullPage: true });
          
          // 모든 버튼 리스트 출력
          const allButtons = await page.locator('button').all();
          console.log(`Total buttons on page: ${allButtons.length}`);
          for (let i = 0; i < allButtons.length; i++) {
            const text = await allButtons[i].textContent();
            const isVisible = await allButtons[i].isVisible();
            console.log(`Button ${i}: "${text}" (visible: ${isVisible})`);
          }
        }
        
      } catch (error) {
        console.log('❌ AI RESPONSE TIMEOUT OR ERROR:', error.message);
        await page.screenshot({ path: 'screenshots/flow-error-ai-timeout.png' });
      }
      
    } else {
      console.log('❌ INTERPRETATION BUTTON NOT FOUND!');
      await page.screenshot({ path: 'screenshots/flow-error-no-interpret-button.png' });
      
      // 현재 페이지의 모든 버튼 확인
      const allButtons = await page.locator('button').all();
      console.log(`Total buttons: ${allButtons.length}`);
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        console.log(`Button ${i}: "${text}"`);
      }
    }
    
    // 최종 상태
    await page.screenshot({ path: 'screenshots/flow-final-state.png', fullPage: true });
    console.log('Test completed!');
    
  } catch (error) {
    console.error('Test error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testTarotCompleteFlow().catch(console.error);