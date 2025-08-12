const { chromium } = require('playwright');

(async () => {
  console.log('=== 🔍 올바른 URL로 재테스트 ===\n');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  const page = await browser.newPage();
  
  try {
    // 1. 타로리딩 - 올바른 경로
    console.log('1️⃣ 타로리딩 페이지 (/reading)');
    const tarotResponse = await page.goto('http://localhost:4000/reading', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    console.log(`- 응답 상태: ${tarotResponse?.status()}`);
    
    await page.waitForTimeout(3000);
    
    // 리딩 시작 버튼 찾기
    const startButton = await page.$('button:has-text("리딩 시작"), button:has-text("Start Reading")');
    console.log(`- 리딩 시작 버튼: ${startButton ? '✅ 있음' : '❌ 없음'}`);
    
    await page.screenshot({ path: 'correct-tarot-reading.png' });
    
    // 2. 꿈해몽 - 올바른 경로
    console.log('\n2️⃣ 꿈해몽 페이지 (/dream-interpretation)');
    const dreamResponse = await page.goto('http://localhost:4000/dream-interpretation', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    console.log(`- 응답 상태: ${dreamResponse?.status()}`);
    
    await page.waitForTimeout(3000);
    
    // 꿈 입력 폼 찾기
    const dreamInput = await page.$('textarea, input[placeholder*="꿈"], input[placeholder*="dream"]');
    console.log(`- 꿈 입력 폼: ${dreamInput ? '✅ 있음' : '❌ 없음'}`);
    
    await page.screenshot({ path: 'correct-dream-interpretation.png' });
    
    // 3. 로그인 페이지
    console.log('\n3️⃣ 로그인 페이지 (/login)');
    const loginResponse = await page.goto('http://localhost:4000/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    console.log(`- 응답 상태: ${loginResponse?.status()}`);
    
    await page.waitForTimeout(2000);
    
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[type="password"]');
    console.log(`- 이메일 입력: ${emailInput ? '✅ 있음' : '❌ 없음'}`);
    console.log(`- 비밀번호 입력: ${passwordInput ? '✅ 있음' : '❌ 없음'}`);
    
    await page.screenshot({ path: 'correct-login.png' });
    
    // 콘솔 에러 수집
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    console.log('\n=== 📋 최종 결과 ===');
    console.log(`타로리딩 (/reading): ${tarotResponse?.status() === 200 ? '✅ 정상' : '❌ 오류'}`);
    console.log(`꿈해몽 (/dream-interpretation): ${dreamResponse?.status() === 200 ? '✅ 정상' : '❌ 오류'}`);
    console.log(`로그인 (/login): ${loginResponse?.status() === 200 ? '✅ 정상' : '❌ 오류'}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️ 콘솔 에러:');
      errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }
    
  } catch (error) {
    console.error('테스트 오류:', error.message);
  }
  
  await browser.close();
})();