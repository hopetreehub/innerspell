const { chromium } = require('playwright');

async function finalTestAuth() {
  console.log('🔥 최종 Google 인증 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 모든 네트워크 요청 모니터링
  const networkLogs = [];
  page.on('request', request => {
    if (request.url().includes('firebase') || request.url().includes('google')) {
      const logEntry = `🌐 REQUEST: ${request.method()} ${request.url()}`;
      networkLogs.push(logEntry);
      console.log(logEntry);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('firebase') || response.url().includes('google')) {
      const logEntry = `📡 RESPONSE: ${response.status()} ${response.url()}`;
      networkLogs.push(logEntry);
      console.log(logEntry);
    }
  });
  
  // 콘솔 로그 수집
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    logs.push(text);
    console.log(text);
  });
  
  page.on('pageerror', error => {
    const errorText = `[PAGE ERROR] ${error.message}`;
    errors.push(errorText);
    console.log(errorText);
  });
  
  try {
    console.log('📱 메인 production URL로 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 페이지 로드 후 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/final_test_1_loaded.png',
      fullPage: true 
    });
    console.log('✅ 메인 사이트 로드됨');
    
    // 잠시 대기
    await page.waitForTimeout(3000);
    
    console.log('🔍 최종 Firebase 설정 확인 중...');
    
    // Firebase 설정 및 환경 정보 확인
    const detailedInfo = await page.evaluate(() => {
      return {
        location: window.location.href,
        hasFirebase: typeof window.firebase !== 'undefined',
        hasGapi: typeof window.gapi !== 'undefined',
        userAgent: window.navigator.userAgent,
        // 페이지 내용 확인
        pageTitle: document.title,
        hasGoogleButton: !!document.querySelector('button:has-text("Google")') || 
                        !!document.querySelector('button[contains(text(), "Google")]') ||
                        !!Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Google')),
        buttonCount: document.querySelectorAll('button').length,
        // 모든 버튼의 텍스트 수집
        allButtons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent.trim()).filter(text => text.length > 0)
      };
    });
    
    console.log('🔍 상세 페이지 정보:', JSON.stringify(detailedInfo, null, 2));
    
    console.log('🖱️ Google 로그인 버튼 찾기 및 클릭...');
    
    // 여러 방법으로 Google 버튼 찾기
    let googleButton = null;
    const selectors = [
      'button:has-text("Google")',
      'button:has-text("구글")',
      'button[class*="google"]',
      'button[id*="google"]',
      '[data-testid="google-signin"]',
      'text=Google로 로그인',
      'text=Continue with Google'
    ];
    
    for (const selector of selectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          googleButton = button;
          console.log(`✅ Google 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }
    
    // 만약 위 방법으로 찾을 수 없다면, 모든 버튼을 확인
    if (!googleButton) {
      console.log('🔍 모든 버튼을 수동으로 확인 중...');
      const allButtons = await page.locator('button').all();
      
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent().catch(() => '');
        console.log(`버튼 ${i + 1}: "${buttonText}"`);
        
        if (buttonText.toLowerCase().includes('google') || buttonText.includes('구글')) {
          googleButton = allButtons[i];
          console.log(`✅ Google 버튼 텍스트로 발견: "${buttonText}"`);
          break;
        }
      }
    }
    
    if (googleButton) {
      // 버튼 하이라이트 및 스크린샷
      await googleButton.highlight();
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/final_test_2_button_found.png',
        fullPage: true 
      });
      
      console.log('🖱️ Google 버튼 클릭 중...');
      
      // 팝업 대기 설정
      const popupPromise = context.waitForEvent('page', { timeout: 15000 }).catch(() => null);
      
      // 클릭
      await googleButton.click();
      
      // 클릭 후 잠시 대기
      await page.waitForTimeout(5000);
      
      // 클릭 후 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/final_test_3_after_click.png',
        fullPage: true 
      });
      
      // 팝업 확인
      const popup = await popupPromise;
      
      if (popup) {
        console.log('🎉 Google OAuth 팝업이 성공적으로 열렸습니다!');
        console.log('팝업 URL:', popup.url());
        
        // 팝업 스크린샷
        await popup.screenshot({ 
          path: '/mnt/e/project/test-studio-firebase/screenshots/final_test_4_popup_success.png',
          fullPage: true 
        });
        
        console.log('✅ GOOGLE LOGIN SUCCESS - 문제가 해결되었습니다!');
        
        // 팝업 닫기
        await popup.close();
      } else {
        console.log('❌ Google OAuth 팝업이 열리지 않았습니다');
        
        // 오류 메시지 확인
        try {
          const errorElements = await page.locator('[class*="error"], .error, [role="alert"], [class*="alert"]').all();
          for (const element of errorElements) {
            const errorText = await element.textContent();
            if (errorText && errorText.trim()) {
              console.log('🚨 페이지 오류 메시지:', errorText);
            }
          }
        } catch (e) {
          console.log('오류 메시지 확인 중 예외 발생');
        }
      }
      
    } else {
      console.log('❌ Google 로그인 버튼을 찾을 수 없습니다');
      
      // 페이지 전체 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/final_test_no_button.png',
        fullPage: true 
      });
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/final_test_5_final_state.png',
      fullPage: true 
    });
    
    // Firebase 설정 로그 확인
    const firebaseConfigLogs = logs.filter(log => 
      log.includes('Firebase config') || 
      log.includes('authDomain') ||
      log.includes('innerspell')
    );
    
    if (firebaseConfigLogs.length > 0) {
      console.log('\n🔥 Firebase 설정 관련 로그:');
      firebaseConfigLogs.forEach(log => console.log(log));
    }
    
    // URL 인코딩 오류 확인
    const urlEncodingErrors = logs.filter(log => 
      log.includes('Illegal url') || 
      log.includes('%0A') ||
      log.includes('iframe')
    );
    
    if (urlEncodingErrors.length > 0) {
      console.log('\n❌ 여전히 존재하는 URL 인코딩 오류:');
      urlEncodingErrors.forEach(error => console.log(error));
    } else {
      console.log('\n✅ URL 인코딩 오류가 완전히 해결되었습니다!');
    }
    
    // 네트워크 요청 요약
    console.log('\n🌐 Firebase/Google 관련 네트워크 요청:');
    networkLogs.forEach(log => console.log(log));
    
    // 결과 요약
    console.log('\n📊 테스트 결과 요약:');
    console.log(`- 페이지 로드: ✅`);
    console.log(`- Google 버튼 발견: ${googleButton ? '✅' : '❌'}`);
    console.log(`- URL 인코딩 오류: ${urlEncodingErrors.length === 0 ? '✅ 해결됨' : '❌ 여전히 존재'}`);
    console.log(`- Firebase 초기화: ${logs.some(log => log.includes('Firebase config')) ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ 최종 테스트 중 오류 발생:', error.message);
    
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/final_test_error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 최종 테스트 완료');
  }
}

finalTestAuth().catch(console.error);