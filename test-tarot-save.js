const { chromium } = require('playwright');

(async () => {
  console.log('🎯 타로 리딩 저장 기능 테스트 시작...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // 개발자 도구 열기
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error' || text.includes('error') || text.includes('Error')) {
      console.log(`🚨 콘솔 에러: ${text}`);
    }
  });
  
  // 네트워크 요청 모니터링
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('firebase')) {
      console.log(`📤 요청: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if ((response.url().includes('/api/') || response.url().includes('firebase')) && response.status() >= 400) {
      console.log(`📥 응답 에러: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // 1. 사이트 접속
    console.log('1️⃣ 사이트 접속 중...');
    await page.goto('https://test-studio-firebase.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 2. 로그인 여부 확인
    console.log('\n2️⃣ 로그인 상태 확인...');
    await page.waitForTimeout(3000);
    
    const loginButton = await page.$('button:has-text("로그인")');
    const userMenu = await page.$('button[aria-label*="user"]');
    
    if (loginButton) {
      console.log('❌ 로그인되지 않은 상태입니다.');
      console.log('   → 로그인이 필요합니다!');
      
      // 로그인 페이지로 이동
      await loginButton.click();
      await page.waitForURL('**/sign-in');
      console.log('   → 로그인 페이지로 이동했습니다.');
      
      // 테스트 계정으로 로그인 시도
      const emailInput = await page.$('input[type="email"]');
      if (emailInput) {
        console.log('   → 테스트 계정으로 로그인 시도...');
        await emailInput.fill('test@example.com');
        const passwordInput = await page.$('input[type="password"]');
        await passwordInput.fill('test123456');
        
        const submitButton = await page.$('button[type="submit"]');
        await submitButton.click();
        
        await page.waitForTimeout(3000);
      }
    } else if (userMenu) {
      console.log('✅ 이미 로그인된 상태입니다.');
    }
    
    // 3. 타로 리딩 페이지로 이동
    console.log('\n3️⃣ 타로 리딩 페이지로 이동...');
    await page.goto('https://test-studio-firebase.vercel.app/reading', {
      waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(2000);
    
    // 4. 스프레드 선택
    console.log('\n4️⃣ 3카드 스프레드 선택...');
    const threeCardSpread = await page.$('button:has-text("3카드")');
    if (threeCardSpread) {
      await threeCardSpread.click();
      await page.waitForTimeout(1000);
    }
    
    // 5. 질문 입력
    console.log('\n5️⃣ 질문 입력...');
    const questionInput = await page.$('textarea[placeholder*="질문"]');
    if (questionInput) {
      await questionInput.fill('테스트 질문: 타로 리딩 저장이 잘 작동하나요?');
    }
    
    // 6. 카드 뽑기
    console.log('\n6️⃣ 카드 뽑기...');
    const drawButton = await page.$('button:has-text("카드 뽑기")');
    if (drawButton) {
      await drawButton.click();
      await page.waitForTimeout(2000);
      
      // 카드 3장 선택
      const cards = await page.$$('.cursor-pointer');
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        await cards[i].click();
        await page.waitForTimeout(500);
      }
    }
    
    // 7. 해석 받기
    console.log('\n7️⃣ 해석 받기...');
    const interpretButton = await page.$('button:has-text("해석 받기")');
    if (interpretButton) {
      await interpretButton.click();
      console.log('   → 해석 생성 중... (최대 30초 대기)');
      
      // 해석 완료 대기
      await page.waitForSelector('text=/.*해석.*/', { timeout: 30000 }).catch(() => null);
    }
    
    // 8. 저장 버튼 찾기
    console.log('\n8️⃣ 저장 버튼 확인...');
    await page.waitForTimeout(2000);
    
    const saveButton = await page.$('button:has-text("저장")');
    const savingButton = await page.$('button:has-text("저장 중")');
    const savedButton = await page.$('button:has-text("저장됨")');
    
    if (savedButton) {
      console.log('✅ 이미 저장된 상태입니다.');
    } else if (savingButton) {
      console.log('⏳ 현재 저장 중입니다...');
    } else if (saveButton) {
      console.log('✅ 저장 버튼을 찾았습니다!');
      
      // 저장 시도
      console.log('\n9️⃣ 저장 시도...');
      await saveButton.click();
      
      // 저장 결과 대기
      await page.waitForTimeout(5000);
      
      // 저장 후 상태 확인
      const savedAfter = await page.$('button:has-text("저장됨")');
      const errorToast = await page.$('[role="alert"]:has-text("오류")');
      
      if (savedAfter) {
        console.log('✅ 저장 성공!');
      } else if (errorToast) {
        const errorText = await errorToast.textContent();
        console.log(`❌ 저장 실패: ${errorText}`);
      } else {
        console.log('⚠️ 저장 결과를 확인할 수 없습니다.');
      }
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없습니다!');
    }
    
    // 10. 콘솔 로그 출력
    console.log('\n📋 콘솔 로그:');
    consoleLogs.slice(-10).forEach(log => console.log(log));
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `tarot-save-test-${timestamp}.png`,
      fullPage: true 
    });
    console.log(`\n📸 스크린샷 저장: tarot-save-test-${timestamp}.png`);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await page.waitForTimeout(5000); // 결과 확인을 위해 잠시 대기
    await browser.close();
  }
})();