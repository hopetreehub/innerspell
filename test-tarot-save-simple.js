const { chromium } = require('playwright');

async function testTarotSave() {
  console.log('🚀 Starting Tarot Reading Save Test...');
  
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
    await page.screenshot({ path: 'screenshots/tarot-save-01-homepage.png', fullPage: true });
    
    // 2. 타로 리딩 버튼 찾기
    console.log('2. 타로 리딩 버튼 찾는 중...');
    const tarotButton = page.locator('button:has-text("타로 읽기"), a:has-text("타로 읽기")').first();
    
    if (await tarotButton.isVisible({ timeout: 10000 })) {
      console.log('✅ 타로 읽기 버튼 발견');
      await tarotButton.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ 타로 읽기 버튼 없음, 직접 URL 이동');
      await page.goto(`${baseUrl}/타로리딩`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: 'screenshots/tarot-save-02-reading-page.png', fullPage: true });
    
    // 3. 로그인 확인 - 로그인 버튼이 있으면 클릭
    console.log('3. 로그인 상태 확인 중...');
    const loginBtn = page.locator('button:has-text("로그인"), a:has-text("로그인")').first();
    
    if (await loginBtn.isVisible({ timeout: 5000 })) {
      console.log('🔐 로그인 필요, 로그인 버튼 클릭');
      await loginBtn.click();
      await page.waitForTimeout(2000);
      
      // Google 로그인 버튼 찾기
      const googleBtn = page.locator('button:has-text("Google"), .google-login').first();
      if (await googleBtn.isVisible({ timeout: 5000 })) {
        console.log('📧 Google 로그인 버튼 발견');
        await googleBtn.click();
        await page.waitForTimeout(3000);
      }
    }
    
    await page.screenshot({ path: 'screenshots/tarot-save-03-after-login.png', fullPage: true });
    
    // 4. 질문 입력
    console.log('4. 질문 입력 중...');
    const questionInput = page.locator('input[placeholder*="질문"], textarea[placeholder*="질문"]').first();
    
    if (await questionInput.isVisible({ timeout: 10000 })) {
      console.log('✅ 질문 입력창 발견');
      await questionInput.fill('나의 미래는 어떻게 될까요?');
      await page.waitForTimeout(1000);
      
      // 시작 버튼 클릭
      const startBtn = page.locator('button:has-text("시작"), button[type="submit"]').first();
      if (await startBtn.isVisible({ timeout: 5000 })) {
        await startBtn.click();
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('❌ 질문 입력창 없음');
    }
    
    await page.screenshot({ path: 'screenshots/tarot-save-04-question-entered.png', fullPage: true });
    
    // 5. 카드 선택 (사용 가능한 카드가 있으면)
    console.log('5. 카드 선택 중...');
    const cards = page.locator('.card, .tarot-card, [data-card]');
    const cardCount = await cards.count();
    console.log(`발견된 카드 수: ${cardCount}`);
    
    if (cardCount > 0) {
      // 첫 번째 카드 클릭
      await cards.first().click();
      await page.waitForTimeout(2000);
      
      // 두 번째 카드 클릭 (있다면)
      if (cardCount > 1) {
        await cards.nth(1).click();
        await page.waitForTimeout(1000);
      }
      
      // 세 번째 카드 클릭 (있다면)
      if (cardCount > 2) {
        await cards.nth(2).click();
        await page.waitForTimeout(1000);
      }
    }
    
    await page.screenshot({ path: 'screenshots/tarot-save-05-cards-selected.png', fullPage: true });
    
    // 6. 해석 생성 버튼 찾기
    console.log('6. 해석 생성 버튼 찾는 중...');
    const interpretBtn = page.locator('button:has-text("해석"), button:has-text("분석"), button:has-text("리딩")').first();
    
    if (await interpretBtn.isVisible({ timeout: 10000 })) {
      console.log('✅ 해석 버튼 발견');
      await interpretBtn.click();
      console.log('⏳ AI 해석 생성 대기 중 (15초)...');
      await page.waitForTimeout(15000); // AI 해석 대기
    } else {
      console.log('❌ 해석 버튼 없음');
    }
    
    await page.screenshot({ path: 'screenshots/tarot-save-06-interpretation-generated.png', fullPage: true });
    
    // 7. 저장 버튼 찾기
    console.log('7. 저장 버튼 찾는 중...');
    
    // 모든 버튼 스캔
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`페이지의 총 버튼 수: ${buttonCount}`);
    
    let saveButtonFound = false;
    let saveButtonText = '';
    
    for (let i = 0; i < Math.min(buttonCount, 30); i++) {
      const btn = allButtons.nth(i);
      const text = await btn.textContent();
      console.log(`버튼 ${i + 1}: "${text}"`);
      
      if (text && (text.includes('저장') || text.includes('Save') || text.includes('보관') || text.includes('기록'))) {
        console.log(`🎯 저장 버튼 발견: "${text}"`);
        saveButtonFound = true;
        saveButtonText = text;
        
        try {
          await btn.click();
          await page.waitForTimeout(3000);
          console.log('✅ 저장 버튼 클릭 완료');
          break;
        } catch (error) {
          console.log(`❌ 저장 버튼 클릭 실패: ${error.message}`);
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/tarot-save-07-after-save-attempt.png', fullPage: true });
    
    // 8. 성공 메시지 확인
    console.log('8. 저장 성공 메시지 확인 중...');
    const successMsg = page.locator('.success, .toast, [role="alert"]:has-text("저장"), .notification:has-text("저장")');
    
    if (await successMsg.isVisible({ timeout: 5000 })) {
      console.log('✅ 저장 성공 메시지 발견');
      await page.screenshot({ path: 'screenshots/tarot-save-08-save-success.png', fullPage: true });
    } else {
      console.log('❌ 저장 성공 메시지 없음');
    }
    
    // 9. 프로필/히스토리 페이지 확인
    console.log('9. 프로필 페이지에서 저장된 리딩 확인 중...');
    
    try {
      // 프로필 버튼 찾기
      const profileBtn = page.locator('button:has-text("프로필"), a:has-text("프로필"), [href*="profile"]').first();
      if (await profileBtn.isVisible({ timeout: 5000 })) {
        await profileBtn.click();
        await page.waitForTimeout(3000);
      } else {
        // 직접 URL 이동
        await page.goto(`${baseUrl}/profile`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
      }
      
      await page.screenshot({ path: 'screenshots/tarot-save-09-profile-page.png', fullPage: true });
      
      // 저장된 리딩 확인
      const savedReadings = page.locator('.reading-item, .history-item, .saved-reading, [data-reading]');
      const savedCount = await savedReadings.count();
      console.log(`저장된 리딩 수: ${savedCount}`);
      
      if (savedCount > 0) {
        console.log('✅ 저장된 리딩 발견!');
        await page.screenshot({ path: 'screenshots/tarot-save-10-saved-readings-found.png', fullPage: true });
      }
      
    } catch (error) {
      console.log(`❌ 프로필 페이지 접근 실패: ${error.message}`);
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'screenshots/tarot-save-11-final-state.png', fullPage: true });
    
    // 결과 리포트
    console.log('\n=== 🎯 테스트 결과 리포트 ===');
    console.log(`저장 버튼 발견: ${saveButtonFound ? '✅' : '❌'} ${saveButtonText || '없음'}`);
    console.log(`콘솔 로그 수: ${consoleLogs.length}`);
    console.log(`에러 수: ${errors.length}`);
    
    if (consoleLogs.length > 0) {
      console.log('\n📋 콘솔 로그:');
      consoleLogs.slice(0, 10).forEach((log, i) => console.log(`${i + 1}. ${log}`));
      if (consoleLogs.length > 10) {
        console.log(`... 그 외 ${consoleLogs.length - 10}개 로그`);
      }
    }
    
    if (errors.length > 0) {
      console.log('\n🚨 에러:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }
    
    // 결과 저장
    const testResults = {
      timestamp: new Date().toISOString(),
      saveButtonFound,
      saveButtonText,
      consoleLogs: consoleLogs.slice(0, 20), // 처음 20개만 저장
      errors,
      screenshots: [
        'tarot-save-01-homepage.png',
        'tarot-save-02-reading-page.png',
        'tarot-save-03-after-login.png',
        'tarot-save-04-question-entered.png',
        'tarot-save-05-cards-selected.png',
        'tarot-save-06-interpretation-generated.png',
        'tarot-save-07-after-save-attempt.png',
        'tarot-save-08-save-success.png',
        'tarot-save-09-profile-page.png',
        'tarot-save-10-saved-readings-found.png',
        'tarot-save-11-final-state.png'
      ]
    };
    
    console.log('\n📊 테스트 결과 JSON:');
    console.log(JSON.stringify(testResults, null, 2));
    
  } catch (error) {
    console.error(`❌ 테스트 실행 중 오류: ${error.message}`);
    await page.screenshot({ path: 'screenshots/tarot-save-error.png', fullPage: true });
  } finally {
    console.log('\n🏁 테스트 완료. 브라우저 종료 중...');
    await browser.close();
  }
}

// 스트립트 실행
testTarotSave().catch(console.error);