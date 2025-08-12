const { chromium } = require('playwright');

(async () => {
  console.log('=== 🚨 긴급 오류 현황 파악 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  const issues = {
    server: { status: 'unknown', error: null },
    tarot: { status: 'unknown', error: null },
    dream: { status: 'unknown', error: null },
    login: { status: 'unknown', error: null }
  };
  
  try {
    // 1. 서버 상태 확인
    console.log('1️⃣ 서버 상태 확인 (포트 4000)');
    try {
      const response = await page.goto('http://localhost:4000', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      issues.server.status = response?.status() === 200 ? 'ok' : 'error';
      console.log(`- 홈페이지 응답: ${response?.status()}`);
    } catch (error) {
      issues.server.status = 'error';
      issues.server.error = error.message;
      console.log(`- ❌ 서버 에러: ${error.message}`);
    }
    
    // 2. 타로리딩 확인
    console.log('\n2️⃣ 타로리딩 페이지 확인');
    try {
      const response = await page.goto('http://localhost:4000/tarot-reading', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      // 콘솔 에러 수집
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`- 콘솔 에러: ${msg.text()}`);
          issues.tarot.error = msg.text();
        }
      });
      
      await page.waitForTimeout(3000);
      
      // 타로 리딩 버튼 찾기
      const readingButton = await page.$('button:has-text("리딩 시작")');
      if (readingButton) {
        await readingButton.click();
        await page.waitForTimeout(2000);
        
        // 해석 결과 확인
        const interpretation = await page.$('.interpretation, .reading-result');
        issues.tarot.status = interpretation ? 'ok' : 'error';
      } else {
        issues.tarot.status = 'error';
        issues.tarot.error = '리딩 버튼을 찾을 수 없음';
      }
      
      await page.screenshot({ path: 'tarot-error-check.png' });
      console.log(`- 상태: ${issues.tarot.status}`);
      if (issues.tarot.error) console.log(`- ❌ 에러: ${issues.tarot.error}`);
    } catch (error) {
      issues.tarot.status = 'error';
      issues.tarot.error = error.message;
      console.log(`- ❌ 타로리딩 에러: ${error.message}`);
    }
    
    // 3. 꿈해몽 확인
    console.log('\n3️⃣ 꿈해몽 페이지 확인');
    try {
      const response = await page.goto('http://localhost:4000/dream', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      await page.waitForTimeout(2000);
      
      const dreamForm = await page.$('textarea, input[type="text"]');
      issues.dream.status = dreamForm ? 'ok' : 'error';
      
      await page.screenshot({ path: 'dream-error-check.png' });
      console.log(`- 상태: ${issues.dream.status}`);
    } catch (error) {
      issues.dream.status = 'error';
      issues.dream.error = error.message;
      console.log(`- ❌ 꿈해몽 에러: ${error.message}`);
    }
    
    // 4. 로그인 확인
    console.log('\n4️⃣ 로그인 페이지 확인');
    try {
      const response = await page.goto('http://localhost:4000/login', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      await page.waitForTimeout(2000);
      
      const loginForm = await page.$('input[type="email"], input[type="text"]');
      const passwordInput = await page.$('input[type="password"]');
      issues.login.status = (loginForm && passwordInput) ? 'ok' : 'error';
      
      await page.screenshot({ path: 'login-error-check.png' });
      console.log(`- 상태: ${issues.login.status}`);
    } catch (error) {
      issues.login.status = 'error';
      issues.login.error = error.message;
      console.log(`- ❌ 로그인 에러: ${error.message}`);
    }
    
    // 최종 보고
    console.log('\n=== 📊 최종 진단 결과 ===');
    console.log(`서버 (포트 4000): ${issues.server.status === 'ok' ? '✅ 정상' : '❌ 오류'}`);
    console.log(`타로리딩: ${issues.tarot.status === 'ok' ? '✅ 정상' : '❌ 오류'}`);
    console.log(`꿈해몽: ${issues.dream.status === 'ok' ? '✅ 정상' : '❌ 오류'}`);
    console.log(`로그인: ${issues.login.status === 'ok' ? '✅ 정상' : '❌ 오류'}`);
    
  } catch (error) {
    console.error('긴급 점검 실패:', error.message);
  }
  
  await browser.close();
})();