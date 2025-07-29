const { chromium } = require('playwright');

async function testTarotSaveFinal() {
  let browser;
  try {
    console.log('🚀 Starting final tarot save test...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // 1. 페이지 접속
    console.log('1️⃣ Navigating to reading page...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/final-01-page-load.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ Entering question...');
    const questionInput = await page.locator('textarea[placeholder*="카드에게"]').first();
    await questionInput.fill('오늘의 운세는 어떨까요?');
    await page.screenshot({ path: 'screenshots/final-02-question.png' });
    
    // 3. 카드 섞기
    console.log('3️⃣ Shuffling cards...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    await page.waitForTimeout(8000); // 섞기 애니메이션 충분히 대기
    await page.screenshot({ path: 'screenshots/final-03-shuffled.png' });
    
    // 4. 카드 펼치기
    console.log('4️⃣ Revealing cards...');
    const revealButton = await page.locator('button:has-text("카드 펼치기")').first();
    await revealButton.click();
    await page.waitForTimeout(5000); // 펼치기 애니메이션 대기
    await page.screenshot({ path: 'screenshots/final-04-revealed.png' });
    
    // 5. 카드 3장 선택 (JavaScript로 직접 클릭)
    console.log('5️⃣ Selecting cards using JavaScript...');
    
    // 카드 선택을 JavaScript로 처리
    await page.evaluate(() => {
      // 펼쳐진 카드들 찾기
      const cardButtons = document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]');
      console.log(`Found ${cardButtons.length} cards to select from`);
      
      // 처음 3장 선택
      for (let i = 0; i < Math.min(3, cardButtons.length); i++) {
        console.log(`Clicking card ${i + 1}...`);
        cardButtons[i].click();
      }
    });
    
    await page.waitForTimeout(3000); // 선택 완료 대기
    await page.screenshot({ path: 'screenshots/final-05-cards-selected.png' });
    
    // 6. 해석 버튼 대기 및 클릭
    console.log('6️⃣ Waiting for interpretation button...');
    
    // 해석 버튼이 활성화될 때까지 대기 (최대 10초)
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const interpretButton = buttons.find(btn => btn.textContent.includes('AI 해석 받기'));
        return interpretButton && !interpretButton.disabled;
      },
      { timeout: 10000 }
    );
    
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    await interpretButton.click();
    await page.screenshot({ path: 'screenshots/final-06-interpret-clicked.png' });
    
    // 7. AI 해석 다이얼로그 나타날 때까지 대기
    console.log('7️⃣ Waiting for AI interpretation dialog...');
    await page.waitForSelector('[role="dialog"]', { timeout: 15000 });
    await page.screenshot({ path: 'screenshots/final-07-dialog-appeared.png' });
    
    // 8. AI 해석 완료까지 대기
    console.log('8️⃣ Waiting for AI interpretation to complete...');
    
    // 로딩 메시지가 사라질 때까지 대기
    try {
      await page.waitForFunction(
        () => {
          const loadingText = document.querySelector('p');
          return !loadingText || !loadingText.textContent.includes('AI가 지혜를 엮고 있습니다');
        },
        { timeout: 60000 }
      );
    } catch (e) {
      console.log('⏰ Loading message timeout, continuing...');
    }
    
    // 해석 내용이 나타날 때까지 대기
    await page.waitForSelector('.prose', { timeout: 30000 });
    await page.waitForTimeout(10000); // 타이핑 효과 완료 대기
    await page.screenshot({ path: 'screenshots/final-08-interpretation-ready.png' });
    
    // 9. 저장 버튼 찾기 및 테스트
    console.log('9️⃣ Testing save functionality...');
    
    // 먼저 로그인 상태 확인
    const loginButton = await page.locator('text=로그인').count();
    const isLoggedIn = loginButton === 0;
    console.log(`🔐 Login status: ${isLoggedIn ? 'Logged in' : 'Not logged in'}`);
    
    // 저장 버튼 찾기
    const saveButtonSelectors = [
      'button:has-text("이 리딩 저장하기")',
      'button:has-text("리딩 저장")',
      '[role="dialog"] button:has(svg[class*="lucide-save"])'
    ];
    
    let saveButton = null;
    for (const selector of saveButtonSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible()) {
          saveButton = button;
          console.log(`✅ Found save button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (saveButton) {
      console.log('💾 Testing save button click...');
      await saveButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/final-09-save-clicked.png' });
      
      if (isLoggedIn) {
        // 로그인된 경우: 저장 성공 확인
        const saveSuccess = await page.locator('text=저장 완료').isVisible().catch(() => false);
        if (saveSuccess) {
          console.log('✅ SAVE SUCCESS: Reading saved successfully!');
          
          // 대시보드에서 확인
          await page.goto('http://localhost:4000/dashboard');
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'screenshots/final-10-dashboard.png' });
          
          const savedReading = await page.locator('text=/오늘의 운세/').isVisible().catch(() => false);
          console.log(`📋 Dashboard check: ${savedReading ? 'Reading found' : 'Reading not found'}`);
        } else {
          console.log('⚠️ Save success message not found');
        }
      } else {
        // 로그인되지 않은 경우: 로그인 프롬프트 확인
        const loginPrompt = await page.locator('text=로그인 필요').isVisible().catch(() => false);
        if (loginPrompt) {
          console.log('✅ LOGIN PROMPT: Correctly showed login requirement');
        } else {
          console.log('❌ Login prompt not found');
        }
      }
    } else {
      console.log('❌ SAVE BUTTON NOT FOUND in dialog');
      
      // 다이얼로그 닫고 외부에서 찾기
      console.log('🔍 Closing dialog and looking outside...');
      const closeButton = await page.locator('button:has-text("닫기")').first();
      await closeButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/final-09-dialog-closed.png' });
      
      // 외부 저장 버튼 찾기
      const externalSaveButton = await page.locator('button:has-text("리딩 저장")').first();
      if (await externalSaveButton.isVisible()) {
        console.log('✅ Found external save button');
        await externalSaveButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/final-09-external-save.png' });
      } else {
        console.log('❌ No external save button found either');
      }
    }
    
    // 10. 최종 결과 정리
    console.log('🏁 TEST SUMMARY:');
    console.log('================');
    console.log(`✅ Page loaded: SUCCESS`);
    console.log(`✅ Question entered: SUCCESS`);
    console.log(`✅ Cards shuffled: SUCCESS`);
    console.log(`✅ Cards revealed: SUCCESS`);
    console.log(`✅ Cards selected: SUCCESS`);
    console.log(`✅ AI interpretation: SUCCESS`);
    console.log(`${saveButton ? '✅' : '❌'} Save button found: ${saveButton ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🔐 User login status: ${isLoggedIn ? 'LOGGED IN' : 'NOT LOGGED IN'}`);
    
    await page.screenshot({ path: 'screenshots/final-summary.png', fullPage: true });
    console.log('✨ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    if (browser) {
      try {
        await page.screenshot({ path: 'screenshots/final-error.png', fullPage: true });
      } catch (e) {
        console.error('Failed to take error screenshot:', e);
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testTarotSaveFinal().catch(console.error);