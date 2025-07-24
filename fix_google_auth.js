const { chromium } = require('playwright');

async function fixGoogleAuth() {
  console.log('🔧 Google 인증 오류 수정 작업 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 모든 네트워크 요청 모니터링
  page.on('request', request => {
    if (request.url().includes('firebase') || request.url().includes('google')) {
      console.log('🌐 Network Request:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('firebase') || response.url().includes('google')) {
      console.log('📡 Network Response:', response.status(), response.url());
    }
  });
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    console.log(text);
  });
  
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  try {
    console.log('📱 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // 페이지 로드 후 Firebase 설정 확인
    const firebaseInfo = await page.evaluate(() => {
      return {
        windowFirebase: typeof window.firebase,
        googleApis: typeof window.gapi,
        currentURL: window.location.href,
        userAgent: window.navigator.userAgent,
        // 환경 변수 확인 (클라이언트에서 접근 가능한 것들)
        publicVars: {
          NODE_ENV: typeof window !== 'undefined' ? document.querySelector('meta[name="env"]')?.content : 'unknown'
        }
      };
    });
    
    console.log('🔍 Firebase 환경 정보:', JSON.stringify(firebaseInfo, null, 2));
    
    // 개발자 도구에서 Network 탭 정보 확인
    await page.keyboard.press('F12');
    await page.waitForTimeout(2000);
    
    // Network 탭 클릭
    await page.click('[aria-label="Network panel"]').catch(() => {
      console.log('Network 탭을 찾을 수 없습니다. 계속 진행...');
    });
    
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/fix_step1_devtools.png',
      fullPage: true 
    });
    
    // Google 로그인 버튼 찾기 및 클릭
    console.log('🖱️  Google 로그인 버튼 클릭...');
    
    const googleButton = page.locator('button:has-text("Google")').first();
    await googleButton.click();
    
    // 클릭 후 네트워크 요청 관찰
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/fix_step2_after_click.png',
      fullPage: true 
    });
    
    // Firebase Auth iframe 확인
    const iframes = await page.locator('iframe').all();
    console.log(`🖼️  페이지에서 발견된 iframe 수: ${iframes.length}`);
    
    for (let i = 0; i < iframes.length; i++) {
      try {
        const src = await iframes[i].getAttribute('src');
        console.log(`iframe ${i + 1} src:`, src);
        
        if (src && src.includes('firebase')) {
          console.log('🔥 Firebase iframe 발견!');
          
          // iframe 내용 확인 시도
          try {
            const frame = await iframes[i].contentFrame();
            if (frame) {
              const frameUrl = frame.url();
              console.log('iframe URL:', frameUrl);
            }
          } catch (e) {
            console.log('iframe 내용 접근 제한됨 (CORS)');
          }
        }
      } catch (e) {
        console.log(`iframe ${i + 1} 정보 가져오기 실패:`, e.message);
      }
    }
    
    // JavaScript 에러 메시지 상세 확인
    const errorDetails = await page.evaluate(() => {
      // 현재 페이지의 모든 script 태그 확인
      const scripts = Array.from(document.querySelectorAll('script'));
      const scriptInfo = scripts.map(script => ({
        src: script.src,
        hasContent: script.innerHTML.length > 0,
        type: script.type
      }));
      
      return {
        scripts: scriptInfo,
        errors: window.lastKnownErrors || [],
        location: window.location.href
      };
    });
    
    console.log('📜 스크립트 정보:', JSON.stringify(errorDetails, null, 2));
    
    console.log('🔍 문제 진단 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    await page.screenshot({ 
      path: '/mnt/e/project/test-studio-firebase/screenshots/fix_error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 브라우저 종료됨');
  }
}

fixGoogleAuth().catch(console.error);