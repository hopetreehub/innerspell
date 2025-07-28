const { chromium } = require('playwright');

async function testTarotSaveWithAuth() {
  console.log('🚀 Starting Tarot Reading Save Test with Authentication...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // 에러 캐치
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    const baseUrl = 'https://test-studio-firebase.vercel.app';
    
    // 1. 홈페이지 접속
    console.log('1. 홈페이지 접속 중...');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/auth-01-homepage.png', fullPage: true });
    
    // 2. 타로 리딩 페이지로 직접 이동
    console.log('2. 타로 리딩 페이지로 이동 중...');
    await page.goto(`${baseUrl}/타로리딩`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/auth-02-reading-page.png', fullPage: true });
    
    // 3. 로그인 모달이 있는지 확인
    console.log('3. 로그인 모달 확인 중...');
    const loginModal = page.locator('[role="dialog"], .modal, .dialog');
    
    if (await loginModal.isVisible({ timeout: 5000 })) {
      console.log('✅ 로그인 모달 발견');
      
      // Google 로그인 버튼 클릭
      const googleBtn = page.locator('button:has-text("Google"), .google-login, [data-provider="google"]').first();
      if (await googleBtn.isVisible({ timeout: 5000 })) {
        console.log('🔐 Google 로그인 버튼 클릭');
        await googleBtn.click();
        await page.waitForTimeout(3000);
        
        // Google 로그인 페이지에서 admin@innerspell.com으로 로그인 시도
        if (page.url().includes('accounts.google.com') || page.url().includes('google')) {
          console.log('🌎 Google 인증 페이지로 이동됨');
          
          // 이메일 입력 (만약 이미 로그인되어있지 않다면)
          const emailInput = page.locator('input[type="email"], #identifierId');
          if (await emailInput.isVisible({ timeout: 5000 })) {
            await emailInput.fill('admin@innerspell.com');
            await page.click('#identifierNext');
            await page.waitForTimeout(3000);
          }
          
          await page.screenshot({ path: 'screenshots/auth-03-google-login.png', fullPage: true });
        } else {
          console.log('📧 로컬 이메일 로그인 폼 사용');
          // 로컬 이메일 로그인 시도
          const emailInput = page.locator('input[type="email"], input[name="email"]');
          const passwordInput = page.locator('input[type="password"], input[name="password"]');
          
          if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('admin@innerspell.com');
            if (await passwordInput.isVisible({ timeout: 1000 })) {
              await passwordInput.fill('admin123');
              
              const submitBtn = page.locator('button[type="submit"], button:has-text("로그인")').first();
              if (await submitBtn.isVisible({ timeout: 3000 })) {
                await submitBtn.click();
                await page.waitForTimeout(5000);
              }
            }
          }
        }
      }
    } else {
      console.log('❌ 로그인 모달 없음, 이미 로그인된 상태일 수 있음');
    }
    
    await page.screenshot({ path: 'screenshots/auth-04-after-login-attempt.png', fullPage: true });
    
    // 4. 타로 리딩 페이지로 다시 이동 (로그인 후)
    console.log('4. 로그인 후 타로 리딩 페이지 재접속...');
    await page.goto(`${baseUrl}/타로리딩`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/auth-05-reading-page-after-login.png', fullPage: true });
    
    // 5. 질문 입력
    console.log('5. 질문 입력 시도...');
    const questionInput = page.locator('textarea, input[placeholder*="질문"]');
    
    if (await questionInput.isVisible({ timeout: 10000 })) {
      console.log('✅ 질문 입력창 발견');
      await questionInput.fill('나의 미래는 어떻게 될까요?');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/auth-06-question-entered.png', fullPage: true });
    } else {
      console.log('❌ 질문 입력창 없음');
    }
    
    // 6. 카드 뽑기 버튼 클릭
    console.log('6. 카드 뽑기 버튼 찾기...');
    const drawButton = page.locator('button:has-text("카드 뽑기"), button:has-text("뽑기"), .draw-card, .card-draw');
    
    if (await drawButton.isVisible({ timeout: 10000 })) {
      console.log('✅ 카드 뽑기 버튼 발견');
      await drawButton.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'screenshots/auth-07-cards-drawn.png', fullPage: true });
    } else {
      console.log('❌ 카드 뽑기 버튼 없음');
    }
    
    // 7. 카드 선택 (카드가 나타났다면)
    console.log('7. 카드 선택 시도...');
    const cards = page.locator('.card:not(.card-back), .tarot-card, [data-card-id]');
    const cardCount = await cards.count();
    console.log(`발견된 카드 수: ${cardCount}`);
    
    if (cardCount > 0) {
      console.log('✅ 카드들 발견, 선택 시작');
      
      // 카드 클릭 (최대 3장)
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        await cards.nth(i).click();
        await page.waitForTimeout(1500);
        console.log(`카드 ${i + 1} 선택됨`);
      }
      
      await page.screenshot({ path: 'screenshots/auth-08-cards-selected.png', fullPage: true });
    }
    
    // 8. 해석 버튼 찾기
    console.log('8. 해석 버튼 찾기...');
    const interpretButton = page.locator('button:has-text("해석"), button:has-text("리딩"), button:has-text("분석"), .interpret');
    
    if (await interpretButton.isVisible({ timeout: 10000 })) {
      console.log('✅ 해석 버튼 발견');
      await interpretButton.click();
      console.log('⏳ AI 해석 생성 대기 중 (20초)...');
      await page.waitForTimeout(20000);
      await page.screenshot({ path: 'screenshots/auth-09-interpretation-done.png', fullPage: true });
    } else {
      console.log('❌ 해석 버튼 없음');
    }
    
    // 9. 저장 버튼 찾기 (가장 중요한 부분!)
    console.log('9. 저장 버튼 검색 중...');
    
    // 페이지의 모든 텍스트를 스캔하여 저장 관련 요소 찾기
    const pageText = await page.textContent('body');
    console.log('페이지에 "저장" 텍스트 포함 여부:', pageText.includes('저장'));
    
    // 여러 방법으로 저장 버튼 찾기
    const saveSelectors = [
      'button:has-text("저장")',
      'button:has-text("Save")',
      'button:has-text("보관")',
      'button:has-text("기록")',
      '[data-action="save"]',
      '.save-button',
      '.save-reading',
      '.save',
      'button[title*="저장"]',
      'button[aria-label*="저장"]'
    ];
    
    let saveButtonFound = false;
    let saveButtonText = '';
    
    for (const selector of saveSelectors) {
      const saveBtn = page.locator(selector).first();
      if (await saveBtn.isVisible({ timeout: 2000 })) {
        console.log(`🎯 저장 버튼 발견 (${selector})`);
        saveButtonText = await saveBtn.textContent();
        console.log(`저장 버튼 텍스트: "${saveButtonText}"`);
        
        try {
          await saveBtn.click();
          saveButtonFound = true;
          await page.waitForTimeout(3000);
          console.log('✅ 저장 버튼 클릭 완료');
          break;
        } catch (error) {
          console.log(`❌ 저장 버튼 클릭 실패: ${error.message}`);
        }
      }
    }
    
    // 모든 버튼을 스캔하여 저장과 관련된 버튼 찾기
    if (!saveButtonFound) {
      console.log('🔍 페이지의 모든 버튼 스캔 중...');
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`총 버튼 수: ${buttonCount}`);
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = allButtons.nth(i);
        const text = await btn.textContent();
        const title = await btn.getAttribute('title');
        const ariaLabel = await btn.getAttribute('aria-label');
        
        console.log(`버튼 ${i + 1}: text="${text}" title="${title}" aria-label="${ariaLabel}"`);
        
        if ((text && (text.includes('저장') || text.includes('Save'))) ||
            (title && (title.includes('저장') || title.includes('Save'))) ||
            (ariaLabel && (ariaLabel.includes('저장') || ariaLabel.includes('Save')))) {
          
          console.log(`🎯 저장 버튼 후보 발견: ${text || title || ariaLabel}`);
          saveButtonText = text || title || ariaLabel;
          
          try {
            await btn.click();
            saveButtonFound = true;
            await page.waitForTimeout(3000);
            console.log('✅ 저장 버튼 클릭 완료');
            break;
          } catch (error) {
            console.log(`❌ 저장 버튼 클릭 실패: ${error.message}`);
          }
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/auth-10-after-save-attempt.png', fullPage: true });
    
    // 10. 저장 성공 메시지 확인
    console.log('10. 저장 성공 메시지 확인...');
    const successSelectors = [
      '.success',
      '.toast',
      '.notification',
      '[role="alert"]',
      '.alert-success',
      '.save-success'
    ];
    
    let saveSuccessFound = false;
    for (const selector of successSelectors) {
      const successMsg = page.locator(selector);
      if (await successMsg.isVisible({ timeout: 3000 })) {
        const msgText = await successMsg.textContent();
        if (msgText && msgText.includes('저장') || msgText.includes('성공')) {
          console.log(`✅ 저장 성공 메시지 발견: ${msgText}`);
          saveSuccessFound = true;
          break;
        }
      }
    }
    
    if (!saveSuccessFound) {
      console.log('❌ 저장 성공 메시지 없음');
    }
    
    // 11. 프로필 페이지에서 저장된 리딩 확인
    console.log('11. 프로필 페이지에서 저장된 리딩 확인...');
    
    try {
      await page.goto(`${baseUrl}/profile`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'screenshots/auth-11-profile-page.png', fullPage: true });
      
      // 저장된 리딩 항목 찾기
      const readingItems = page.locator('.reading-item, .history-item, .saved-reading, [data-reading-id]');
      const savedCount = await readingItems.count();
      console.log(`프로필 페이지에서 발견된 저장된 리딩 수: ${savedCount}`);
      
      if (savedCount > 0) {
        console.log('✅ 저장된 리딩이 프로필에서 확인됨!');
        
        // 첫 번째 리딩 항목의 상세 정보
        const firstReading = readingItems.first();
        const readingText = await firstReading.textContent();
        console.log(`첫 번째 저장된 리딩: ${readingText}`);
      }
      
    } catch (error) {
      console.log(`❌ 프로필 페이지 접근 실패: ${error.message}`);
      
      // 다른 경로들 시도
      const alternativePaths = ['/history', '/my-readings', '/dashboard'];
      for (const path of alternativePaths) {
        try {
          await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(3000);
          
          const readingItems = page.locator('.reading-item, .history-item, .saved-reading');
          const count = await readingItems.count();
          if (count > 0) {
            console.log(`✅ ${path} 페이지에서 ${count}개의 저장된 리딩 발견`);
            break;
          }
        } catch (altError) {
          console.log(`❌ ${path} 경로 접근 실패`);
        }
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'screenshots/auth-12-final-state.png', fullPage: true });
    
    // 결과 리포트
    console.log('\n=== 🎯 최종 테스트 결과 리포트 ===');
    console.log(`✅ 홈페이지 접속: 성공`);
    console.log(`✅ 타로 리딩 페이지 접속: 성공`);
    console.log(`🔐 로그인 시도: 시도됨`);
    console.log(`💾 저장 버튼 발견: ${saveButtonFound ? '✅ 성공' : '❌ 실패'} ${saveButtonText || ''}`);
    console.log(`🎉 저장 성공 메시지: ${saveSuccessFound ? '✅ 발견' : '❌ 없음'}`);
    console.log(`📋 콘솔 로그 수: ${consoleLogs.length}`);
    console.log(`🚨 에러 수: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 발생한 에러들:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }
    
    // 중요한 콘솔 로그만 필터링
    const importantLogs = consoleLogs.filter(log => 
      log.includes('error') || 
      log.includes('failed') || 
      log.includes('success') || 
      log.includes('저장') ||
      log.includes('save')
    );
    
    if (importantLogs.length > 0) {
      console.log('\n📋 중요한 콘솔 로그:');
      importantLogs.forEach((log, i) => console.log(`${i + 1}. ${log}`));
    }
    
    console.log('\n🔍 저장 기능 분석 결론:');
    if (saveButtonFound) {
      console.log('✅ 저장 버튼이 존재하며 UI에서 접근 가능합니다.');
      if (saveSuccessFound) {
        console.log('✅ 저장 기능이 완전히 작동하는 것으로 보입니다.');
      } else {
        console.log('⚠️ 저장 버튼은 있지만 성공 메시지가 확인되지 않았습니다.');
      }
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없습니다. 저장 기능이 구현되지 않았거나 UI에 노출되지 않습니다.');
    }
    
  } catch (error) {
    console.error(`❌ 테스트 실행 중 오류: ${error.message}`);
    await page.screenshot({ path: 'screenshots/auth-error.png', fullPage: true });
  } finally {
    console.log('\n🏁 테스트 완료. 브라우저 종료 중...');
    await browser.close();
  }
}

// 스크립트 실행
testTarotSaveWithAuth().catch(console.error);