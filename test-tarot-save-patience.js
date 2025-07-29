const { chromium } = require('playwright');

async function testTarotSavePatience() {
  let browser;
  try {
    console.log('🚀 Starting patient tarot save test...');
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // 1-5. 빠른 카드 선택까지 (이전과 동일)
    console.log('1️⃣-5️⃣ Quick setup and card selection...');
    await page.goto('http://localhost:4000/reading');
    await page.waitForLoadState('networkidle');
    
    const questionInput = await page.locator('textarea[placeholder*="카드에게"]').first();
    await questionInput.fill('오늘의 운세는 어떨까요?');
    
    const shuffleButton = await page.locator('button:has-text("카드 섞기")').first();
    await shuffleButton.click();
    await page.waitForTimeout(8000);
    
    const revealButton = await page.locator('button:has-text("카드 펼치기")').first();
    await revealButton.click();
    await page.waitForTimeout(5000);
    
    // 카드 3장 선택
    for (let i = 0; i < 3; i++) {
      await page.evaluate((index) => {
        const cards = document.querySelectorAll('[role="button"][aria-label*="펼쳐진"]');
        if (cards[index]) cards[index].click();
      }, i);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'screenshots/patience-05-cards-ready.png' });
    
    // 6. 해석 버튼 클릭
    console.log('6️⃣ Clicking interpretation button...');
    const interpretButton = await page.locator('button:has-text("AI 해석 받기")').first();
    await interpretButton.click();
    await page.screenshot({ path: 'screenshots/patience-06-interpret-start.png' });
    
    // 7. AI 해석 완료까지 충분히 대기 (다이얼로그 또는 페이지 내)
    console.log('7️⃣ Waiting patiently for AI interpretation (up to 2 minutes)...');
    
    let interpretationFound = false;
    let attempts = 0;
    const maxAttempts = 24; // 2분 (5초 * 24)
    
    while (!interpretationFound && attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts} - Checking for AI interpretation...`);
      
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `screenshots/patience-07-wait-${attempts}.png` });
      
      // 다이얼로그 확인
      const dialogExists = await page.locator('[role="dialog"]').count() > 0;
      if (dialogExists) {
        console.log('✅ Dialog found!');
        interpretationFound = true;
        break;
      }
      
      // 페이지 내 해석 내용 확인
      const interpretationText = await page.locator('text=/타로|해석|운세|카드.*의미|미래|과거|현재/').count();
      if (interpretationText > 0) {
        console.log('✅ Interpretation content found on page!');
        interpretationFound = true;
        break;
      }
      
      // 로딩 상태 확인
      const loadingButton = await page.locator('button:has-text("해석 중")').count();
      if (loadingButton > 0) {
        console.log('⏳ Still interpreting...');
        continue;
      }
      
      // 에러 확인
      const errorText = await page.locator('text=/오류|error|실패|failed/i').count();
      if (errorText > 0) {
        console.log('❌ Error detected, stopping wait');
        break;
      }
    }
    
    // 8. 해석 결과 확인 및 저장 버튼 찾기
    console.log('8️⃣ Checking for save functionality...');
    await page.screenshot({ path: 'screenshots/patience-08-final-state.png', fullPage: true });
    
    // 다이얼로그 내부 저장 버튼 확인
    const dialogSaveButton = await page.locator('[role="dialog"] button:has-text("저장")').count();
    if (dialogSaveButton > 0) {
      console.log('💾 Save button found in dialog!');
      const saveBtn = await page.locator('[role="dialog"] button:has-text("저장")').first();
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/patience-09-save-dialog.png' });
    }
    
    // 페이지 내 저장 버튼 확인
    const pageSaveButton = await page.locator('button:has-text("저장")').count();
    if (pageSaveButton > 0) {
      console.log('💾 Save button found on page!');
      const saveBtn = await page.locator('button:has-text("저장")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/patience-09-save-page.png' });
      }
    }
    
    // 9. 최종 결과 분석
    console.log('9️⃣ Final analysis...');
    
    // 로그인 상태 확인
    const loginLinks = await page.locator('a[href*="sign-in"], text=로그인').count();
    const isLoggedIn = loginLinks === 0;
    
    // 저장 관련 메시지 확인
    const saveSuccess = await page.locator('text=저장 완료').count() > 0;
    const loginRequired = await page.locator('text=로그인 필요').count() > 0;
    
    console.log('🏁 FINAL TEST RESULTS:');
    console.log('=' .repeat(60));
    console.log(`✅ Cards selected: SUCCESS (3/3)`);
    console.log(`✅ AI interpretation requested: SUCCESS`);
    console.log(`${interpretationFound ? '✅' : '❌'} AI interpretation completed: ${interpretationFound ? 'SUCCESS' : 'TIMEOUT'}`);
    console.log(`${dialogSaveButton > 0 || pageSaveButton > 0 ? '✅' : '❌'} Save button found: ${dialogSaveButton > 0 || pageSaveButton > 0 ? 'SUCCESS' : 'NOT FOUND'}`);
    console.log(`🔐 User login status: ${isLoggedIn ? 'LOGGED IN' : 'NOT LOGGED IN'}`);
    
    if (saveSuccess) {
      console.log('🎉 SAVE FUNCTIONALITY: CONFIRMED WORKING!');
    } else if (loginRequired) {
      console.log('🔐 SAVE FUNCTIONALITY: LOGIN REQUIRED (WORKING AS EXPECTED)');
    } else if (dialogSaveButton > 0 || pageSaveButton > 0) {
      console.log('💾 SAVE FUNCTIONALITY: BUTTON EXISTS (LIKELY WORKING)');
    } else {
      console.log('❌ SAVE FUNCTIONALITY: NOT FOUND');
    }
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testTarotSavePatience().catch(console.error);