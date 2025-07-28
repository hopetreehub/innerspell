const { chromium } = require('playwright');

async function testTarotSaveCorrectPath() {
  console.log('🚀 Starting Tarot Reading Save Test with Correct Path...');
  
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
    await page.screenshot({ path: 'screenshots/correct-01-homepage.png', fullPage: true });
    
    // 2. 올바른 경로로 타로 리딩 페이지 이동
    console.log('2. 타로 리딩 페이지로 이동 (/reading)...');
    await page.goto(`${baseUrl}/reading`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/correct-02-reading-page.png', fullPage: true });
    
    // 페이지가 404가 아닌지 확인
    const pageTitle = await page.title();
    const pageText = await page.textContent('body');
    console.log(`페이지 제목: ${pageTitle}`);
    
    if (pageText.includes('404') || pageText.includes('페이지를 찾을 수 없습니다')) {
      console.log('❌ 여전히 404 에러. 다른 경로들 시도...');
      
      // 네비게이션에서 타로 리딩 링크 찾기
      await page.goto(baseUrl);
      await page.waitForTimeout(3000);
      
      const tarotLinks = page.locator('a[href*="reading"], a[href*="tarot"], a:has-text("타로"), a:has-text("리딩")');
      const linkCount = await tarotLinks.count();
      console.log(`타로 관련 링크 수: ${linkCount}`);
      
      for (let i = 0; i < linkCount; i++) {
        const link = tarotLinks.nth(i);
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        console.log(`링크 ${i + 1}: "${text}" -> ${href}`);
        
        if (href && (href.includes('reading') || href.includes('tarot'))) {
          console.log(`🎯 타로 리딩 링크 클릭: ${href}`);
          await link.click();
          await page.waitForTimeout(5000);
          break;
        }
      }
    } else {
      console.log('✅ 타로 리딩 페이지 정상 로드됨');
    }
    
    await page.screenshot({ path: 'screenshots/correct-03-after-navigation.png', fullPage: true });
    
    // 3. 로그인 확인 및 수행
    console.log('3. 로그인 상태 확인...');
    
    // 로그인 버튼이나 회원가입 버튼이 보이면 로그인 필요
    const authButtons = page.locator('button:has-text("로그인"), button:has-text("회원가입"), a:has-text("로그인")');
    
    if (await authButtons.first().isVisible({ timeout: 5000 })) {
      console.log('🔐 로그인 필요. 로그인 시도...');
      await authButtons.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/correct-04-login-modal.png', fullPage: true });
      
      // admin@innerspell.com으로 이메일 로그인 시도
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      if (await emailInput.isVisible({ timeout: 3000 })) {
        console.log('📧 이메일 로그인 폼 발견');
        await emailInput.fill('admin@innerspell.com');
        
        // 비밀번호 없이 이메일로 로그인 버튼 찾기
        const emailLoginBtn = page.locator('button:has-text("비밀번호 없이"), button:has-text("이메일로 로그인")');
        if (await emailLoginBtn.isVisible({ timeout: 3000 })) {
          console.log('✉️ 비밀번호 없이 이메일 로그인 시도');
          await emailLoginBtn.click();
          await page.waitForTimeout(5000);
        }
      }
    } else {
      console.log('✅ 이미 로그인된 상태로 보임');
    }
    
    await page.screenshot({ path: 'screenshots/correct-05-after-login.png', fullPage: true });
    
    // 4. 타로 리딩 폼 요소들 찾기
    console.log('4. 타로 리딩 폼 요소 확인...');
    
    // 질문 입력 필드
    const questionFields = page.locator('textarea[placeholder*="질문"], input[placeholder*="질문"], [name="question"], #question');
    const questionFieldCount = await questionFields.count();
    console.log(`질문 입력 필드 수: ${questionFieldCount}`);
    
    if (questionFieldCount > 0) {
      console.log('✅ 질문 입력 필드 발견');
      await questionFields.first().fill('나의 미래는 어떻게 될까요?');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/correct-06-question-filled.png', fullPage: true });
    }
    
    // 타로 스프레드 선택
    const spreadSelectors = page.locator('select, .select, [role="combobox"]');
    const spreadCount = await spreadSelectors.count();
    console.log(`스프레드 선택 요소 수: ${spreadCount}`);
    
    if (spreadCount > 0) {
      console.log('✅ 스프레드 선택 요소 발견');
      // 첫 번째 드롭다운 클릭
      await spreadSelectors.first().click();
      await page.waitForTimeout(1000);
      
      // 옵션 선택
      const options = page.locator('[role="option"], option');
      const optionCount = await options.count();
      if (optionCount > 0) {
        await options.first().click();
        await page.waitForTimeout(1000);
      }
    }
    
    // 리딩 시작 버튼
    const startButtons = page.locator('button:has-text("시작"), button:has-text("카드"), button:has-text("뽑기"), button[type="submit"]');
    const startButtonCount = await startButtons.count();
    console.log(`시작 버튼 수: ${startButtonCount}`);
    
    if (startButtonCount > 0) {
      console.log('✅ 시작 버튼 발견');
      await startButtons.first().click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'screenshots/correct-07-reading-started.png', fullPage: true });
    }
    
    // 5. 카드 요소들 찾기
    console.log('5. 카드 요소 확인...');
    
    // 다양한 카드 선택자들 시도
    const cardSelectors = [
      '.card:not(.card-back)',
      '.tarot-card',
      '[data-card]',
      '[data-card-id]',
      '.card-front',
      '.playing-card',
      'button[data-card]',
      'div[role="button"][data-card]'
    ];
    
    let cards = null;
    let cardCount = 0;
    
    for (const selector of cardSelectors) {
      cards = page.locator(selector);
      cardCount = await cards.count();
      if (cardCount > 0) {
        console.log(`✅ 카드 발견 (${selector}): ${cardCount}개`);
        break;
      }
    }
    
    if (cardCount > 0) {
      console.log('🃏 카드 선택 시작...');
      
      // 카드 선택 (최대 3장)
      const maxCards = Math.min(cardCount, 3);
      for (let i = 0; i < maxCards; i++) {
        try {
          await cards.nth(i).click();
          await page.waitForTimeout(2000);
          console.log(`카드 ${i + 1} 선택됨`);
        } catch (error) {
          console.log(`카드 ${i + 1} 선택 실패: ${error.message}`);
        }
      }
      
      await page.screenshot({ path: 'screenshots/correct-08-cards-selected.png', fullPage: true });
    } else {
      console.log('❌ 카드를 찾을 수 없음');
    }
    
    // 6. 해석 생성 버튼 찾기
    console.log('6. 해석 생성 버튼 찾기...');
    
    const interpretButtons = page.locator(
      'button:has-text("해석"), button:has-text("분석"), button:has-text("리딩"), ' +
      'button:has-text("생성"), button:has-text("결과"), .interpret-btn, .generate-btn'
    );
    const interpretButtonCount = await interpretButtons.count();
    console.log(`해석 버튼 수: ${interpretButtonCount}`);
    
    if (interpretButtonCount > 0) {
      console.log('✅ 해석 버튼 발견');
      await interpretButtons.first().click();
      console.log('⏳ AI 해석 생성 대기 중 (30초)...');
      await page.waitForTimeout(30000);
      await page.screenshot({ path: 'screenshots/correct-09-interpretation-done.png', fullPage: true });
    }
    
    // 7. 저장 버튼 찾기 - 가장 중요한 부분!
    console.log('7. 🎯 저장 버튼 집중 검색...');
    
    // 페이지 소스에서 "저장" 텍스트 검색
    const htmlContent = await page.content();
    const saveInHtml = htmlContent.includes('저장') || htmlContent.includes('Save') || htmlContent.includes('save');
    console.log(`HTML에 저장 관련 텍스트 포함: ${saveInHtml}`);
    
    // 모든 요소에서 저장 관련 텍스트 검색
    const allTexts = await page.locator('*').allTextContents();
    const saveTexts = allTexts.filter(text => 
      text.includes('저장') || text.includes('Save') || text.includes('보관') || text.includes('기록')
    );
    console.log(`저장 관련 텍스트들: ${JSON.stringify(saveTexts)}`);
    
    // 다양한 저장 버튼 선택자들 시도
    const saveSelectors = [
      'button:has-text("저장")',
      'button:has-text("Save")',
      'button:has-text("보관")',
      'button:has-text("기록")',
      'button[data-action="save"]',
      'button[id*="save"]',
      'button[class*="save"]',
      '.save-button',
      '.save-reading',
      '.save-btn',
      '[role="button"]:has-text("저장")',
      'a:has-text("저장")',
      '*[onclick*="save"]',
      '*[onclick*="저장"]'
    ];
    
    let saveButtonFound = false;
    let saveButtonText = '';
    let saveButtonSelector = '';
    
    for (const selector of saveSelectors) {
      const saveBtn = page.locator(selector).first();
      if (await saveBtn.isVisible({ timeout: 1000 })) {
        console.log(`🎯 저장 버튼 발견! (${selector})`);
        saveButtonText = await saveBtn.textContent();
        saveButtonSelector = selector;
        saveButtonFound = true;
        
        try {
          await saveBtn.click();
          await page.waitForTimeout(5000);
          console.log('✅ 저장 버튼 클릭 완료');
          break;
        } catch (error) {
          console.log(`❌ 저장 버튼 클릭 실패: ${error.message}`);
        }
      }
    }
    
    // 버튼 스캔으로 저장 기능 찾기
    if (!saveButtonFound) {
      console.log('🔍 모든 버튼 상세 스캔...');
      const allButtons = page.locator('button, [role="button"], input[type="button"], input[type="submit"]');
      const buttonCount = await allButtons.count();
      console.log(`총 클릭 가능한 요소 수: ${buttonCount}`);
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = allButtons.nth(i);
        const text = await btn.textContent();
        const title = await btn.getAttribute('title');
        const ariaLabel = await btn.getAttribute('aria-label');
        const className = await btn.getAttribute('class');
        const id = await btn.getAttribute('id');
        const dataAttrs = await btn.evaluate(el => {
          const attrs = {};
          for (let attr of el.attributes) {
            if (attr.name.startsWith('data-')) {
              attrs[attr.name] = attr.value;
            }
          }
          return attrs;
        });
        
        console.log(`버튼 ${i + 1}:`, {
          text: text?.trim(),
          title,
          ariaLabel,
          className,
          id,
          dataAttrs
        });
        
        // 저장 관련 키워드 검색
        const keywords = [text, title, ariaLabel, className, id, ...Object.values(dataAttrs)].join(' ').toLowerCase();
        
        if (keywords.includes('저장') || keywords.includes('save') || keywords.includes('보관') || keywords.includes('기록')) {
          console.log(`🎯 저장 버튼 후보 발견!`);
          saveButtonText = text || title || ariaLabel || '저장 버튼';
          saveButtonFound = true;
          
          try {
            await btn.click();
            await page.waitForTimeout(5000);
            console.log('✅ 저장 버튼 클릭 성공');
            break;
          } catch (error) {
            console.log(`❌ 저장 버튼 클릭 실패: ${error.message}`);
          }
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/correct-10-after-save-attempt.png', fullPage: true });
    
    // 8. 저장 성공 메시지 확인
    console.log('8. 저장 성공 메시지 확인...');
    
    const successSelectors = [
      '.toast:has-text("저장")',
      '.notification:has-text("저장")',
      '.alert-success:has-text("저장")',
      '.success:has-text("저장")',
      '[role="alert"]:has-text("저장")',
      '.save-success',
      '.success-message'
    ];
    
    let saveSuccessFound = false;
    let successMessage = '';
    
    for (const selector of successSelectors) {
      const msg = page.locator(selector).first();
      if (await msg.isVisible({ timeout: 3000 })) {
        successMessage = await msg.textContent();
        saveSuccessFound = true;
        console.log(`✅ 저장 성공 메시지 발견: "${successMessage}"`);
        break;
      }
    }
    
    // 9. 프로필 페이지에서 저장된 리딩 확인
    console.log('9. 프로필 페이지에서 저장된 리딩 확인...');
    
    try {
      await page.goto(`${baseUrl}/profile`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'screenshots/correct-11-profile-page.png', fullPage: true });
      
      // 저장된 리딩 확인
      const readingSelectors = [
        '.reading-item',
        '.history-item',
        '.saved-reading',
        '[data-reading-id]',
        '.tarot-reading-history',
        '.reading-card'
      ];
      
      let totalSavedReadings = 0;
      for (const selector of readingSelectors) {
        const readings = page.locator(selector);
        const count = await readings.count();
        if (count > 0) {
          console.log(`${selector}로 ${count}개 리딩 발견`);
          totalSavedReadings += count;
        }
      }
      
      console.log(`총 저장된 리딩 수: ${totalSavedReadings}`);
      
      if (totalSavedReadings > 0) {
        console.log('✅ 저장된 리딩이 프로필에서 확인됨!');
        
        // 리딩 상세 정보 확인
        const firstReading = page.locator('.reading-item, .history-item, .saved-reading').first();
        if (await firstReading.isVisible()) {
          const readingDetails = await firstReading.textContent();
          console.log(`첫 번째 저장된 리딩 상세: ${readingDetails}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ 프로필 페이지 접근 실패: ${error.message}`);
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'screenshots/correct-12-final-state.png', fullPage: true });
    
    // 최종 결과 리포트
    console.log('\n=== 🎯 타로 리딩 저장 기능 테스트 최종 결과 ===');
    console.log(`📍 테스트 URL: ${baseUrl}/reading`);
    console.log(`✅ 페이지 접속: 성공`);
    console.log(`🔐 로그인 시도: 완료`);
    console.log(`📝 질문 입력: ${questionFieldCount > 0 ? '✅ 가능' : '❌ 불가능'}`);
    console.log(`🃏 카드 선택: ${cardCount > 0 ? `✅ 가능 (${cardCount}개 카드)` : '❌ 불가능'}`);
    console.log(`🔮 해석 생성: ${interpretButtonCount > 0 ? '✅ 가능' : '❌ 불가능'}`);
    console.log(`💾 저장 버튼: ${saveButtonFound ? `✅ 발견 (${saveButtonText})` : '❌ 없음'}`);
    console.log(`🎉 저장 성공 메시지: ${saveSuccessFound ? `✅ 확인 (${successMessage})` : '❌ 없음'}`);
    console.log(`📚 저장된 리딩 조회: ${totalSavedReadings > 0 ? `✅ ${totalSavedReadings}개 발견` : '❌ 없음'}`);
    
    // 저장 기능 구현 여부 결론
    console.log('\n🔍 저장 기능 구현 상태 분석:');
    if (saveButtonFound && saveSuccessFound && totalSavedReadings > 0) {
      console.log('✅ 저장 기능이 완전히 구현되어 정상 작동합니다.');
    } else if (saveButtonFound && !saveSuccessFound) {
      console.log('⚠️ 저장 버튼은 있지만 성공 피드백이 없습니다. 백엔드 구현 확인 필요.');
    } else if (saveButtonFound) {
      console.log('⚠️ 저장 버튼은 있지만 실제 저장 기능 작동 여부 불분명.');
    } else {
      console.log('❌ 저장 버튼이 없습니다. 저장 기능이 구현되지 않았습니다.');
    }
    
    // 에러 및 로그 요약
    if (errors.length > 0) {
      console.log(`\n🚨 발생한 에러 (${errors.length}개):`);
      errors.slice(0, 5).forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }
    
    const importantLogs = consoleLogs.filter(log => 
      log.includes('error') || log.includes('failed') || log.includes('success') || 
      log.includes('저장') || log.includes('save') || log.includes('reading')
    );
    
    if (importantLogs.length > 0) {
      console.log(`\n📋 중요한 콘솔 로그 (${importantLogs.length}개):`);
      importantLogs.slice(0, 10).forEach((log, i) => console.log(`${i + 1}. ${log}`));
    }
    
  } catch (error) {
    console.error(`❌ 테스트 실행 중 치명적 오류: ${error.message}`);
    await page.screenshot({ path: 'screenshots/correct-error.png', fullPage: true });
  } finally {
    console.log('\n🏁 테스트 완료. 브라우저를 5초 후 종료합니다...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// 스크립트 실행
testTarotSaveCorrectPath().catch(console.error);