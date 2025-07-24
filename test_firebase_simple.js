const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 수집
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`[${msg.type()}] ${text}`);
  });
  
  // 에러 수집
  page.on('pageerror', error => {
    console.error('❌ ERROR:', error.message);
  });
  
  // API 응답 모니터링
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/')) {
      try {
        const body = await response.text();
        console.log(`\n📥 API Response [${response.status()}]: ${url}`);
        console.log('Body:', body);
      } catch (e) {}
    }
  });

  try {
    console.log('=== Vercel 사이트 접속 ===');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'networkidle' 
    });
    
    // Firebase 설정 확인
    const firebaseConfig = await page.evaluate(() => {
      return {
        hasFirebase: typeof window.firebase !== 'undefined',
        env: window.__ENV__ || {},
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage)
      };
    });
    
    console.log('\nFirebase 환경:', firebaseConfig);
    
    // 로그인 페이지 테스트
    console.log('\n=== 로그인 페이지 이동 ===');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in');
    await page.waitForTimeout(2000);
    
    // 모든 버튼 확인
    const buttons = await page.locator('button').all();
    console.log(`\n버튼 수: ${buttons.length}`);
    for (const button of buttons) {
      const text = await button.textContent();
      console.log(`- "${text}"`);
    }
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'simple-signin.png')
    });
    
    // 타로 리딩 페이지 직접 테스트
    console.log('\n=== 타로 리딩 페이지 테스트 ===');
    await page.goto('https://test-studio-firebase.vercel.app/reading');
    await page.waitForTimeout(3000);
    
    // 페이지 상태 확인
    const pageState = await page.evaluate(() => {
      return {
        title: document.title,
        hasCards: document.querySelectorAll('[data-testid="tarot-card"], .cursor-pointer').length,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log('\n페이지 상태:', pageState);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'simple-reading.png')
    });
    
    // API 테스트 - 세션 확인
    console.log('\n=== API 세션 테스트 ===');
    const sessionResponse = await page.request.get('https://test-studio-firebase.vercel.app/api/auth/session');
    console.log('Session API 상태:', sessionResponse.status());
    const sessionData = await sessionResponse.text();
    console.log('Session 데이터:', sessionData);
    
    // API 테스트 - Debug
    console.log('\n=== Debug API 테스트 ===');
    const debugResponse = await page.request.get('https://test-studio-firebase.vercel.app/api/debug/ai-providers');
    console.log('Debug API 상태:', debugResponse.status());
    const debugData = await debugResponse.text();
    console.log('Debug 데이터:', debugData);
    
    // Firebase 관련 로그 출력
    console.log('\n=== Firebase 관련 콘솔 로그 ===');
    logs.filter(log => 
      log.toLowerCase().includes('firebase') || 
      log.toLowerCase().includes('mock') || 
      log.toLowerCase().includes('admin')
    ).forEach(log => console.log(log));
    
  } catch (error) {
    console.error('테스트 오류:', error);
  }
  
  console.log('\nEnter를 눌러 종료...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  await browser.close();
})();