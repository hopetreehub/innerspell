const { chromium } = require('playwright');
const fs = require('fs');

async function debugGoogleLogin() {
  console.log('🔍 Google 로그인 오류 진단 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
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
    console.log('📱 1. Vercel 배포된 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 페이지 로드 후 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/01_signin_page.png',
      fullPage: true 
    });
    console.log('✅ 로그인 페이지 스크린샷 저장됨');
    
    // 2초 대기
    await page.waitForTimeout(2000);
    
    console.log('🔍 2. Firebase 설정 및 환경 변수 확인 중...');
    
    // Firebase 설정 확인
    const firebaseConfig = await page.evaluate(() => {
      return {
        hasFirebase: typeof window.firebase !== 'undefined',
        hasAuth: typeof window.firebase?.auth !== 'undefined',
        config: window.__NEXT_CONFIG__ || 'Not found',
        hasNextPublicEnv: typeof window.__NEXT_DATA__ !== 'undefined',
        location: window.location.href,
        userAgent: window.navigator.userAgent
      };
    });
    
    console.log('Firebase 설정:', JSON.stringify(firebaseConfig, null, 2));
    
    console.log('🖱️ 3. Google 로그인 버튼 찾는 중...');
    
    // Google 로그인 버튼 찾기 (여러 선택자 시도)
    const googleButtonSelectors = [
      'button:has-text("Google")',
      'button:has-text("구글")',
      '[data-testid="google-signin"]',
      '.google-signin-button',
      'button[class*="google"]',
      'text=Google로 로그인',
      'text=Continue with Google'
    ];
    
    let googleButton = null;
    let buttonSelector = null;
    
    for (const selector of googleButtonSelectors) {
      try {
        googleButton = await page.locator(selector).first();
        if (await googleButton.isVisible()) {
          buttonSelector = selector;
          console.log(`✅ Google 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 선택자 실패: ${selector}`);
      }
    }
    
    if (!googleButton || !buttonSelector) {
      console.log('🔍 페이지의 모든 버튼 확인 중...');
      const allButtons = await page.locator('button').all();
      console.log(`총 ${allButtons.length}개 버튼 발견`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        const buttonHTML = await allButtons[i].innerHTML();
        console.log(`버튼 ${i + 1}: "${buttonText}" - HTML: ${buttonHTML.substring(0, 100)}...`);
      }
      
      // 모든 요소 확인 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/02_no_google_button.png',
        fullPage: true 
      });
      
      throw new Error('Google 로그인 버튼을 찾을 수 없습니다');
    }
    
    // Google 버튼 하이라이트 및 스크린샷
    await googleButton.highlight();
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/03_google_button_found.png',
      fullPage: true 
    });
    
    console.log('🖱️ 4. Google 로그인 버튼 클릭 중...');
    
    // 새 페이지/팝업 대기 설정
    const [popup] = await Promise.all([
      context.waitForEvent('page', { timeout: 10000 }).catch(() => null),
      googleButton.click()
    ]);
    
    // 클릭 후 잠시 대기
    await page.waitForTimeout(3000);
    
    // 클릭 후 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/04_after_click.png',
      fullPage: true 
    });
    
    if (popup) {
      console.log('✅ Google OAuth 팝업이 열렸습니다');
      await popup.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/05_google_popup.png',
        fullPage: true 
      });
      
      // 팝업 URL 확인
      console.log('팝업 URL:', popup.url());
      
      await popup.close();
    } else {
      console.log('❌ Google OAuth 팝업이 열리지 않았습니다');
      
      // 현재 페이지에서 오류 메시지 확인
      const errorMessages = await page.locator('[class*="error"], .error, [data-testid*="error"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('페이지 오류 메시지:', errorMessages);
      }
      
      // 알림창 확인
      page.on('dialog', async dialog => {
        console.log('알림창 메시지:', dialog.message());
        await page.screenshot({ 
          path: '/mnt/e/project/test-studio-firebase/screenshots/06_dialog_error.png',
          fullPage: true 
        });
        await dialog.accept();
      });
    }
    
    console.log('🔍 5. 최종 페이지 상태 확인 중...');
    
    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/07_final_state.png',
      fullPage: true 
    });
    
    // 최종 로그 및 오류 수집
    console.log('\n📋 수집된 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    console.log('\n❌ 수집된 오류:');
    errors.forEach(error => console.log(error));
    
    // 로그 파일로 저장
    const logData = {
      timestamp: new Date().toISOString(),
      logs: logs,
      errors: errors,
      firebaseConfig: firebaseConfig,
      pageUrl: page.url(),
      buttonFound: !!buttonSelector,
      buttonSelector: buttonSelector,
      popupOpened: !!popup
    };
    
    fs.writeFileSync(
      '/mnt/e/project/test-studio-firebase/screenshots/debug_log.json', 
      JSON.stringify(logData, null, 2)
    );
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 발생 시 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/08_error_state.png',
      fullPage: true 
    });
    
    // 오류 로그 저장
    const errorData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      logs: logs,
      errors: errors,
      pageUrl: page.url()
    };
    
    fs.writeFileSync(
      '/mnt/e/project/test-studio-firebase/screenshots/error_log.json', 
      JSON.stringify(errorData, null, 2)
    );
  } finally {
    await browser.close();
    console.log('🏁 브라우저 종료됨');
  }
}

debugGoogleLogin().catch(console.error);