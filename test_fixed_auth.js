const { chromium } = require('playwright');

async function testFixedAuth() {
  console.log('🧪 수정된 Google 인증 테스트 시작...');
  
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
    console.log('📱 새로운 배포 URL로 접속 중...');
    await page.goto('https://test-studio-firebase-cnqdvzcbn-johns-projects-bf5e60f3.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 페이지 로드 후 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/test_fixed_1_loaded.png',
      fullPage: true 
    });
    console.log('✅ 새 배포 페이지 로드됨');
    
    // 2초 대기
    await page.waitForTimeout(2000);
    
    console.log('🔍 Firebase 설정 확인 중...');
    
    // Firebase 설정 확인
    const firebaseInfo = await page.evaluate(() => {
      return {
        hasFirebase: typeof window.firebase !== 'undefined',
        hasAuth: typeof window.firebase?.auth !== 'undefined',
        location: window.location.href,
        consoleMessages: window.console?.messages || []
      };
    });
    
    console.log('Firebase 정보:', JSON.stringify(firebaseInfo, null, 2));
    
    console.log('🖱️ Google 로그인 버튼 클릭 중...');
    
    // Google 로그인 버튼 찾기
    const googleButton = page.locator('button:has-text("Google")').first();
    
    if (await googleButton.isVisible()) {
      console.log('✅ Google 버튼 발견됨');
      
      // 버튼 하이라이트
      await googleButton.highlight();
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/test_fixed_2_button_found.png',
        fullPage: true 
      });
      
      // 새 페이지/팝업 대기 설정
      const popupPromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
      
      // 버튼 클릭
      await googleButton.click();
      
      // 클릭 후 대기
      await page.waitForTimeout(3000);
      
      // 클릭 후 스크린샷
      await page.screenshot({ 
        path: '/mnt/e/project/test-studio-firebase/screenshots/test_fixed_3_after_click.png',
        fullPage: true 
      });
      
      // 팝업 확인
      const popup = await popupPromise;
      
      if (popup) {
        console.log('✅ Google OAuth 팝업이 성공적으로 열렸습니다!');
        console.log('팝업 URL:', popup.url());
        
        await popup.screenshot({ 
          path: '/mnt/e/project/test-studio-firebase/screenshots/test_fixed_4_popup_success.png',
          fullPage: true 
        });
        
        await popup.close();
      } else {
        console.log('❌ Google OAuth 팝업이 열리지 않았습니다');
        
        // 페이지에서 오류 메시지 확인
        const errorMessage = await page.locator('[class*="error"], .error, [role="alert"]').textContent().catch(() => null);
        if (errorMessage) {
          console.log('페이지 오류 메시지:', errorMessage);
        }
      }
      
    } else {
      console.log('❌ Google 로그인 버튼을 찾을 수 없습니다');
    }
    
    // 최종 상태 스크린샷
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/test_fixed_5_final.png',
      fullPage: true 
    });
    
    // 콘솔 로그에서 Firebase 관련 메시지 확인
    const firebaseConfigLogs = logs.filter(log => log.includes('Firebase config'));
    if (firebaseConfigLogs.length > 0) {
      console.log('🔥 Firebase 설정 로그:');
      firebaseConfigLogs.forEach(log => console.log(log));
    }
    
    // URL 인코딩 오류 확인
    const urlErrors = logs.filter(log => log.includes('Illegal url') || log.includes('%0A'));
    if (urlErrors.length > 0) {
      console.log('❌ URL 인코딩 오류가 여전히 존재합니다:');
      urlErrors.forEach(error => console.log(error));
    } else {
      console.log('✅ URL 인코딩 오류가 해결되었습니다!');
    }
    
    console.log('\n📋 수집된 모든 로그:');
    logs.forEach(log => console.log(log));
    
    console.log('\n❌ 수집된 오류:');
    errors.forEach(error => console.log(error));
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/test_fixed_error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 테스트 완료');
  }
}

testFixedAuth().catch(console.error);