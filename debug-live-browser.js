const { chromium } = require('playwright');

async function debugLiveBrowser() {
  console.log('🔍 실시간 브라우저 데모 모드 디버깅...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    const page = await context.newPage();
    
    // 모든 콘솔 메시지 캡처
    page.on('console', msg => {
      console.log(`[브라우저 콘솔] ${msg.text()}`);
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
      console.log(`[브라우저 에러] ${error.message}`);
    });
    
    console.log('📍 타로 리딩 페이지로 이동...');
    await page.goto('http://localhost:4000/reading', { waitUntil: 'networkidle' });
    
    // 페이지 로드 후 3초 대기
    await page.waitForTimeout(3000);
    
    // 페이지 전체 텍스트에서 데모 관련 텍스트 찾기
    const fullPageText = await page.locator('body').textContent();
    
    console.log('\n🔍 데모/Mock 관련 텍스트 검색:');
    const demoPatterns = [
      '데모 모드',
      'demo mode', 
      'mock mode',
      '데모 버전',
      '현재 데모',
      '실제 데이터베이스 연결 후',
      'Mock',
      'development'
    ];
    
    demoPatterns.forEach(pattern => {
      const found = fullPageText.includes(pattern);
      if (found) {
        console.log(`❌ 발견: "${pattern}"`);
        
        // 해당 텍스트 주변 컨텍스트 추출
        const index = fullPageText.indexOf(pattern);
        const start = Math.max(0, index - 50);
        const end = Math.min(fullPageText.length, index + 100);
        const context = fullPageText.substring(start, end).replace(/\\n/g, ' ');
        console.log(`   컨텍스트: ...${context}...`);
      } else {
        console.log(`✅ 없음: "${pattern}"`);
      }
    });
    
    // Firebase 객체 상태 확인
    console.log('\n🔥 Firebase 상태 확인:');
    const firebaseStatus = await page.evaluate(() => {
      // @ts-ignore
      if (window.firebase) {
        return 'Real Firebase detected';
      }
      // @ts-ignore  
      if (window.__firebaseConfig) {
        // @ts-ignore
        return `Firebase config: ${JSON.stringify(window.__firebaseConfig)}`;
      }
      return 'No Firebase objects found';
    });
    console.log(firebaseStatus);
    
    // 환경 변수 상태 확인
    console.log('\n🌍 환경 변수 상태:');
    const envStatus = await page.evaluate(() => {
      return {
        NODE_ENV: process.env.NODE_ENV,
        USE_REAL_AUTH: process.env.NEXT_PUBLIC_USE_REAL_AUTH,
        API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT_SET',
        PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT_SET'
      };
    });
    console.log(envStatus);
    
    // 질문 입력해서 저장 버튼까지 진행
    console.log('\n📝 저장 기능 테스트:');
    
    // 질문 입력
    const questionInput = page.locator('textarea[placeholder*="카드에게"]');
    if (await questionInput.isVisible()) {
      await questionInput.fill('실제 Firebase 연결 테스트');
      console.log('✅ 질문 입력됨');
    }
    
    // 카드 섞기
    const shuffleButton = page.locator('button:has-text("카드 섞기")');
    if (await shuffleButton.isVisible()) {
      await shuffleButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 카드 섞기 완료');
    }
    
    // 저장 버튼 찾기
    console.log('\n💾 저장 버튼 찾기:');
    const allButtons = await page.locator('button').allTextContents();
    console.log('모든 버튼:', allButtons.filter(text => text.trim().length > 0));
    
    const saveButton = page.locator('button:has-text("저장")');
    const saveButtonExists = await saveButton.isVisible().catch(() => false);
    console.log('저장 버튼 존재:', saveButtonExists);
    
    if (saveButtonExists) {
      console.log('💾 저장 버튼 클릭 시도...');
      await saveButton.click();
      await page.waitForTimeout(3000);
      
      // 클릭 후 나타나는 메시지 확인
      const afterClickText = await page.locator('body').textContent();
      
      // 토스트 메시지나 알림 확인
      const toastSelectors = [
        '[data-sonner-toaster]',
        '[role="alert"]', 
        '.toast',
        '[class*="toast"]'
      ];
      
      for (const selector of toastSelectors) {
        const toastElements = await page.locator(selector).allTextContents().catch(() => []);
        if (toastElements.length > 0) {
          console.log(`토스트 메시지 (${selector}):`, toastElements);
        }
      }
      
      // 데모 모드 메시지가 토스트로 나타났는지 확인
      const hasNewDemoMessage = afterClickText.includes('데모 모드') || afterClickText.includes('현재 데모');
      console.log('저장 클릭 후 데모 모드 메시지:', hasNewDemoMessage);
    }
    
    // 로그인 상태 확인
    console.log('\n🔐 로그인 상태 확인:');
    const loginButton = page.locator('button:has-text("로그인"), a:has-text("로그인")');
    const needsLogin = await loginButton.isVisible().catch(() => false);
    console.log('로그인 필요:', needsLogin);
    
    if (needsLogin) {
      console.log('🔐 로그인이 필요한 상태입니다. 로그인 페이지로 이동...');
      await page.goto('http://localhost:4000/sign-in');
      await page.waitForTimeout(2000);
      
      const googleButton = page.locator('button:has-text("Google")');
      const hasGoogleLogin = await googleButton.isVisible().catch(() => false);
      console.log('Google 로그인 버튼 존재:', hasGoogleLogin);
    }
    
    // 30초간 브라우저 유지하여 수동 확인 가능
    console.log('\\n⏳ 30초간 브라우저 유지 - 수동으로 확인해보세요...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error);
  } finally {
    await browser.close();
  }
}

debugLiveBrowser();