const { chromium } = require('playwright');

async function testTarotSaveWorking() {
  let browser;
  try {
    console.log('🚀 Starting working tarot save test...');
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
    await page.screenshot({ path: 'screenshots/working-01-page-load.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ Entering question...');
    const questionInput = await page.locator('textarea[placeholder*="카드에게"]').first();
    await questionInput.fill('오늘의 운세는 어떨까요?');
    await page.screenshot({ path: 'screenshots/working-02-question.png' });
    
    // 3. 카드 섞기
    console.log('3️⃣ Shuffling cards...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'screenshots/working-03-shuffled.png' });
    
    // 4. 카드 펼치기
    console.log('4️⃣ Revealing cards...');
    const revealButton = await page.locator('button:has-text("카드 펼치기")').first();
    await revealButton.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/working-04-revealed.png' });
    
    // 5. 카드 3장 선택 (순차적으로)
    console.log('5️⃣ Selecting 3 cards sequentially...');
    
    for (let cardIndex = 0; cardIndex < 3; cardIndex++) {
      console.log(`Selecting card ${cardIndex + 1}...`);
      
      // 현재 선택 가능한 카드들 찾기 (매번 새로 찾기)
      const availableCards = await page.locator('[role="button"][aria-label*="펼쳐진"]').all();
      console.log(`Available cards: ${availableCards.length}`);
      
      if (availableCards.length > cardIndex) {
        // JavaScript로 강제 클릭
        await page.evaluate((index) => {
          const cards = document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]');
          if (cards[index]) {
            cards[index].click();
          }
        }, cardIndex);
        
        await page.waitForTimeout(2000); // 각 선택 후 대기
        await page.screenshot({ path: `screenshots/working-05-${cardIndex+1}-selected.png` });
        
        // 선택된 카드 수 확인
        const selectedCountText = await page.locator('text=/선택된 카드.*\\d+\\/3/').textContent().catch(() => '');
        console.log(`Selection status: ${selectedCountText}`);
      } else {
        console.log(`No more cards available to select at index ${cardIndex}`);
        break;
      }
    }
    
    // 현재 상태 확인
    await page.screenshot({ path: 'screenshots/working-05-all-selected.png' });
    
    // 6. 해석 버튼 확인 및 클릭
    console.log('6️⃣ Checking for interpretation button...');
    
    // 해석 버튼 찾기
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    const buttonExists = await interpretButton.count() > 0;
    console.log(`Interpret button exists: ${buttonExists}`);
    
    if (buttonExists) {
      const isDisabled = await interpretButton.isDisabled();
      console.log(`Interpret button disabled: ${isDisabled}`);
      
      if (!isDisabled) {
        console.log('✅ Clicking interpretation button...');
        await interpretButton.click();
        await page.screenshot({ path: 'screenshots/working-06-interpret-clicked.png' });
        
        // 7. AI 해석 다이얼로그 대기
        console.log('7️⃣ Waiting for AI interpretation dialog...');
        await page.waitForSelector('[role="dialog"]', { timeout: 15000 });
        await page.screenshot({ path: 'screenshots/working-07-dialog-appeared.png' });
        
        // 8. AI 해석 완료까지 대기
        console.log('8️⃣ Waiting for AI interpretation to complete...');
        
        // 해석 내용이 나타날 때까지 대기
        await page.waitForSelector('.prose', { timeout: 30000 });
        await page.waitForTimeout(15000); // 타이핑 효과 완료 대기
        await page.screenshot({ path: 'screenshots/working-08-interpretation-ready.png' });
        
        // 9. 저장 버튼 테스트
        console.log('9️⃣ Testing save functionality...');
        
        // 로그인 상태 확인
        const signInLinks = await page.locator('a[href*="sign-in"]').count();
        const isLoggedIn = signInLinks === 0;
        console.log(`🔐 Login status: ${isLoggedIn ? 'Logged in' : 'Not logged in'}`);
        
        // 저장 버튼 찾기
        const saveButtonSelectors = [
          'button:has-text("이 리딩 저장하기")',
          'button:has-text("리딩 저장")',
          '[role="dialog"] button[class*="bg-primary"]'
        ];
        
        let saveButton = null;
        for (const selector of saveButtonSelectors) {
          const button = await page.locator(selector).first();
          if (await button.count() > 0 && await button.isVisible()) {
            saveButton = button;
            console.log(`✅ Found save button: ${selector}`);
            break;
          }
        }
        
        if (saveButton) {
          console.log('💾 SAVE BUTTON FOUND! Testing click...');
          await saveButton.click();
          await page.waitForTimeout(5000);
          await page.screenshot({ path: 'screenshots/working-09-save-result.png' });
          
          if (isLoggedIn) {
            // 저장 성공 확인
            const saveSuccess = await page.locator('text=저장 완료').isVisible().catch(() => false);
            console.log(`💾 Save result: ${saveSuccess ? 'SUCCESS' : 'UNKNOWN'}`);
            
            if (saveSuccess) {
              console.log('🎉 SAVE FUNCTIONALITY CONFIRMED WORKING!');
            }
          } else {
            // 로그인 프롬프트 확인
            const loginPrompt = await page.locator('text=로그인 필요').isVisible().catch(() => false);
            console.log(`🔐 Login prompt: ${loginPrompt ? 'SHOWN' : 'NOT SHOWN'}`);
            
            if (loginPrompt) {
              console.log('🎉 SAVE BUTTON WORKS - LOGIN PROMPT SHOWN!');
            }
          }
        } else {
          console.log('❌ SAVE BUTTON NOT FOUND IN DIALOG');
          
          // 다이얼로그 닫고 외부에서 찾기
          const closeButton = await page.locator('button:has-text("닫기")').first();
          if (await closeButton.count() > 0) {
            await closeButton.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'screenshots/working-09-dialog-closed.png' });
            
            // 외부 저장 버튼 확인
            const externalSaveButton = await page.locator('button:has-text("리딩 저장")').first();
            if (await externalSaveButton.count() > 0 && await externalSaveButton.isVisible()) {
              console.log('✅ Found external save button');
              await externalSaveButton.click();
              await page.waitForTimeout(3000);
              await page.screenshot({ path: 'screenshots/working-09-external-save.png' });
            }
          }
        }
        
      } else {
        console.log('❌ Interpretation button is disabled');
      }
    } else {
      console.log('❌ Interpretation button not found');
    }
    
    // 10. 최종 정리
    console.log('🏁 TEST COMPLETED - SUMMARY:');
    console.log('=' .repeat(50));
    console.log('✅ 1. Page loaded successfully');
    console.log('✅ 2. Question entered successfully');
    console.log('✅ 3. Cards shuffled successfully');
    console.log('✅ 4. Cards revealed successfully');
    console.log('✅ 5. Card selection attempted');
    console.log(`${buttonExists ? '✅' : '❌'} 6. Interpretation button found`);
    console.log('=' .repeat(50));
    
    await page.screenshot({ path: 'screenshots/working-final-summary.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testTarotSaveWorking().catch(console.error);