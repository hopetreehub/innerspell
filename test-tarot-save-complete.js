const { chromium } = require('playwright');

async function testTarotSaveComplete() {
  let browser;
  try {
    console.log('🚀 Starting comprehensive tarot save test...');
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
    await page.screenshot({ path: 'screenshots/complete-01-page-load.png' });
    
    // 2. 질문 입력
    console.log('2️⃣ Entering question...');
    const questionInput = await page.locator('textarea[placeholder*="카드에게"]').first();
    await questionInput.fill('오늘의 운세는 어떨까요?');
    await page.screenshot({ path: 'screenshots/complete-02-question.png' });
    
    // 3. 카드 섞기
    console.log('3️⃣ Shuffling cards...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    await page.waitForTimeout(8000); // 섞기 애니메이션 충분히 대기
    await page.screenshot({ path: 'screenshots/complete-03-shuffled.png' });
    
    // 4. 카드 펼치기
    console.log('4️⃣ Revealing cards...');
    const revealButton = await page.locator('button:has-text("카드 펼치기")').first();
    await revealButton.click();
    await page.waitForTimeout(3000); // 펼치기 애니메이션 대기
    await page.screenshot({ path: 'screenshots/complete-04-revealed.png' });
    
    // 5. 카드 3장 선택 (더 정확한 방법)
    console.log('5️⃣ Selecting cards...');
    
    // 펼쳐진 카드들을 찾아서 3장 선택
    const spreadCards = await page.locator('[role="button"][aria-label*="펼쳐진"]').all();
    console.log(`Found ${spreadCards.length} spread cards`);
    
    for (let i = 0; i < Math.min(3, spreadCards.length); i++) {
      console.log(`Selecting card ${i + 1}...`);
      await spreadCards[i].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `screenshots/complete-05-${i+1}-selected.png` });
    }
    
    // 6. 선택 완료 확인 및 해석 요청
    console.log('6️⃣ Requesting interpretation...');
    
    // 해석 버튼이 활성화될 때까지 대기
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    await interpretButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // 버튼이 비활성화되어 있지 않은지 확인
    const isDisabled = await interpretButton.isDisabled();
    if (isDisabled) {
      console.log('⚠️ Interpret button is disabled, waiting for it to be enabled...');
      await page.waitForFunction(
        () => !document.querySelector('button:has-text("AI 해석 받기")')?.disabled,
        { timeout: 10000 }
      );
    }
    
    await interpretButton.click();
    await page.screenshot({ path: 'screenshots/complete-06-interpret-clicked.png' });
    
    // 7. AI 해석 다이얼로그 나타날 때까지 대기
    console.log('7️⃣ Waiting for AI interpretation dialog...');
    await page.waitForSelector('[role="dialog"]', { timeout: 15000 });
    await page.screenshot({ path: 'screenshots/complete-07-dialog-appeared.png' });
    
    // 8. AI 해석 완료까지 대기 (타이핑 효과 완료)
    console.log('8️⃣ Waiting for AI interpretation to complete...');
    
    // "AI가 지혜를 엮고 있습니다..." 메시지가 사라질 때까지 대기
    await page.waitForFunction(
      () => !document.querySelector('text=AI가 지혜를 엮고 있습니다...'),
      { timeout: 60000 }
    );
    
    // 추가로 타이핑 효과가 완료될 때까지 충분히 대기
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'screenshots/complete-08-interpretation-ready.png' });
    
    // 9. 저장 버튼 찾기 (다이얼로그 내부)
    console.log('9️⃣ Looking for save button in dialog...');
    
    const saveButtonSelectors = [
      'button:has-text("이 리딩 저장하기")',
      'button:has-text("리딩 저장")',
      'button:has-text("저장")',
      '[role="dialog"] button:has(svg.lucide-save)',
      '[role="dialog"] button[class*="bg-primary"]'
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
        console.log(`❌ Save button not found with selector: ${selector}`);
      }
    }
    
    if (saveButton) {
      console.log('🎯 SAVE BUTTON FOUND! Testing save functionality...');
      
      // 로그인 상태 확인
      const isLoggedIn = await page.locator('text=로그인').count() === 0;
      console.log(`Login status: ${isLoggedIn ? 'Logged in' : 'Not logged in'}`);
      
      if (!isLoggedIn) {
        console.log('⚠️ User not logged in - testing login prompt...');
        await saveButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/complete-09-login-prompt.png' });
        
        // 로그인 토스트 메시지 확인
        const loginToast = await page.locator('text=로그인 필요').isVisible().catch(() => false);
        if (loginToast) {
          console.log('✅ Login prompt appeared correctly');
        } else {
          console.log('❌ Login prompt not found');
        }
      } else {
        console.log('✅ User is logged in - testing save functionality...');
        await saveButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/complete-09-save-clicked.png' });
        
        // 저장 성공 메시지 확인
        const saveSuccess = await page.locator('text=저장 완료').isVisible().catch(() => false);
        if (saveSuccess) {
          console.log('✅ Save success message appeared');
          
          // 대시보드에서 저장된 내용 확인
          console.log('🔍 Checking saved reading in dashboard...');
          await page.goto('http://localhost:4000/dashboard');
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'screenshots/complete-10-dashboard.png' });
          
          const savedReading = await page.locator('text=/오늘의 운세/').first().isVisible().catch(() => false);
          if (savedReading) {
            console.log('✅ Saved reading found in dashboard');
          } else {
            console.log('❌ Saved reading not found in dashboard');
          }
        } else {
          console.log('❌ Save success message not found');
        }
      }
    } else {
      console.log('❌ SAVE BUTTON NOT FOUND!');
      
      // 다이얼로그 밖에서 저장 버튼 찾기
      console.log('🔍 Closing dialog and looking for save button outside...');
      const closeButton = await page.locator('button:has-text("닫기")').first();
      await closeButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/complete-09-dialog-closed.png' });
      
      // 다이얼로그 외부 저장 버튼 찾기
      const externalSaveButton = await page.locator('button:has-text("리딩 저장")').first();
      if (await externalSaveButton.isVisible()) {
        console.log('✅ Found save button outside dialog');
        await externalSaveButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/complete-09-external-save.png' });
      } else {
        console.log('❌ No save button found outside dialog either');
      }
      
      // 현재 페이지의 모든 버튼 디버깅
      console.log('🐛 Debugging all buttons on page:');
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        const isDisabled = await allButtons[i].isDisabled();
        console.log(`Button ${i}: "${text}" (visible: ${isVisible}, disabled: ${isDisabled})`);
      }
    }
    
    console.log('✨ Test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    if (browser) {
      await page.screenshot({ path: 'screenshots/complete-error.png', fullPage: true });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testTarotSaveComplete().catch(console.error);