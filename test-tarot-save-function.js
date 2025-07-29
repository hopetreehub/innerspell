const { chromium } = require('playwright');
const path = require('path');

async function testTarotSaveFunction() {
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
    await page.screenshot({ path: 'screenshots/save-test-01-reading-page.png' });
    
    // 2. 질문 입력
    console.log('Step 2: Entering question...');
    const questionInput = await page.locator('textarea[placeholder*="카드에게"]').first();
    await questionInput.fill('오늘의 운세는 어떨까요?');
    await page.screenshot({ path: 'screenshots/save-test-02-question-entered.png' });
    
    // 3. 카드 섞기 버튼 클릭
    console.log('Step 3: Clicking shuffle button...');
    const shuffleButton = await page.locator('button:has-text("카드 섞기"), button:has-text("셔플")').first();
    await shuffleButton.click();
    await page.waitForTimeout(2000); // 애니메이션 대기
    await page.screenshot({ path: 'screenshots/save-test-03-cards-shuffled.png' });
    
    // 4. 카드 3장 선택
    console.log('Step 4: Selecting 3 cards...');
    const cards = await page.locator('.card, [class*="card"]').all();
    console.log(`Found ${cards.length} cards`);
    
    // 처음 3장 선택
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].click();
      await page.waitForTimeout(500); // 각 선택 후 대기
    }
    await page.screenshot({ path: 'screenshots/save-test-04-cards-selected.png' });
    
    // 5. AI 해석 요청
    console.log('Step 5: Requesting AI interpretation...');
    const interpretButton = await page.locator('button:has-text("해석"), button:has-text("AI 해석")').first();
    await interpretButton.click();
    
    // AI 응답 대기 (최대 30초)
    console.log('Waiting for AI response...');
    await page.waitForSelector('text=/타로|해석|운세/', { timeout: 30000 });
    await page.waitForTimeout(2000); // 추가 렌더링 대기
    await page.screenshot({ path: 'screenshots/save-test-05-ai-interpretation.png' });
    
    // 6. 저장 버튼 찾기
    console.log('Step 6: Looking for save button...');
    
    // 다양한 저장 버튼 텍스트 시도
    const saveButtonSelectors = [
      'button:has-text("저장")',
      'button:has-text("Save")',
      'button:has-text("보관")',
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
        // Continue to next selector
      }
    }
    
    if (saveButton) {
      console.log('Save button found! Clicking...');
      await saveButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/save-test-06-after-save-click.png' });
      
      // 7. 저장 확인 메시지 또는 UI 변화 확인
      console.log('Step 7: Checking for save confirmation...');
      
      // 저장 성공 메시지 확인
      const successMessages = [
        'text=/저장.*완료/',
        'text=/저장.*성공/',
        'text=/saved/i',
        'text=/보관.*완료/'
      ];
      
      let saveConfirmed = false;
      for (const message of successMessages) {
        try {
          await page.waitForSelector(message, { timeout: 3000 });
          saveConfirmed = true;
          console.log('Save confirmation message found!');
          break;
        } catch (e) {
          // Continue
        }
      }
      
      // 8. 저장된 내용 확인 (대시보드로 이동)
      console.log('Step 8: Checking saved content...');
      await page.goto('http://localhost:4000/dashboard');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/save-test-07-dashboard-check.png' });
      
      // 방금 저장한 리딩 찾기
      const savedReading = await page.locator('text=/오늘의 운세/').first();
      if (await savedReading.isVisible()) {
        console.log('Saved reading found in dashboard!');
        await page.screenshot({ path: 'screenshots/save-test-08-saved-reading-found.png' });
      } else {
        console.log('Could not find saved reading in dashboard');
      }
      
    } else {
      console.log('ERROR: Save button not found!');
      
      // 페이지의 모든 버튼 확인
      const allButtons = await page.locator('button').all();
      console.log(`Total buttons found: ${allButtons.length}`);
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        console.log(`Button ${i}: "${text}"`);
      }
      
      // 전체 페이지 스크린샷
      await page.screenshot({ path: 'screenshots/save-test-error-no-save-button.png', fullPage: true });
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ path: 'screenshots/save-test-final-state.png' });
    
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

// Run the test
testTarotSaveFunction().catch(console.error);