const { chromium } = require('playwright');

(async () => {
  console.log('=== 🎯 최종 기능 테스트 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  const results = {
    tarot: { status: 'pending', details: {} },
    dream: { status: 'pending', details: {} },
    login: { status: 'pending', details: {} }
  };
  
  try {
    // 1. 타로리딩 테스트
    console.log('1️⃣ 타로리딩 테스트 (/reading)');
    try {
      await page.goto('http://localhost:4000/reading', { 
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      
      await page.waitForTimeout(3000);
      
      // 질문 입력
      const questionInput = await page.$('textarea[placeholder*="질문"]');
      if (questionInput) {
        await questionInput.fill('나의 미래는 어떻게 될까요?');
        console.log('- 질문 입력: ✅');
        results.tarot.details.questionInput = true;
      }
      
      // 스프레드 선택 (기본값 사용)
      const spreadSelected = await page.$('select, [role="combobox"]');
      console.log(`- 스프레드 선택: ${spreadSelected ? '✅' : '❌'}`);
      results.tarot.details.spreadSelect = !!spreadSelected;
      
      // 리딩 진행 버튼
      const readingButton = await page.$('button:has-text("리딩 진행")');
      if (readingButton) {
        const isDisabled = await readingButton.evaluate(btn => btn.disabled);
        console.log(`- 리딩 버튼 상태: ${isDisabled ? '❌ 비활성화' : '✅ 활성화'}`);
        results.tarot.details.buttonEnabled = !isDisabled;
        
        if (!isDisabled) {
          await readingButton.click();
          await page.waitForTimeout(5000);
          
          // 해석 결과 확인
          const interpretation = await page.$('.interpretation, .reading-result, [data-testid="interpretation"]');
          results.tarot.details.hasInterpretation = !!interpretation;
          console.log(`- 해석 결과: ${interpretation ? '✅' : '❌'}`);
        }
      }
      
      results.tarot.status = results.tarot.details.questionInput && 
                             results.tarot.details.buttonEnabled ? 'success' : 'error';
      
      await page.screenshot({ path: 'final-tarot-test.png' });
      
    } catch (error) {
      results.tarot.status = 'error';
      results.tarot.error = error.message;
      console.log(`- ❌ 오류: ${error.message}`);
    }
    
    // 2. 꿈해몽 테스트
    console.log('\n2️⃣ 꿈해몽 테스트 (/dream-interpretation)');
    try {
      await page.goto('http://localhost:4000/dream-interpretation', { 
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      
      await page.waitForTimeout(3000);
      
      // 꿈 내용 입력
      const dreamInput = await page.$('textarea');
      if (dreamInput) {
        await dreamInput.fill('하늘을 나는 꿈을 꿨습니다.');
        console.log('- 꿈 내용 입력: ✅');
        results.dream.details.dreamInput = true;
      }
      
      // 해석 버튼
      const interpretButton = await page.$('button:has-text("해석"), button:has-text("분석")');
      if (interpretButton) {
        console.log('- 해석 버튼: ✅');
        results.dream.details.hasButton = true;
      }
      
      results.dream.status = results.dream.details.dreamInput && 
                            results.dream.details.hasButton ? 'success' : 'error';
      
      await page.screenshot({ path: 'final-dream-test.png' });
      
    } catch (error) {
      results.dream.status = 'error';
      results.dream.error = error.message;
      console.log(`- ❌ 오류: ${error.message}`);
    }
    
    // 3. 로그인 테스트
    console.log('\n3️⃣ 로그인 테스트 (/login)');
    try {
      await page.goto('http://localhost:4000/login', { 
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      
      await page.waitForTimeout(2000);
      
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      const passwordInput = await page.$('input[type="password"]');
      const loginButton = await page.$('button[type="submit"], button:has-text("로그인")');
      
      results.login.details.hasEmailInput = !!emailInput;
      results.login.details.hasPasswordInput = !!passwordInput;
      results.login.details.hasLoginButton = !!loginButton;
      
      console.log(`- 이메일 입력: ${emailInput ? '✅' : '❌'}`);
      console.log(`- 비밀번호 입력: ${passwordInput ? '✅' : '❌'}`);
      console.log(`- 로그인 버튼: ${loginButton ? '✅' : '❌'}`);
      
      results.login.status = (emailInput && passwordInput && loginButton) ? 'success' : 'error';
      
      await page.screenshot({ path: 'final-login-test.png' });
      
    } catch (error) {
      results.login.status = 'error';
      results.login.error = error.message;
      console.log(`- ❌ 오류: ${error.message}`);
    }
    
    // 최종 보고
    console.log('\n=== 📊 최종 테스트 결과 ===');
    console.log(`타로리딩: ${results.tarot.status === 'success' ? '✅ 성공' : '❌ 실패'}`);
    console.log(`꿈해몽: ${results.dream.status === 'success' ? '✅ 성공' : '❌ 실패'}`);
    console.log(`로그인: ${results.login.status === 'success' ? '✅ 성공' : '❌ 실패'}`);
    
    // 상세 문제점
    console.log('\n⚠️ 발견된 문제점:');
    if (results.tarot.status === 'error') {
      console.log('- 타로리딩: API 키 설정 필요 (OpenAI/Anthropic)');
    }
    if (results.dream.status === 'error') {
      console.log('- 꿈해몽: 페이지 로딩 타임아웃');
    }
    if (results.login.status === 'error') {
      console.log('- 로그인: Firebase 설정 필요');
    }
    
  } catch (error) {
    console.error('테스트 실패:', error.message);
  }
  
  await browser.close();
})();