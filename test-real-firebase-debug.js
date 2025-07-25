const { chromium } = require('playwright');

async function debugRealFirebase() {
  console.log('🔍 실제 Firebase 상태 브라우저 디버그...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 메시지 캡처
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Firebase') || text.includes('Auth') || text.includes('mock') || text.includes('real')) {
        console.log(`[BROWSER] ${text}`);
      }
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
      console.log(`[ERROR] ${error.message}`);
    });
    
    console.log('📍 홈페이지로 이동...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    // 환경 변수 상태 확인
    const envCheck = await page.evaluate(() => {
      return {
        NODE_ENV: process.env.NODE_ENV,
        USE_REAL_AUTH: process.env.NEXT_PUBLIC_USE_REAL_AUTH,
        FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT_SET',
        FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT_SET'
      };
    });
    
    console.log('🌐 브라우저 환경 변수:', envCheck);
    
    // Firebase 객체 상태 확인
    const firebaseStatus = await page.evaluate(() => {
      // @ts-ignore
      return window.__firebaseDebugInfo__ || 'Firebase debug info 없음';
    });
    
    console.log('🔥 Firebase 상태:', firebaseStatus);
    
    // AuthContext 디버그 정보 추가
    await page.addScriptTag({
      content: `
        // AuthContext 디버그 정보 출력
        console.log('🔍 AuthContext 디버그 시작...');
        
        // 환경 변수 확인
        console.log('ENV NODE_ENV:', process.env.NODE_ENV);
        console.log('ENV USE_REAL_AUTH:', process.env.NEXT_PUBLIC_USE_REAL_AUTH);
        console.log('ENV USE_REAL_AUTH type:', typeof process.env.NEXT_PUBLIC_USE_REAL_AUTH);
        
        // 조건 확인
        const isDev = process.env.NODE_ENV === 'development';
        const useRealAuth = process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'true';
        const shouldUseMock = isDev && !useRealAuth;
        
        console.log('🎯 Auth 결정:');
        console.log('  isDev:', isDev);
        console.log('  useRealAuth:', useRealAuth);
        console.log('  shouldUseMock:', shouldUseMock);
        
        if (shouldUseMock) {
          console.log('❌ Mock Auth가 활성화됨');
        } else {
          console.log('✅ Real Firebase Auth가 활성화됨');
        }
      `
    });
    
    await page.waitForTimeout(2000);
    
    // 로그인 페이지로 이동해서 실제 Google 로그인 테스트
    console.log('📍 로그인 페이지로 이동...');
    await page.goto('http://localhost:4000/sign-in', { waitUntil: 'networkidle' });
    
    // Google 로그인 버튼 찾기
    const googleButton = page.locator('button:has-text("Google")');
    const googleButtonExists = await googleButton.isVisible().catch(() => false);
    
    console.log('🔘 Google 로그인 버튼 존재:', googleButtonExists);
    
    if (googleButtonExists) {
      console.log('🔍 Google 로그인 버튼 클릭 테스트...');
      
      // 팝업 대기
      const [popup] = await Promise.all([
        context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
        googleButton.click().catch(() => console.log('버튼 클릭 실패'))
      ]);
      
      if (popup) {
        console.log('✅ Google OAuth 팝업이 열렸습니다!');
        console.log('팝업 URL:', popup.url());
        await popup.close();
      } else {
        console.log('❌ Google OAuth 팝업이 열리지 않았습니다.');
      }
    }
    
    // 10초간 대기하여 콘솔 메시지 확인
    console.log('⏳ 10초간 추가 로그 대기...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 디버그 중 오류:', error);
  } finally {
    await browser.close();
  }
}

debugRealFirebase();