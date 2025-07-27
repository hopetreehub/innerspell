const { chromium } = require('playwright');

async function debugTarotSaveError() {
  console.log('🔍 타로 지침 저장 에러 직접 디버깅 시작');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  try {
    const page = await browser.newPage();
    
    // 콘솔 메시지 수집
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
      console.log(`[${msg.type()}] ${msg.text()}`);
    });

    // 네트워크 요청 모니터링
    const networkRequests = [];
    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method(),
        timestamp: new Date().toISOString()
      });
      
      if (!response.ok()) {
        console.log(`❌ Failed request: ${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });

    // 에러 이벤트 수집
    const errors = [];
    page.on('pageerror', error => {
      errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.log(`💥 Page error: ${error.message}`);
    });

    console.log('1️⃣ Vercel 배포 페이지 접속');
    await page.goto('https://test-studio-firebase.vercel.app/admin');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: './debug-step-1-admin-page.png',
      fullPage: true 
    });

    console.log('2️⃣ Mock 인증 설정');
    // 개발자 도구에서 mock 인증 설정
    await page.evaluate(() => {
      // Firebase Auth Mock
      const mockUser = {
        uid: 'debug-admin-uid',
        email: 'debug@admin.com',
        displayName: 'Debug Admin',
        photoURL: null,
        emailVerified: true
      };

      // AuthContext Mock
      localStorage.setItem('firebase-auth-user', JSON.stringify(mockUser));
      localStorage.setItem('user-role', 'admin');
      
      // Window 객체에 Mock 설정
      window.mockAuth = {
        currentUser: mockUser,
        isAdmin: true,
        loading: false
      };

      console.log('🔧 Mock auth 설정 완료:', mockUser);
    });

    // 페이지 새로고침
    await page.reload();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: './debug-step-2-after-mock-auth.png',
      fullPage: true 
    });

    console.log('3️⃣ 타로 지침 탭 클릭');
    // 타로 지침 탭 찾기 (여러 방법 시도)
    const tarotTabSelectors = [
      'text=타로 지침',
      '[role="tab"]:has-text("타로 지침")',
      'button:has-text("타로 지침")',
      '.tab:has-text("타로 지침")'
    ];

    let tarotTabClicked = false;
    for (const selector of tarotTabSelectors) {
      try {
        const tarotTab = page.locator(selector).first();
        if (await tarotTab.isVisible({ timeout: 2000 })) {
          console.log(`✅ 타로 지침 탭 발견: ${selector}`);
          await tarotTab.click();
          tarotTabClicked = true;
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }

    if (!tarotTabClicked) {
      console.log('⚠️ 타로 지침 탭을 찾을 수 없음');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: './debug-step-3-tarot-tab.png',
      fullPage: true 
    });

    console.log('4️⃣ 새 지침 생성 버튼 클릭');
    const newGuidelineSelectors = [
      'text=새 지침 생성',
      'button:has-text("새 지침")',
      'button:has-text("생성")',
      '[data-testid="new-guideline-button"]'
    ];

    let newButtonClicked = false;
    for (const selector of newGuidelineSelectors) {
      try {
        const newButton = page.locator(selector).first();
        if (await newButton.isVisible({ timeout: 2000 })) {
          console.log(`✅ 새 지침 생성 버튼 발견: ${selector}`);
          await newButton.click();
          newButtonClicked = true;
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }

    if (!newButtonClicked) {
      console.log('⚠️ 새 지침 생성 버튼을 찾을 수 없음');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: './debug-step-4-new-guideline-form.png',
      fullPage: true 
    });

    console.log('5️⃣ 폼 필드 입력');
    // 스프레드 선택
    try {
      const spreadSelect = page.locator('select').first();
      if (await spreadSelect.isVisible()) {
        await spreadSelect.selectOption({ index: 1 });
        console.log('✅ 스프레드 선택 완료');
      }
    } catch (e) {
      console.log('❌ 스프레드 선택 실패:', e.message);
    }

    // 스타일 선택
    try {
      const styleSelect = page.locator('select').nth(1);
      if (await styleSelect.isVisible()) {
        await styleSelect.selectOption({ index: 1 });
        console.log('✅ 스타일 선택 완료');
      }
    } catch (e) {
      console.log('❌ 스타일 선택 실패:', e.message);
    }

    // 제목 입력
    try {
      const titleInput = page.locator('input[name="title"], input:first-of-type').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('디버그 테스트 타로 지침');
        console.log('✅ 제목 입력 완료');
      }
    } catch (e) {
      console.log('❌ 제목 입력 실패:', e.message);
    }

    // 설명 입력
    try {
      const descTextarea = page.locator('textarea').first();
      if (await descTextarea.isVisible()) {
        await descTextarea.fill('디버그 테스트용 타로 지침 설명입니다.');
        console.log('✅ 설명 입력 완료');
      }
    } catch (e) {
      console.log('❌ 설명 입력 실패:', e.message);
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: './debug-step-5-form-filled.png',
      fullPage: true 
    });

    console.log('6️⃣ 저장 버튼 클릭');
    const saveSelectors = [
      'button:has-text("저장")',
      'button[type="submit"]',
      'button:has-text("Save")',
      '.save-button'
    ];

    let saveButtonClicked = false;
    for (const selector of saveSelectors) {
      try {
        const saveButton = page.locator(selector).first();
        if (await saveButton.isVisible({ timeout: 2000 })) {
          console.log(`✅ 저장 버튼 발견: ${selector}`);
          
          // 네트워크 응답 대기
          const responsePromise = page.waitForResponse(response => 
            response.url().includes('/api/') || 
            response.url().includes('firebase') ||
            response.request().method() === 'POST'
          ).catch(() => null);

          await saveButton.click();
          console.log('🔄 저장 버튼 클릭 완료, 응답 대기 중...');
          
          // 응답 확인
          const response = await Promise.race([
            responsePromise,
            page.waitForTimeout(10000)
          ]);
          
          if (response) {
            console.log(`📡 API 응답 수신: ${response.status()} ${response.url()}`);
            try {
              const responseText = await response.text();
              console.log(`📄 응답 내용: ${responseText.substring(0, 500)}...`);
            } catch (textError) {
              console.log('❌ 응답 텍스트 읽기 실패:', textError.message);
            }
          } else {
            console.log('⚠️ API 응답 없음 (타임아웃)');
          }
          
          saveButtonClicked = true;
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector} - ${e.message}`);
      }
    }

    if (!saveButtonClicked) {
      console.log('⚠️ 저장 버튼을 찾을 수 없음');
    }

    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: './debug-step-6-after-save.png',
      fullPage: true 
    });

    console.log('7️⃣ 에러 메시지 확인');
    // 에러 메시지 찾기
    const errorSelectors = [
      '.error',
      '.alert-error',
      '.text-red-500',
      '.text-danger',
      '[role="alert"]',
      '.toast-error'
    ];

    const foundErrors = [];
    for (const selector of errorSelectors) {
      try {
        const errorElements = page.locator(selector);
        const count = await errorElements.count();
        
        for (let i = 0; i < count; i++) {
          const errorText = await errorElements.nth(i).textContent();
          if (errorText && errorText.trim()) {
            foundErrors.push({
              selector,
              text: errorText.trim()
            });
          }
        }
      } catch (e) {
        // 선택자가 없는 경우 무시
      }
    }

    console.log('\n🎯 === 디버깅 결과 요약 ===');
    console.log(`📊 콘솔 메시지: ${consoleMessages.length}개`);
    console.log(`🌐 네트워크 요청: ${networkRequests.length}개`);
    console.log(`💥 페이지 에러: ${errors.length}개`);
    console.log(`🚨 화면 에러 메시지: ${foundErrors.length}개`);

    if (consoleMessages.length > 0) {
      console.log('\n📝 최근 콘솔 메시지 (최대 10개):');
      consoleMessages.slice(-10).forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    }

    if (networkRequests.filter(req => !req.url.includes('static')).length > 0) {
      console.log('\n🌐 주요 네트워크 요청:');
      networkRequests
        .filter(req => !req.url.includes('static') && !req.url.includes('_next'))
        .slice(-10)
        .forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.status} ${req.method} ${req.url}`);
        });
    }

    if (errors.length > 0) {
      console.log('\n💥 페이지 에러:');
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.message}`);
      });
    }

    if (foundErrors.length > 0) {
      console.log('\n🚨 화면 에러 메시지:');
      foundErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. [${error.selector}] ${error.text}`);
      });
    }

    // 최종 상태 확인
    const finalState = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasAuth: !!window.mockAuth,
        localStorageKeys: Object.keys(localStorage),
        hasFirebase: typeof window.firebase !== 'undefined',
        documentReady: document.readyState
      };
    });

    console.log('\n🔍 최종 상태:', finalState);

    await page.screenshot({ 
      path: './debug-final-state.png',
      fullPage: true 
    });

    console.log('\n✅ 디버깅 완료! 스크린샷과 로그를 확인하세요.');
    console.log('📸 저장된 스크린샷:');
    console.log('  - debug-step-1-admin-page.png');
    console.log('  - debug-step-2-after-mock-auth.png');
    console.log('  - debug-step-3-tarot-tab.png');
    console.log('  - debug-step-4-new-guideline-form.png');
    console.log('  - debug-step-5-form-filled.png');
    console.log('  - debug-step-6-after-save.png');
    console.log('  - debug-final-state.png');

  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error);
    
    try {
      await page.screenshot({ 
        path: './debug-error-state.png',
        fullPage: true 
      });
      console.log('📸 에러 상태 스크린샷 저장: debug-error-state.png');
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError);
    }
  } finally {
    await browser.close();
  }
}

debugTarotSaveError().catch(console.error);